"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import type { CartLine } from "./types";

type State = { lines: CartLine[]; hydrated: boolean };

type Action =
  | { type: "HYDRATE"; lines: CartLine[] }
  | { type: "ADD"; line: CartLine }
  | { type: "SET_QTY"; productId: string; qty: number }
  | { type: "REMOVE"; productId: string }
  | { type: "CLEAR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { lines: action.lines, hydrated: true };
    case "ADD": {
      const existing = state.lines.find((l) => l.productId === action.line.productId);
      const lines = existing
        ? state.lines.map((l) =>
            l.productId === action.line.productId ? { ...l, qty: l.qty + action.line.qty } : l
          )
        : [...state.lines, action.line];
      return { ...state, lines };
    }
    case "SET_QTY": {
      if (action.qty <= 0) {
        return { ...state, lines: state.lines.filter((l) => l.productId !== action.productId) };
      }
      return {
        ...state,
        lines: state.lines.map((l) => (l.productId === action.productId ? { ...l, qty: action.qty } : l)),
      };
    }
    case "REMOVE":
      return { ...state, lines: state.lines.filter((l) => l.productId !== action.productId) };
    case "CLEAR":
      return { ...state, lines: [] };
  }
}

const CART_STORAGE_KEY = "otecng:cart";

type CartContextValue = {
  lines: CartLine[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initial state is always empty so the server-rendered markup and the
  // first client render match exactly — localStorage is only read after
  // mount, in the effect below, to avoid a hydration mismatch.
  const [state, dispatch] = useReducer(reducer, { lines: [], hydrated: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      dispatch({ type: "HYDRATE", lines: raw ? JSON.parse(raw) : [] });
    } catch {
      dispatch({ type: "HYDRATE", lines: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.lines));
  }, [state.lines, state.hydrated]);

  const value: CartContextValue = {
    lines: state.lines,
    hydrated: state.hydrated,
    count: state.lines.reduce((sum, l) => sum + l.qty, 0),
    subtotal: state.lines.reduce((sum, l) => sum + l.price * l.qty, 0),
    add: (line) => dispatch({ type: "ADD", line }),
    setQty: (productId, qty) => dispatch({ type: "SET_QTY", productId, qty }),
    remove: (productId) => dispatch({ type: "REMOVE", productId }),
    clear: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
