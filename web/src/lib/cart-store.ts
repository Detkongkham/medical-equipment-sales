"use client";

import { useSyncExternalStore } from "react";

export type CartItem = { key: string; productId: string; variantId?: string; qty: number };

const KEY = "xtk-cart";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let cache: CartItem[] = EMPTY;
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

function write(next: CartItem[]) {
  cache = next;
  loaded = true;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode): the cart still works for this page view.
  }
  listeners.forEach((listener) => listener());
}

/** Only ids and quantities are kept: names and prices are always looked up on the server. */
export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  add(item: { productId: string; variantId?: string }) {
    const key = `${item.productId}:${item.variantId ?? ""}`;
    const items = read();
    write(items.some((i) => i.key === key) ? items.map((i) => (i.key === key ? { ...i, qty: Math.min(9999, i.qty + 1) } : i)) : [...items, { ...item, key, qty: 1 }]);
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

export function useCart() {
  return useSyncExternalStore(cartStore.subscribe, read, () => EMPTY);
}
