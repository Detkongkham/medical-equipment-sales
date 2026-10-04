export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.xtklaos.com",
  nameLao: "ບໍລິສັດ ຊັບທະວີຄູນ ຈຳກັດຜູ້ດຽວ",
  nameEng: "Xupthavykhoun Sole Co., Ltd",
  short: "XTK",
  founded: 2016,
  addressLao: "ບ້ານ ດອນແດງ, ເຮືອນເລກທີ 470, ໜ່ວຍ 46, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ, ຕູ້ ປ.ນ. 1030",
  addressEng: "Dondeng Village, House no. 470, Unit 46, Chanthabouly District, Vientiane Capital, PO Box 1030, Lao PDR",
  geo: { lat: 17.9991, lng: 102.6105 },
  phones: [
    { label: "(021) 563 121", tel: "+85621563121" },
    { label: "(021) 563 183", tel: "+85621563183" },
    { label: "020 5589 2929", tel: "+8562055892929" },
  ],
  hotline: { label: "020 5589 2929", tel: "+8562055892929" },
  fax: "(021) 562 949",
  email: "info@xtklaos.com",
  hrEmail: "Assistant@xtklaos.com",
  // International format without the leading 0 (the legacy site used 85602055892929, which is wrong).
  whatsapp: "8562055892929",
  messenger: "xtkadmin",
  facebook: "https://www.facebook.com/xtkadmin",
};

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function messengerLink(text?: string) {
  const base = `https://m.me/${site.messenger}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const mapLink = `https://maps.google.com/maps?q=${site.geo.lat},${site.geo.lng}`;
export const mapEmbed = `https://maps.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=16&output=embed`;
