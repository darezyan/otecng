import crypto from "crypto";

function secretKey(): string {
  const key = process.env.SQUAD_SECRET_KEY;
  if (!key) throw new Error("SQUAD_SECRET_KEY is not set");
  return key;
}

// Squad doesn't expose a separate "test mode" flag — sandbox vs live is
// determined by which key you were issued, and sandbox keys are always
// prefixed this way.
function baseUrl(): string {
  return secretKey().startsWith("sandbox_")
    ? "https://sandbox-api-d.squadco.com"
    : "https://api-d.squadco.com";
}

export type InitializeTransactionResult = {
  checkoutUrl: string;
  reference: string;
};

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  customerName: string;
}): Promise<InitializeTransactionResult> {
  const res = await fetch(`${baseUrl()}/transaction/initiate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      initiate_type: "inline",
      transaction_ref: input.reference,
      callback_url: input.callbackUrl,
      customer_name: input.customerName,
    }),
  });
  const json = await res.json();
  if (!res.ok || json.status !== 200 || !json.data?.checkout_url) {
    throw new Error(json.message || "Squad: failed to initialize transaction");
  }
  return { checkoutUrl: json.data.checkout_url, reference: json.data.transaction_ref };
}

export type VerifyTransactionResult = {
  status: "success" | "failed" | "abandoned" | "pending" | "unknown";
  amountKobo: number;
};

export async function verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
  const res = await fetch(`${baseUrl()}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });
  const json = await res.json();
  if (!res.ok || json.status !== 200) {
    throw new Error(json.message || "Squad: failed to verify transaction");
  }
  const rawStatus = String(json.data?.transaction_status ?? "").toLowerCase();
  const status: VerifyTransactionResult["status"] =
    rawStatus === "success" || rawStatus === "failed" || rawStatus === "abandoned" || rawStatus === "pending"
      ? (rawStatus as VerifyTransactionResult["status"])
      : "unknown";
  return { status, amountKobo: Number(json.data?.transaction_amount ?? 0) };
}

// The webhook's only authentication is this signature — reject anything
// that doesn't match before acting on the payload. Squad signs the raw
// body with HMAC-SHA512 and compares as an UPPERCASE hex digest (unlike
// Paystack, which is lowercase) — get this wrong and every webhook 401s.
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha512", secretKey()).update(rawBody).digest("hex").toUpperCase();
  return expected === signatureHeader;
}
