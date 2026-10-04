// Seed data taken from the legacy Blogspot sites and the Facebook page (checked 2026-10-04).
// No prices exist in either source, so every variant is "ask for price".
import { PrismaClient, RelationType, StockStatus, PostType } from "@prisma/client";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

const catalogFiles = readdirSync(join(__dirname, "../public/catalog"));
function img(...names: string[]): string[] {
  return names.map((name) => {
    const file = catalogFiles.find((f) => f.replace(/\.[a-z]+$/, "") === name);
    if (!file) throw new Error(`Missing catalog image: ${name}`);
    return `/catalog/${file}`;
  });
}

type Cat = { slug: string; lo: string; en: string; image?: string; children?: Cat[] };

const categories: Cat[] = [
  {
    slug: "pharmaceuticals", lo: "ການຢາ", en: "Pharmaceuticals", image: img("pharmaceuticals-01")[0],
  },
  {
    slug: "health-care", lo: "ອຸປະກອນການແພດ", en: "Health Care", image: img("health-care-01")[0],
    children: [
      { slug: "medical-equipment", lo: "ເຄື່ອງມືແພດ", en: "Medical Equipment" },
      { slug: "diagnostic", lo: "ເຄື່ອງກວດວັດ", en: "Diagnostic Devices" },
      { slug: "surgical", lo: "ເຄື່ອງມືຜ່າຕັດ", en: "Surgical Instruments" },
    ],
  },
  {
    slug: "laboratory", lo: "ອຸປະກອນຫ້ອງວິໄຈ", en: "Laboratory", image: img("laboratory-01")[0],
    children: [
      { slug: "analyzers", lo: "ເຄື່ອງວິເຄາະ", en: "Analyzers" },
      { slug: "reagents", lo: "ນ້ຳຢາກວດວິເຄາະ", en: "Reagents" },
      { slug: "rapid-tests", lo: "ຊຸດກວດໄວ", en: "Rapid Tests" },
    ],
  },
  {
    slug: "consumable", lo: "ເຄື່ອງໃຊ້ສິ້ນເປືອງ", en: "Consumables", image: img("consumable-01")[0],
    children: [
      { slug: "disposables", lo: "ອຸປະກອນໃຊ້ແລ້ວຖິ້ມ", en: "Medical Disposables" },
      { slug: "printer-paper", lo: "ເຈ້ຍພິມການແພດ", en: "Medical Printer Paper" },
    ],
  },
  {
    slug: "security", lo: "ອຸປະກອນຮັກສາຄວາມປອດໄພ", en: "Security", image: img("security-02")[0],
    children: [
      { slug: "xray-inspection", lo: "ເຄື່ອງສະແກນ X-ray", en: "X-ray Inspection Systems" },
      { slug: "metal-detectors", lo: "ເຄື່ອງກວດຈັບໂລຫະ", en: "Metal Detectors" },
      { slug: "trace-detection", lo: "ເຄື່ອງກວດຫາສານ", en: "Trace Detection" },
    ],
  },
];

const brands = [
  { slug: "xtkbio", name: "XTKBio+", isHouseBrand: true },
  { slug: "xupwell", name: "Xupwell", isHouseBrand: true },
  { slug: "genrui", name: "Genrui" },
  { slug: "chison", name: "Chison" },
  { slug: "lumiquick", name: "LumiQuick Diagnostics" },
  { slug: "vivachek", name: "VivaChek" },
  { slug: "vcomin", name: "Vcomin" },
  { slug: "gima", name: "GIMA" },
  { slug: "sony", name: "Sony" },
  { slug: "autoclear", name: "Autoclear" },
  { slug: "ceia", name: "CEIA" },
];

type Spec = [lo: string, en: string, value: string];
type Variant = { lo: string; en: string; pack?: string; inStock?: boolean };
type P = {
  slug: string; cat: string; brand?: string; model?: string;
  lo: string; en: string; descLo?: string; descEng?: string;
  images: string[]; certs?: string[]; specs?: Spec[];
  inStock?: boolean; featured?: boolean; variants?: Variant[];
};

