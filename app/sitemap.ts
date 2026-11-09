import type { MetadataRoute } from "next";
import { getAllProductSlugs, getBrands, getCategories } from "@/lib/data/products";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    getAllProductSlugs().catch(() => []),
    getCategories().catch(() => []),
    getBrands().catch(() => []),
  ]);

  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/products"), changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/products?category=${c.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...brands.map((b) => ({
      url: absoluteUrl(`/products?brand=${b.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/products/${p.slug}`),
      lastModified: new Date(p.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
