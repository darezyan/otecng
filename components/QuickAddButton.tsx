"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart/CartProvider";
import type { CartLine } from "@/lib/cart/types";

// One-tap "Add to cart" on product cards. Adds a single unit; the product
// page keeps the quantity stepper and Buy Now.
export default function QuickAddButton({ line }: { line: Omit<CartLine, "qty"> }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add({ ...line, qty: 1 });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-sm font-semibold transition-colors ${
        added
          ? "bg-zinc-900 text-white"
          : "border border-zinc-300 bg-white text-zinc-900 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      {added ? (
        <>
          <Check className="size-4" /> Added
        </>
      ) : (
        "Add to cart"
      )}
    </button>
  );
}