const products: P[] = [
  // --- Pharmaceuticals (the legacy site lists drug groups only) ---
  { slug: "antibacterial-drugs", cat: "pharmaceuticals", lo: "ຢາຕ້ານເຊື້ອ", en: "Antibacterial Drugs", images: img("pharmaceuticals-01") },
  { slug: "antihistamines", cat: "pharmaceuticals", lo: "ຢາແກ້ແພ້", en: "Antihistamines", images: img("pharmaceuticals-01") },
  { slug: "analgesics-antipyretics-nsaids", cat: "pharmaceuticals", lo: "ຢາແກ້ປວດ, ລົດໄຂ້ ແລະ NSAIDs", en: "Analgesics, Antipyretics and NSAIDs", images: img("pharmaceuticals-01") },
  { slug: "respiratory-drugs", cat: "pharmaceuticals", lo: "ຢາລະບົບຫາຍໃຈ", en: "Respiratory Drugs", images: img("pharmaceuticals-01") },
  { slug: "gastrointestinal-drugs", cat: "pharmaceuticals", lo: "ຢາລະບົບກະເພາະລຳໄສ້", en: "Gastrointestinal Drugs", images: img("pharmaceuticals-01") },

  // --- Health care: equipment ---
  { slug: "ct-scan", cat: "medical-equipment", lo: "ເຄື່ອງ CT Scan", en: "CT Scan", images: img("health-care-01") },
  { slug: "digital-x-ray", cat: "medical-equipment", lo: "ເຄື່ອງ X-ray ດິຈິຕອນ", en: "Digital X-ray Imaging Machine", images: img("health-care-02") },
  { slug: "c-arm-x-ray", cat: "medical-equipment", lo: "ເຄື່ອງ C-arm X-ray", en: "C-arm X-ray", images: [] },
  {
    slug: "chison-ultrasound", cat: "medical-equipment", brand: "chison", featured: true,
    lo: "ເຄື່ອງ Ultrasound 4D-5D", en: "Ultrasound 4D-5D",
    descLo: "ເຄື່ອງເອໂກສີ ແລະ ຂາວດຳ ພາບຄົມຊັດ. ມີທັງແບບພົກພາ, ແບບລົດເຂັນ ແລະ ຂາວດຳ.",
    descEng: "Colour and B&W ultrasound systems: portable, cart-based and B&W models.",
    images: img("fb-chison-ultrasound", "health-care-03"),
    variants: [
      { lo: "ແບບພົກພາ", en: "Portable Ultrasound" },
      { lo: "ແບບລົດເຂັນ", en: "Cart-based Ultrasound" },
      { lo: "ຂາວດຳ", en: "B&W Ultrasound" },
    ],
  },
  { slug: "anesthesia-machine", cat: "medical-equipment", lo: "ເຄື່ອງດົມຢາສະຫຼົບ", en: "Anesthesia Machine", images: [] },
  { slug: "ventilator", cat: "medical-equipment", lo: "ເຄື່ອງຊ່ວຍຫາຍໃຈ", en: "Ventilator", images: ["/posts/ventilator-check-1.jpg"] },
  { slug: "patient-monitor", cat: "medical-equipment", lo: "ເຄື່ອງຕິດຕາມຄົນເຈັບ", en: "Patient Monitor", images: ["/posts/monitor-check-2.jpg"] },
  { slug: "fetal-maternal-monitor", cat: "medical-equipment", lo: "ເຄື່ອງຕິດຕາມແມ່ ແລະ ລູກໃນທ້ອງ", en: "Fetal & Maternal Monitor", images: img("health-care-04") },
  { slug: "ecg-machine", cat: "medical-equipment", lo: "ເຄື່ອງກວດຄື້ນໄຟຟ້າຫົວໃຈ ECG", en: "ECG Machine", images: img("health-care-05") },
  { slug: "surgical-lamp", cat: "medical-equipment", lo: "ໂຄມໄຟຜ່າຕັດ", en: "Surgical Lamp", images: img("health-care-07") },

  // --- Health care: diagnostic ---
  {
    slug: "xupwell-as-35x-blood-pressure-monitor", cat: "diagnostic", brand: "xupwell", model: "AS-35X", featured: true, inStock: true,
    lo: "ເຄື່ອງວັດຄວາມດັນແບບວັດແຂນ Xupwell AS-35X", en: "Xupwell AS-35X Upper Arm Blood Pressure Monitor",
    descLo: "ເຄື່ອງວັດຄວາມດັນດິຈິຕອນ ມາດຕະຖານການແພດ, ມີສຽງພາສາໄທ, ໃຊ້ງານງ່າຍ ສາມາດກວດດ້ວຍຕົນເອງໄດ້.",
    descEng: "Automatic digital upper-arm blood pressure monitor. One-touch operation, easy to read display.",
    images: img("fb-xupwell-bp", "fb-xupwell-bp-2", "health-care-08"),
    specs: [
      ["ຈໍສະແດງຜົນ", "Display", "LCD: SYS / DIA / PUL"],
      ["ໜ່ວຍຄວາມຈຳ", "Memory", "120 readings"],
      ["ອຸປະກອນໃນຊຸດ", "In the box", "Monitor, arm cuff, cable, 4 × AA batteries, storage bag, manual"],
    ],
  },
  {
    slug: "vivachek-fad-blood-glucose-monitor", cat: "diagnostic", brand: "vivachek", inStock: true,
    lo: "ເຄື່ອງກວດນ້ຳຕານໃນເລືອດແບບພົກພາ VivaChek Fad", en: "VivaChek Fad Blood Glucose Monitoring System",
    images: img("fb-vivachek", "health-care-09"),
    specs: [
      ["ປະລິມານເລືອດ", "Sample volume", "0.5 µl"],
      ["ຊ່ວງ HCT", "HCT range", "0–70%"],
      ["ເວລາຮູ້ຜົນ", "Test time", "5 s"],
      ["ເອນໄຊມ໌", "Enzyme", "GDH-FAD"],
    ],
  },
  {
    slug: "fingertip-pulse-oximeter", cat: "diagnostic", inStock: true,
    lo: "ເຄື່ອງວັດອົກຊີເຈນປາຍນິ້ວ", en: "Fingertip Pulse Oximeter",
    descLo: "ວັດແທກອົກຊີເຈນໃນເລືອດ ແລະ ອັດຕາການເຕັ້ນຂອງຫົວໃຈ. ຈໍສະແດງຜົນ LED.",
    descEng: "Measures blood oxygen saturation and pulse rate. LED display.",
    images: img("fb-oximeter", "health-care-10"),
  },
  { slug: "handheld-pulse-oximeter", cat: "diagnostic", lo: "ເຄື່ອງວັດອົກຊີເຈນແບບມືຖື", en: "Handheld Pulse Oximeter", images: img("health-care-13") },
  {
    slug: "vcomin-fetal-doppler", cat: "diagnostic", brand: "vcomin", inStock: true,
    lo: "ເຄື່ອງຟັງສຽງຫົວໃຈເດັກໃນທ້ອງ Fetal Doppler", en: "Fetal Doppler",
    descLo: "ໃຊ້ຄື້ນ Ultrasound ປອດໄພຕໍ່ເດັກໃນທ້ອງ. ຈໍ LCD ມີໄຟໃນຈໍ.",
    descEng: "Pocket fetal heart-rate doppler with backlit LCD.",
    images: img("fb-fetal-doppler", "health-care-11"),
  },
  {
    slug: "gima-trad-dual-head-stethoscope", cat: "diagnostic", brand: "gima", model: "TRAD Dual Head", inStock: true,
    lo: "ຫູຟັງການແພດ GIMA TRAD Dual Head", en: "GIMA TRAD Dual Head Stethoscope",
    descLo: "ສຳລັບຜູ້ໃຫຍ່ ແລະ ເດັກ. ຄວາມຍາວ 62 cm.",
    descEng: "Dual-head stethoscope for adults and children. Length 62 cm.",
    images: img("fb-stethoscope-gima", "fb-stethoscope-gima-2", "health-care-12"),
    certs: ["ISO 9001", "ISO 13485"],
  },
  { slug: "oxygen-flow-meter", cat: "diagnostic", lo: "ເຄື່ອງວັດອັດຕາການໄຫຼອົກຊີເຈນ", en: "Oxygen Flow Meter", images: img("health-care-14") },
  { slug: "infrared-forehead-thermometer", cat: "diagnostic", lo: "ເຄື່ອງວັດອຸນຫະພູມໜ້າຜາກ Infrared", en: "Medical Infrared Forehead Thermometer", images: img("health-care-15") },

  // --- Health care: surgical ---
  {
    slug: "surgical-sutures", cat: "surgical", lo: "ໄໝຫຍິບແຜ", en: "Surgical Sutures", images: img("health-care-16", "fb-consumable-suture-ecg"),
    variants: [
      { lo: "ໄໝລະລາຍ", en: "Absorbable Surgical Suture" },
      { lo: "ໄໝບໍ່ລະລາຍ", en: "Nonabsorbable Surgical Suture" },
    ],
  },
  {
    slug: "minor-surgery-instrument-sets", cat: "surgical", inStock: true,
    lo: "ຊຸດເຄື່ອງມືຜ່າຕັດນ້ອຍ", en: "Minor Surgery Instrument Sets",
    images: img("fb-instrument-set", "fb-instrument-set-2", "fb-instrument-set-3"),
    variants: [
      { lo: "ຊຸດຜ່າຕັດນ້ອຍ", en: "Minor instrument set", inStock: true },
      { lo: "ຊຸດເກີດລູກ", en: "Delivery set", inStock: true },
      { lo: "ຊຸດລ້າງແຜ", en: "Dressing set", inStock: true },
    ],
  },

  // --- Laboratory: analyzers ---
  {
    slug: "xtkbio-tk-200-chemistry-analyzer", cat: "analyzers", brand: "xtkbio", model: "TK-200", featured: true,
    lo: "ເຄື່ອງກວດເລືອດເຄມີໂອໂຕ XTKBio+ TK-200", en: "XTKBio+ TK-200 Automatic Chemistry Analyzer",
    descLo: "ກວດໄດ້ເຖິງ 200 ຕົວຢ່າງ/ຊົ່ວໂມງ. ເໝາະກັບໂຮງໝໍ ຫຼື ຄລີນິກ ທີ່ຕ້ອງການຄວາມວ່ອງໄວ ແລະ ຜົນກວດແມ່ນຍຳ.",
    descEng: "Up to 200 tests per hour, for hospitals and clinics that need fast, accurate results.",
    images: img("fb-tk-200"), certs: ["CE", "FDA", "ISO 9001", "ISO 13485"],
    specs: [
      ["ຄວາມໄວ", "Throughput", "200 tests/hour"],
      ["ຊ່ອງຕົວຢ່າງ", "Sample positions", "37"],
      ["ຊ່ອງນ້ຳຢາ", "Reagent positions", "28"],
      ["Cuvette", "Reaction cuvettes", "48 reusable (6 mm optical length)"],
      ["ຫົວດູດ", "Probe", "Teflon coating, anti-collision, liquid-level detection"],
      ["ການລ້າງ", "Washing", "Automatic probe and cuvette washing"],
      ["ຖາດນ້ຳຢາ", "Reagent tray", "Refrigerated, independent switch"],
      ["ຕົວຢ່າງດ່ວນ", "STAT", "Yes"],
    ],
  },
  {
    slug: "gs100-auto-chemistry-analyzer", cat: "analyzers", model: "GS100",
    lo: "ເຄື່ອງກວດເລືອດເຄມີອັດຕະໂນມັດ GS100", en: "GS100 Auto Chemistry Analyzer",
    images: img("fb-gs100", "laboratory-03"),
    specs: [
      ["ຄວາມໄວ", "Throughput", "100 tests/hour"],
      ["ຈໍສຳຜັດ", "Touch screen", "10.4 inch"],
    ],
  },
  { slug: "semi-auto-chemistry-analyzer", cat: "analyzers", lo: "ເຄື່ອງກວດເລືອດເຄມີເຄິ່ງອັດຕະໂນມັດ", en: "Semi-Automated Chemistry Analyzer", images: img("laboratory-03") },
  {
    slug: "genrui-kt-6510-hematology-analyzer", cat: "analyzers", brand: "genrui", model: "KT-6510", featured: true,
    lo: "ເຄື່ອງກວດນັບເມັດເລືອດ CBC 5-Part Genrui KT-6510", en: "Genrui KT-6510 5-Part Auto Hematology Analyzer",
    descLo: "ແຍກເມັດເລືອດຂາວໄດ້ 5 ຊະນິດ ຢ່າງລະອຽດ ແລະ ແມ່ນຍຳ.",
    descEng: "5-part white blood cell differential with 28 parameters.",
    images: img("fb-kt-6510", "laboratory-01"),
    specs: [
      ["ພາຣາມິເຕີ", "Parameters", "28"],
      ["ຄວາມໄວ", "Throughput", "60 samples/hour"],
      ["ນ້ຳຢາ", "Reagents", "2 Lyse + 1 Diluent"],
      ["ຄວາມຈຳ", "Memory", "50,000 results"],
      ["ຈໍສຳຜັດ", "Touch screen", "10.4 inch LCD"],
    ],
  },
  {
    slug: "genrui-ge300-electrolyte-analyzer", cat: "analyzers", brand: "genrui", model: "GE300",
    lo: "ເຄື່ອງວິເຄາະ Electrolyte Genrui GE300", en: "Genrui GE300 Electrolyte Analyzer",
    images: img("fb-ge300"),
    specs: [
      ["ຄວາມໄວ", "Throughput", "60 samples/hour"],
      ["ຈໍສຳຜັດ", "Touch screen", "5.6 inch"],
      ["ພາຣາມິເຕີ", "Parameters", "K, Na, Cl, iCa, Li, pH, TCa, TCO2, AG"],
    ],
  },
  {
    slug: "quantitative-immunoassay-analyzer", cat: "analyzers", brand: "genrui",
    lo: "ເຄື່ອງວິເຄາະ Immunoassay", en: "Quantitative Immunoassay Analyzer",
    images: img("laboratory-04", "laboratory-05"),
    specs: [["ລາຍການກວດ", "Test menu", "T3, T4, TSH, HbA1c"]],
  },
  { slug: "urine-analyzer", cat: "analyzers", lo: "ເຄື່ອງກວດປັດສະວະ", en: "Urine Analysis Machine", images: img("laboratory-06") },
  {
    slug: "hemoglobin-testing-system", cat: "analyzers", featured: true, inStock: true,
    lo: "ເຄື່ອງກວດເລືອດ Hemoglobin ແບບພົກພາ", en: "Portable Hemoglobin Testing System",
    descLo: "ກວດຫາປະລິມານ Hemoglobin (Hb) ແລະ ຄ່າ Hematocrit (Hct) ເພື່ອວິເຄາະພາວະເລືອດຈາງ ແລະ ເລືອດຂຸ້ນ. ກວດໄດ້ທັງເດັກນ້ອຍ ແລະ ຜູ້ໃຫຍ່.",
    descEng: "Measures hemoglobin (Hb) and hematocrit (Hct) to screen for anemia and polycythemia. For children and adults.",
    images: img("fb-hemoglobin", "fb-hemoglobin-kit"), certs: ["CE", "ISO"],
    specs: [
      ["ປະລິມານເລືອດ", "Sample volume", "10 µl"],
      ["ຈໍສະແດງຜົນ", "Display", "LCD"],
      ["ອຸປະກອນໃນຊຸດ", "In the box", "Meter, carrying case, lancing device, test strips, AAA batteries, manual"],
    ],
  },
  { slug: "centrifuge", cat: "analyzers", lo: "ເຄື່ອງປັ່ນຫວ່ຽງ", en: "Centrifuge", images: img("health-care-06") },

  // --- Laboratory: reagents ---
  {
    slug: "hematology-reagents", cat: "reagents", lo: "ນ້ຳຢາ Hematology", en: "Hematology Reagents", images: img("laboratory-02"),
    variants: [{ lo: "Diluent", en: "Diluent" }, { lo: "Lyse", en: "Lyse" }],
  },
  {
    slug: "clinical-chemistry-reagents", cat: "reagents", lo: "ນ້ຳຢາກວດເຄມີຄລີນິກ", en: "Clinical Chemistry Reagents", images: img("laboratory-02"),
    variants: ["Cholesterol", "Glucose", "Urea/BUN", "Uric acid", "Triglyceride", "Creatinine", "AST/GOT", "ALT/GPT", "Calcium", "Total protein", "GGT", "HDL Cholesterol", "LDL Cholesterol", "Albumin", "Direct Bilirubin", "Total Bilirubin", "Alkaline phosphatase"].map((n) => ({ lo: n, en: n })),
  },
  { slug: "urine-test-strips", cat: "reagents", lo: "ແຖບກວດປັດສະວະ", en: "Urine Test Strips", images: img("laboratory-07") },
  {
    slug: "febrile-antigen", cat: "reagents", lo: "ນ້ຳຢາ Febrile Antigen", en: "Febrile Antigen", images: img("laboratory-08"),
    variants: ["Salmonella Typhi H", "Salmonella Typhi O", "Proteus OXK", "Proteus OX2", "Proteus OX19"].map((n) => ({ lo: n, en: n })),
  },
  {
    slug: "latex-reagents", cat: "reagents", lo: "ນ້ຳຢາ Latex", en: "Turbidimetry Latex Reagents", images: img("laboratory-09"),
    variants: ["ASLO Latex", "CRP Latex", "RPR Latex", "S.L.E Latex", "RF Latex"].map((n) => ({ lo: n, en: n })),
  },
  {
    slug: "blood-grouping-antisera", cat: "reagents", lo: "ນ້ຳຢາກວດກຸ່ມເລືອດ", en: "Blood Grouping Antisera", images: img("laboratory-10"),
    variants: ["Anti-A", "Anti-B", "Anti-AB", "Anti-D"].map((n) => ({ lo: n, en: n })),
  },

  // --- Laboratory: rapid tests ---
  {
    slug: "lumiquick-rapid-tests", cat: "rapid-tests", brand: "lumiquick", featured: true, inStock: true,
    lo: "ຊຸດກວດ Rapid Test LumiQuick", en: "LumiQuick Rapid Tests",
    descLo: "ຊຸດກວດໄວ ເຫັນຜົນໄວ ຊັດເຈນ ເໝາະກັບການໃຊ້ໃນໂຮງໝໍ ແລະ ຄລີນິກ.",
    descEng: "Rapid diagnostic tests with fast, clear results for hospitals and clinics.",
    images: img("fb-lumiquick-dengue", "fb-lumiquick-dengue-2", "fb-lumiquick-hbsag", "fb-lumiquick-hpylori", "fb-lumiquick-malaria", "fb-lumiquick-rickettsia", "laboratory-11"),
    certs: ["ISO 13485", "ISO 9001", "GMP"],
    variants: [
      { lo: "Dengue IgG/IgM/NS1 Combo", en: "Dengue IgG/IgM/NS1 Combo", pack: "25 test/box", inStock: true },
      { lo: "H.Pylori Antibody Test Card", en: "H.Pylori Antibody Test Card", pack: "25 test/box", inStock: true },
      { lo: "HBsAg Test Card", en: "HBsAg Test Card", pack: "25 test/box", inStock: true },
      { lo: "HBsAg Test Strip", en: "HBsAg Test Strip", pack: "50 test/box", inStock: true },
      { lo: "HBsAb Test Card", en: "HBsAb Test Card", pack: "25 test/box", inStock: true },
      { lo: "HBsAb Test Strip", en: "HBsAb Test Strip", pack: "50 test/box", inStock: true },
      { lo: "HIV I&II Test Card", en: "HIV I&II Test Card", pack: "25 test/box", inStock: true },
      { lo: "HCV Antibody Test Card", en: "HCV Antibody Test Card", pack: "25 test/box", inStock: true },
      { lo: "HCV Antibody Strip", en: "HCV Antibody Strip", pack: "50 test/box", inStock: true },
      { lo: "Leptospira IgM/IgG", en: "Leptospira IgM/IgG", pack: "25 test/box", inStock: true },
      { lo: "Malaria Pf/Pv Antigen Test Card", en: "Malaria Pf/Pv Antigen Test Card", inStock: true },
      { lo: "Rickettsia IgG/IgM Combo Test Card", en: "Rickettsia IgG/IgM Combo Test Card" },
    ],
  },
  {
    slug: "other-rapid-tests", cat: "rapid-tests", lo: "ຊຸດກວດໄວອື່ນໆ", en: "Other Rapid Tests", images: img("laboratory-11"),
    variants: ["Amphetamine (AMP) Test Card", "Amphetamine (AMP) Test Strip", "Chlamydia", "Salmonella Typhi IgG/IgM Combo Test Card", "Syphilis (Whole Blood/Serum/Plasma)", "TB (Whole Blood/Serum/Plasma)", "Typhoid (Whole Blood/Serum/Plasma)"].map((n) => ({ lo: n, en: n })),
  },

  // --- Consumables ---
  {
    slug: "blood-collection-tubes", cat: "disposables", featured: true, inStock: true,
    lo: "ຫຼອດເກັບເລືອດ 3.0 ml", en: "Blood Collection Tubes 3.0 ml",
    images: img("fb-blood-tubes", "consumable-01", "fb-consumable-tubes-syringes"),
    variants: [
      { lo: "Clot Activator (ຝາແດງ)", en: "Clot Activator (red)", pack: "100/pack", inStock: true },
      { lo: "Gel & Clot Activator (ຝາເຫຼືອງ)", en: "Gel & Clot Activator (yellow)", pack: "100/pack", inStock: true },
      { lo: "EDTA K3 (ຝາມ່ວງ)", en: "EDTA K3 (purple)", pack: "100/pack", inStock: true },
      { lo: "Lithium Heparin (ຝາຂຽວ)", en: "Lithium Heparin (green)", pack: "100/pack", inStock: true },
    ],
  },
  {
    slug: "syringes-and-needles", cat: "disposables", lo: "ສະແລັງ ແລະ ເຂັມສັກຢາ", en: "Syringes & Needles", images: img("consumable-05", "fb-consumable-tubes-syringes"),
    variants: [
      { lo: "ສະແລັງບໍ່ມີເຂັມ", en: "Syringe without needle" },
      { lo: "ສະແລັງພ້ອມເຂັມ", en: "Syringe with needle" },
      { lo: "ສະແລັງ Insulin", en: "Insulin syringe" },
      { lo: "ເຂັມ", en: "Needle" },
    ],
  },
  { slug: "pipette-tips", cat: "disposables", lo: "Pipette Tips", en: "Pipette Tips", images: img("consumable-06") },
  {
    slug: "medical-tubes-and-catheters", cat: "disposables", lo: "ທໍ່ ແລະ ສາຍການແພດ", en: "Medical Tubes & Catheters", images: img("consumable-03", "fb-consumable-catheter-bandage"),
    variants: [
      { lo: "Foley Catheter 2 Way", en: "Foley Catheter 2 Way", pack: "FR 12, 14, 16, 18" },
      { lo: "Stomach Tube", en: "Stomach Tube", pack: "8, 10, 16, 18" },
      { lo: "ຖົງປັດສະວະ", en: "Urine Bag" },
    ],
  },
  {
    slug: "anesthesia-breathing-and-oxygen", cat: "disposables", lo: "ອຸປະກອນຊ່ວຍຫາຍໃຈ ແລະ ອົກຊີເຈນ", en: "Anesthesia Breathing & Oxygen Supplies", images: img("consumable-04", "fb-consumable-oxygen"),
    variants: [
      { lo: "ຊຸດພົ່ນຢາ", en: "Nasal Nebulizer" },
      { lo: "ໜ້າກາກອົກຊີເຈນພ້ອມຖົງ", en: "Oxygen Mask with Bag" },
      { lo: "ສາຍອົກຊີເຈນ", en: "Nasal Oxygen Cannula" },
      { lo: "ວົງຈອນຫາຍໃຈໃຊ້ຄັ້ງດຽວ", en: "Single-use Breathing Circuit" },
      { lo: "ທໍ່ຊ່ວຍຫາຍໃຈ", en: "Endotracheal Tube (uncuffed)" },
      { lo: "ສາຍດູດສະເໝຫະ", en: "Suction Catheter with Control" },
    ],
  },
  { slug: "operators-protection", cat: "disposables", lo: "ອຸປະກອນປ້ອງກັນຜູ້ປະຕິບັດງານ", en: "Operator's Protection", images: img("consumable-02") },
  {
    slug: "dressing-and-bandages", cat: "disposables", lo: "ຜ້າພັນແຜ ແລະ ເທບ", en: "Bandages & Tapes", images: img("fb-consumable-catheter-bandage"),
    variants: [
      { lo: "ຜ້າພັນຢືດ", en: "Elastic Bandage" },
      { lo: "ສຳລີ", en: "Hydrophilic Cotton", pack: "500 g" },
      { lo: "ເທບ Zinc-Oxide", en: "Zinc-Oxide Tape" },
      { lo: "ເທບປະຖົມພະຍາບານ", en: "First Aid Tape" },
    ],
  },
  { slug: "ecg-electrodes", cat: "disposables", lo: "ແຜ່ນ ECG Electrode", en: "ECG Electrodes", images: img("fb-consumable-suture-ecg") },
  {
    slug: "ultrasound-paper", cat: "printer-paper", brand: "sony", lo: "ເຈ້ຍ Ultrasound", en: "Ultrasound Paper", images: img("consumable-07"),
    variants: [
      { lo: "SONY Type V UPP-110HG", en: "SONY Type V UPP-110HG", pack: "110 mm × 18 m" },
      { lo: "High Quality Type II UPP-110HD", en: "High Quality Type II UPP-110HD", pack: "110 mm × 20 m" },
    ],
  },
  {
    slug: "thermal-paper", cat: "printer-paper", lo: "ເຈ້ຍ Thermal", en: "Thermal Paper", images: img("consumable-08"),
    variants: [
      { lo: "ສຳລັບເຄື່ອງ CBC", en: "For CBC analyzer", pack: "79 × 40 mm" },
      { lo: "ສຳລັບເຄື່ອງເຄມີ ແລະ Immunoassay", en: "For chemistry and immunoassay analyzers", pack: "57 × 34 mm" },
      { lo: "ສຳລັບເຄື່ອງກວດປັດສະວະ", en: "For urine analyzer", pack: "55 × 46 mm" },
    ],
  },
  {
    slug: "ecg-paper", cat: "printer-paper", lo: "ເຈ້ຍ ECG", en: "ECG Paper", images: img("consumable-09"),
    variants: [
      { lo: "110 mm × 20 m", en: "110 mm × 20 m" },
      { lo: "215 mm × 30 m", en: "215 mm × 30 m" },
    ],
  },
  {
    slug: "fetal-monitor-paper", cat: "printer-paper", lo: "ເຈ້ຍ Fetal/Maternal Monitor", en: "Fetal/Maternal Monitor Paper", images: img("consumable-10"),
    variants: [{ lo: "152 × 90 mm", en: "152 × 90 mm" }],
  },

  // --- Security ---
  { slug: "xray-180150dvs", cat: "xray-inspection", brand: "autoclear", model: "180150DVS", featured: true, lo: "ເຄື່ອງສະແກນ X-ray 180150DVS", en: "180150DVS X-ray Inspection System", images: img("security-01") },
  { slug: "xray-100100tdvs-dv", cat: "xray-inspection", brand: "autoclear", model: "100100TDVS-DV", lo: "ເຄື່ອງສະແກນ X-ray 100100TDVS-DV", en: "100100TDVS-DV X-ray Inspection System", images: img("security-02") },
  { slug: "xray-7555dvs", cat: "xray-inspection", brand: "autoclear", model: "7555DVS", lo: "ເຄື່ອງສະແກນ X-ray 7555DVS", en: "7555DVS X-ray Inspection System", images: img("security-03") },
  { slug: "xray-5333dvs", cat: "xray-inspection", brand: "autoclear", model: "5333DVS", lo: "ເຄື່ອງສະແກນ X-ray 5333DVS", en: "5333DVS X-ray Inspection System", images: img("security-04") },
  { slug: "walk-through-smd600-plus-mi2", cat: "metal-detectors", brand: "ceia", model: "SMD600 Plus-MI2", lo: "ປະຕູກວດຈັບໂລຫະ SMD600 Plus-MI2", en: "SMD600 Plus-MI2 Walk-Through Metal Detector", images: img("security-05") },
  { slug: "handheld-pd240cb", cat: "metal-detectors", brand: "ceia", model: "PD240CB", lo: "ເຄື່ອງກວດຈັບໂລຫະແບບມືຖື PD240CB", en: "PD240CB Hand Held Metal Detector", images: img("security-06") },
  { slug: "handheld-pd140n", cat: "metal-detectors", brand: "ceia", model: "PD140N", lo: "ເຄື່ອງກວດຈັບໂລຫະແບບມືຖື PD140N", en: "PD140N Hand Held Metal Detector", images: img("security-07") },
  { slug: "handheld-pd240", cat: "metal-detectors", brand: "ceia", model: "PD240", lo: "ເຄື່ອງກວດຈັບໂລຫະແບບມືຖື PD240", en: "PD240 Hand Held Metal Detector", images: img("security-08") },
  { slug: "trace-e5000", cat: "trace-detection", model: "E5000", lo: "ເຄື່ອງກວດຫາສານ E5000 Series", en: "E5000 Series Trace Detector", images: img("security-09") },
  { slug: "trace-n2300", cat: "trace-detection", model: "N2300", lo: "ເຄື່ອງກວດຫາສານ N2300", en: "N2300 Trace Detector", images: img("security-10") },
  { slug: "trace-clx", cat: "trace-detection", model: "CLX", lo: "ເຄື່ອງກວດຫາສານ CLX Compact", en: "CLX Compact Trace Detector", images: img("security-11") },
  { slug: "lrs-900", cat: "trace-detection", model: "LRS-900", lo: "LRS-900", en: "LRS-900", images: img("security-12") },
];

