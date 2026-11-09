import { ImageResponse } from "next/og";
import { getHeroImages } from "@/lib/data/products";
import { BrandCard, OG_SIZE, ogFonts, toPngDataUri } from "@/lib/og";

export const alt = "otecng: genuine home appliances, delivered";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image() {
  const hero = await getHeroImages().catch(() => [] as string[]);
  const image = await toPngDataUri(hero[1] ?? hero[0]);
  return new ImageResponse(
    (
      <BrandCard
        title="Home appliances, made simple."
        subtitle="TVs, refrigerators, freezers, ACs and more at honest prices."
        image={image}
      />
    ),
    { ...size, fonts: await ogFonts() }
  );
}
