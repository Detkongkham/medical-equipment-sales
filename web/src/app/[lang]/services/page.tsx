import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketForm } from "@/components/forms";
import { Container, PageTitle } from "@/components/ui";
import { getDictionary, isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).services;
  return { title: t.title, description: t.intro, alternates: { canonical: `/${lang}/services`, languages: { lo: "/lo/services", en: "/en/services" } } };
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <Container className="py-8">
      <PageTitle intro={t.services.intro}>{t.services.title}</PageTitle>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {t.services.items.map(([title, text]) => (
            <div key={title} className="rounded-xl border border-slate-200 p-4">
              <h2 className="font-bold text-brand">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
          <div className="rounded-xl bg-brand p-5 text-white">
            <p className="text-sm text-white/80">{t.services.hotline}</p>
            <a href={`tel:${site.hotline.tel}`} className="text-2xl font-bold hover:underline">{site.hotline.label}</a>
          </div>
        </div>
        <section>
          <h2 className="mb-4 text-lg font-bold text-brand">{t.services.formTitle}</h2>
          <TicketForm t={t.services} messages={t.form} />
        </section>
      </div>
    </Container>
  );
}
