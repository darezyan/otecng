import OpenGraphImage from "./opengraph-image";

export const alt = "Product on otecng";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default function Image(props: { params: Promise<{ slug: string }> }) {
  return OpenGraphImage(props);
}
