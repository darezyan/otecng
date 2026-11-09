// Renders the receipt email for a sample order to a local HTML file so the
// template can be reviewed in a browser. Usage: npx tsx scripts/preview-receipt.ts [out.html]
import { writeFileSync } from "node:fs";
import { renderReceiptEmail } from "../lib/email/receipt";

const { subject, html } = renderReceiptEmail({
  id: "3f9c2a71-5b0e-4c8d-9a1e-2b7f6d4c8e10",
  status: "paid",
  payment_reference: "otecng_7e2b1c94-0d5a-4f3e-8b6c-1a9d2e4f7c30",
  total: 2_743_000,
  currency: "NGN",
  customer_name: "Adaeze Okafor",
  customer_email: "customer@example.com",
  customer_phone: "0803 000 0000",
  delivery_address: "12 Admiralty Way, Lekki Phase 1",
  delivery_city: "Lekki",
  delivery_state: "Lagos",
  paid_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  order_items: [
    { id: "1", order_id: "x", product_id: null, product_name: "LG Cross Door Refrigerator 570L (GC-L22FFQPB)", product_price: 2_094_000, qty: 1 },
    { id: "2", order_id: "x", product_id: null, product_name: "Maxi Portable AC 1.0 HP (CRN7)", product_price: 324_500, qty: 2 },
  ],
});
const out = process.argv[2] ?? "receipt-preview.html";
writeFileSync(out, html);
console.log(`${subject}\n-> ${out}`);