// Analyzer -> the reagents and paper it uses.
const relations: [from: string, to: string, type: RelationType][] = [
  ["genrui-kt-6510-hematology-analyzer", "hematology-reagents", "REAGENT"],
  ["genrui-kt-6510-hematology-analyzer", "thermal-paper", "CONSUMABLE"],
  ["genrui-kt-6510-hematology-analyzer", "blood-collection-tubes", "CONSUMABLE"],
  ["xtkbio-tk-200-chemistry-analyzer", "clinical-chemistry-reagents", "REAGENT"],
  ["xtkbio-tk-200-chemistry-analyzer", "blood-collection-tubes", "CONSUMABLE"],
  ["gs100-auto-chemistry-analyzer", "clinical-chemistry-reagents", "REAGENT"],
  ["gs100-auto-chemistry-analyzer", "thermal-paper", "CONSUMABLE"],
  ["semi-auto-chemistry-analyzer", "clinical-chemistry-reagents", "REAGENT"],
  ["urine-analyzer", "urine-test-strips", "REAGENT"],
  ["urine-analyzer", "thermal-paper", "CONSUMABLE"],
  ["quantitative-immunoassay-analyzer", "thermal-paper", "CONSUMABLE"],
  ["chison-ultrasound", "ultrasound-paper", "CONSUMABLE"],
  ["ecg-machine", "ecg-paper", "CONSUMABLE"],
  ["ecg-machine", "ecg-electrodes", "CONSUMABLE"],
  ["fetal-maternal-monitor", "fetal-monitor-paper", "CONSUMABLE"],
];

