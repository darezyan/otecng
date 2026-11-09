export const SITE_NAME = "otecng";
export const SITE_TAGLINE = "Genuine home appliances, delivered";
export const SITE_DESCRIPTION =
  "Shop genuine TVs, refrigerators, freezers, air conditioners, washing machines and home appliances from trusted brands like Hisense, LG, Maxi and Thermocool. Honest prices, secure Paystack checkout and doorstep delivery in Nigeria.";

// Canonical origin for metadata, OG images, sitemap and emails.
// NEXT_PUBLIC_SITE_URL wins (set it once a custom domain is attached);
// on Vercel we fall back to the project's production domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}
