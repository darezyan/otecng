import { createServiceSupabaseClient } from "@/lib/supabase/serviceClient";
import type { Order, OrderItem } from "@/lib/supabase/types";

export type NewOrderInput = {
  paystackReference: string;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  items: { productId: string; name: string; price: number; qty: number }[];
};

export async function createPendingOrder(input: NewOrderInput): Promise<Order> {
  const supabase = createServiceSupabaseClient();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      status: "pending",
      paystack_reference: input.paystackReference,
      total: input.total,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      delivery_address: input.deliveryAddress,
      delivery_city: input.deliveryCity,
      delivery_state: input.deliveryState,
    })
    .select()
    .single();
  if (error) throw error;

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_price: item.price,
      qty: item.qty,
    }))
  );
  if (itemsError) throw itemsError;

  return order as unknown as Order;
}

// The `status = 'pending'` guard is the idempotency mechanism: the callback
// page and the webhook can both race to mark the same order, and a webhook
// can retry/redeliver — the second call always matches 0 rows and no-ops.
// Returns true only for the call that actually flipped pending -> paid, so
// exactly one caller sends the receipt email.
export async function markOrderPaid(paystackReference: string): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("paystack_reference", paystackReference)
    .eq("status", "pending")
    .select("id");
  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function markOrderFailed(paystackReference: string): Promise<void> {
  const supabase = createServiceSupabaseClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "failed" })
    .eq("paystack_reference", paystackReference)
    .eq("status", "pending");
  if (error) throw error;
}

export async function getOrderByReference(
  paystackReference: string
): Promise<(Order & { order_items: OrderItem[] }) | null> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("paystack_reference", paystackReference)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as (Order & { order_items: OrderItem[] })) ?? null;
}