const boilerLo = "ບໍລິສັດ ຊັບທະວີຄູນ ຈຳກັດຜູ້ດຽວ ມີບໍລິການຫຼັງການຂາຍ: ມອບສົ່ງ, ຕິດຕັ້ງ ແລະ ສອນການນຳໃຊ້.";
const posts = [
  {
    slug: "tk-200-installation-and-training", type: PostType.PROJECT, date: "2026-08-12",
    lo: "ຕິດຕັ້ງ ແລະ ສອນການນຳໃຊ້ເຄື່ອງກວດເລືອດເຄມີໂອໂຕ XTKBio+ TK-200",
    en: "Installation and training: XTKBio+ TK-200 chemistry analyzer",
    bodyLo: `ສຳເລັດການຕິດຕັ້ງ ແລະ ສອນການນຳໃຊ້ເຄື່ອງກວດເລືອດເຄມີໂອໂຕ ກວດໄດ້ 200 ຕົວຢ່າງ/ຊົ່ວໂມງ.\n\nຂໍຂອບໃຈລູກຄ້າທີ່ເຊື່ອໝັ້ນໃນການບໍລິການຂອງພວກເຮົາ.\n\n${boilerLo}`,
    bodyEng: "Installation and on-site user training completed for the TK-200 automatic chemistry analyzer (200 tests per hour).",
    images: ["/posts/tk200-install-2.jpg", "/posts/tk200-install-1.jpg"], products: ["xtkbio-tk-200-chemistry-analyzer"],
  },
  {
    slug: "ultrasound-pre-delivery-check", type: PostType.PROJECT, date: "2026-08-17",
    lo: "ກວດເຊັກເຄື່ອງ Ultrasound 4D-5D ກຽມຈັດສົ່ງໃຫ້ລູກຄ້າ",
    en: "Pre-delivery check: 4D-5D ultrasound systems",
    bodyLo: `ກວດເຊັກເຄື່ອງ Ultrasound 4D-5D ພາບຄົມຊັດ ກ່ອນຈັດສົ່ງໃຫ້ກັບລູກຄ້າ.\n\n${boilerLo}`,
    bodyEng: "Every ultrasound system is checked by our technicians before delivery.",
    images: ["/posts/ultrasound-check-1.jpg", "/posts/ultrasound-check-2.jpg", "/posts/ultrasound-check-3.jpg"], products: ["chison-ultrasound"],
  },
  {
    slug: "ventilator-pre-delivery-check", type: PostType.PROJECT, date: "2026-08-13",
    lo: "ກວດເຊັກເຄື່ອງຊ່ວຍຫາຍໃຈ Ventilator ກຽມມອບສົ່ງໃຫ້ລູກຄ້າ",
    en: "Pre-delivery check: ventilator",
    bodyLo: `ກວດເຊັກເຄື່ອງຊ່ວຍຫາຍໃຈ Ventilator ກ່ອນມອບສົ່ງໃຫ້ກັບລູກຄ້າ.\n\n${boilerLo}`,
    bodyEng: "Ventilator inspected and tested before handover to the customer.",
    images: ["/posts/ventilator-check-1.jpg", "/posts/ventilator-check-2.jpg"], products: ["ventilator"],
  },
  {
    slug: "patient-monitor-pre-delivery-check", type: PostType.PROJECT, date: "2026-07-09",
    lo: "ກວດເຊັກເຄື່ອງຕິດຕາມຄົນເຈັບ ກຽມຈັດສົ່ງໃຫ້ລູກຄ້າ",
    en: "Pre-delivery check: patient monitors",
    bodyLo: `ກວດເຊັກເຄື່ອງຕິດຕາມຄົນເຈັບ ກ່ອນຈັດສົ່ງໃຫ້ລູກຄ້າ.\n\n${boilerLo}`,
    bodyEng: "Patient monitors checked before delivery.",
    images: ["/posts/monitor-check-1.jpg", "/posts/monitor-check-2.jpg", "/posts/monitor-check-3.jpg"], products: ["patient-monitor"],
  },
  {
    slug: "security-supplier-visit", type: PostType.NEWS, date: "2026-08-03",
    lo: "ຜູ້ສະໜອງມາຢ້ຽມຢາມ ແລະ ໃຫ້ຄວາມຮູ້ໃນຂະແໜງຮັກສາຄວາມປອດໄພ",
    en: "Supplier visit and training for our security division",
    bodyLo: "ຂອບໃຈຜູ້ສະໜອງທີ່ມາຢ້ຽມຢາມ ແລະ ໃຫ້ຄວາມຮູ້ແກ່ບໍລິສັດ ໃນຂະແໜງຮັກສາຄວາມປອດໄພ:\n\n1. ເຄື່ອງສະແກນ X-ray ໃນອາຄານ\n2. ເຄື່ອງກວດຫາສານເສບຕິດ\n3. ເຄື່ອງ X-ray ແບບເຄື່ອນທີ່\n4. ເຄື່ອງກວດຫາວັດຖຸລະເບີດ\n5. ເຄື່ອງກວດຫາອຸປະກອນທີ່ຖືກເຊື່ອງ\n6. ເຄື່ອງກວດຫາລະເບີດພາກສະໜາມ",
    bodyEng: "Our supplier visited to train the team on security equipment: building X-ray scanners, narcotics detectors, mobile X-ray, explosives detectors, concealed-object detectors and field explosive detectors.",
    images: [], products: ["xray-180150dvs"],
  },
];

