import type { Metadata } from "next";
import { getFeaturedProducts } from "@/lib/data/products";
import CartView from "@/components/CartView";

export const metadata: Metadata = { title: "Your cart", robots: { index: false, follow: false } };
export const revalidate = 3600;

export default async function CartPage() {
  const suggestions = await getFeaturedProducts(4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">Your cart</h1>
      <CartView suggestions={suggestions} />
    </div>
  );
}
