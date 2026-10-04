"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { submitApplication, submitQuote, submitTicket, type FormState } from "@/app/actions";
import type { Dictionary } from "@/lib/i18n";
import { quoteStore, useQuote } from "@/lib/quote-store";
import { Field, Honeypot, Input, Select, Textarea, buttonClass } from "./ui";

const initial: FormState = { ok: false };

function ErrorNote({ state, messages }: { state: FormState; messages: Dictionary["form"] }) {
  return state.error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{messages[state.error]}</p> : null;
}

function Success({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div role="status" className="rounded-xl border border-leaf/40 bg-leaf/5 p-6 text-center">
      <h2 className="text-xl font-bold text-leaf-dark">{title}</h2>
      {children}
    </div>
  );
}

export function QuoteForm({ t, messages, whatsappBase }: { t: Dictionary["quote"]; messages: Dictionary["form"]; whatsappBase: string }) {
  const items = useQuote();
  const [state, action, pending] = useActionState(submitQuote, initial);

  useEffect(() => {
    if (state.ok) quoteStore.clear();
  }, [state.ok]);

  if (state.ok) {
    return (
      <Success title={t.successTitle}>
        <p className="mt-3">{t.successText}</p>
        <p className="mt-1 text-2xl font-bold text-brand">{state.number}</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">{t.successNext}</p>
        <a href={`${whatsappBase}?text=${encodeURIComponent(state.number ?? "")}`} target="_blank" rel="noopener noreferrer" className={`mt-4 ${buttonClass("green")}`}>
          {t.followUp}
        </a>
      </Success>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="min-w-0">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-600">{t.empty}</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
            {items.map((item) => (
              <li key={item.key} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  {item.variant ? <p className="text-sm text-slate-600">{item.variant}</p> : null}
                </div>
                <label className="text-sm text-slate-600">
                  <span className="sr-only">{t.qty}</span>
                  <input
                    type="number" min={1} max={9999} value={item.qty} inputMode="numeric"
                    onChange={(e) => quoteStore.setQty(item.key, Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-base"
                  />
                </label>
                <button type="button" onClick={() => quoteStore.remove(item.key)} className="text-sm text-red-600 hover:underline">{t.remove}</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={action} className="min-w-0 space-y-4">
        <h2 className="text-lg font-bold text-brand">{t.details}</h2>
        <input type="hidden" name="items" value={JSON.stringify(items.map(({ productId, variantId, qty }) => ({ productId, variantId, qty })))} />
        <Honeypot />
        <Field label={t.organization} required><Input name="organization" required maxLength={200} autoComplete="organization" /></Field>
        <Field label={t.customerType} required>
          <Select name="type" defaultValue="CLINIC">
            {Object.entries(t.types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.contactName} required><Input name="contactName" required maxLength={120} autoComplete="name" /></Field>
          <Field label={t.phone} required><Input name="phone" type="tel" required maxLength={40} autoComplete="tel" /></Field>
          <Field label={t.whatsapp}><Input name="whatsapp" type="tel" maxLength={40} /></Field>
          <Field label={t.email}><Input name="email" type="email" maxLength={120} autoComplete="email" /></Field>
        </div>
        <Field label={t.address}><Input name="address" maxLength={500} autoComplete="street-address" /></Field>
        <Field label={t.note}><Textarea name="note" maxLength={2000} /></Field>
        <ErrorNote state={state} messages={messages} />
        <button type="submit" disabled={pending || items.length === 0} className={buttonClass("primary")}>
          {pending ? t.sending : t.submit}
        </button>
      </form>
    </div>
  );
}

export function TicketForm({ t, messages }: { t: Dictionary["services"]; messages: Dictionary["form"] }) {
  const [state, action, pending] = useActionState(submitTicket, initial);
  if (state.ok) {
    return (
      <Success title={t.successTitle}>
        <p className="mt-3">{t.successText}</p>
        <p className="mt-1 text-2xl font-bold text-brand">{state.number}</p>
        <p className="mt-3 text-sm text-slate-600">{t.successNext}</p>
      </Success>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <Honeypot />
      <Field label={t.organization} required><Input name="organization" required maxLength={200} autoComplete="organization" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.contactName} required><Input name="contactName" required maxLength={120} autoComplete="name" /></Field>
        <Field label={t.phone} required><Input name="phone" type="tel" required maxLength={40} autoComplete="tel" /></Field>
        <Field label={t.deviceModel} required><Input name="deviceModel" required maxLength={200} /></Field>
        <Field label={t.serialNumber}><Input name="serialNumber" maxLength={120} /></Field>
      </div>
      <Field label={t.issue} required><Textarea name="issue" required maxLength={4000} /></Field>
      <Field label={t.photos}><Input name="files" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" /></Field>
      <ErrorNote state={state} messages={messages} />
      <button type="submit" disabled={pending} className={buttonClass("primary")}>{pending ? t.sending : t.submit}</button>
    </form>
  );
}

export function ApplicationForm({ t, messages, jobs }: { t: Dictionary["careers"]; messages: Dictionary["form"]; jobs: { id: string; title: string }[] }) {
  const [state, action, pending] = useActionState(submitApplication, initial);
  if (state.ok) {
    return (
      <Success title={t.successTitle}>
        <p className="mt-3 text-sm text-slate-600">{t.successNext}</p>
      </Success>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <Honeypot />
      <Field label={t.job} required>
        <Select name="jobId" required>
          {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
        </Select>
      </Field>
      <Field label={t.fullName} required><Input name="fullName" required maxLength={120} autoComplete="name" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.phone} required><Input name="phone" type="tel" required maxLength={40} autoComplete="tel" /></Field>
        <Field label={t.email}><Input name="email" type="email" maxLength={120} autoComplete="email" /></Field>
      </div>
      <Field label={t.documents} required><Input name="files" type="file" multiple required accept=".pdf,.jpg,.jpeg,.png,.webp" /></Field>
      <Field label={t.note}><Textarea name="note" maxLength={2000} /></Field>
      <ErrorNote state={state} messages={messages} />
      <button type="submit" disabled={pending} className={buttonClass("primary")}>{pending ? t.sending : t.submit}</button>
    </form>
  );
}
