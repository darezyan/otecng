import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/data/products";
import { formatNaira } from "@/lib/format";
import { BrandCard, OG_COLORS, OG_SIZE, Wordmark, ogFonts, toPngDataUri } from "@/lib/og";

export const alt = "Product on otecng";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  const fonts = await ogFonts();

  if (!product) {
    return new ImageResponse(<BrandCard title="Electronics Made Easy" />, { ...size, fonts });
  }

  const sorted = [...product.product_images].sort((a, b) => a.position - b.position);
  const primary = product.product_images.find((i) => i.is_primary) ?? sorted[0];
  const image = await toPngDataUri(primary?.url, 1000);
  const name = product.name.length > 90 ? `${product.name.slice(0, 88).trimEnd()}…` : product.name;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff", fontFamily: "Jakarta" }}>
        <div
          style={{
            width: 600,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: OG_COLORS.surface,
            padding: 56,
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img src={image} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          ) : (
            <Wordmark size={64} inverted={false} />
          )}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 56px 48px",
            background: OG_COLORS.ink,
          }}
        >
          <Wordmark size={36} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: OG_COLORS.orange,
              }}
            >
              {`${product.brand.name} · ${product.category.name}`}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 16,
                fontSize: name.length > 55 ? 34 : 42,
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: -1,
                color: "#ffffff",
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 54,
                fontWeight: 800,
                letterSpacing: -1.5,
                color: "#ffffff",
              }}
            >
              {formatNaira(product.price)}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "12px 22px",
              borderRadius: 10,
              background: OG_COLORS.orange,
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            Shop now on otecng
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
