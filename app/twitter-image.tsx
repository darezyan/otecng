import OpenGraphImage from "./opengraph-image";

export const alt = "otecng: Electronics Made Easy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default function Image() {
  return OpenGraphImage();
}
