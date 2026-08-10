export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  brandName: string;
  qty: number;
};

// sessionStorage key for a Buy Now line — separate from the persistent
// "otecng:cart" localStorage key so Buy Now never touches the real cart.
export const BUY_NOW_STORAGE_KEY = "otecng:buyNow";
