import Link from "next/link";
import type { Metadata } from "next";
import { CircleCheck, CircleX } from "lucide-react";
import { getOrderByReference, markOrderFailed } from "@/lib/data/orders";
import { markPaidAndSendReceipt } from "@/lib/email/send";
import { orderNumber } from "@/lib/email/receipt";
import { verifyTransaction } from "@/lib/paystack";
import { formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";
import ClearCartOnSuccess from "@/components/ClearCartOnSuccess";
import type { Order, OrderItem } from "@/lib/supabase/types";

type OrderWithItems = Order & { order_items: OrderItem[] };

export const metadata: Metadata = { title: "Order status", robots: { index: false, follow: false } };

export default async function CheckoutCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { reference: refParam, trxref } = await searchParams;
  const reference = refParam ?? trxref;

  if (!reference) {
    return <Failure message="No payment reference was provided." />;
  }

  // Never trust the redirect alone — verify server-side against Paystack
  // before treating anything as paid.
  let verified;
  try {
    verified = await verifyTransaction(reference);
  } catch {
    return <Failure message="We couldn't verify this payment. If you were charged, contact support with your reference." reference={reference} />;
  }

  const order = await getOrderByReference(reference);
  if (!order) {
    return <Failure message="We couldn't find an order for this payment." reference={reference} />;
  }

  const amountMatches = verified.data.amount === Math.round(order.total * 100);

  if (verified.data.status === "success" && amountMatches) {
    await markPaidAndSendReceipt(reference);
    return <Success order={order} />;
  }

  await markOrderFailed(reference);
  return <Failure message="This payment was not completed." reference={reference} />;
}

function Success({ order }: { order: OrderWithItems }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <ClearCartOnSuccess />
      <div className="text-center">
        <CircleCheck className="mx-auto size-14 text-emerald-600" strokeWidth={1.5} aria-hidden />
        <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">Order confirmed</h1>
        <p className="mt-2 text-muted-foreground">
          Thanks, {order.customer_name.split(" ")[0]}. We&apos;ve received your payment and emailed a receipt to{" "}
          <span className="font-medium text-foreground">{order.customer_email}</span>.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border">
        <div className="grid grid-cols-2 gap-4 bg-surface p-5 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Order number</p>
            <p className="mt-0.5 font-semibold text-foreground">{orderNumber(order)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Payment reference</p>
            <p className="mt-0.5 truncate font-medium text-foreground">{order.paystack_reference}</p>
          </div>
        </div>
        <div className="divide-y px-5">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm">
              <span className="text-foreground">
                {item.product_name} <span className="text-muted-foreground">&times; {item.qty}</span>
              </span>
              <span className="shrink-0 font-medium text-foreground">{formatNaira(item.product_price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t px-5 py-4 font-semibold">
          <span className="text-foreground">Total paid</span>
          <span className="font-heading text-lg text-foreground">{formatNaira(order.total)}</span>
        </div>
        <div className="border-t px-5 py-4 text-sm text-muted-foreground">
          Delivering to {order.delivery_address}, {order.delivery_city}, {order.delivery_state}. We&apos;ll call{" "}
          {order.customer_phone} to arrange delivery.
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button nativeButton={false} size="lg" className="h-12 px-6 font-semibold" render={<Link href="/products">Continue shopping</Link>} />
      </div>
    </div>
  );
}

function Failure({ message, reference }: { message: string; reference?: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <CircleX className="mx-auto size-14 text-destructive" strokeWidth={1.5} aria-hidden />
      <h1 className="mt-4 font-heading text-3xl font-bold text-foreground">Payment not completed</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      {reference && <p className="mt-2 text-xs break-all text-muted-foreground">Reference: {reference}</p>}
      <p className="mt-2 text-sm text-muted-foreground">Your cart has been kept so you can try again.</p>
      <Button nativeButton={false} size="lg" className="mt-8 h-12 px-6 font-semibold" render={<Link href="/checkout">Try again</Link>} />
    </div>
  );
}
