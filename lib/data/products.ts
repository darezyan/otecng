import { createSupabaseClient } from "@/lib/supabase/client";
import type { Brand, Category, ProductWithRelations } from "@/lib/supabase/types";

const PRODUCT_SELECT = `*, brand:brands(*), category:categories(*), product_images(*)`;

export async function getBrands(): Promise<Brand[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("brands").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Brand[];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}

// Plain "newest N" tends to surface a whole page of near-identical listings
// from whichever brand/batch was imported last (e.g. a run of Snowsea
// freezers). Round-robin across brands instead so "featured" actually shows
// a spread.
export async function getFeaturedProducts(limit = 8): Promise<ProductWithRelations[]> {
  const supabase = createSupabaseClient();
  const brands = await getBrands();
  const perBrand = Math.ceil(limit / brands.length) + 1;

  const byBrand = await Promise.all(
    brands.map(async (brand) => {
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: false })
        .limit(perBrand);
      return (data ?? []) as unknown as ProductWithRelations[];
    })
  );

  const interleaved: ProductWithRelations[] = [];
  for (let i = 0; i < perBrand; i++) {
    for (const list of byBrand) {
      if (list[i]) interleaved.push(list[i]);
    }
  }
  return interleaved.slice(0, limit);
}

export async function getProductsByCategorySlug(categorySlug: string, limit = 8): Promise<ProductWithRelations[]> {
  const supabase = createSupabaseClient();
  const { data: category } = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
  if (!category) return [];
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithRelations[];
}

// "min-max" or "min-" (open-ended) — e.g. "100000-300000", "2000000-".
export const PRICE_BRACKETS: { value: string; label: string }[] = [
  { value: "0-100000", label: "Under ₦100,000" },
  { value: "100000-300000", label: "₦100,000 – ₦300,000" },
  { value: "300000-500000", label: "₦300,000 – ₦500,000" },
  { value: "500000-1000000", label: "₦500,000 – ₦1,000,000" },
  { value: "1000000-2000000", label: "₦1,000,000 – ₦2,000,000" },
  { value: "2000000-", label: "Above ₦2,000,000" },
];

function parseBracket(bracket: string): { min: number; max: number | null } {
  const [minStr, maxStr] = bracket.split("-");
  return { min: Number(minStr), max: maxStr ? Number(maxStr) : null };
}

function inBracket(value: number | null, bracket: string): boolean {
  if (value === null) return false;
  const { min, max } = parseBracket(bracket);
  return value >= min && (max === null || value <= max);
}

export type ProductFilters = {
  brandSlug?: string;
  categorySlug?: string;
  query?: string;
  sizeBracket?: string;
  priceBracket?: string;
  page?: number;
  pageSize?: number;
};

export async function getProducts(
  filters: ProductFilters = {}
): Promise<{ products: ProductWithRelations[]; count: number }> {
  const { brandSlug, categorySlug, query, sizeBracket, priceBracket, page = 1, pageSize = 24 } = filters;
  const supabase = createSupabaseClient();

  let dbQuery = supabase.from("products").select(PRODUCT_SELECT, { count: "exact" });

  if (brandSlug) {
    const { data: brand } = await supabase.from("brands").select("id").eq("slug", brandSlug).single();
    if (!brand) return { products: [], count: 0 };
    dbQuery = dbQuery.eq("brand_id", brand.id);
  }
  if (categorySlug) {
    const { data: category } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();
    if (!category) return { products: [], count: 0 };
    dbQuery = dbQuery.eq("category_id", category.id);
  }
  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }
  if (priceBracket) {
    const { min, max } = parseBracket(priceBracket);
    if (!Number.isNaN(min)) dbQuery = dbQuery.gte("price", min);
    if (max !== null && !Number.isNaN(max)) dbQuery = dbQuery.lte("price", max);
  }

  // Size (liters) isn't a real column — it's parsed out of the product name —
  // so a size-bracket filter can't be pushed into the SQL query. Fetch the
  // (already narrowly-filtered) candidate set unpaginated and filter/paginate
  // in memory instead. Fine at this scale (a few hundred rows per category).
  if (sizeBracket) {
    const { data, error } = await dbQuery.order("created_at", { ascending: false });
    if (error) throw error;
    const filtered = ((data ?? []) as unknown as ProductWithRelations[]).filter((p) =>
      inBracket(extractLiters(p.name), sizeBracket)
    );
    const from = (page - 1) * pageSize;
    return { products: filtered.slice(from, from + pageSize), count: filtered.length };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await dbQuery.order("created_at", { ascending: false }).range(from, to);
  if (error) throw error;
  return { products: (data ?? []) as unknown as ProductWithRelations[], count: count ?? 0 };
}

