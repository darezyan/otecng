import { NextRequest, NextResponse } from "next/server";
import { markOrderFailed } from "@/lib/data/orders";
import { markPaidAndSendReceipt } from "@/lib/email/send";
import { verifyWebhookSignature } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as { event: string; data: { reference: string } };

  if (event.event === "charge.success") {
    await markPaidAndSendReceipt(event.data.reference);
  } else if (event.event === "charge.failed") {
    await markOrderFailed(event.data.reference);
  }

  return NextResponse.json({ received: true });
}
