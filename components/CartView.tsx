"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart/CartProvider";
import { formatNaira } from "@/lib/format";

export default function CartView() {
  const { hydrated, lines, subtotal, setQty, remove } = useCart();

  if (!hydrated) return null;

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-20 text-center">
        <p className="font-medium text-foreground">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">Browse our range and add something you like.</p>
        <Button nativeButton={false} className="mt-6" render={<Link href="/products">Shop all products</Link>} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="divide-y rounded-xl border">
          {lines.map((line) => (
            <div key={line.productId} className="flex gap-4 p-4">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-surface">
                {line.image ? (
                  <Image src={line.image} alt="" fill sizes="80px" className="object-contain p-2" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-[11px] font-semibold tracking-wide text-primary uppercase">
                  {line.brandName}
                </span>
                <Link href={`/products/${line.slug}`} className="text-sm font-medium text-foreground hover:underline">
                  {line.name}
                </Link>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 rounded-lg border">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(line.productId, line.qty - 1)}
                    >
                      <Minus />
                    </Button>
                    <span className="w-6 text-center text-sm">{line.qty}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Increase quantity"
                      onClick={() => setQty(line.productId, line.qty + 1)}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <span className="font-heading text-sm font-bold text-foreground">
                    {formatNaira(line.price * line.qty)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove from cart"
                className="text-muted-foreground"
                onClick={() => remove(line.productId)}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-xl border bg-surface p-6 lg:sticky lg:top-44">
        <h2 className="font-heading text-base font-bold text-foreground">Order summary</h2>
        <Separator className="my-4" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{formatNaira(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Delivery fee calculated at checkout.</p>
        <Button nativeButton={false} size="lg" className="mt-5 h-12 w-full text-sm font-semibold" render={<Link href="/checkout">Proceed to checkout</Link>} />
        <p className="mt-3 text-center text-xs text-muted-foreground">Secure payment with Paystack</p>
      </div>
    </div>
  );
}
