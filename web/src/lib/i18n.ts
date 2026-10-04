export const locales = ["lo", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "lo";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Lao text is always present; English falls back to Lao when missing. */
export function pick(lang: Locale, lao: string, eng?: string | null) {
  return lang === "en" && eng ? eng : lao;
}

const lo = {
  tagline: "ຈຳໜ່າຍ ແລະ ສ້ອມແປງ ເຄື່ອງອຸປະກອນການແພດທຸກຊະນິດ",
  metaDescription:
    "ບໍລິສັດ ຊັບທະວີຄູນ ຈຳກັດຜູ້ດຽວ ຈຳໜ່າຍຢາ, ອຸປະກອນການແພດ, ອຸປະກອນຫ້ອງວິໄຈ, ນ້ຳຢາກວດວິເຄາະ, ເຄື່ອງໃຊ້ສິ້ນເປືອງ ແລະ ອຸປະກອນຮັກສາຄວາມປອດໄພ ພ້ອມບໍລິການຫຼັງການຂາຍ.",
  nav: {
    home: "ໜ້າຫຼັກ", products: "ສິນຄ້າ", brands: "ຍີ່ຫໍ້", services: "ບໍລິການເຕັກນິກ",
    projects: "ຜົນງານ ແລະ ຂ່າວ", careers: "ຮ່ວມງານກັບເຮົາ", about: "ກ່ຽວກັບເຮົາ", contact: "ຕິດຕໍ່", quote: "ໃບຂໍລາຄາ",
  },
  home: {
    heroTitle: "ອຸປະກອນການແພດຄົບວົງຈອນ ພ້ອມບໍລິການຫຼັງການຂາຍ",
    heroText: "ອຸປະກອນການແພດ, ຫ້ອງວິໄຈ, ນ້ຳຢາກວດວິເຄາະ, ເຄື່ອງໃຊ້ສິ້ນເປືອງ ແລະ ອຸປະກອນຮັກສາຄວາມປອດໄພ ມາດຕະຖານສາກົນ. ມອບສົ່ງ, ຕິດຕັ້ງ ແລະ ສອນການນຳໃຊ້.",
    browse: "ເບິ່ງສິນຄ້າທັງໝົດ", categories: "ໝວດສິນຄ້າ", featured: "ສິນຄ້າແນະນຳ", inStock: "ສິນຄ້າພ້ອມສົ່ງ",
    latest: "ຜົນງານຫຼ້າສຸດ", viewAll: "ເບິ່ງທັງໝົດ",
    why: "ເປັນຫຍັງຕ້ອງເລືອກເຮົາ",
    whyItems: [
      ["ປະສົບການ", "ບຸກຄະລາກອນແຕ່ລະພະແນກມີປະສົບການຫຼາຍກວ່າ 20 ປີ."],
      ["ເຈົ້າຂອງເປັນເພຊັດສະກອນ", "ເຈົ້າຂອງທຸລະກິດແມ່ນນັກເພຊັດສະກອນ ເຂົ້າໃຈຄວາມຕ້ອງການຂອງໂຮງໝໍ ແລະ ຄລີນິກ."],
      ["ບໍລິການຫຼັງການຂາຍ", "ມອບສົ່ງ, ຕິດຕັ້ງ, ສອນການນຳໃຊ້ ແລະ ສ້ອມແປງ ໂດຍທີມເຕັກນິກຂອງບໍລິສັດ."],
      ["ມາດຕະຖານສາກົນ", "ສິນຄ້າໄດ້ມາດຕະຖານ CE, FDA, ISO 13485 ຕາມແຕ່ລະລາຍການ."],
    ],
  },
  product: {
    all: "ສິນຄ້າທັງໝົດ", search: "ຄົ້ນຫາຊື່, ລຸ້ນ ຫຼື ລະຫັດ", searchButton: "ຄົ້ນຫາ", allBrands: "ທຸກຍີ່ຫໍ້",
    onlyInStock: "ສະເພາະພ້ອມສົ່ງ", clear: "ລ້າງຕົວກອງ", none: "ບໍ່ພົບສິນຄ້າ. ລອງປ່ຽນຄຳຄົ້ນ ຫຼື ຖາມແອັດມິນໄດ້ເລີຍ.",
    count: "ລາຍການ", inStock: "ພ້ອມສົ່ງ", preOrder: "ສັ່ງຈອງ", houseBrand: "ຍີ່ຫໍ້ຂອງບໍລິສັດ",
    brand: "ຍີ່ຫໍ້", model: "ລຸ້ນ", sku: "ລະຫັດ", fdd: "ເລກທະບຽນ ອຢ", certifications: "ມາດຕະຖານ",
    askPrice: "ຂໍລາຄາ", price: "ລາຄາ", priceFrom: "ເລີ່ມຕົ້ນ", priceNote: "ລາຄາອາດປ່ຽນແປງ, ຂໍໃບສະເໜີລາຄາເພື່ອຢືນຢັນ", addToQuote: "ເພີ່ມເຂົ້າໃບຂໍລາຄາ", added: "ເພີ່ມແລ້ວ", viewQuote: "ເບິ່ງໃບຂໍລາຄາ",
    askWhatsapp: "ຖາມຜ່ານ WhatsApp", askMessenger: "ຖາມຜ່ານ Messenger", brochure: "ດາວໂຫຼດ Brochure",
    options: "ຕົວເລືອກ ແລະ ຂະໜາດບັນຈຸ", option: "ລາຍການ", pack: "ຂະໜາດບັນຈຸ", status: "ສະຖານະ",
    specs: "ສະເປັກ", usedWith: "ນ້ຳຢາ ແລະ ວັດສະດຸທີ່ໃຊ້ຮ່ວມກັນ", worksWith: "ໃຊ້ໄດ້ກັບເຄື່ອງ",
    related: "ຜົນງານທີ່ກ່ຽວຂ້ອງ", noImage: "ຍັງບໍ່ມີຮູບ",
    inquiry: "ສະບາຍດີ ຂ້າພະເຈົ້າສົນໃຈສິນຄ້າ",
  },
  brands: { title: "ຍີ່ຫໍ້", house: "ຍີ່ຫໍ້ຂອງບໍລິສັດ", distributed: "ຍີ່ຫໍ້ທີ່ຈຳໜ່າຍ", products: "ລາຍການ" },
  quote: {
    title: "ໃບຂໍລາຄາ", intro: "ເລືອກສິນຄ້າທີ່ຕ້ອງການ ແລ້ວສົ່ງຄຳຂໍ. ຝ່າຍຂາຍຈະຕິດຕໍ່ກັບພ້ອມໃບສະເໜີລາຄາ.",
    empty: "ຍັງບໍ່ມີສິນຄ້າໃນໃບຂໍລາຄາ.", qty: "ຈຳນວນ", remove: "ລຶບ", details: "ຂໍ້ມູນຜູ້ຂໍລາຄາ",
    organization: "ຊື່ໂຮງໝໍ / ຄລີນິກ / ອົງກອນ", customerType: "ປະເພດລູກຄ້າ",
    types: { HOSPITAL: "ໂຮງໝໍ", CLINIC: "ຄລີນິກ", DEALER: "ຕົວແທນຈຳໜ່າຍ", GOVERNMENT: "ໜ່ວຍງານລັດ / ໂຄງການ", INDIVIDUAL: "ບຸກຄົນທົ່ວໄປ" },
    contactName: "ຊື່ຜູ້ຕິດຕໍ່", phone: "ເບີໂທ", whatsapp: "ເບີ WhatsApp (ຖ້າຕ່າງຈາກເບີໂທ)", email: "ອີເມວ",
    address: "ທີ່ຢູ່ຈັດສົ່ງ", note: "ໝາຍເຫດ", submit: "ສົ່ງຄຳຂໍລາຄາ", sending: "ກຳລັງສົ່ງ...",
    successTitle: "ໄດ້ຮັບຄຳຂໍລາຄາແລ້ວ", successText: "ເລກອ້າງອີງຂອງທ່ານ:", successNext: "ຝ່າຍຂາຍຈະຕິດຕໍ່ກັບໂດຍໄວ. ຖ້າຕ້ອງການດ່ວນ ສາມາດແຈ້ງເລກອ້າງອີງຜ່ານ WhatsApp.",
    followUp: "ຕິດຕາມຜ່ານ WhatsApp",
  },
  services: {
    title: "ບໍລິການເຕັກນິກ", intro: "ພະແນກບໍລິການຫຼັງການຂາຍພ້ອມໃຫ້ບໍລິການທ່ານ.",
    items: [
      ["ກວດເຊັກກ່ອນສົ່ງມອບ", "ທຸກເຄື່ອງຖືກກວດເຊັກໂດຍທີມເຕັກນິກກ່ອນຈັດສົ່ງ."],
      ["ຕິດຕັ້ງ ແລະ ສອນການນຳໃຊ້", "ມອບສົ່ງ, ຕິດຕັ້ງ ແລະ ຝຶກອົບຮົມຜູ້ໃຊ້ທີ່ສະຖານທີ່ຂອງລູກຄ້າ."],
      ["ສ້ອມແປງ", "ສ້ອມແປງເຄື່ອງອຸປະກອນການແພດທຸກຊະນິດ."],
    ],
    hotline: "ສາຍດ່ວນບໍລິການ", formTitle: "ແຈ້ງສ້ອມແປງ",
    organization: "ຊື່ໂຮງໝໍ / ຄລີນິກ", contactName: "ຊື່ຜູ້ຕິດຕໍ່", phone: "ເບີໂທ",
    deviceModel: "ຊື່ເຄື່ອງ / ລຸ້ນ", serialNumber: "Serial No.", issue: "ອາການ ຫຼື ບັນຫາ",
    photos: "ຮູບປະກອບ (ສູງສຸດ 5 ໄຟລ໌, ໄຟລ໌ລະ 8 MB)", submit: "ສົ່ງແຈ້ງສ້ອມ", sending: "ກຳລັງສົ່ງ...",
    successTitle: "ໄດ້ຮັບການແຈ້ງສ້ອມແລ້ວ", successText: "ເລກຕິດຕາມຂອງທ່ານ:", successNext: "ທີມເຕັກນິກຈະຕິດຕໍ່ກັບໂດຍໄວ.",
  },
  projects: { title: "ຜົນງານ ແລະ ຂ່າວ", project: "ຜົນງານ", news: "ຂ່າວ", relatedProducts: "ສິນຄ້າທີ່ກ່ຽວຂ້ອງ", back: "ກັບໄປໜ້າຜົນງານ" },
  careers: {
    title: "ຮ່ວມງານກັບເຮົາ", intro: "ບໍລິສັດມີການຂະຫຍາຍໂຕຢ່າງຕໍ່ເນື່ອງ ຈຶ່ງເປີດຮັບເພື່ອນຮ່ວມງານ.",
    positions: "ຕຳແໜ່ງ", requirements: "ເງື່ອນໄຂ", benefits: "ສະຫວັດດີການ", none: "ຕອນນີ້ຍັງບໍ່ມີຕຳແໜ່ງວ່າງ.",
    formTitle: "ສະໝັກງານ", job: "ຕຳແໜ່ງທີ່ສະໝັກ", fullName: "ຊື່ ແລະ ນາມສະກຸນ", phone: "ເບີໂທ", email: "ອີເມວ",
    documents: "ເອກະສານ: CV, ໃບຄຳຮ້ອງ, ໃບປະກາດ, ໃບປະສົບການ (PDF ຫຼື ຮູບ, ສູງສຸດ 5 ໄຟລ໌)", note: "ຂໍ້ຄວາມເພີ່ມເຕີມ",
    submit: "ສົ່ງໃບສະໝັກ", sending: "ກຳລັງສົ່ງ...", successTitle: "ໄດ້ຮັບໃບສະໝັກແລ້ວ", successNext: "ຝ່າຍບຸກຄະລາກອນຈະຕິດຕໍ່ກັບ.",
    orEmail: "ຫຼື ສົ່ງ CV ມາທີ່",
  },
  about: {
    title: "ກ່ຽວກັບເຮົາ",
    body: [
      "ບໍລິສັດ ຊັບທະວີຄູນ ຈຳກັດຜູ້ດຽວ ຈົດທະບຽນເປັນບໍລິສັດຖືກຕ້ອງຕາມກົດໝາຍຂອງ ສປປ ລາວ ໃນວັນທີ 01/07/2016.",
      "ພວກເຮົາສະໜອງ ແລະ ຈຳໜ່າຍຢາ, ຜະລິດຕະພັນການແພດ, ອຸປະກອນຫ້ອງວິໄຈ ແລະ ນ້ຳຢາກວດວິເຄາະທຸກຊະນິດທີ່ມີຄຸນນະພາບ ພ້ອມທັງມີຂະແໜງຮັກສາຄວາມປອດໄພທີ່ທັນສະໄໝ ໄດ້ມາດຕະຖານສາກົນ.",
      "ບຸກຄະລາກອນແຕ່ລະພະແນກມີປະສົບການຫຼາຍກວ່າ 20 ປີ ແລະ ມີພະແນກບໍລິການຫຼັງການຂາຍມືອາຊີບ ພ້ອມໃຫ້ບໍລິການທ່ານ.",
    ],
  },
  contact: { title: "ຕິດຕໍ່ເຮົາ", address: "ທີ່ຢູ່", phone: "ໂທລະສັບ", fax: "ແຟັກ", email: "ອີເມວ", chat: "ແຊັດ", map: "ເປີດໃນ Google Maps" },
  form: {
    required: "ກະລຸນາກອກຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບ.", emptyQuote: "ກະລຸນາເລືອກສິນຄ້າຢ່າງໜ້ອຍ 1 ລາຍການ.",
    files: "ໄຟລ໌ບໍ່ຖືກຕ້ອງ: ຮັບ PDF, JPG, PNG ສູງສຸດ 5 ໄຟລ໌ ໄຟລ໌ລະ 8 MB.", failed: "ສົ່ງບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່ ຫຼື ຕິດຕໍ່ທາງໂທລະສັບ.",
  },
  footer: { rights: "ສະຫງວນລິຂະສິດ", quick: "ລິ້ງດ່ວນ" },
  notFound: { title: "ບໍ່ພົບໜ້ານີ້", back: "ກັບໜ້າຫຼັກ" },
};

const en: typeof lo = {
  tagline: "Medical equipment sales and repair",
  metaDescription:
    "Xupthavykhoun Sole Co., Ltd supplies pharmaceuticals, medical equipment, laboratory equipment, diagnostic reagents, consumables and security equipment in Lao PDR, with after-sales service.",
  nav: {
    home: "Home", products: "Products", brands: "Brands", services: "Technical Service",
    projects: "Projects & News", careers: "Careers", about: "About", contact: "Contact", quote: "Quote",
  },
  home: {
    heroTitle: "Complete medical equipment supply with after-sales service",
    heroText: "Medical and laboratory equipment, diagnostic reagents, consumables and security equipment to international standards. Delivery, installation and user training included.",
    browse: "Browse all products", categories: "Product categories", featured: "Featured products", inStock: "In stock",
    latest: "Latest projects", viewAll: "View all",
    why: "Why choose us",
    whyItems: [
      ["Experience", "Staff in each department have more than 20 years of experience."],
      ["Pharmacist-owned", "The business is owned by a pharmacist who understands what hospitals and clinics need."],
      ["After-sales service", "Delivery, installation, user training and repair by our own technical team."],
      ["International standards", "Products certified CE, FDA and ISO 13485, depending on the item."],
    ],
  },
  product: {
    all: "All products", search: "Search name, model or code", searchButton: "Search", allBrands: "All brands",
    onlyInStock: "In stock only", clear: "Clear filters", none: "No products found. Try another search, or ask us directly.",
    count: "items", inStock: "In stock", preOrder: "Pre-order", houseBrand: "Our own brand",
    brand: "Brand", model: "Model", sku: "Code", fdd: "FDD registration no.", certifications: "Certifications",
    askPrice: "Ask for price", price: "Price", priceFrom: "From", priceNote: "Prices may change; request a quote to confirm", addToQuote: "Add to quote", added: "Added", viewQuote: "View quote",
    askWhatsapp: "Ask on WhatsApp", askMessenger: "Ask on Messenger", brochure: "Download brochure",
    options: "Options and pack sizes", option: "Item", pack: "Pack size", status: "Status",
    specs: "Specifications", usedWith: "Reagents and supplies used with this product", worksWith: "Works with",
    related: "Related projects", noImage: "No image yet",
    inquiry: "Hello, I am interested in",
  },
  brands: { title: "Brands", house: "Our own brands", distributed: "Brands we distribute", products: "items" },
  quote: {
    title: "Request a quote", intro: "Add the products you need and send the request. Our sales team will reply with a quotation.",
    empty: "Your quote list is empty.", qty: "Qty", remove: "Remove", details: "Your details",
    organization: "Hospital / clinic / organisation", customerType: "Customer type",
    types: { HOSPITAL: "Hospital", CLINIC: "Clinic", DEALER: "Dealer", GOVERNMENT: "Government / project", INDIVIDUAL: "Individual" },
    contactName: "Contact name", phone: "Phone", whatsapp: "WhatsApp number (if different)", email: "Email",
    address: "Delivery address", note: "Notes", submit: "Send request", sending: "Sending...",
    successTitle: "Request received", successText: "Your reference number:", successNext: "Our sales team will contact you shortly. For urgent requests, send the reference number on WhatsApp.",
    followUp: "Follow up on WhatsApp",
  },
  services: {
    title: "Technical service", intro: "Our after-sales service department is ready to help.",
    items: [
      ["Pre-delivery check", "Every unit is inspected by our technicians before it ships."],
      ["Installation and training", "Delivery, installation and user training at your site."],
      ["Repair", "Repair of all kinds of medical equipment."],
    ],
    hotline: "Service hotline", formTitle: "Request a repair",
    organization: "Hospital / clinic", contactName: "Contact name", phone: "Phone",
    deviceModel: "Device name / model", serialNumber: "Serial no.", issue: "Problem description",
    photos: "Photos (up to 5 files, 8 MB each)", submit: "Send request", sending: "Sending...",
    successTitle: "Repair request received", successText: "Your ticket number:", successNext: "Our technical team will contact you shortly.",
  },
  projects: { title: "Projects & News", project: "Project", news: "News", relatedProducts: "Related products", back: "Back to projects" },
  careers: {
    title: "Careers", intro: "We are growing and looking for new colleagues.",
    positions: "positions", requirements: "Requirements", benefits: "Benefits", none: "There are no open positions right now.",
    formTitle: "Apply", job: "Position", fullName: "Full name", phone: "Phone", email: "Email",
    documents: "Documents: CV, application letter, certificates, references (PDF or image, up to 5 files)", note: "Message",
    submit: "Send application", sending: "Sending...", successTitle: "Application received", successNext: "Our HR team will contact you.",
    orEmail: "Or email your CV to",
  },
  about: {
    title: "About us",
    body: [
      "Xupthavykhoun Sole Co., Ltd was registered as a legal company under the law of Lao PDR on 01/07/2016.",
      "We supply and distribute drugs, medical products, laboratory equipment and all kinds of quality diagnostic reagents, and operate a security division with modern equipment to international standards.",
      "Staff in each department have more than 20 years of experience, and a professional after-sales service department is ready to serve you.",
    ],
  },
  contact: { title: "Contact us", address: "Address", phone: "Phone", fax: "Fax", email: "Email", chat: "Chat", map: "Open in Google Maps" },
  form: {
    required: "Please fill in all required fields.", emptyQuote: "Please add at least one product.",
    files: "Invalid files: PDF, JPG or PNG, up to 5 files of 8 MB each.", failed: "Could not send. Please try again or call us.",
  },
  footer: { rights: "All rights reserved", quick: "Quick links" },
  notFound: { title: "Page not found", back: "Back to home" },
};

const dictionaries = { lo, en };
export type Dictionary = typeof lo;

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}
