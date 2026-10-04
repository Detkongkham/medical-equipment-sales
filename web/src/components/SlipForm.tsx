"use client";

import { useActionState } from "react";
import { uploadSlip, type SlipState } from "@/app/order-actions";
import type { Dictionary } from "@/lib/i18n";
import { buttonClass } from "./ui";

const initial: SlipState = { ok: false };

export function SlipForm({ t, number, token }: { t: Dictionary["shop"]["order"]; number: string; token: string }) {
  const [state, action, pending] = useActionState(uploadSlip, initial);
  const errors = { files: t.slipFiles, closed: t.slipClosed, failed: t.slipFailed };
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="number" value={number} />
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-medium text-slate-700">
        {t.uploadHint}
        <input type="file" name="files" required multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="mt-2 block w-full text-sm" />
      </label>
      {state.ok ? <p role="status" className="rounded-lg bg-leaf/10 px-3 py-2 text-sm text-leaf-dark">{t.slipOk}</p> : null}
      {state.error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors[state.error]}</p> : null}
      <button type="submit" disabled={pending} className={buttonClass("primary")}>{pending ? t.uploading : t.upload}</button>
    </form>
  );
}
