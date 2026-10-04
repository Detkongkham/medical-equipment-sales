import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container, PageTitle } from "@/components/ui";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).about;
  return { title: t.title, description: t.body[1], alternates: { canonical: `/${lang}/about`, languages: { lo: "/lo/about", en: "/en/about" } } };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <Container className="py-8">
      <PageTitle>{t.about.title}</PageTitle>
      <div className="grid items-start gap-8 md:grid-cols-[200px_1fr]">
        <Image src="/brand/logo.jpg" alt="XTK" width={200} height={200} className="mx-auto w-40 md:w-full" />
        <div className="max-w-3xl space-y-4 text-slate-700">
          {t.about.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.home.whyItems.map(([title, text]) => (
          <div key={title} className="rounded-xl border border-slate-200 p-4">
            <h2 className="font-bold text-brand">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
