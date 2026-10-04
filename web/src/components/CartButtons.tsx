"use client";

import Link from "next/link";
import { useState } from "react";
import { cartStore, useCart } from "@/lib/cart-store";
import { buttonClass } from "./ui";

type Labels = { add: string; added: string; view: string };

export function AddToCartButton({ productId, variantId, labels, lang, compact }: { productId: string; variantId?: string; labels: Labels; lang: string; compact?: boolean }) {
  const [added, setAdded] = useState(false);
  if (added) {
    return (
      <Link href={`/${lang}/cart`} className={compact ? "text-sm font-semibold text-leaf hover:underline" : buttonClass("green")}>
        ✓ {labels.added} · {labels.view}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        cartStore.add({ productId, variantId });
        setAdded(true);
      }}
      className={compact ? "whitespace-nowrap rounded-md bg-leaf px-2.5 py-1 text-sm font-semibold text-white hover:bg-leaf-dark" : buttonClass("green")}
    >
      {compact ? `+ ${labels.add}` : labels.add}
    </button>
  );
}

/** Shown in the header only once something is in the cart. */
export function CartNavLink({ href, label }: { href: string; label: string }) {
  const count = useCart().length;
  if (count === 0) return null;
  return (
    <Link href={href} className="relative inline-flex items-center gap-2 rounded-lg border border-brand px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5">
      {label}
      <span className="rounded-full bg-brand px-1.5 text-xs font-bold text-white">{count}</span>
    </Link>
  );
}
