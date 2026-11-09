import type { Order, OrderItem } from "@/lib/supabase/types";
import { formatNaira } from "@/lib/format";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export type OrderWithItems = Order & { order_items: OrderItem[] };

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(d);
}

/** Short, human-friendly order number derived from the order UUID. */
export function orderNumber(order: Pick<Order, "id">): string {
  return `OTC-${order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

// Table-based, inline-styled HTML: the only layout that renders reliably in
// Gmail, Outlook and Apple Mail. No external CSS, no web fonts.
export function renderReceiptEmail(order: OrderWithItems): { subject: string; html: string; text: string } {
  const number = orderNumber(order);
  const firstName = order.customer_name.trim().split(/\s+/)[0] || order.customer_name;
  const subject = `Your ${SITE_NAME} receipt · ${number}`;
  const ink = "#09090b";
  const orange = "#f54a00";
  const muted = "#667085";
  const border = "#e6e8ee";

  const rows = order.order_items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid ${border};font-size:14px;line-height:20px;color:${ink};">
            ${esc(item.product_name)}
            <div style="font-size:12px;color:${muted};">${item.qty} &times; ${formatNaira(item.product_price)}</div>
          </td>
          <td align="right" style="padding:14px 0 14px 16px;border-bottom:1px solid ${border};font-size:14px;font-weight:600;color:${ink};white-space:nowrap;">
            ${formatNaira(item.product_price * item.qty)}
          </td>
        </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">Payment received for order ${number}. Total ${formatNaira(order.total)}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f7;">
  <tr><td align="center" style="padding:32px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${border};">
      <tr><td style="background:${ink};padding:24px 32px;">
        <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">otec<span style="color:${orange};">ng</span></span>
      </td></tr>

      <tr><td style="padding:32px 32px 8px;">
        <div style="display:inline-block;background:#e9f7ef;color:#12784a;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;">&#10003; Payment received</div>
        <h1 style="margin:16px 0 8px;font-size:24px;line-height:30px;color:${ink};">Thank you, ${esc(firstName)}.</h1>
        <p style="margin:0;font-size:15px;line-height:24px;color:${muted};">
          We've received your payment and your order is being prepared for delivery. This email is your official receipt from ${SITE_NAME}.
        </p>
      </td></tr>

      <tr><td style="padding:24px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;border-radius:8px;">
          <tr>
            <td style="padding:16px;font-size:12px;color:${muted};">Order number<div style="margin-top:4px;font-size:14px;font-weight:600;color:${ink};">${number}</div></td>
            <td style="padding:16px;font-size:12px;color:${muted};">Date paid<div style="margin-top:4px;font-size:14px;font-weight:600;color:${ink};">${formatDate(order.paid_at)}</div></td>
          </tr>
          <tr>
            <td colspan="2" style="padding:0 16px 16px;font-size:12px;color:${muted};">Payment reference<div style="margin-top:4px;font-size:13px;color:${ink};word-break:break-all;">${esc(order.payment_reference)}</div></td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:24px 32px 0;">
        <h2 style="margin:0 0 4px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:${muted};">Order summary</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${rows}
          <tr>
            <td style="padding:14px 0 4px;font-size:14px;color:${muted};">Subtotal</td>
            <td align="right" style="padding:14px 0 4px;font-size:14px;color:${ink};">${formatNaira(order.total)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:14px;color:${muted};">Delivery</td>
            <td align="right" style="padding:4px 0;font-size:14px;color:${ink};">We'll contact you</td>
          </tr>
          <tr>
            <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:${ink};">Total paid</td>
            <td align="right" style="padding:12px 0 0;font-size:18px;font-weight:800;color:${ink};">${formatNaira(order.total)}</td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:28px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${border};border-radius:8px;">
          <tr><td style="padding:16px;font-size:14px;line-height:22px;color:${ink};">
            <div style="font-size:12px;color:${muted};margin-bottom:4px;">Delivering to</div>
            <strong>${esc(order.customer_name)}</strong><br>
            ${esc(order.delivery_address)}<br>
            ${esc(order.delivery_city)}, ${esc(order.delivery_state)}<br>
            ${esc(order.customer_phone)}
          </td></tr>
        </table>
      </td></tr>

      <tr><td align="center" style="padding:32px;">
        <a href="${absoluteUrl("/products")}" style="display:inline-block;background:${orange};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">Continue shopping</a>
        <p style="margin:24px 0 0;font-size:12px;line-height:18px;color:${muted};">
          Questions about your order? Just reply to this email and quote <strong>${number}</strong>.
        </p>
      </td></tr>

      <tr><td style="background:#f7f8fa;padding:20px 32px;font-size:11px;line-height:17px;color:${muted};text-align:center;">
        &copy; ${new Date().getFullYear()} ${SITE_NAME} · Payments processed securely by Squad by GTCO.<br>
        All prices in Nigerian Naira (NGN).
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    `Thank you, ${firstName}. We've received your payment.`,
    ``,
    `Order number: ${number}`,
    `Date paid: ${formatDate(order.paid_at)}`,
    `Payment reference: ${order.payment_reference}`,
    ``,
    ...order.order_items.map(
      (i) => `${i.product_name}  x${i.qty}  ${formatNaira(i.product_price * i.qty)}`
    ),
    ``,
    `Total paid: ${formatNaira(order.total)}`,
    ``,
    `Delivering to: ${order.customer_name}, ${order.delivery_address}, ${order.delivery_city}, ${order.delivery_state} (${order.customer_phone})`,
    ``,
    `Questions? Reply to this email and quote ${number}.`,
    `${SITE_NAME} · ${absoluteUrl("/")}`,
  ].join("\n");

  return { subject, html, text };
}
