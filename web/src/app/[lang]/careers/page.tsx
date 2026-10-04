import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/forms";
import { Container, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { getDictionary, isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/[lang]/careers">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).careers;
  return { title: t.title, description: t.intro, alternates: { canonical: `/${lang}/careers`, languages: { lo: "/lo/careers", en: "/en/careers" } } };
}

const lines = (text: string | null) => (text ?? "").split("\n").filter(Boolean);

export default async function CareersPage({ params }: PageProps<"/[lang]/careers">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const jobs = await db.jobOpening.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });

  return (
    <Container className="py-8">
      <PageTitle intro={t.careers.intro}>{t.careers.title}</PageTitle>
      {jobs.length === 0 ? (
        <p className="text-slate-600">{t.careers.none}</p>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {jobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-slate-200 p-5">
                <h2 className="text-lg font-bold text-brand">
                  {job.title} <span className="text-sm font-medium text-slate-500">· {job.positions} {t.careers.positions}</span>
                </h2>
                <p className="mt-1 text-sm text-slate-600">{job.description}</p>
                <h3 className="mt-3 text-sm font-semibold">{t.careers.requirements}</h3>
                <ul className="list-inside list-disc text-sm text-slate-700">{lines(job.requirements).map((line) => <li key={line}>{line}</li>)}</ul>
                {job.benefits ? (
                  <>
                    <h3 className="mt-3 text-sm font-semibold">{t.careers.benefits}</h3>
                    <ul className="list-inside list-disc text-sm text-slate-700">{lines(job.benefits).map((line) => <li key={line}>{line}</li>)}</ul>
                  </>
                ) : null}
              </article>
            ))}
          </div>
          <section>
            <h2 className="mb-4 text-lg font-bold text-brand">{t.careers.formTitle}</h2>
            <ApplicationForm t={t.careers} messages={t.form} jobs={jobs.map(({ id, title }) => ({ id, title }))} />
            <p className="mt-4 text-sm text-slate-600">
              {t.careers.orEmail} <a href={`mailto:${site.hrEmail}`} className="font-semibold text-brand hover:underline">{site.hrEmail}</a>
            </p>
          </section>
        </div>
      )}
    </Container>
  );
}
