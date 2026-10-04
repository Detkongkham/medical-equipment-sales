import { AdminTitle, thDate } from "@/components/admin";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "ຜູ້ສະໝັກງານ" };

export default async function ApplicantsAdmin() {
  await requireAdmin("HR");
  const applicants = await db.jobApplicant.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { job: { select: { title: true } } } });
  return (
    <>
      <AdminTitle>ຜູ້ສະໝັກງານ</AdminTitle>
      {applicants.length === 0 ? <p className="text-slate-600">ຍັງບໍ່ມີຜູ້ສະໝັກ.</p> : null}
      <div className="space-y-3">
        {applicants.map((a) => (
          <article key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <h2 className="font-bold text-slate-900">{a.fullName} <span className="font-normal text-slate-500">· {a.job.title}</span></h2>
              <span className="text-xs text-slate-500">{thDate(a.createdAt)}</span>
            </div>
            <p className="mt-1 text-slate-600">
              <a className="text-brand hover:underline" href={`tel:${a.phone}`}>{a.phone}</a>
              {a.email ? <> · <a className="text-brand hover:underline" href={`mailto:${a.email}`}>{a.email}</a></> : null}
            </p>
            {a.note ? <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 px-3 py-2 text-slate-700">{a.note}</p> : null}
            {a.documentUrls.length > 0 ? (
              <p className="mt-2">ເອກະສານ: {a.documentUrls.map((url, i) => <a key={url} className="mr-3 text-brand hover:underline" href={`/admin/download?f=${encodeURIComponent(url)}`}>ໄຟລ໌ {i + 1}</a>)}</p>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}
