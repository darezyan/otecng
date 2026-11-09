"use client";

import { Loader2 } from "lucide-react";
import { useLinkStatus } from "next/link";

// Must render as a descendant of <Link>. Ties directly to the click via
// React's transition state, so it shows even when loading.tsx's prefetch
// hasn't finished in time (the gap that left clicks feeling unresponsive).
export default function LinkPendingHint() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Loader2 className="ml-1.5 size-3.5 shrink-0 animate-spin text-primary" aria-hidden />;
}
