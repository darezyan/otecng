"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import { BUY_NOW_STORAGE_KEY } from "@/lib/cart/types";

// Runs once on the confirmation page after a successful payment. If this
// checkout used the Buy Now sessionStorage payload, only that gets cleared
// — clearing the real persistent cart here would wipe unrelated items a
// customer still has queued up.
export default function ClearCartOnSuccess() {
  const { clear } = useCart();

  useEffect(() => {
    if (sessionStorage.getItem(BUY_NOW_STORAGE_KEY)) {
      sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
    } else {
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
