import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, PageTitle, buttonClass } from "@/components/ui";
import { getDictionary, isLocale, pick } from "@/lib/i18n";
import { mapEmbed, mapLink, messengerLink, site, whatsappLink } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).contact.title, alternates: { canonical: `/${lang}/contact`, languages: { lo: "/lo/contact", en: "/en/contact" } } };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).contact;
  return (
    <Container className="py-8">
      <PageTitle>{t.title}</PageTitle>
      <div className="grid gap-8 md:grid-cols-2">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-semibold text-slate-500">{t.address}</dt>
            <dd>{pick(lang, site.addressLao, site.addressEng)}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">{t.phone}</dt>
            <dd className="flex flex-wrap gap-x-4">
              {site.phones.map((phone) => <a key={phone.tel} href={`tel:${phone.tel}`} className="font-semibold text-brand hover:underline">{phone.label}</a>)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">{t.fax}</dt>
            <dd>{site.fax}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-500">{t.email}</dt>
            <dd><a href={`mailto:${site.email}`} className="font-semibold text-brand hover:underline">{site.email}</a></dd>
          </div>
          <div>
            <dt className="mb-2 text-sm font-semibold text-slate-500">{t.chat}</dt>
            <dd className="flex flex-wrap gap-2">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={buttonClass("green")}>WhatsApp</a>
              <a href={messengerLink()} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>Messenger</a>
              <a href={site.facebook} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>Facebook</a>
            </dd>
          </div>
        </dl>
        <div>
          <iframe src={mapEmbed} title={t.map} loading="lazy" className="aspect-[4/3] w-full rounded-xl border border-slate-200" />
          <a href={mapLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">{t.map} →</a>
        </div>
      </div>
    </Container>
  );
}
