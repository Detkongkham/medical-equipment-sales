import type { Metadata } from "next";
import { Noto_Sans_Lao } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartNavLink } from "@/components/CartButtons";
import { LangSwitch } from "@/components/LangSwitch";
import { QuoteNavLink } from "@/components/QuoteButtons";
import { Container } from "@/components/ui";
import { getDictionary, isLocale, locales, pick } from "@/lib/i18n";
import { messengerLink, site, whatsappLink } from "@/lib/site";
import "../globals.css";

const lao = Noto_Sans_Lao({ variable: "--font-lao", subsets: ["lao", "latin"] });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const name = pick(lang, site.nameLao, site.nameEng);
  return {
    metadataBase: new URL(site.url),
    title: { default: `${name} | ${t.tagline}`, template: `%s | ${site.short} ${pick(lang, "ຊັບທະວີຄູນ", "Xupthavykhoun")}` },
    description: t.metaDescription,
    openGraph: { siteName: name, locale: lang === "lo" ? "lo_LA" : "en_US", type: "website", images: ["/brand/cover.jpg"] },
    icons: { icon: "/brand/logo.png" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const nav = [
    ["/products", t.nav.products],
    ["/brands", t.nav.brands],
    ["/services", t.nav.services],
    ["/projects", t.nav.projects],
    ["/careers", t.nav.careers],
    ["/about", t.nav.about],
    ["/contact", t.nav.contact],
  ] as const;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.nameEng,
    alternateName: site.nameLao,
    url: site.url,
    logo: `${site.url}/brand/logo.jpg`,
    email: site.email,
    telephone: site.hotline.tel,
    foundingDate: String(site.founded),
    address: { "@type": "PostalAddress", streetAddress: site.addressEng, addressLocality: "Vientiane Capital", addressCountry: "LA" },
    sameAs: [site.facebook],
  };

  return (
    <html lang={lang} className={`${lao.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <Container className="flex items-center justify-between gap-3 py-2.5">
            <Link href={`/${lang}`} className="flex items-center gap-2.5">
              <Image src="/brand/logo.png" alt="XTK" width={800} height={514} className="h-10 w-auto" priority />
              <span className="hidden text-sm font-bold leading-tight text-brand sm:block">
                {pick(lang, site.nameLao, site.nameEng)}
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <LangSwitch lang={lang} />
              <CartNavLink href={`/${lang}/cart`} label={t.shop.cart} />
              <QuoteNavLink href={`/${lang}/quote`} label={t.nav.quote} />
            </div>
          </Container>
          <nav className="border-t border-slate-100 bg-brand text-white">
            <Container className="flex gap-1 overflow-x-auto py-1 text-sm font-medium">
              {nav.map(([path, label]) => (
                <Link key={path} href={`/${lang}${path}`} className="shrink-0 rounded-md px-3 py-1.5 hover:bg-white/15">
                  {label}
                </Link>
              ))}
            </Container>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-16 bg-brand-dark text-sm text-white/85">
          <div aria-hidden="true" className="flex h-1"><span className="w-[70%] bg-brand" /><span className="w-[20%] bg-leaf-bright" /><span className="w-[10%] bg-accent" /></div>
          <Container className="grid gap-8 py-10 md:grid-cols-3">
            <div>
              <Image src="/brand/logo.png" alt="XTK" width={800} height={514} className="mb-3 h-14 w-auto rounded-full ring-2 ring-white/80" />
              <p className="text-base font-bold text-white">{pick(lang, site.nameLao, site.nameEng)}</p>
              <p className="mt-2">{t.tagline}</p>
              <p className="mt-3">{pick(lang, site.addressLao, site.addressEng)}</p>
            </div>
            <div>
              <p className="font-semibold text-white">{t.nav.contact}</p>
              <ul className="mt-2 space-y-1">
                {site.phones.map((phone) => (
                  <li key={phone.tel}>
                    <a href={`tel:${phone.tel}`} className="hover:underline">{phone.label}</a>
                  </li>
                ))}
                <li><a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a></li>
                <li><a href={site.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white">{t.footer.quick}</p>
              <ul className="mt-2 grid grid-cols-2 gap-1">
                {nav.map(([path, label]) => (
                  <li key={path}><Link href={`/${lang}${path}`} className="hover:underline">{label}</Link></li>
                ))}
              </ul>
            </div>
          </Container>
          <div className="border-t border-white/15 py-4 text-center text-xs text-white/70">
            © {new Date().getFullYear()} {site.nameEng}. {t.footer.rights}.
          </div>
        </footer>

        <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-xs font-bold text-white shadow-lg hover:brightness-95">WA</a>
          <a href={messengerLink()} target="_blank" rel="noopener noreferrer" aria-label="Messenger" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0084ff] text-xs font-bold text-white shadow-lg hover:brightness-95">FB</a>
          <a href={`tel:${site.hotline.tel}`} aria-label={site.hotline.label} className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg text-white shadow-lg hover:bg-brand-dark">☎</a>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      </body>
    </html>
  );
}
