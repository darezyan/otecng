import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/data/products";
import { createPendingOrder } from "@/lib/data/orders";
import { initializeTransaction } from "@/lib/squad";

type CheckoutBody = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  items: { productId: string; qty: number }[];
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CheckoutBody>;

    if (
      !isNonEmptyString(body.customerName) ||
      !isNonEmptyString(body.customerEmail) ||
      !isNonEmptyString(body.customerPhone) ||
      !isNonEmptyString(body.deliveryAddress) ||
      !isNonEmptyString(body.deliveryCity) ||
      !isNonEmptyString(body.deliveryState) ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json({ error: "Missing or invalid checkout details" }, { status: 400 });
    }

    const qtyByProductId = new Map(body.items.map((item) => [item.productId, item.qty]));
    const products = await getProductsByIds([...qtyByProductId.keys()]);

    if (products.length !== qtyByProductId.size) {
      return NextResponse.json({ error: "One or more items are no longer available" }, { status: 400 });
    }

    // Recompute total from current DB prices — never trust the client's cart snapshot.
    const orderItems = products.map((product) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: qtyByProductId.get(product.id)!,
    }));
    const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const paymentReference = `otecng_${crypto.randomUUID()}`;

    await createPendingOrder({
      paymentReference,
      total,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      deliveryAddress: body.deliveryAddress,
      deliveryCity: body.deliveryCity,
      deliveryState: body.deliveryState,
      items: orderItems,
    });

    const callbackUrl = new URL("/checkout/callback", request.url).toString();

    const init = await initializeTransaction({
      email: body.customerEmail,
      customerName: body.customerName,
      amountKobo: Math.round(total * 100), // Squad amounts are in kobo, same as Paystack
      reference: paymentReference,
      callbackUrl,
    });
    return NextResponse.json({ redirectUrl: init.checkoutUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start checkout" },
      { status: 500 }
    );
  }
}
