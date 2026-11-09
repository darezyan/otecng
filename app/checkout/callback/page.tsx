import type { Metadata } from "next";
import Link from "next/link";
import { getOrderByReference, markOrderFailed } from "@/lib/data/orders";
import { markPaidAndSendReceipt } from "@/lib/email/send";
import { verifyTransaction } from "@/lib/squad";
import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";
import ClearCartOnSuccess from "@/components/ClearCartOnSuccess";
import type { Order, OrderItem } from "@/lib/supabase/types";

type OrderWithItems = Order & { order_items: OrderItem[] };

export const metadata: Metadata = { title: "Order status", robots: { index: false, follow: false } };

export default async function CheckoutCallbackPage({
  searchParams,
}: {
  // Squad's docs confirm the reference comes back as a query param on the
  // callback redirect but don't pin down the exact key — check the
  // plausible variants (their own request/response fields use
  // "transaction_ref"; "reference"/"trxref" are common gateway conventions).
  searchParams: Promise<{ transaction_ref?: string; reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.transaction_ref ?? params.reference ?? params.trxref;

  if (!reference) {
    return <Failure message="No payment reference was provided." />;
  }

  // Never trust the redirect alone — verify server-side against Squad
  // before treating anything as paid.
  let verified;
  try {
    verified = await verifyTransaction(reference);
  } catch {
    return (
      <Failure
        message="We couldn't verify this payment. If you were charged, contact support with your reference."
        reference={reference}
      />
    );
  }

  const order = await getOrderByReference(reference);
  if (!order) {
    return <Failure message="We couldn't find an order for this payment." reference={reference} />;
  }

  const amountMatches = verified.amountKobo === Math.round(order.total * 100);

  if (verified.status === "success" && amountMatches) {
    await markPaidAndSendReceipt(reference);
    return <Success order={order} />;
  }

  await markOrderFailed(reference);
  return <Failure message="This payment was not completed." reference={reference} />;
}

function Success({ order }: { order: OrderWithItems }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <ClearCartOnSuccess />
      <h1 className="text-2xl font-bold text-foreground">Order confirmed</h1>
      <p className="mt-2 text-muted-foreground">
        Thanks, {order.customer_name} — we&apos;ve received your order.
      </p>

      <div className="mt-8 rounded-2xl border p-5 text-left">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-medium text-foreground">{order.payment_reference}</span>
        </div>
        <div className="mt-4 divide-y">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground">
                {item.product_name} &times; {item.qty}
              </span>
              <span className="text-muted-foreground">{formatNaira(item.product_price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm font-semibold">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{formatNaira(order.total)}</span>
        </div>
      </div>

      <Button className="mt-8" render={<Link href="/products">Continue shopping</Link>} />
    </div>
  );
}

function Failure({ message, reference }: { message: string; reference?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">Payment not completed</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      {reference && <p className="mt-1 text-xs text-muted-foreground">Reference: {reference}</p>}
      <Button className="mt-8" render={<Link href="/checkout">Try again</Link>} />
    </div>
  );
}
