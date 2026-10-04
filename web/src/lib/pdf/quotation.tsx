import { join } from "node:path";
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { site } from "../site";

const fontFile = (subset: "lao" | "latin", weight: 400 | 700) =>
  join(process.cwd(), "node_modules/@fontsource/noto-sans-lao/files", `noto-sans-lao-${subset}-${weight}-normal.woff`);

// react-pdf picks one file per family, so Lao and Latin glyphs are registered as two families and listed as a fallback pair.
for (const [family, subset] of [["XtkLao", "lao"], ["XtkLatin", "latin"]] as const) {
  Font.register({ family, fonts: [{ src: fontFile(subset, 400), fontWeight: 400 }, { src: fontFile(subset, 700), fontWeight: 700 }] });
}
Font.registerHyphenationCallback((word) => [word]);

const BLUE = "#2E3192";
const GREEN = "#248E3C";

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 36, fontFamily: ["XtkLatin", "XtkLao"], fontSize: 9.5, color: "#0f172a", lineHeight: 1.6 },
  head: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, borderBottomColor: BLUE, paddingBottom: 10 },
  logo: { width: 46, height: 46, marginRight: 10 },
  company: { flexDirection: "row", flex: 1 },
  companyName: { fontSize: 12, fontWeight: 700, color: BLUE },
  small: { fontSize: 8, color: "#475569" },
  title: { textAlign: "right" },
  titleText: { fontSize: 16, fontWeight: 700, color: BLUE },
  meta: { flexDirection: "row", marginTop: 14 },
  box: { flexGrow: 1, flexShrink: 1, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, padding: 8 },
  label: { fontSize: 8, color: "#64748b", marginBottom: 2 },
  bold: { fontWeight: 700 },
  table: { marginTop: 14, borderWidth: 1, borderColor: "#cbd5e1" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  th: { backgroundColor: BLUE, color: "#fff", fontWeight: 700 },
  td: { paddingVertical: 4, paddingHorizontal: 5 },
  totals: { marginTop: 8, alignSelf: "flex-end", width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grand: { borderTopWidth: 1.5, borderTopColor: GREEN, marginTop: 3, paddingTop: 4, fontSize: 11, fontWeight: 700, color: GREEN },
  terms: { marginTop: 16 },
  sign: { flexDirection: "row", justifyContent: "space-around", marginTop: 36 },
  signBox: { width: 160, alignItems: "center", borderTopWidth: 1, borderTopColor: "#94a3b8", paddingTop: 4 },
  foot: { position: "absolute", bottom: 22, left: 36, right: 36, textAlign: "center", fontSize: 7.5, color: "#94a3b8" },
});

const COLS = { no: 24, item: 0, pack: 70, qty: 36, price: 76, amount: 82 } as const;

