import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuoteForm } from "@/components/forms";
import { Container, PageTitle } from "@/components/ui";
import { getDictionary, isLocale } from "@/lib/i18n";
import { whatsappLink } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/quote">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDictionary(lang).quote.title, robots: { index: false } } : {};
}

export default async function QuotePage({ params }: PageProps<"/[lang]/quote">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <Container className="py-8">
      <PageTitle intro={t.quote.intro}>{t.quote.title}</PageTitle>
      <QuoteForm t={t.quote} messages={t.form} whatsappBase={whatsappLink()} />
    </Container>
  );
}
