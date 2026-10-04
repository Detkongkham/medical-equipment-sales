import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ProductGrid, productCardSelect } from "@/components/ProductCard";
import { Container, SectionTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { getDictionary, isLocale, pick } from "@/lib/i18n";

export const revalidate = 300;

const getPost = cache((slug: string) =>
  db.post.findFirst({
    where: { slug, publishedAt: { not: null } },
    include: { products: { where: { isPublished: true }, select: productCardSelect } },
  }),
);

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: pick(lang, post.titleLao, post.titleEng),
    alternates: { canonical: `/${lang}/projects/${slug}`, languages: { lo: `/lo/projects/${slug}`, en: `/en/projects/${slug}` } },
    openGraph: { images: post.images.slice(0, 1) },
  };
}

export default async function PostPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const post = await getPost(slug);
  if (!post) notFound();
  const t = getDictionary(lang).projects;
  const title = pick(lang, post.titleLao, post.titleEng);
  const dateFormat = new Intl.DateTimeFormat(lang === "lo" ? "lo-LA" : "en-GB", { dateStyle: "long" });

  return (
    <Container className="py-8">
      <Link href={`/${lang}/projects`} className="text-sm text-slate-500 hover:underline">← {t.back}</Link>
      <article className="mt-4 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-leaf">
          {post.type === "PROJECT" ? t.project : t.news} · {dateFormat.format(post.publishedAt!)}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-brand sm:text-3xl">{title}</h1>
        <div className="mt-4 whitespace-pre-line text-slate-700">{pick(lang, post.bodyLao, post.bodyEng)}</div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {post.images.map((src) => (
            <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
              <Image src={src} alt={title} fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
            </div>
          ))}
        </div>
      </article>
      {post.products.length > 0 ? (
        <section className="mt-12">
          <SectionTitle>{t.relatedProducts}</SectionTitle>
          <ProductGrid products={post.products} lang={lang} />
        </section>
      ) : null}
    </Container>
  );
}
