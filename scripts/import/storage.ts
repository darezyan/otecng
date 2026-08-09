import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Untyped on purpose: this admin client only exists for the one-off import
// script, which writes rows shaped by ImportProduct rather than the app's
// read-side Database type. The storefront's Supabase clients stay typed.
export type AdminClient = ReturnType<typeof createAdminClient>;

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function ensureBucket(admin: AdminClient) {
  const { data: buckets, error } = await admin.storage.listBuckets();
  if (error) throw error;
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: createError } = await admin.storage.createBucket(BUCKET, { public: true });
    if (createError) throw createError;
  }
}

function extFromContentType(ct: string | null): string {
  if (!ct) return "jpg";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("png")) return "png";
  return "jpg";
}

export async function uploadProductImage(
  admin: AdminClient,
  sourceImageUrl: string,
  storagePathBase: string
): Promise<string | null> {
  try {
    const res = await fetch(sourceImageUrl, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type");
    const ext = extFromContentType(contentType);
    const buffer = Buffer.from(await res.arrayBuffer());
    const path = `${storagePathBase}.${ext}`;

    const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
      contentType: contentType ?? "image/jpeg",
      upsert: true,
    });
    if (error) throw error;

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.warn(`    ! image upload failed (${sourceImageUrl}): ${(err as Error).message}`);
    return null;
  }
}
