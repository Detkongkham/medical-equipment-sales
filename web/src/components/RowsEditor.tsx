"use client";

import { useState } from "react";

type Column = { name: string; label: string; type?: "text" | "select" | "hidden"; options?: [value: string, label: string][]; width?: string; placeholder?: string };

const cell = "w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

/** Repeatable rows of inputs. The server reads each column with formData.getAll(name) and pairs values by position. */
export function RowsEditor({ columns, initial, addLabel }: { columns: Column[]; initial: Record<string, string>[]; addLabel: string }) {
  const blank = Object.fromEntries(columns.map((c) => [c.name, c.type === "select" ? c.options?.[0]?.[0] ?? "" : ""]));
  const [rows, setRows] = useState(() => initial.map((row, i) => ({ key: i, values: row })));
  const [next, setNext] = useState(initial.length);
  const visible = columns.filter((c) => c.type !== "hidden");

  return (
    <div className="space-y-2">
      {rows.length > 0 ? (
        <div className="hidden gap-2 text-xs font-medium text-slate-500 md:grid" style={{ gridTemplateColumns: `${visible.map((c) => c.width ?? "1fr").join(" ")} 2rem` }}>
          {visible.map((c) => <span key={c.name}>{c.label}</span>)}
          <span />
        </div>
      ) : null}
      {rows.map((row) => (
        <div key={row.key} className="rounded-lg border border-slate-200 p-2 md:border-0 md:p-0">
          <div className="grid items-start gap-2 md:[grid-template-columns:var(--cols)]" style={{ ["--cols" as string]: `${visible.map((c) => c.width ?? "1fr").join(" ")} 2rem` }}>
            {columns.map((c) =>
              c.type === "hidden" ? (
                <input key={c.name} type="hidden" name={c.name} defaultValue={row.values[c.name] ?? ""} />
              ) : c.type === "select" ? (
                <select key={c.name} name={c.name} defaultValue={row.values[c.name] ?? blank[c.name]} aria-label={c.label} className={cell}>
                  {c.options?.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              ) : (
                <input key={c.name} name={c.name} defaultValue={row.values[c.name] ?? ""} aria-label={c.label} placeholder={c.placeholder ?? c.label} className={cell} />
              ),
            )}
            <button type="button" aria-label="ລຶບແຖວ" onClick={() => setRows(rows.filter((r) => r.key !== row.key))} className="h-8 rounded-lg text-lg leading-none text-slate-400 hover:bg-red-50 hover:text-red-600">×</button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => { setRows([...rows, { key: next, values: blank }]); setNext(next + 1); }}
        className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/5"
      >
        + {addLabel}
      </button>
    </div>
  );
}
