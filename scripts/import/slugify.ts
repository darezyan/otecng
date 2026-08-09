import { createHash } from "node:crypto";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180);
}

export function uniqueSlug(name: string, sourceUrl: string): string {
  const hash = createHash("md5").update(sourceUrl).digest("hex").slice(0, 6);
  return `${slugify(name)}-${hash}`;
}