// Used by checkout to recompute order totals server-side from current DB
// prices — never trust a price the client's cart sends us.
export async function getProductsByIds(ids: string[]): Promise<ProductWithRelations[]> {
  if (ids.length === 0) return [];
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).in("id", ids);
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithRelations[];
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as unknown as ProductWithRelations) ?? null;
}

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4
): Promise<ProductWithRelations[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithRelations[];
}

// Powers the header's per-category dropdown: which brands actually sell in
// this category, plus one representative product photo.
export async function getCategoryMenuData(
  categorySlug: string,
  allBrands: Brand[]
): Promise<{ brands: Brand[]; thumbnail: string | null }> {
  const supabase = createSupabaseClient();
  const { data: category } = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
  if (!category) return { brands: [], thumbnail: null };

  const [{ data: rows }, { data: imageRow }] = await Promise.all([
    supabase.from("products").select("brand_id").eq("category_id", category.id),
    supabase
      .from("products")
      .select("product_images(url, is_primary)")
      .eq("category_id", category.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const brandIds = new Set((rows ?? []).map((r) => r.brand_id as string));
  const brands = allBrands.filter((b) => brandIds.has(b.id));

  const images = (imageRow?.product_images ?? []) as { url: string; is_primary: boolean }[];
  const thumbnail = images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;

  return { brands, thumbnail };
}

// Refrigerator listings don't have a structured "size" column — capacity is
// baked into the name (e.g. "LG Cross Door Refrigerator 570L (...)"). Extract
// it from there rather than adding a schema column for one field.
const REFRIGERATOR_SIZE_PATTERN = /\b(\d{2,4})L\b/;

function extractLiters(name: string): number | null {
  const match = REFRIGERATOR_SIZE_PATTERN.exec(name);
  return match ? Number(match[1]) : null;
}

// "min-max" or "min-" (open-ended), in liters — mirrors PRICE_BRACKETS.
export const REFRIGERATOR_SIZE_BRACKETS: { value: string; label: string }[] = [
  { value: "0-50", label: "Under 50L" },
  { value: "50-200", label: "50L – 200L" },
  { value: "200-400", label: "200L – 400L" },
  { value: "400-600", label: "400L – 600L" },
  { value: "600-", label: "600L and above" },
];

export type SizeFacet = { value: string; label: string; count: number };

export async function getRefrigeratorSizeFacets(): Promise<SizeFacet[]> {
  const supabase = createSupabaseClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "refrigerators")
    .maybeSingle();
  if (!category) return [];

  const { data } = await supabase.from("products").select("name").eq("category_id", category.id);
  const liters = (data ?? []).map((row) => extractLiters(row.name as string));

  return REFRIGERATOR_SIZE_BRACKETS.map((bracket) => ({
    ...bracket,
    count: liters.filter((l) => inBracket(l, bracket.value)).length,
  })).filter((facet) => facet.count > 0);
}

// One representative photo per category for the homepage hero collage —
// picking blind from `product_images` tends to land on a run of near-
// identical images (same brand/listing batch), so we deliberately diversify.
const HERO_CATEGORY_SLUGS: { category: string; brand?: string }[] = [
  { category: "tvs" },
  { category: "refrigerators" },
  { category: "freezers", brand: "lg" },
  { category: "acs", brand: "hisense" },
];

export async function getHeroImages(): Promise<string[]> {
  const supabase = createSupabaseClient();
  const results = await Promise.all(
    HERO_CATEGORY_SLUGS.map(async ({ category: slug, brand: brandSlug }) => {
      const { data: category } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
      if (!category) return null;
      let query = supabase
        .from("products")
        .select("product_images(url, is_primary)")
        .eq("category_id", category.id);
      if (brandSlug) {
        const { data: brand } = await supabase.from("brands").select("id").eq("slug", brandSlug).maybeSingle();
        if (brand) query = query.eq("brand_id", brand.id);
      }
      const { data } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();
      const images = (data?.product_images ?? []) as { url: string; is_primary: boolean }[];
      return images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
    })
  );
  return results.filter((url): url is string => Boolean(url));
}