const jobs = [
  {
    title: "ເຕັກນິກການແພດ", department: "Technical", positions: 3,
    description: "ຕິດຕັ້ງ, ກວດເຊັກ ແລະ ບໍລິການຫຼັງການຂາຍ ສຳລັບເຄື່ອງມືການແພດ ແລະ ເຄື່ອງວິເຄາະ.",
    requirements: "ຈົບສາຍງານທີ່ກ່ຽວຂ້ອງ: ວິເຄາະ, ເຄມີ, ການແພດ\nຈົບຊັ້ນສູງ ຫຼື ປະລິນຍາຕີ\nມີພື້ນຖານພາສາອັງກິດ\nເປີດໂອກາດໃຫ້ນັກຮຽນຈົບໃໝ່",
  },
  {
    title: "ເຕັກນິກທົ່ວໄປ", department: "Technical", positions: 2,
    description: "ຕິດຕັ້ງ, ສ້ອມແປງ ແລະ ບຳລຸງຮັກສາອຸປະກອນ.",
    requirements: "ຈົບສາຍງານທີ່ກ່ຽວຂ້ອງ: ເຕັກນິກໄຟຟ້າ, ເຕັກນິກທົ່ວໄປ\nຈົບຊັ້ນສູງ ຫຼື ປະລິນຍາຕີ\nມີພື້ນຖານພາສາອັງກິດ\nເປີດໂອກາດໃຫ້ນັກຮຽນຈົບໃໝ່",
  },
];
const benefits = "ເງິນເດືອນ 13\nໂບນັດທ້າຍປີ\nປະກັນສັງຄົມ\nພັກເສົາ-ທິດ\nມື້ພັກປະຈຳປີ\nມື້ພັກເທດສະການ";

