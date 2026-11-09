import * as cheerio from "cheerio";
import type { ImportProduct } from "./types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const BRANDS = [
  { id: 1, slug: "lg" },
  { id: 5, slug: "hisense" },
  { id: 7, slug: "maxi" },
] as const;

// Fouani's top-level shop categories (category_id -> our canonical slug/name).
// "Promotions" (id 114) is deliberately excluded: it's a marketing bundle
// collection, not a real product category, and would create near-duplicates.
const CATEGORIES = [
  { id: 15, slug: "refrigerators", name: "Refrigerators" },
  { id: 174, slug: "freezers", name: "Freezers" },
  { id: 18, slug: "washing-machines", name: "Washing Machines" },
  { id: 5, slug: "tvs", name: "TVs" },
  { id: 9, slug: "audio", name: "Audio" },
  { id: 44, slug: "acs", name: "Air Conditioners" },
  { id: 49, slug: "small-appliances", name: "Small Appliances" },
  { id: 39, slug: "power-solution", name: "Power Solutions" },
  { id: 33, slug: "furniture", name: "Furniture" },
  { id: 177, slug: "cookers-microwave", name: "Cookers & Microwaves" },
  { id: 183, slug: "others", name: "Others" },
] as const;

const MAX_IMAGES = 5;

async function fetchListingJson(categoryId: number, brandId: number, page: number): Promise<any> {
  const url = `https://fouanistore.com/nigeria-en/shop?category_id=${categoryId}&with_filters=true&brand_ids[]=${brandId}&page=${page}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) throw new Error(`Fouani ${res.status}: ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const raw = $("#__NEXT_DATA__").html();
  if (!raw) throw new Error(`Fouani: __NEXT_DATA__ not found at ${url}`);
  return JSON.parse(raw);
}

function imageUrl(img: any): string | null {
  if (!img?.base_url) return null;
  const file = img.webp_image || img.origin;
  if (!file) return null;
  return `${img.base_url}/${file}`;
}

// Fouani's category_id=49 bundles fans in with small appliances (blenders,
// kettles, irons, etc.) on their own site — split fans out into their own
// category on ours, matched by product name since Fouani gives no other signal.
const FAN_PATTERN = /\bfan\b/i;

function resolveCategory(categoryId: number, name: string, fallback: { slug: string; name: string }) {
  if (categoryId === 49 && FAN_PATTERN.test(name)) {
    return { slug: "fans", name: "Fans" };
  }
  return fallback;
}

// Fouani's raw description is markdown with a "Related PDFs" section linking
// to *their* warranty/document CDN — not something otecng should surface.
function cleanDescription(raw: string): string {
  return raw
    .split(/related pdfs?:?/i)[0]
    .replace(/^####\s*/gm, "")
    .replace(/^description:?\s*$/gim, "")
    .trim();
}

export async function fetchFouaniProducts(
  skipSourceUrls: Set<string> = new Set()
): Promise<ImportProduct[]> {
  const results: ImportProduct[] = [];

  for (const brand of BRANDS) {
    for (const category of CATEGORIES) {
      let page = 1;
      let lastPage = 1;
      do {
        const data = await fetchListingJson(category.id, brand.id, page);
        const payload = data?.props?.pageProps?.data;
        if (!payload) break;
        lastPage = payload.last_page ?? 1;

        for (const p of (payload.data ?? []) as any[]) {
          const sourceUrl = `https://fouanistore.com/nigeria-en/product/${p.id}`;
          if (skipSourceUrls.has(sourceUrl)) continue;

          const images = [imageUrl(p.image), ...(p.attachments ?? []).map((a: any) => imageUrl(a.image))].filter(
            (u): u is string => !!u
          );
          const uniqueImages = Array.from(new Set(images)).slice(0, MAX_IMAGES);
          if (uniqueImages.length === 0) continue;

          const price = Number(p.discounted_price) > 0 ? Number(p.discounted_price) : Number(p.price);
          if (!price) continue;

          const { slug: categorySlug, name: categoryName } = resolveCategory(category.id, p.name, category);
          results.push({
            brandSlug: brand.slug,
            categorySlug,
            categoryName,
            name: p.name,
            price,
            description: cleanDescription(String(p.description ?? "")),
            sourceUrl,
            images: uniqueImages,
          });
        }
        page++;
      } while (page <= lastPage);

      console.log(`  Fouani ${brand.slug}/${category.slug}: done (running total ${results.length})`);
    }
  }

  return results;
}
