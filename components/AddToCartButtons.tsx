"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/CartProvider";
import { BUY_NOW_STORAGE_KEY, type CartLine } from "@/lib/cart/types";

export default function AddToCartButtons({
  productId,
  slug,
  name,
  price,
  image,
  brandName,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  brandName: string;
}) {
  const router = useRouter();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function line(): CartLine {
    return { productId, slug, name, price, image, brandName, qty };
  }

  function handleAddToCart() {
    add(line());
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify([line()]));
    router.push("/checkout?mode=buynow");
  }

  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Quantity</span>
        <div className="flex w-fit items-center rounded-lg border">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus />
          </Button>
          <span className="w-10 text-center text-sm font-semibold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <Button variant="ghost" size="icon" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
            <Plus />
          </Button>
        </div>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Button size="lg" className="h-12 text-sm font-semibold" onClick={handleAddToCart}>
          {added ? (
            <>
              <Check /> Added to cart
            </>
          ) : (
            <>
              <ShoppingBag /> Add to cart
            </>
          )}
        </Button>
        <Button
          size="lg"
          className="h-12 bg-ink text-sm font-semibold text-white hover:bg-ink-soft"
          onClick={handleBuyNow}
        >
          Buy now
        </Button>
      </div>
    </div>
  );
}
