import { NextRequest, NextResponse } from "next/server";
import { markOrderFailed, markOrderPaid } from "@/lib/data/orders";
import { verifyWebhookSignature } from "@/lib/squad";

type SquadWebhookPayload = {
  Event: string;
  TransactionRef: string;
  Body: { transaction_ref: string; transaction_status: string };
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-squad-encrypted-body");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as SquadWebhookPayload;
  const reference = event.Body?.transaction_ref ?? event.TransactionRef;
  const status = String(event.Body?.transaction_status ?? "").toLowerCase();

  if (event.Event === "charge_successful" && status === "success") {
    await markOrderPaid(reference);
  } else if (status === "failed" || status === "abandoned") {
    await markOrderFailed(reference);
  }

  return NextResponse.json({ received: true });
}
