import { config } from "dotenv";
config({ path: ".env.local" });

import { fetchFouaniProducts } from "./fouani";
import { fetchJumiaProducts } from "./jumia";
import { createAdminClient, ensureBucket, uploadProductImage, type AdminClient } from "./storage";
import { uniqueSlug } from "./slugify";
import { pLimit } from "./concurrency";
import type { ImportProduct } from "./types";

const IMPORT_CONCURRENCY = 6;

async function getExistingSourceUrls(admin: AdminClient): Promise<Set<string>> {
  const urls = new Set<string>();
  const pageSize = 1000;
  let from = 0;
  for (;;) {
    const { data, error } = await admin
      .from("products")
      .select("source_url")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data) if (row.source_url) urls.add(row.source_url);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return urls;
}

async function getBrandId(admin: AdminClient, cache: Map<string, string>, slug: string): Promise<string> {
  const cached = cache.get(slug);
  if (cached) return cached;
  const { data, error } = await admin.from("brands").select("id").eq("slug", slug).single();
  if (error || !data) throw new Error(`Brand not seeded: ${slug} (run the migration first)`);
  cache.set(slug, data.id);
  return data.id;
}

async function getCategoryId(
  admin: AdminClient,
  cache: Map<string, string>,
  slug: string,
  name: string
): Promise<string> {
  const cached = cache.get(slug);
  if (cached) return cached;
  const { data: existing } = await admin.from("categories").select("id").eq("slug", slug).maybeSingle();
  if (existing) {
    cache.set(slug, existing.id);
    return existing.id;
  }
  const { data, error } = await admin.from("categories").insert({ name, slug }).select("id").single();
  if (error) throw error;
  cache.set(slug, data.id);
  return data.id;
}

async function importProduct(
  admin: AdminClient,
  brandCache: Map<string, string>,
  categoryCache: Map<string, string>,
  p: ImportProduct,
  index: number,
  total: number
) {
  console.log(`[${index}/${total}] ${p.brandSlug}/${p.categorySlug} — ${p.name}`);

  const brandId = await getBrandId(admin, brandCache, p.brandSlug);
  const categoryId = await getCategoryId(admin, categoryCache, p.categorySlug, p.categoryName);
  const slug = uniqueSlug(`${p.brandSlug}-${p.name}`, p.sourceUrl);

  const { data: product, error } = await admin
    .from("products")
    .insert({
      brand_id: brandId,
      category_id: categoryId,
      name: p.name,
      slug,
      price: p.price,
      currency: "NGN",
      description: p.description,
      source_url: p.sourceUrl,
    })
    .select("id")
    .single();

  if (error || !product) {
    console.warn(`  ! product insert failed: ${error?.message}`);
    return;
  }

  await Promise.all(
    p.images.map(async (imageUrl, i) => {
      const publicUrl = await uploadProductImage(admin, imageUrl, `${p.brandSlug}/${slug}/${i}`);
      if (!publicUrl) return;
      const { error: imgError } = await admin
        .from("product_images")
        .insert({ product_id: product.id, url: publicUrl, position: i, is_primary: i === 0 });
      if (imgError) console.warn(`  ! image row insert failed: ${imgError.message}`);
    })
  );
}

async function main() {
  const admin = createAdminClient();
  console.log("Ensuring Storage bucket exists...");
  await ensureBucket(admin);

  console.log("Loading already-imported source URLs (for idempotent re-runs)...");
  const existing = await getExistingSourceUrls(admin);
  console.log(`  ${existing.size} products already imported, will be skipped`);

  console.log("\nFetching Fouani catalog (Hisense, LG, Maxi — all categories)...");
  const fouani = await fetchFouaniProducts(existing);
  console.log(`Fouani: ${fouani.length} new products found`);

  console.log(
    "\nFetching Jumia catalog (Thermocool/Bruhm/Tamashi/MeWe — see JUMIA_BRAND_SOURCES in jumia.ts for per-brand scope, Snowsea — freezers only)..."
  );
  const jumia = await fetchJumiaProducts(existing);
  console.log(`Jumia: ${jumia.length} new products found`);

  // Listing pages can repeat a product across pages (pagination overlap,
  // sponsored placements), which would otherwise attempt two inserts with
  // the same deterministic slug and fail the second on the unique constraint.
  const seenUrls = new Set<string>();
  const all = [...fouani, ...jumia].filter((p) => {
    if (seenUrls.has(p.sourceUrl)) return false;
    seenUrls.add(p.sourceUrl);
    return true;
  });
  console.log(`\nImporting ${all.length} products into Supabase (${IMPORT_CONCURRENCY} at a time)...\n`);

  const brandCache = new Map<string, string>();
  const categoryCache = new Map<string, string>();

  // Resolve every distinct category up front, sequentially, so concurrent
  // importProduct calls below never race to insert the same new category.
  const categoryPairs = new Map<string, string>();
  for (const p of all) categoryPairs.set(p.categorySlug, p.categoryName);
  for (const [slug, name] of categoryPairs) {
    await getCategoryId(admin, categoryCache, slug, name);
  }

  const limit = pLimit(IMPORT_CONCURRENCY);
  let done = 0;
  await Promise.all(
    all.map((product) =>
      limit(async () => {
        done++;
        await importProduct(admin, brandCache, categoryCache, product, done, all.length);
      })
    )
  );

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
