import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { getDictionary, isLocale, pick } from "@/lib/i18n";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).projects.title, alternates: { canonical: `/${lang}/projects`, languages: { lo: "/lo/projects", en: "/en/projects" } } };
}

export default async function ProjectsPage({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).projects;
  const posts = await db.post.findMany({ where: { publishedAt: { not: null } }, orderBy: { publishedAt: "desc" } });
  const dateFormat = new Intl.DateTimeFormat(lang === "lo" ? "lo-LA" : "en-GB", { dateStyle: "medium" });

  return (
    <Container className="py-8">
      <PageTitle>{t.title}</PageTitle>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/${lang}/projects/${post.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 transition-shadow hover:shadow-md">
            {post.images[0] ? (
              <div className="relative aspect-[4/3] bg-slate-100">
                <Image src={post.images[0]} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              </div>
            ) : null}
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-leaf">
                {post.type === "PROJECT" ? t.project : t.news} · {dateFormat.format(post.publishedAt!)}
              </p>
              <h2 className="mt-1 font-semibold text-slate-900 group-hover:text-brand">{pick(lang, post.titleLao, post.titleEng)}</h2>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
