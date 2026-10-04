import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartView } from "@/components/CartView";
import { Container, PageTitle } from "@/components/ui";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getPaymentInfo, paymentReady } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[lang]/cart">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDictionary(lang).shop.cartTitle, robots: { index: false } } : {};
}

export default async function CartPage({ params }: PageProps<"/[lang]/cart">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <Container className="py-8">
      <PageTitle intro={t.shop.cartIntro}>{t.shop.cartTitle}</PageTitle>
      <CartView t={t.shop} types={t.quote.types} lang={lang} paymentReady={paymentReady(await getPaymentInfo())} />
    </Container>
  );
}
