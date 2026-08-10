"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart/CartProvider";
import { BUY_NOW_STORAGE_KEY, type CartLine } from "@/lib/cart/types";
import { formatNaira } from "@/lib/format";

type GuestInfo = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
};

const EMPTY_GUEST_INFO: GuestInfo = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  deliveryAddress: "",
  deliveryCity: "",
  deliveryState: "",
};

export default function CheckoutForm() {
  const isBuyNow = useSearchParams().get("mode") === "buynow";
  const { hydrated, lines: cartLines } = useCart();
  const [buyNowLines, hydrateBuyNowLines] = useReducer((_: CartLine[], lines: CartLine[]) => lines, []);

  useEffect(() => {
    if (!isBuyNow) return;
    const raw = sessionStorage.getItem(BUY_NOW_STORAGE_KEY);
    if (raw) hydrateBuyNowLines(JSON.parse(raw));
  }, [isBuyNow]);

  const lines = isBuyNow ? buyNowLines : cartLines;
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  const [info, setInfo] = useState<GuestInfo>(EMPTY_GUEST_INFO);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...info,
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong starting your payment");
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (!hydrated && !isBuyNow) return null;

  if (lines.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">There&apos;s nothing to check out.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Field id="customerName" label="Full name">
          <Input
            id="customerName"
            required
            value={info.customerName}
            onChange={(e) => setInfo({ ...info, customerName: e.target.value })}
          />
        </Field>
        <Field id="customerEmail" label="Email">
          <Input
            id="customerEmail"
            type="email"
            required
            value={info.customerEmail}
            onChange={(e) => setInfo({ ...info, customerEmail: e.target.value })}
          />
        </Field>
        <Field id="customerPhone" label="Phone">
          <Input
            id="customerPhone"
            type="tel"
            required
            value={info.customerPhone}
            onChange={(e) => setInfo({ ...info, customerPhone: e.target.value })}
          />
        </Field>
        <Field id="deliveryAddress" label="Delivery address">
          <Input
            id="deliveryAddress"
            required
            value={info.deliveryAddress}
            onChange={(e) => setInfo({ ...info, deliveryAddress: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field id="deliveryCity" label="City">
            <Input
              id="deliveryCity"
              required
              value={info.deliveryCity}
              onChange={(e) => setInfo({ ...info, deliveryCity: e.target.value })}
            />
          </Field>
          <Field id="deliveryState" label="State">
            <Input
              id="deliveryState"
              required
              value={info.deliveryState}
              onChange={(e) => setInfo({ ...info, deliveryState: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="h-fit rounded-2xl border p-5">
        <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
        <Separator className="my-4" />
        <div className="space-y-2">
          {lines.map((line) => (
            <div key={line.productId} className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                {line.name} &times; {line.qty}
              </span>
              <span className="text-muted-foreground">{formatNaira(line.price * line.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm font-semibold">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatNaira(subtotal)}</span>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-5 w-full" disabled={submitting}>
          {submitting ? "Starting payment..." : "Pay with Paystack"}
        </Button>
      </div>
    </form>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
