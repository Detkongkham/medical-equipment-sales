"use client";

import { useSyncExternalStore } from "react";

export type QuoteItem = {
  key: string;
  productId: string;
  variantId?: string;
  title: string;
  variant?: string;
  qty: number;
};

const KEY = "xtk-quote";
const EMPTY: QuoteItem[] = [];
const listeners = new Set<() => void>();
let cache: QuoteItem[] = EMPTY;
let loaded = false;

function read() {
  if (!loaded) {
    loaded = true;
    try {
      cache = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function write(next: QuoteItem[]) {
  cache = next;
  loaded = true;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode): the list still works for this page view.
  }
  listeners.forEach((listener) => listener());
}

export const quoteStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  add(item: Omit<QuoteItem, "key" | "qty">) {
    const key = `${item.productId}:${item.variantId ?? ""}`;
    const items = read();
    write(
      items.some((i) => i.key === key)
        ? items.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
        : [...items, { ...item, key, qty: 1 }],
    );
  },
  setQty(key: string, qty: number) {
    write(read().map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(9999, qty || 1)) } : i)));
  },
  remove(key: string) {
    write(read().filter((i) => i.key !== key));
  },
  clear() {
    write([]);
  },
};

export function useQuote() {
  return useSyncExternalStore(quoteStore.subscribe, read, () => EMPTY);
}
