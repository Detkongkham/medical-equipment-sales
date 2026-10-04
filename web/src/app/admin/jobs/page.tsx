import { AdminTitle, Card, Check, Notice, one } from "@/components/admin";
import { Field, Input, Textarea, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteJob, saveJob } from "../actions";

export const metadata = { title: "ຕຳແໜ່ງງານ" };

type Job = { id: string; title: string; department: string; positions: number; location: string; description: string; requirements: string; benefits: string | null; isActive: boolean };

function JobForm({ job }: { job?: Job }) {
  return (
    <form action={saveJob} className="space-y-3">
      <input type="hidden" name="id" value={job?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2"><Field label="ຕຳແໜ່ງ" required><Input name="title" defaultValue={job?.title} required /></Field></div>
        <Field label="ພະແນກ"><Input name="department" defaultValue={job?.department} /></Field>
        <Field label="ຈຳນວນຮັບ"><Input name="positions" type="number" min={1} defaultValue={job?.positions ?? 1} /></Field>
      </div>
      <Field label="ສະຖານທີ່ເຮັດວຽກ"><Input name="location" defaultValue={job?.location ?? "Vientiane Capital"} /></Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="ລາຍລະອຽດວຽກ" required><Textarea name="description" rows={5} defaultValue={job?.description} required /></Field>
        <Field label="ເງື່ອນໄຂ" required><Textarea name="requirements" rows={5} defaultValue={job?.requirements} required /></Field>
        <Field label="ສະຫວັດດີການ"><Textarea name="benefits" rows={5} defaultValue={job?.benefits ?? ""} /></Field>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Check name="isActive" label="ເປີດຮັບສະໝັກ" defaultChecked={job?.isActive ?? true} />
        <button className={buttonClass("primary")}>{job ? "ບັນທຶກ" : "ເພີ່ມຕຳແໜ່ງ"}</button>
      </div>
    </form>
  );
}

export default async function JobsAdmin({ searchParams }: PageProps<"/admin/jobs">) {
  await requireAdmin("HR");
  const sp = await searchParams;
  const jobs = await db.jobOpening.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { applicants: true } } } });
  return (
    <>
      <AdminTitle>ຕຳແໜ່ງງານ</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <Card title="ເພີ່ມຕຳແໜ່ງ" className="mb-6"><JobForm /></Card>
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <JobForm job={job} />
            <form action={deleteJob} className="mt-2 text-xs text-slate-500">
              <input type="hidden" name="id" value={job.id} />
              {job._count.applicants} ຜູ້ສະໝັກ · <button className="text-red-600 hover:underline">ລຶບ</button>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
