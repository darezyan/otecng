import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-heading text-2xl font-bold text-foreground sm:text-3xl">Checkout</h1>
      <Suspense fallback={null}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