export type QuotationPdfData = {
  quoteNumber: string;
  issuedAt: Date;
  validUntil: Date | null;
  customer: { organization: string; contactName: string; phone: string; email: string | null; address: string | null };
  items: { name: string; sku: string; pack: string | null; quantity: number; unitPrice: number | null }[];
  discount: number;
  terms: string | null;
  logoPath: string;
};

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
const date = (d: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Vientiane" }).format(d);

export const lineTotal = (item: { quantity: number; unitPrice: number | null }) => (item.unitPrice == null ? 0 : item.unitPrice * item.quantity);

function QuotationDocument({ data }: { data: QuotationPdfData }) {
  const subtotal = data.items.reduce((sum, item) => sum + lineTotal(item), 0);
  const total = Math.max(0, subtotal - data.discount);
  const cell = (width: number, align: "left" | "right" | "center" = "left") => [s.td, width ? { width } : { flex: 1 }, { textAlign: align }];
  return (
    <Document title={`${data.quoteNumber} – ${data.customer.organization}`} author={site.nameEng}>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <View style={s.company}>
            {/* react-pdf Image has no alt prop */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={data.logoPath} style={s.logo} />
            <View style={{ flex: 1 }}>
              <Text style={s.companyName}>{site.nameLao}</Text>
              <Text style={[s.bold, { color: BLUE }]}>{site.nameEng.toUpperCase()}</Text>
              <Text style={s.small}>{site.addressLao}</Text>
              <Text style={s.small}>{site.phones.map((p) => p.label).join(" · ")} · {site.email} · {site.url.replace("https://", "")}</Text>
            </View>
          </View>
          <View style={s.title}>
            <Text style={[s.titleText, { lineHeight: 1.8 }]}>ໃບສະເໜີລາຄາ</Text>
            <Text style={[s.bold, { color: BLUE }]}>QUOTATION</Text>
          </View>
        </View>

        <View style={s.meta}>
          <View style={s.box}>
            <Text style={s.label}>ລູກຄ້າ / Customer</Text>
            <Text style={s.bold}>{data.customer.organization}</Text>
            <Text>{data.customer.contactName} · {data.customer.phone}</Text>
            {data.customer.email ? <Text>{data.customer.email}</Text> : null}
            {data.customer.address ? <Text style={s.small}>{data.customer.address}</Text> : null}
          </View>
          <View style={[s.box, { flexGrow: 0, flexShrink: 0, flexBasis: 190, marginLeft: 14 }]}>
            <Text style={s.label}>ເລກທີ່ / No.</Text>
            <Text style={s.bold}>{data.quoteNumber}</Text>
            <Text style={[s.label, { marginTop: 4 }]}>ວັນທີ / Date</Text>
            <Text>{date(data.issuedAt)}</Text>
            {data.validUntil ? (
              <>
                <Text style={[s.label, { marginTop: 4 }]}>ໃຊ້ໄດ້ເຖິງ / Valid until</Text>
                <Text>{date(data.validUntil)}</Text>
              </>
            ) : null}
          </View>
        </View>

        <View style={s.table}>
          <View style={[s.tr, s.th]} fixed>
            <Text style={cell(COLS.no, "center")}>#</Text>
            <Text style={cell(COLS.item)}>ລາຍການ / Item</Text>
            <Text style={cell(COLS.pack)}>ບັນຈຸ / Pack</Text>
            <Text style={cell(COLS.qty, "right")}>ຈຳນວນ</Text>
            <Text style={cell(COLS.price, "right")}>ລາຄາ/ຫົວໜ່ວຍ</Text>
            <Text style={cell(COLS.amount, "right")}>ລວມ (ກີບ)</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={s.tr} wrap={false}>
              <Text style={cell(COLS.no, "center")}>{i + 1}</Text>
              <View style={[s.td, { flex: 1 }]}>
                <Text>{item.name}</Text>
                <Text style={s.small}>{item.sku}</Text>
              </View>
              <Text style={cell(COLS.pack)}>{item.pack ?? ""}</Text>
              <Text style={cell(COLS.qty, "right")}>{item.quantity}</Text>
              <Text style={cell(COLS.price, "right")}>{item.unitPrice == null ? "—" : fmt(item.unitPrice)}</Text>
              <Text style={cell(COLS.amount, "right")}>{item.unitPrice == null ? "—" : fmt(lineTotal(item))}</Text>
            </View>
          ))}
        </View>

        <View style={s.totals} wrap={false}>
          <View style={s.totalRow}><Text>ລວມຍ່ອຍ / Subtotal</Text><Text>{fmt(subtotal)} ກີບ</Text></View>
          {data.discount > 0 ? <View style={s.totalRow}><Text>ສ່ວນຫຼຸດ / Discount</Text><Text>- {fmt(data.discount)} ກີບ</Text></View> : null}
          <View style={[s.totalRow, s.grand]}><Text>ລວມທັງໝົດ / Total</Text><Text>{fmt(total)} ກີບ</Text></View>
        </View>

        {data.terms ? (
          <View style={s.terms} wrap={false}>
            <Text style={[s.bold, { color: BLUE }]}>ເງື່ອນໄຂ / Terms</Text>
            <Text>{data.terms}</Text>
          </View>
        ) : null}

        <View style={s.sign} wrap={false}>
          <View style={s.signBox}><Text style={s.small}>ຜູ້ສະເໜີລາຄາ / Prepared by</Text></View>
          <View style={s.signBox}><Text style={s.small}>ລູກຄ້າຢືນຢັນ / Customer acceptance</Text></View>
        </View>

        <Text style={s.foot} fixed render={({ pageNumber, totalPages }) => `${data.quoteNumber} · ${pageNumber}/${totalPages}`} />
      </Page>
    </Document>
  );
}

export async function renderQuotationPdf(data: Omit<QuotationPdfData, "logoPath">) {
  return renderToBuffer(<QuotationDocument data={{ ...data, logoPath: join(process.cwd(), "public/brand/logo.png") }} />);
}