async function main() {
  // Reset catalog content (customer data is left untouched).
  await prisma.productRelation.deleteMany();
  await prisma.post.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.jobOpening.deleteMany({ where: { applicants: { none: {} } } });

  const catId: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const parent = await prisma.category.create({ data: { slug: c.slug, nameLao: c.lo, nameEng: c.en, image: c.image, sortOrder: i } });
    catId[c.slug] = parent.id;
    for (const [j, ch] of (c.children ?? []).entries()) {
      const child = await prisma.category.create({ data: { slug: ch.slug, nameLao: ch.lo, nameEng: ch.en, sortOrder: j, parentId: parent.id } });
      catId[ch.slug] = child.id;
    }
  }

  const brandId: Record<string, string> = {};
  for (const b of brands) brandId[b.slug] = (await prisma.brand.create({ data: b })).id;

  const productId: Record<string, string> = {};
  for (const [i, p] of products.entries()) {
    const sku = `XTK-${String(i + 1).padStart(4, "0")}`;
    const status = p.inStock ? StockStatus.IN_STOCK : StockStatus.PRE_ORDER;
    const created = await prisma.product.create({
      data: {
        sku, slug: p.slug, modelNumber: p.model,
        titleLao: p.lo, titleEng: p.en, shortDescLao: p.descLo, shortDescEng: p.descEng,
        categoryId: catId[p.cat], brandId: p.brand ? brandId[p.brand] : null,
        stockStatus: status, images: p.images, certifications: p.certs ?? [],
        specifications: p.specs?.map(([labelLao, labelEng, value]) => ({ labelLao, labelEng, value })),
        isFeatured: p.featured ?? false, isPublished: true,
        variants: {
          create: (p.variants ?? []).map((v, j) => ({
            sku: `${sku}-${String(j + 1).padStart(2, "0")}`,
            nameLao: v.lo, nameEng: v.en, packSize: v.pack,
            stockStatus: v.inStock ? StockStatus.IN_STOCK : StockStatus.PRE_ORDER,
          })),
        },
      },
    });
    productId[p.slug] = created.id;
  }

  for (const [from, to, type] of relations) {
    await prisma.productRelation.create({ data: { fromId: productId[from], toId: productId[to], type } });
  }

  for (const p of posts) {
    await prisma.post.create({
      data: {
        slug: p.slug, type: p.type, titleLao: p.lo, titleEng: p.en, bodyLao: p.bodyLo, bodyEng: p.bodyEng,
        images: p.images, publishedAt: new Date(p.date),
        products: { connect: p.products.map((s) => ({ id: productId[s] })) },
      },
    });
  }

  if ((await prisma.jobOpening.count()) === 0) {
    for (const j of jobs) await prisma.jobOpening.create({ data: { ...j, benefits } });
  }

  console.log(`Seeded ${Object.keys(catId).length} categories, ${brands.length} brands, ${products.length} products, ${posts.length} posts.`);
}

main().finally(() => prisma.$disconnect());
