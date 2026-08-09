import { extractJsonAt } from "./jsonScan";
import { pLimit } from "./concurrency";
import type { ImportProduct } from "./types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const MAX_IMAGES = 5;
const REQUEST_DELAY_MS = 150;
const MAX_LISTING_PAGES = 20;
const DETAIL_FETCH_CONCURRENCY = 8;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) throw new Error(`Jumia ${res.status}: ${url}`);
  return res.text();
}

function extractStore(html: string): any {
  const marker = "window.__STORE__=";
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error("Jumia: window.__STORE__ not found");
  return extractJsonAt(html, idx + marker.length).value;
}

function absoluteUrl(path: string): string {
  return new URL(path, "https://www.jumia.com.ng").toString();
}

// Maps Jumia's breadcrumb-style category list onto the same canonical
// categories used for the Fouani import, so brands share one taxonomy.
// Ordered most-specific-first: Jumia's breadcrumbs are generic enough that,
// e.g., an "AC Remote Control" accessory carries a "TV, Audio & Video
// Accessories" crumb and would false-match /audio/ if that rule ran first.
const CATEGORY_RULES: { slug: string; name: string; pattern: RegExp }[] = [
  { slug: "freezers", name: "Freezers", pattern: /freezer/i },
  { slug: "refrigerators", name: "Refrigerators", pattern: /fridge|refrigerator/i },
  { slug: "acs", name: "Air Conditioners", pattern: /air\s?condition|\bac\b/i },
  { slug: "tvs", name: "TVs", pattern: /television|\btv\b/i },
  { slug: "washing-machines", name: "Washing Machines", pattern: /washing machine|washer|dryer/i },
  { slug: "cookers-microwave", name: "Cookers & Microwaves", pattern: /cooker|microwave|\boven\b/i },
  {
    slug: "small-appliances-fans",
    name: "Small Appliances & Fans",
    pattern: /\bfan\b|blender|kettle|\biron\b|toaster|dispenser|small appliance|water\s?heater/i,
  },
  { slug: "power-solution", name: "Power Solutions", pattern: /inverter|generator|solar|power/i },
  { slug: "furniture", name: "Furniture", pattern: /furniture/i },
  { slug: "audio", name: "Audio", pattern: /speaker|sound\s?bar|audio|home\s?theatre/i },
];

function categorize(name: string, categories: string[] = []): { slug: string; name: string } {
  const text = `${name} ${categories.join(" ")}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(text)) return { slug: rule.slug, name: rule.name };
  }
  return { slug: "others", name: "Others" };
}

function isFreezer(categories: string[] = []): boolean {
  return categories.some((c) => /freezer/i.test(c));
}

// Jumia's brand/category listing pages sometimes mix in "related" products
// from other sellers (e.g. Nexus, Aeon, Skyrun freezers showed up on the
// Snowsea freezers page). Cross-check the listing's own `brand` field so we
// never mistag another brand's product as ours.
function isBrand(product: any, expected: string): boolean {
  return typeof product.brand === "string" && product.brand.toLowerCase() === expected.toLowerCase();
}

async function fetchListingProducts(baseUrl: string): Promise<any[]> {
  const all: any[] = [];
  for (let page = 1; page <= MAX_LISTING_PAGES; page++) {
    const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
    let html: string;
    try {
      html = await fetchHtml(url);
    } catch {
      break;
    }
    const store = extractStore(html);
    const products = store?.products ?? [];
    if (products.length === 0) break;
    all.push(...products);
    await sleep(REQUEST_DELAY_MS);
  }
  return all;
}

async function fetchProductDetail(url: string): Promise<{ description: string; images: string[] }> {
  const html = await fetchHtml(url);
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    try {
      const data = JSON.parse(match[1]);
      const graph = data["@graph"] ?? [data];
      const product = graph.find((n: any) => n["@type"] === "Product");
      if (product) {
        const images: string[] = product.image?.contentUrl ?? (product.image ? [product.image] : []);
        return { description: String(product.description ?? "").trim(), images: images.slice(0, MAX_IMAGES) };
      }
    } catch {
      // not the product block; keep scanning
    }
  }
  return { description: "", images: [] };
}

export async function fetchJumiaProducts(skipSourceUrls: Set<string> = new Set()): Promise<ImportProduct[]> {
  const results: ImportProduct[] = [];

  console.log("  Jumia: listing Haier Thermocool catalog...");
  const thermocoolListing = (await fetchListingProducts("https://www.jumia.com.ng/haier-thermocool/")).filter((p) =>
    isBrand(p, "Haier Thermocool")
  );
  console.log(`  Jumia: Thermocool listing has ${thermocoolListing.length} products`);

  console.log("  Jumia: listing Snowsea freezers...");
  const snowseaListing = (await fetchListingProducts("https://www.jumia.com.ng/freezers/snowsea/")).filter(
    (p) => isFreezer(p.categories) && isBrand(p, "Snowsea")
  );
  console.log(`  Jumia: Snowsea freezer listing has ${snowseaListing.length} products`);

  const jobs = [
    ...thermocoolListing.map((product) => ({ brandSlug: "thermocool", product })),
    ...snowseaListing.map((product) => ({ brandSlug: "snowsea", product })),
  ].filter((job) => !skipSourceUrls.has(absoluteUrl(job.product.url)));

  console.log(`  Jumia: fetching detail pages for ${jobs.length} products (${DETAIL_FETCH_CONCURRENCY} at a time)...`);

  const limit = pLimit(DETAIL_FETCH_CONCURRENCY);
  let processed = 0;

  await Promise.all(
    jobs.map(({ brandSlug, product: p }) =>
      limit(async () => {
        const sourceUrl = absoluteUrl(p.url);

        let detail: { description: string; images: string[] };
        try {
          detail = await fetchProductDetail(sourceUrl);
        } catch (err) {
          console.warn(`  ! Jumia detail fetch failed for ${sourceUrl}: ${(err as Error).message}`);
          detail = { description: "", images: [] };
        }
        await sleep(REQUEST_DELAY_MS);

        const images = detail.images.length > 0 ? detail.images : [p.image].filter(Boolean);
        const price = Number(p.prices?.rawPrice ?? 0);

        processed++;
        if (processed % 20 === 0) {
          console.log(`  Jumia: processed ${processed}/${jobs.length} (running total ${results.length})`);
        }

        if (images.length === 0 || !price) return;

        const productName = p.displayName ?? p.name;
        const { slug: categorySlug, name: categoryName } = categorize(productName, p.categories);
        results.push({
          brandSlug,
          categorySlug,
          categoryName,
          name: productName,
          price,
          description: detail.description,
          sourceUrl,
          images,
        });
      })
    )
  );

  return results;
}
