"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { previewCart, submitOrder, type OrderState } from "@/app/order-actions";
import { cartStore, useCart } from "@/lib/cart-store";
import type { Dictionary } from "@/lib/i18n";
import type { PricedLine } from "@/lib/shop";
import { Field, Honeypot, Input, Select, Textarea, buttonClass } from "./ui";

const initial: OrderState = { ok: false };
const money = (n: number) => `${new Intl.NumberFormat("en-US").format(n)} ₭`;

export function CartView({ t, types, lang, paymentReady }: { t: Dictionary["shop"]; types: Dictionary["quote"]["types"]; lang: string; paymentReady: boolean }) {
  const router = useRouter();
  const items = useCart();
  const [lines, setLines] = useState<PricedLine[] | null>(null);
  const [state, action, pending] = useActionState(submitOrder, initial);
  const [method, setMethod] = useState("LAO_QR");

  // Names, prices and stock always come from the server; lines that can no longer be sold are removed from the cart.
  const signature = JSON.stringify(items.map(({ productId, variantId, qty }) => [productId, variantId, qty]));
  useEffect(() => {
    let current = true;
    const snapshot = items;
    if (snapshot.length === 0) return;
    previewCart(snapshot.map(({ productId, variantId, qty }) => ({ productId, variantId, qty }))).then((result) => {
      if (!current) return;
      setLines(result);
      const known = new Set(result.map((l) => l.key));
      for (const item of snapshot) if (!known.has(item.key)) cartStore.remove(item.key);
    });
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `signature` already describes `items`
  }, [signature, state.error]);

  useEffect(() => {
    if (state.ok && state.number) {
      cartStore.clear();
      router.push(`/${lang}/order/${state.number}?t=${state.token}`);
    }
  }, [state, lang, router]);

  const qtyOf = (key: string) => items.find((i) => i.key === key)?.qty ?? 0;
  const visible = (lines ?? []).filter((l) => qtyOf(l.key) > 0);
  const total = visible.reduce((sum, l) => sum + l.unitPrice * qtyOf(l.key), 0);
  const blocked = visible.some((l) => l.available < qtyOf(l.key));

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-600">
        {t.empty} <a href={`/${lang}/products`} className="font-semibold text-brand hover:underline">{t.browse}</a>
      </p>
    );
  }
  if (lines === null) return <p className="text-slate-600">{t.loading}</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="min-w-0">
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
          {visible.map((line) => {
            const qty = qtyOf(line.key);
            const short = line.available < qty;
            return (
              <li key={line.key} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{line.title}</p>
                    {line.variant ? <p className="text-sm text-slate-600">{line.variant}</p> : null}
                    <p className="mt-1 text-sm text-slate-600">{money(line.unitPrice)}</p>
                  </div>
                  <label className="text-sm text-slate-600">
                    <span className="sr-only">{t.qty}</span>
                    <input
                      type="number" min={1} max={9999} value={qty} inputMode="numeric"
                      onChange={(e) => cartStore.setQty(line.key, Number(e.target.value))}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-base"
                    />
                  </label>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <button type="button" onClick={() => cartStore.remove(line.key)} className="text-red-600 hover:underline">{t.remove}</button>
                  <span className="font-semibold text-brand">{money(line.unitPrice * qty)}</span>
                </div>
                {short ? <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{t.lineStock} ({t.onlyStock} {line.available})</p> : null}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 flex items-baseline justify-between text-lg">
          <span className="font-medium text-slate-700">{t.total}</span>
          <span className="text-2xl font-bold text-brand">{money(total)}</span>
        </p>
      </section>

      {paymentReady ? (
        <form action={action} className="min-w-0 space-y-4">
          <h2 className="text-lg font-bold text-brand">{t.details}</h2>
          <input type="hidden" name="items" value={JSON.stringify(items.map(({ productId, variantId, qty }) => ({ productId, variantId, qty })))} />
          <input type="hidden" name="expectedTotal" value={total} />
          <input type="hidden" name="lang" value={lang} />
          <Honeypot />
          <Field label={t.organization} required><Input name="organization" required maxLength={200} autoComplete="organization" /></Field>
          <Field label={t.customerType} required>
            <Select name="type" defaultValue="CLINIC">
              {Object.entries(types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.contactName} required><Input name="contactName" required maxLength={120} autoComplete="name" /></Field>
            <Field label={t.phone} required><Input name="phone" type="tel" required maxLength={40} autoComplete="tel" /></Field>
            <Field label={t.whatsapp}><Input name="whatsapp" type="tel" maxLength={40} /></Field>
            <Field label={t.email}><Input name="email" type="email" maxLength={120} autoComplete="email" /></Field>
          </div>
          <Field label={t.deliveryAddress} required><Textarea name="deliveryAddress" rows={3} required maxLength={500} autoComplete="street-address" /></Field>
          <Field label={t.note}><Textarea name="note" rows={2} maxLength={2000} /></Field>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">{t.payment}</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {([["LAO_QR", t.methodQr], ["BANK_TRANSFER", t.methodBank]] as const).map(([value, label]) => (
                <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium ${method === value ? "border-brand bg-brand/5 text-brand" : "border-slate-300 text-slate-700"}`}>
                  <input type="radio" name="paymentMethod" value={value} checked={method === value} onChange={() => setMethod(value)} className="accent-[#2e3192]" />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{t.payNote}</p>
          </fieldset>

          {state.error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{t.errors[state.error]}</p> : null}
          <button type="submit" disabled={pending || blocked || visible.length === 0} className={buttonClass("primary")}>
            {pending ? t.sending : t.submit}
          </button>
        </form>
      ) : (
        <div className="min-w-0 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-bold text-amber-900">{t.unavailableTitle}</h2>
          <p className="mt-1 text-sm text-amber-900">{t.unavailableText}</p>
        </div>
      )}
    </div>
  );
}
