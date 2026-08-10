import CartView from "@/components/CartView";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">Your cart</h1>
      <CartView />
    </div>
  );
}
