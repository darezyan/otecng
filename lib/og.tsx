import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Shared bits for every generated social preview image (Open Graph / Twitter).
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_COLORS = {
  ink: "#09090b",
  inkSoft: "#18181b",
  orange: "#f54a00",
  muted: "#a1a1aa",
  surface: "#f4f4f5",
};

let fontsPromise: Promise<{ name: string; data: Buffer; weight: 500 | 800; style: "normal" }[]> | null = null;

export function ogFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-Medium.ttf")),
    readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-ExtraBold.ttf")),
  ]).then(([medium, extraBold]) => [
    { name: "Jakarta", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Jakarta", data: extraBold, weight: 800 as const, style: "normal" as const },
  ]);
  return fontsPromise;
}

// Product photos are stored as WebP, which ImageResponse (Satori) can't
// decode. Fetch and re-encode to PNG as a data URI. Returns null on any
// failure so a preview still renders without the photo.
export async function toPngDataUri(url: string | null | undefined, maxSize = 900): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const input = Buffer.from(await res.arrayBuffer());
    const png = await sharp(input)
      .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export function Wordmark({ size = 40, inverted = true }: { size?: number; inverted?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: size,
        fontWeight: 800,
        letterSpacing: -1,
        color: inverted ? "#ffffff" : OG_COLORS.ink,
      }}
    >
      otec<span style={{ color: OG_COLORS.orange }}>ng</span>
    </div>
  );
}

/** Generic branded card: headline on the left, optional product photo on the right. */
export function BrandCard({
  eyebrow,
  title,
  subtitle,
  image,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  footer?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: OG_COLORS.ink,
        fontFamily: "Jakarta",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -220,
          right: -120,
          width: 640,
          height: 640,
          borderRadius: 9999,
          background: "rgba(245,74,0,0.25)",
          filter: "blur(120px)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, flex: 1 }}>
        <Wordmark size={44} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow && (
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: OG_COLORS.orange,
                marginBottom: 18,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: image ? (title.length > 24 ? 56 : 64) : title.length > 40 ? 58 : 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#ffffff",
              maxWidth: image ? 560 : 980,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 500,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.72)",
                marginTop: 22,
                maxWidth: image ? 540 : 900,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <div style={{ display: "flex", fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
          {footer ?? (image ? "Secure checkout · Doorstep delivery" : "Genuine appliances · Secure checkout · Doorstep delivery")}
        </div>
      </div>
      {image && (
        <div style={{ display: "flex", alignItems: "center", paddingRight: 72 }}>
          <div
            style={{
              display: "flex",
              width: 420,
              height: 420,
              borderRadius: 28,
              background: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              padding: 36,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={image} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        </div>
      )}
    </div>
  );
}
