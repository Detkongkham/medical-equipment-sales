import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 ${className}`}>{children}</div>;
}

export function PageTitle({ children, intro }: { children: ReactNode; intro?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-brand sm:text-3xl">{children}</h1>
      {intro ? <p className="mt-2 max-w-3xl text-slate-600">{intro}</p> : null}
    </div>
  );
}

export function SectionTitle({ children, href, more }: { children: ReactNode; href?: string; more?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-xl font-bold text-brand sm:text-2xl">{children}</h2>
      {href && more ? (
        <Link href={href} className="shrink-0 text-sm font-medium text-leaf hover:underline">
          {more} →
        </Link>
      ) : null}
    </div>
  );
}

const buttonStyles = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  green: "bg-leaf text-white hover:bg-leaf-dark",
  outline: "border border-brand text-brand hover:bg-brand/5",
};

export function buttonClass(variant: keyof typeof buttonStyles = "primary") {
  return `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${buttonStyles[variant]}`;
}

export function ButtonLink({ variant, className = "", ...props }: ComponentProps<typeof Link> & { variant?: keyof typeof buttonStyles }) {
  return <Link {...props} className={`${buttonClass(variant)} ${className}`} />;
}

export function StockBadge({ inStock, labels }: { inStock: boolean; labels: { inStock: string; preOrder: string } }) {
  return inStock ? (
    <span className="inline-block whitespace-nowrap rounded-full bg-leaf/10 px-2.5 py-0.5 text-xs font-semibold text-leaf-dark">{labels.inStock}</span>
  ) : (
    <span className="inline-block whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{labels.preOrder}</span>
  );
}

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
      {children}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={inputClass} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea rows={4} {...props} className={inputClass} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={inputClass} />;
}

/** Hidden field that only bots fill in. */
export function Honeypot() {
  return <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />;
}
