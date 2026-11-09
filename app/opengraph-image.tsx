import { ImageResponse } from "next/og";
import { getHeroImages } from "@/lib/data/products";
import { BrandCard, OG_SIZE, ogFonts, toPngDataUri } from "@/lib/og";

export const alt = "otecng: Electronics Made Easy";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image() {
  const hero = await getHeroImages().catch(() => [] as string[]);
  const image = await toPngDataUri(hero[1] ?? hero[0]);
  return new ImageResponse(
    (
      <BrandCard
        title="Electronics Made Easy"
        subtitle="Shop quality electronics for your home, work, and everyday life."
        image={image}
      />
    ),
    { ...size, fonts: await ogFonts() }
  );
}
