"use client";

import Link from "next/link";
import { useState } from "react";
import { quoteStore, useQuote } from "@/lib/quote-store";
import { buttonClass } from "./ui";

type Labels = { add: string; added: string; view: string };

export function AddToQuoteButton({
  productId, variantId, title, variant, labels, lang, compact,
}: {
  productId: string; variantId?: string; title: string; variant?: string; labels: Labels; lang: string; compact?: boolean;
}) {
  const [added, setAdded] = useState(false);
  if (added) {
    return (
      <Link href={`/${lang}/quote`} className={compact ? "text-sm font-semibold text-leaf hover:underline" : buttonClass("green")}>
        ✓ {labels.added} · {labels.view}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        quoteStore.add({ productId, variantId, title, variant });
        setAdded(true);
      }}
      className={compact ? "whitespace-nowrap rounded-md border border-brand px-2.5 py-1 text-sm font-semibold text-brand hover:bg-brand/5" : buttonClass("primary")}
    >
      {compact ? `+ ${labels.add}` : labels.add}
    </button>
  );
}

export function QuoteNavLink({ href, label }: { href: string; label: string }) {
  const count = useQuote().length;
  return (
    <Link href={href} className="relative inline-flex items-center gap-2 rounded-lg bg-leaf px-3 py-2 text-sm font-semibold text-white hover:bg-leaf-dark">
      {label}
      {count > 0 ? <span className="rounded-full bg-white px-1.5 text-xs font-bold text-leaf-dark">{count}</span> : null}
    </Link>
  );
}
