import { getOrderByReference, markOrderPaid } from "@/lib/data/orders";
import { renderReceiptEmail } from "./receipt";

// Transactional email via Resend's REST API (no SDK needed).
//   RESEND_API_KEY        required to send; without it receipts are skipped (logged)
//   EMAIL_FROM            e.g. "otecng <orders@otecng.com>" (domain must be verified in Resend)
//   EMAIL_REPLY_TO        optional, where customer replies go
//   STORE_ORDER_EMAIL     optional, gets a copy of every receipt (new-order alert)
async function sendEmail(input: { to: string; subject: string; html: string; text: string; bcc?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not set; skipped "${input.subject}" to ${input.to}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "otecng <onboarding@resend.dev>",
      to: [input.to],
      bcc: input.bcc ? [input.bcc] : undefined,
      reply_to: process.env.EMAIL_REPLY_TO || undefined,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}

/**
 * Marks the order paid and, only if this call is the one that flipped it
 * from pending, emails the customer their receipt. Safe to call from both
 * the callback page and the webhook: the loser of the race no-ops.
 * Email failures are logged, never thrown, so they can't fail a payment.
 */
export async function markPaidAndSendReceipt(paymentReference: string): Promise<void> {
  const transitioned = await markOrderPaid(paymentReference);
  if (!transitioned) return;

  try {
    const order = await getOrderByReference(paymentReference);
    if (!order) return;
    const { subject, html, text } = renderReceiptEmail(order);
    await sendEmail({
      to: order.customer_email,
      subject,
      html,
      text,
      bcc: process.env.STORE_ORDER_EMAIL || undefined,
    });
  } catch (err) {
    console.error(`[email] receipt for ${paymentReference} failed:`, err);
  }
}
