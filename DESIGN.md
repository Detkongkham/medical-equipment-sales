# 🎨 DESIGN.md — ລະບົບການອອກແບບ XTVK

> ມາດຕະຖານ UI ຂອງເວັບໄຊທ໌ **ບໍລິສັດ ຊັບທະວີຄູນ ຈຳກັດຜູ້ດຽວ** (XUPTHAVYKHOUN Medical Equipment & Services Platform).
>
> - **ຕົ້ນກຳເນີດ:** ສັງເຄາະຈາກ design system ຂອງ OmniCommerce AI (OCA / `mts-admin`) ແລ້ວ **ຕັດ ແລະ ປັບ** ໃຫ້ເຂົ້າກັບໂຄງການນີ້. ສິ່ງທີ່ຢືມມາ: ຫຼັກການ "ແບນ + ຂອບ", ສູດສີສະຖານະ 3 ສີ, ໂຄງ component, ກົດ accessibility. ສິ່ງທີ່ **ບໍ່ເອົາ**: ສີມ່ວງ, dark mode, app shell ແບບ sidebar, ລະບົບ AI, ຊັ້ນ override 440 ແຖວ.
> - **ສີ:** ອີງຈາກໂລໂກ້ XTK ທັງ 3 ສີ (ນ້ຳເງິນ · ຂຽວ · ແດງ) — §3.1.
> - **ຄວາມຈິງຂອງໂຄດ:** ຄ່າທີ່ລະບຸວ່າ ✅ ມີຢູ່ແລ້ວໃນ `web/src` (`globals.css`, `components/ui.tsx`, `ProductCard.tsx`, `QuoteButtons.tsx`, `[lang]/layout.tsx`). ຄ່າທີ່ລະບຸວ່າ 🆕 ແມ່ນມາດຕະຖານທີ່ເພີ່ມໃໝ່ ຍັງບໍ່ຢູ່ໃນໂຄດ.
> - **ວັນທີ:** 2026-10-05
> - **ນຳໃຊ້ກັບ:** ເວັບສາທາລະນະ (`web/`, ໄລຍະ 1) ເປັນຫຼັກ; ຫຼັງບ້ານ (ໄລຍະ 1–2) ໃຊ້ token ດຽວກັນ — ເບິ່ງ §12.

---

## ສາລະບານ

1. [ຫຼັກການອອກແບບ](#1-ຫຼັກການອອກແບບ)
2. [Tech stack ດ້ານ UI](#2-tech-stack-ດ້ານ-ui)
3. [ສີ](#3-ສີ)
4. [ຕົວໜັງສື](#4-ຕົວໜັງສື)
5. [Spacing, Layout, Grid](#5-spacing-layout-grid)
6. [Radius, Border, Shadow](#6-radius-border-shadow)
7. [App shell ຂອງເວັບສາທາລະນະ](#7-app-shell-ຂອງເວັບສາທາລະນະ)
8. [Component](#8-component)
9. [Page pattern](#9-page-pattern)
10. [ຮູບພາບ ແລະ ໄອຄອນ](#10-ຮູບພາບ-ແລະ-ໄອຄອນ)
11. [ພາສາ, ຕົວເລກ, ເນື້ອຫາ](#11-ພາສາ-ຕົວເລກ-ເນື້ອຫາ)
12. [ຫຼັງບ້ານ (Admin)](#12-ຫຼັງບ້ານ-admin)
13. [Motion](#13-motion)
14. [Accessibility ແລະ Performance](#14-accessibility-ແລະ-performance)
15. [ຂໍ້ຕັດສິນຈາກການສັງເຄາະ](#15-ຂໍ້ຕັດສິນຈາກການສັງເຄາະ)
16. [Checklist ກ່ອນ merge UI](#16-checklist-ກ່ອນ-merge-ui)

---

## 1. ຫຼັກການອອກແບບ

ເວັບນີ້ເປັນ **ເວັບຂໍລາຄາ (RFQ) ຂອງບໍລິສັດຂາຍອຸປະກອນການແພດ** ບໍ່ແມ່ນຮ້ານຂາຍອອນລາຍ (ສິນຄ້າບໍ່ມີລາຄາ, `SalesMode = RFQ_ONLY`). ຜູ້ໃຊ້ຫຼັກ: ເຈົ້າໜ້າທີ່ຈັດຊື້ຂອງໂຮງໝໍ/ຄລີນິກ/ລັດ, ຕົວແທນ, ຜູ້ສະໝັກງານ — ສ່ວນໃຫຍ່ເຂົ້າຜ່ານ **ມືຖື** ແລະ ອິນເຕີເນັດບໍ່ໄວ.

| # | ຫຼັກການ | ໃນທາງປະຕິບັດ |
|---|---|---|
| 1 | **ໜ້າເຊື່ອຖື, ບໍ່ຫວຼູຫວາ** | ພື້ນຂາວ, ນ້ຳເງິນເຂັ້ມ + ຂຽວໃບໄມ້ ຕາມໂລໂກ້. ບໍ່ມີ gradient ຕົກແຕ່ງ, ບໍ່ມີ animation ຟຸ່ມເຟືອຍ. ຜູ້ຊື້ອຸປະກອນການແພດຕ້ອງຮູ້ສຶກວ່າ "ເປັນບໍລິສັດຈິງ". |
| 2 | **ນ້ຳເງິນ = ແບຣນ, ຂຽວ = ການກະທຳ** | `brand` ໃຊ້ກັບ heading, nav, ປຸ່ມຮອງ. `leaf` ໃຊ້ກັບ **CTA ທີ່ນຳໄປສູ່ການຂໍລາຄາ/ຕິດຕໍ່** ແລະ ສະຖານະ "ພ້ອມສົ່ງ". ສອງສີນີ້ບໍ່ສັບສົນບົດບາດກັນ. |
| 3 | **ແບນ ແລະ ມີຂອບ** | Card = ຂອບ 1px + ພື້ນຂາວ; ເງົາອ່ອນ (`shadow-md`) ປາກົດສະເພາະ hover. ເງົາແຮງສະຫງວນໃຫ້ສິ່ງທີ່ລອຍ (dropdown, modal). |
| 4 | **ຮູບສິນຄ້າຄືພະເອກ** | ສິນຄ້າບໍ່ມີລາຄາໃຫ້ເປັນຈຸດຂາຍ, ສະນັ້ນຮູບ + ຊື່ລຸ້ນ + ຍີ່ຫໍ້ ຕ້ອງຊັດ. ຮູບ `object-contain` ເທິງພື້ນ `slate-50`, ບໍ່ຕັດ. |
| 5 | **ທາງລັດສູ່ການຂໍລາຄາສະເໝີ** | ທຸກໜ້າສິນຄ້າ/ລາຍການ ມີ "ເພີ່ມເຂົ້າໃບຂໍລາຄາ"; ທຸກໜ້າມີ WhatsApp / Messenger / ໂທ ຢູ່ໃກ້ມື. ລູກຄ້າລາວສ່ວນໃຫຍ່ຕົກລົງຜ່ານແຊັດ. |
| 6 | **ລາວກ່ອນ, ສອງພາສາສະເໝີ** | `/lo` (default) ແລະ `/en`; ທຸກຂໍ້ຄວາມຜ່ານ dictionary. ຕົວອັກສອນລາວມີສະຣະ/ວັນນະຍຸດສູງ — ຕ້ອງໃຫ້ພື້ນທີ່ບັນທັດ. |
| 7 | **ເບົາ ແລະ ໄວ** | SSG/SSR, ບໍ່ມີ library UI ໜັກເກີນຈຳເປັນ, ຮູບຜ່ານ `next/image`. ເປົ້າໝາຍ LCP < 2.5s ເທິງ 4G. |
| 8 | **Mobile-first** | ອອກແບບທີ່ 375px ກ່ອນ; ຈາກນັ້ນຂະຫຍາຍ `sm` → `md` → `lg`. ປຸ່ມກົດໄດ້ ≥ 40px. |

---

## 2. Tech stack ດ້ານ UI

| ເລື່ອງ | ✅ ປັດຈຸບັນ (`web/package.json`) | 🆕 ມາດຕະຖານ |
|---|---|---|
| Framework | Next.js 16 App Router, React 19 | ຄືເກົ່າ. **ອ່ານ `node_modules/next/dist/docs/` ກ່ອນຂຽນໂຄດ** (ຕາມ `AGENTS.md`: ລຸ້ນນີ້ມີ breaking change; ເຊັ່ນ `LayoutProps<"/[lang]">`, `proxy.ts`) |
| Styling | Tailwind CSS v4 ຜ່ານ `@tailwindcss/postcss`, token ໃນ `@theme inline` | ຄືເກົ່າ; ບໍ່ມີ `tailwind.config.js` |
| Font | `Noto_Sans_Lao` ຜ່ານ `next/font/google` → `--font-lao` | ຄືເກົ່າ; ເພີ່ມ `Inter` ເປັນ latin fallback ຖ້າຕ້ອງການ (§4.1) |
| Component | ຂຽນເອງໃນ `components/ui.tsx` (`Container`, `PageTitle`, `SectionTitle`, `ButtonLink`, `StockBadge`, `Field`, `Input`...) | **ຂຽນເອງຕໍ່ໄປ** ສຳລັບເວັບສາທາລະນະ. ຍັງບໍ່ຕິດຕັ້ງ shadcn/ui ຈົນກວ່າເລີ່ມເຮັດຫຼັງບ້ານ (§12) — `SYSTEM_ARCHITECTURE.md` ວາງແຜນໄວ້ ແຕ່ເວັບສາທາລະນະບໍ່ຕ້ອງການ |
| Icon | ຍັງບໍ່ມີ (ໃຊ້ຕົວອັກສອນ `✓` `→` `+`) | `lucide-react`, stroke 2px. ເພີ່ມເມື່ອຕ້ອງການໄອຄອນຄັ້ງທຳອິດ |
| Form | Server Actions (`actions.ts`) + `zod` | ຄືເກົ່າ; schema ຂອງ zod ເປັນແຫຼ່ງຄວາມຈິງຂອງການ validate |
| State | `quote-store.ts` (ກະຕ່າ RFQ ຝັ່ງ client) | ຄືເກົ່າ |
| Class merge | ສະຕຣິງ template | 🆕 ເພີ່ມ `cn()` (`clsx` + `tailwind-merge`) ເມື່ອ component ເລີ່ມຮັບ `className` ຈາກພາຍນອກ ແລະ ເກີດ class ຂັດກັນ |

---

## 3. ສີ

### 3.1 ສີແບຣນ (ວັດຈາກ pixel ຂອງໂລໂກ້ XTK ໂດຍກົງ)

ໂລໂກ້ມີ **3 ສີ**: ວົງຮີນ້ຳເງິນ, ໃບສີແດງ, ຕົວ X ສີຂຽວ (ໄລ່ 4 ເສດ) ພ້ອມຕົວ "TK" ສີຂາວ.

| ສ່ວນຂອງໂລໂກ້ | ຄ່າທີ່ວັດໄດ້ | Token | ຄ່າທີ່ໃຊ້ | ສະຖານະ |
|---|---|---|---|---|
| ວົງຮີ (ສີທີ່ມີຫຼາຍສຸດ) | `#2c348c`–`#30348c` | `brand` | `#2e3192` | ✅ |
| — (ເຂັ້ມຂຶ້ນ, hover / footer) | — | `brand-dark` | `#23266f` | ✅ |
| ໃບສີແດງ | `#e82024` / `#e92227` | `accent` | `#e92227` | ✅ ເພີ່ມໃໝ່ |
| — (ແດງເຂັ້ມ, ຕົວໜັງສື / hover) | — | `accent-dark` | `#c4161b` | ✅ ເພີ່ມໃໝ່ |
| X ຂຽວ ສະຫວ່າງ (ເສດ) | `#38b048` | — | ໃຊ້ໃນ gradient ຕົກແຕ່ງເທົ່ານັ້ນ | 🆕 |
| X ຂຽວ ຫຼັກ | `#009444` / `#008c44` | `leaf-bright` | `#009444` | ✅ ເພີ່ມໃໝ່ |
| — (ຂຽວສຳລັບປຸ່ມ ຜ່ານ AA) | — | `leaf` | **`#00813c`** | ✅ (ປ່ຽນຈາກ `#248e3c`) |
| X ຂຽວ ເຂັ້ມ | `#006838` | `leaf-dark` | `#006838` | ✅ (ປ່ຽນຈາກ `#1b6e2e`) |
| ຕົວ TK | ຂາວ | — | `#ffffff` | — |

**ເຫດຜົນທີ່ `leaf` ≠ ຂຽວໃນໂລໂກ້ຕົວຈິງ:** ຂຽວຕົ້ນສະບັບ `#009444` ມີ contrast ກັບຕົວໜັງສືຂາວພຽງ **3.95:1** — ບໍ່ຜ່ານ AA ສຳລັບປຸ່ມ 14px. ຈຶ່ງດຶງລົງເປັນ `#00813c` (**4.99:1** ✔) ໂດຍຍັງຢູ່ໃນເສດດຽວກັນ; `leaf-bright` ເກັບໄວ້ໃຫ້ພື້ນຜິວໃຫຍ່ ແລະ ການຕົກແຕ່ງ.

| Token | Contrast ເທິງຂາວ | ໃຊ້ກັບ |
|---|---|---|
| `brand` `#2e3192` | **10.3:1** ✔ | heading, nav, ປຸ່ມ primary, ຂອບ outline, focus |
| `brand-dark` `#23266f` | 13.1:1 ✔ | hover ປຸ່ມ primary, ພື້ນ footer |
| `leaf` `#00813c` | **4.99:1** ✔ AA | **CTA ຂໍລາຄາ** (ພື້ນ, ຕົວໜັງສືຂາວ), link "ເບິ່ງທັງໝົດ →", eyebrow ຍີ່ຫໍ້ |
| `leaf-dark` `#006838` | 6.9:1 ✔ | hover CTA, ຕົວໜັງສືຂຽວຂະໜາດນ້ອຍ, badge "ພ້ອມສົ່ງ" |
| `leaf-bright` `#009444` | 3.95:1 ✘ | **ຫ້າມ** ເປັນຕົວໜັງສືນ້ອຍ ຫຼື ພື້ນປຸ່ມຕົວໜັງສືຂາວ; ໃຊ້ສຳລັບ ໄອຄອນໃຫຍ່, ແຖບ, gradient |
| `accent` `#e92227` | 4.45:1 | ພື້ນ badge/ແຖບເນັ້ນ (ຕົວໜັງສືຂາວ ≥ 14px bold), dot, ເສັ້ນເນັ້ນ |
| `accent-dark` `#c4161b` | 6.0:1 ✔ | ຕົວໜັງສືແດງ, ປຸ່ມ danger, hover |

*Contrast ຄິດຕາມສູດ WCAG 2.x ຜ່ານສະຄຣິບ (ບໍ່ໄດ້ວັດດ້ວຍເຄື່ອງມື browser) — ກວດຊ້ຳໃນ DevTools ກ່ອນ launch.*

**ບົດບາດຂອງ 3 ສີ (ໂລໂກ້ເປັນຫຼັກ):**

| ສີ | ບົດບາດ | ໃຊ້ໄດ້ | ຫ້າມ |
|---|---|---|---|
| **ນ້ຳເງິນ** `brand` | ໂຄງ ແລະ ຄວາມເຊື່ອຖື | ພື້ນ nav/footer, heading, ປຸ່ມ primary | — |
| **ຂຽວ** `leaf` | **ການກະທຳ** (ຂໍລາຄາ) + "ພ້ອມສົ່ງ" | CTA, badge ສະຖານະ, link | ໃຊ້ເປັນພື້ນໃຫຍ່ |
| **ແດງ** `accent` | **ຈຸດເນັ້ນ** ໜ້ອຍໆ | ຈຸດ/ແຖບນ້ອຍ, ປ້າຍ "ໃໝ່"/"ໂປຣໂມຊັນ", ເສັ້ນເນັ້ນຫົວ section (`h-1 w-10 bg-accent`) | ເປັນປຸ່ມຫຼັກ; ໃຊ້ເກີນ 1 ຈຸດຕໍ່ viewport |

ກົດ: ສັດສ່ວນໃນໜ້າ ≈ **ຂາວ/ເທົາ 80 · ນ້ຳເງິນ 12 · ຂຽວ 6 · ແດງ 2** (ຄືກັບໂລໂກ້ ທີ່ນ້ຳເງິນເດັ່ນ, ຂຽວ-ແດງເປັນຈຸດເນັ້ນ). ໃຊ້ **ໜຶ່ງ CTA ຂຽວຕໍ່ມຸມມອງ**. ແດງໃນ UI ໃຊ້ໄດ້ທັງ "ແບຣນ" (accent) ແລະ "ຜິດພາດ" (`danger`, §3.3) — ເພື່ອບໍ່ໃຫ້ສັບສົນ: **accent ບໍ່ເຄີຍໃຊ້ກັບຂໍ້ຄວາມ error ຫຼື ຂອບ input**; error ໃຊ້ກ່ອງ tint + ໄອຄອນ `AlertCircle` ສະເໝີ.

### 3.1.1 Gradient ແລະ ການຕົກແຕ່ງຈາກໂລໂກ້

| Gradient | ຄ່າ | ໃຊ້ກັບ |
|---|---|---|
| Brand | `from-brand to-brand-dark` (`bg-gradient-to-br`) | ພື້ນ hero, ແຖບ CTA ປິດທ້າຍ |
| Leaf (X ຂອງໂລໂກ້) | `from-leaf-bright to-leaf-dark` | ກ່ອງໄອຄອນຈຸດເດັ່ນ (ຖ້າຕ້ອງການ) |
| ແຖບສາມສີ (ໂລໂກ້) | `h-1` ແບ່ງ `brand` / `leaf-bright` / `accent` = 70 / 20 / 10% | ເສັ້ນເທິງ footer ຫຼື ໃຕ້ nav — ໃຊ້ **ບ່ອນດຽວ** ເປັນລາຍເຊັນ |

ບໍ່ໃຊ້ gradient ອື່ນ.

### 3.2 ສີກາງ (Neutral — ຕະກູນ slate ຂອງ Tailwind)

| ບົດບາດ | Class | ຄ່າ | ຕົວຢ່າງ |
|---|---|---|---|
| ພື້ນໜ້າ | `bg-white` | `#ffffff` | body ✅ |
| ພື້ນຍ່ອຍ | `bg-slate-50` | `#f8fafc` | ພື້ນຮູບສິນຄ້າ, ສ່ວນສະຫຼັບສີ, ຫົວຕາຕະລາງສະເປັກ |
| ພື້ນ chip ກາງໆ | `bg-slate-100` | `#f1f5f9` | badge "ສັ່ງຈອງ" |
| ຂອບ default | `border-slate-200` | `#e2e8f0` | card, divider |
| ຂອບ input | `border-slate-300` | `#cbd5e1` | input, select |
| ຂໍ້ຄວາມຫຼັກ | `text-slate-900` | `#0f172a` | ຊື່ສິນຄ້າ. ✅ body ໃຊ້ `#1f2333` |
| ຂໍ້ຄວາມ label | `text-slate-700` | `#334155` | `Field` label |
| ຂໍ້ຄວາມຮອງ | `text-slate-600` | `#475569` | ຄຳອະທິບາຍ, intro |
| Placeholder / ໄອຄອນ muted | `text-slate-400` | `#94a3b8` | **ຫ້າມ** ໃຊ້ກັບຂໍ້ຄວາມທີ່ຕ້ອງອ່ານ (contrast ~2.6:1) |

### 3.3 ສີຄວາມໝາຍ (Semantic) — ສູດ 3 ສີ

ຢືມຈາກ OCA: ທຸກສະຖານະ = **ພື້ນ tint + ຂອບ + ຕົວໜັງສືເຂັ້ມ**. 🆕 ຍັງບໍ່ມີໃນໂຄດ ຍົກເວັ້ນ `danger` ທີ່ໃຊ້ເປັນ `text-red-600` ໃນ `*` ບັງຄັບ.

| ຄວາມໝາຍ | ພື້ນ | ຂອບ | ຕົວໜັງສື | ໃຊ້ກັບ |
|---|---|---|---|---|
| **Success** | `#f0fdf4` | `#bbf7d0` | `#006838` (= `leaf-dark`) | ສົ່ງຟອມສຳເລັດ, ເລກອ້າງອີງ RFQ |
| **Warning** | `#fffbeb` | `#fde68a` | `#b45309` | ຂໍ້ມູນຍັງບໍ່ຄົບ, ໃກ້ໝົດສະຕັອກ (ໄລຍະ 3) |
| **Danger** | `#fef2f2` | `#fecaca` | `#c4161b` (= `accent-dark`) | error ຂອງຟອມ, ອັບໂຫຼດບໍ່ສຳເລັດ |
| **Info** | `#eff6ff` | `#bfdbfe` | `#1d4ed8` | ໝາຍເຫດ, ຂໍ້ມູນເພີ່ມເຕີມ |
| Neutral | `#f8fafc` | `#e2e8f0` | `#475569` | "ສັ່ງຈອງ" (Pre-order) |

> `success` ໃຊ້ຕົວໜັງສືຂຽວເຂັ້ມ `leaf-dark` ຮ່ວມກັບ `leaf` ຂອງແບຣນ ແຕ່ຕ່າງຈຸດປະສົງ: `leaf` = ປຸ່ມ/ແບຣນ, `success` = ຂໍ້ຄວາມແຈ້ງຜົນ ໃນກ່ອງ tint. `danger` ແບ່ງສີແດງກັບ `accent` — ເບິ່ງກົດໃນ §3.1.

### 3.4 ສີປະຈຳໝວດສິນຄ້າ (🆕 ທາງເລືອກ)

6 ໝວດ (Pharmaceuticals, Health Care, Laboratory, Consumable, Security, Technical Services) **ຍັງບໍ່ກຳນົດສີປະຈຳໝວດ** — ຮຸ່ນແລກ: ໃຊ້ໄອຄອນ + ຮູບແທນສີ ເພື່ອບໍ່ໃຫ້ພາລະເຕັມໄປດ້ວຍສີ. ຖ້າພາຍຫຼັງຕ້ອງການ ໃຫ້ກຳນົດເປັນ token ແລະ ໃຊ້ສູດ 3 ສີ ຂອງ §3.3.

### 3.5 Token ໃນ `globals.css`

ຊື່ token ເກົ່າ (`brand`, `leaf`...) ຄົງເດີມ ຈຶ່ງບໍ່ແຕກ; ປ່ຽນແຕ່ຄ່າຂອງ `leaf`/`leaf-dark` ໃຫ້ກົງໂລໂກ້ ແລະ ຜ່ານ AA, ແລະ ເພີ່ມ `leaf-bright`, `accent`, `accent-dark`.

```css
@theme inline {
  /* ✅ ມີໃນ web/src/app/globals.css ແລ້ວ — ສີຈາກໂລໂກ້ XTK */
  --color-brand: #2e3192;
  --color-brand-dark: #23266f;
  --color-leaf: #00813c;
  --color-leaf-dark: #006838;
  --color-leaf-bright: #009444;
  --color-accent: #e92227;
  --color-accent-dark: #c4161b;
  --font-sans: var(--font-lao), ui-sans-serif, system-ui, sans-serif;

  /* 🆕 semantic: soft / line / ink */
  --color-success-soft: #f0fdf4; --color-success-line: #bbf7d0; --color-success-ink: #006838;
  --color-warning-soft: #fffbeb; --color-warning-line: #fde68a; --color-warning-ink: #b45309;
  --color-danger-soft:  #fef2f2; --color-danger-line:  #fecaca; --color-danger-ink:  #c4161b;
  --color-info-soft:    #eff6ff; --color-info-line:    #bfdbfe; --color-info-ink:    #1d4ed8;
}
```

ກົດ: ສີຂອງແບຣນ/ສະຖານະ ຕ້ອງມາຈາກ token ເທົ່ານັ້ນ (`bg-brand`, `text-success-ink`) — **ບໍ່ຂຽນ hex ໃນ `className`**. ສີກາງ ໃຊ້ `slate-*` ຂອງ Tailwind ໂດຍກົງໄດ້.

---

## 4. ຕົວໜັງສື

### 4.1 ຟອນ

| ບົດບາດ | Stack |
|---|---|
| Sans (ທັງໝົດ) | `var(--font-lao)` (Noto Sans Lao, subsets `lao` + `latin`), `ui-sans-serif`, `system-ui`, `sans-serif` ✅ |
| Mono (ລະຫັດ SKU, ລຸ້ນ, serial) | `ui-monospace` ຜ່ານ `font-mono` — ໃຊ້ກັບ `modelNumber`, `sku`, ເລກອ້າງອີງ RFQ |

ໂຫຼດແບບ `next/font` (self-host, `display: swap` ຄ່າ default). ບໍ່ໃຊ້ `<link>` Google Fonts.

### 4.2 ຂະໜາດ

**ບໍ່ສືບທອດ** scale "+2px" ຂອງ OCA (ເຊິ່ງ `text-xs` = 14px). ເຫດຜົນ: ເວັບສາທາລະນະເປັນເນື້ອຫາອ່ານ, ໃຊ້ scale ມາດຕະຖານຂອງ Tailwind ແລ້ວແກ້ບັນຫາອັກສອນລາວດ້ວຍ **line-height** (✅ `:lang(lo) { line-height: 1.75 }`) ແລະ ຂະໜາດຂັ້ນຕ່ຳ.

| ບົດບາດ | Class | ຂະໜາດ |
|---|---|---|
| H1 (ຊື່ໜ້າ) | `text-2xl sm:text-3xl font-bold text-brand` ✅ | 24 → 30px |
| H2 (ຫົວສ່ວນ) | `text-xl sm:text-2xl font-bold text-brand` ✅ | 20 → 24px |
| H3 (ຊື່ card, ຫົວຍ່ອຍ) | `text-sm`–`text-base font-semibold text-slate-900` ✅ | 14–16px |
| Body | `text-base text-slate-700` | 16px |
| Intro / ຄຳອະທິບາຍ | `text-slate-600` (+ `max-w-3xl`) ✅ | 16px |
| Label ຟອມ | `text-sm font-medium text-slate-700` ✅ | 14px |
| Eyebrow (ຍີ່ຫໍ້ເທິງ card) | `text-xs font-semibold uppercase tracking-wide text-leaf-dark` | 12px |
| Badge | `text-xs font-semibold` ✅ | 12px |
| Input | `text-base` ✅ | 16px (ປ້ອງກັນ iOS zoom ເວລາ focus) |
| ປຸ່ມ | `text-sm font-semibold` ✅ | 14px |

ກົດ:
- **ຂັ້ນຕ່ຳ 12px** (`text-xs`) ໃຊ້ກັບ badge/eyebrow ເທົ່ານັ້ນ; ບໍ່ໃຊ້ `text-[10px]` ຫຼື ນ້ອຍກວ່າ — ອັກສອນລາວທີ່ນ້ອຍກວ່ານີ້ອ່ານບໍ່ອອກ.
- `uppercase` / `tracking-wide` ມີຜົນສະເພາະອັກສອນ Latin (ລາວບໍ່ມີຕົວພິມໃຫຍ່) — ໃຊ້ກັບຊື່ຍີ່ຫໍ້ ແລະ ຊື່ອັງກິດເທົ່ານັ້ນ.
- ບໍ່ໃຊ້ `italic` ກັບຂໍ້ຄວາມລາວ.
- ຂໍ້ຄວາມຍາວໃນ card: `line-clamp-2`. ເລກ/ລຸ້ນ/ລະຫັດ: `tabular-nums` ຫຼື `font-mono`.

---

## 5. Spacing, Layout, Grid

### 5.1 Container ✅

```tsx
<div className="mx-auto w-full max-w-6xl px-4">…</div>   // = <Container>
```

ກວ້າງສຸດ 1152px, ຂອບຂ້າງ 16px. ເນື້ອຫາອ່ານ (ບົດຄວາມ, ກ່ຽວກັບ) ຈຳກັດ `max-w-3xl`.

### 5.2 Spacing

ໃຊ້ scale ຂອງ Tailwind (1 ໜ່ວຍ = 4px). ຄ່າທີ່ໃຊ້ຈິງ ແລະ ຄວນຮັກສາ:

| ປະເພດ | ຄ່າ |
|---|---|
| Gap ໃນ card / ກຸ່ມນ້ອຍ | `gap-2` (8px) |
| Gap ຂອງ grid | `gap-3 sm:gap-4` (12 → 16px) ✅ |
| Padding card | `p-3` (ແໜ້ນ, card ສິນຄ້າ) · `p-4`–`p-6` (card ເນື້ອຫາ) |
| ລະຫວ່າງ section | `py-10 sm:py-14` 🆕 |
| ຫົວຂໍ້ → ເນື້ອຫາ | `mb-5` (`SectionTitle`) · `mb-8` (`PageTitle`) ✅ |

### 5.3 ຂະໜາດຕົວຄວບຄຸມ

| ຄວາມສູງ | ໃຊ້ກັບ |
|---|---|
| ~36px | ປຸ່ມ default (`px-4 py-2.5 text-sm` ≈ 40px ລວມ line-height) ✅ |
| ~40px | input (`px-3 py-2 text-base`) ✅ |
| ≥ 44px | ປຸ່ມໃນມືຖືທີ່ສຳຄັນ (CTA ຂໍລາຄາ, ປຸ່ມແຊັດລອຍ) |

ຂັ້ນຕ່ຳຂອງ hit area: **40×40px** ເທິງມືຖື. ປຸ່ມ `compact` (`+ ເພີ່ມ` ໃນ card) ອະນຸຍາດນ້ອຍກວ່າໄດ້ ແຕ່ຕ້ອງມີ padding ອ້ອມຮອບພໍ ບໍ່ໃຫ້ກົດຜິດ.

### 5.4 Breakpoint ແລະ Grid

| Breakpoint | ຄ່າ | ປະຕິບັດ |
|---|---|---|
| ຖານ | < 640 | 1 ຖັນ / grid ສິນຄ້າ 2 ຖັນ; nav scroll ແນວນອນ |
| `sm` | 640 | ຟອມ 2 ຖັນ; ຊື່ບໍລິສັດປາກົດໃນ header |
| `md` | 768 | grid ສິນຄ້າ 3 ຖັນ |
| `lg` | 1024 | grid ສິນຄ້າ 4 ຖັນ; ໜ້າ detail 2 ຖັນ |

| Pattern | Class |
|---|---|
| **Grid ສິນຄ້າ** ✅ | `grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4` |
| ທາງລັດ 6 ໝວດ (ໜ້າຫຼັກ) 🆕 | `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6` |
| ຟອມ | `grid grid-cols-1 gap-4 sm:grid-cols-2` (ຊ່ອງຍາວ `sm:col-span-2`) |
| Detail ສິນຄ້າ | `grid gap-8 lg:grid-cols-2` (ຮູບ/Gallery ຊ້າຍ, ຂໍ້ມູນ + CTA ຂວາ) |

---

## 6. Radius, Border, Shadow

| Class | px | ໃຊ້ກັບ |
|---|---|---|
| `rounded-md` | 6 | ປຸ່ມ compact ໃນ card ✅ |
| `rounded-lg` | 8 | **ປຸ່ມ, input, select** ✅ |
| `rounded-xl` | 12 | **card ສິນຄ້າ / card ເນື້ອຫາ**, ຮູບໃນ gallery ✅ |
| `rounded-2xl` | 16 | modal, hero card 🆕 |
| `rounded-full` | ∞ | badge, logo ວົງ, count, pill ✅ |

ກົດຊ້ອນ: radius ຂອງລູກ ≤ radius ຂອງແມ່. Card `rounded-xl` → ກ່ອງຍ່ອຍ `rounded-lg`.

**Border:** card/divider `border border-slate-200` ✅ · input `border-slate-300` ແລະ focus ເປັນ `focus:border-brand focus:ring-2 focus:ring-brand/20` ✅ · selected `border-brand` · danger `border-danger-line`.

**Shadow:** ປົກກະຕິ `shadow-none` (ບໍ່ໃສ່). `hover:shadow-md` + `transition-shadow` ສຳລັບ card ທີ່ກົດໄດ້ ✅. `shadow-lg` ສຳລັບປຸ່ມລອຍ (§7.4). `shadow-xl` ສຳລັບ dropdown/modal. ບໍ່ໃຊ້ເງົາສີ.

---

## 7. App shell ຂອງເວັບສາທາລະນະ

```
┌────────────────────────────────────────────────────────────┐
│ Header (sticky z-30, bg-white/95 blur, border-b)           │
│  [logo + ຊື່ບໍລິສັດ]            [ລາວ|EN] [ໃບຂໍລາຄາ (n)]    │
├────────────────────────────────────────────────────────────┤
│ Nav bar (bg-brand, text-white, scroll ແນວນອນໃນມືຖື)        │
│  ສິນຄ້າ · ຍີ່ຫໍ້ · ບໍລິການ · ຜົນງານ · ຮັບສະໝັກງານ · ກ່ຽວກັບ · ຕິດຕໍ່ │
├────────────────────────────────────────────────────────────┤
│ <main>  Container max-w-6xl                                │
├────────────────────────────────────────────────────────────┤
│ Footer (brand-dark): ທີ່ຕັ້ງ, ໂທ, ອີເມວ, ແຜນທີ່, ໂຊຊຽວ      │
└────────────────────────────────────────────────────────────┘
                                      ● WhatsApp  ● Messenger (ລອຍ)
```

### 7.1 Header ✅

- `sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur`; ແຖວເທິງ `py-2.5`.
- ຊ້າຍ: ໂລໂກ້ `logo.png` (`h-10 w-auto`, `priority`) ✅ + ຊື່ບໍລິສັດ `text-sm font-bold leading-tight text-brand` (`hidden sm:block`).
- ຂວາ: `LangSwitch` + `QuoteNavLink` (ປຸ່ມຂຽວ `bg-leaf` ມີ count badge ຂາວ `bg-white text-leaf-dark`).

### 7.2 Nav bar ✅

`bg-brand text-white`, ລາຍການ `shrink-0 rounded-md px-3 py-1.5 hover:bg-white/15`, ແຖວ `overflow-x-auto`. ລາຍການທີ່ກຳລັງຢູ່ (active) 🆕 ໃຫ້ມີ `bg-white/15 font-semibold` ແລະ `aria-current="page"`. 7 ລາຍການ: ສິນຄ້າ, ຍີ່ຫໍ້, ບໍລິການ, ຜົນງານ, Careers, ກ່ຽວກັບ, ຕິດຕໍ່.

### 7.3 Footer 🆕

`bg-brand-dark text-white/85`; ເທິງສຸດມີ **ແຖບສາມສີ** `h-1` (§3.1.1); ໂລໂກ້ `public/brand/logo.png` (ພື້ນໂປ່ງໃສ) ໃສ່ວົງແຫວນຂາວ `rounded-full ring-2 ring-white/80 h-14 w-auto` ✅ ເພື່ອບໍ່ໃຫ້ວົງຮີນ້ຳເງິນກືນເຂົ້າພື້ນ footer; 3 ຖັນໃນ `md` (ບໍລິສັດ + ທີ່ຢູ່ · ລິ້ງດ່ວນ · ຕິດຕໍ່). ເບີໂທ/ອີເມວເປັນ link (`tel:`, `mailto:`). ແຖວລຸ່ມ `border-t border-white/15 text-sm`: ລິຂະສິດ + ປີຈົດທະບຽນ 2016. ຂໍ້ມູນມາຈາກ `lib/site.ts` ບ່ອນດຽວ.

### 7.4 ປຸ່ມລອຍ (ແຊັດ) 🆕

`fixed bottom-4 right-4 z-40`, ປຸ່ມວົງ `size-12 rounded-full shadow-lg` ຊ້ອນແນວຕັ້ງ `gap-2`: WhatsApp (`#25d366` ສີແບຣນຂອງ WhatsApp, ອະນຸຍາດເປັນຂໍ້ຍົກເວັ້ນ), Messenger, ໂທ (`bg-brand`). ແຕ່ລະປຸ່ມມີ `aria-label`. ລິ້ງຈາກ `whatsappLink()` / `messengerLink()` ໃນ `lib/site.ts`. ຢ່າໃຫ້ບັງ CTA ລຸ່ມສຸດຂອງຟອມ — ໃສ່ `pb-24` ໃຫ້ `<main>` ໃນມືຖື.

### 7.5 Z-index

| ຊັ້ນ | ຄ່າ |
|---|---|
| ເນື້ອໃນ | `z-0`–`z-10` |
| Header sticky | `z-30` ✅ |
| ປຸ່ມແຊັດລອຍ | `z-40` |
| Dropdown / popover | `z-50` |
| Modal + overlay (`bg-black/60`) | `z-[60]` |
| Toast | `z-[70]` |

---

## 8. Component

### 8.1 Button ✅ (`buttonClass`, `ButtonLink`)

Base: `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60`.

| Variant | Class | ໃຊ້ເມື່ອ |
|---|---|---|
| `primary` | `bg-brand text-white hover:bg-brand-dark` | ການກະທຳຫຼັກທົ່ວໄປ (ສົ່ງຟອມ, ເບິ່ງລາຍລະອຽດ) |
| `green` | `bg-leaf text-white hover:bg-leaf-dark` | **CTA ຂໍລາຄາ** / ເພີ່ມເຂົ້າໃບຂໍລາຄາ |
| `outline` | `border border-brand text-brand hover:bg-brand/5` | ປຸ່ມຮອງ (ກັບຄືນ, ດາວໂຫຼດ Brochure) |
| 🆕 `danger` | `bg-danger text-white` — ສະເພາະ admin ລຶບ | ໃຊ້ໃນຫຼັງບ້ານເທົ່ານັ້ນ |

ສະຖານະ: `disabled:opacity-60` + `cursor-not-allowed`; ຕ້ອງມີ **focus ring** — 🆕 ເພີ່ມ `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand` ໃສ່ base (ປັດຈຸບັນບໍ່ມີ). ປຸ່ມກຳລັງສົ່ງ (server action): ປ່ຽນ label ("ກຳລັງສົ່ງ...") + `disabled`, ໃຊ້ `useFormStatus`.

ປຸ່ມໃນ card (compact): `rounded-md border border-brand px-2.5 py-1 text-sm font-semibold text-brand hover:bg-brand/5` ✅.

### 8.2 Badge

| Badge | Class |
|---|---|
| **ພ້ອມສົ່ງ** (`IN_STOCK`) ✅ | `rounded-full bg-leaf/10 px-2.5 py-0.5 text-xs font-semibold text-leaf-dark` |
| **ສັ່ງຈອງ** (`PRE_ORDER`) ✅ | `rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600` |
| ຍີ່ຫໍ້ຂອງບໍລິສັດເອງ (XTKBio+, Xupwell) 🆕 | `rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand` ປ້າຍ "ຍີ່ຫໍ້ຂອງ XTK" |
| ມາດຕະຖານ (CE, FDA, ISO) 🆕 | `rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700` |
| Count ໃນໃບຂໍລາຄາ ✅ | `rounded-full bg-white px-1.5 text-xs font-bold text-leaf-dark` (ເທິງພື້ນຂຽວ) |

ກົດ: ສະຖານະຕ້ອງມີ **ຂໍ້ຄວາມ** (ບໍ່ແມ່ນສີຢ່າງດຽວ); ບໍ່ສະແດງລາຄາ. ຖ້າລະບົບໄລຍະ 3 ເປີດ `DIRECT_BUY` ຈຶ່ງສະແດງລາຄາ.

### 8.3 Card ສິນຄ້າ ✅ (`ProductCard`)

```
Link: group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white
      transition-shadow hover:shadow-md
├─ ຮູບ:   relative aspect-[4/3] bg-slate-50 · <Image fill object-contain p-3>
│         ບໍ່ມີຮູບ → ຂໍ້ຄວາມ "ບໍ່ມີຮູບ" text-sm text-slate-400 ກາງກ່ອງ
└─ ຕົວ:   flex flex-1 flex-col gap-2 p-3
          · ຍີ່ຫໍ້   text-xs font-semibold uppercase tracking-wide text-leaf
          · ຊື່      text-sm font-semibold text-slate-900 group-hover:text-brand  (ແນະນຳ line-clamp-2)
          · badge   mt-auto pt-1  ← ຊິດລຸ່ມສະເໝີ ເພື່ອໃຫ້ card ໃນແຖວດຽວກັນສູງເທົ່າກັນ
```

`sizes="(max-width: 640px) 50vw, 25vw"` ຖືກຕ້ອງ — ຮັກສາໄວ້ເມື່ອປ່ຽນ grid. ຕົວອັກສອນຍີ່ຫໍ້ `text-leaf` (`#00813c`) ມີ contrast 4.99:1 ເທິງຂາວ ✔ AA. ຖ້າຕ້ອງການນ້ອຍກວ່າ 12px ຫຼື ເທິງພື້ນເທົາ ໃຫ້ໃຊ້ `text-leaf-dark`.

Card ອື່ນ: **ໝວດ** (ໄອຄອນ/ຮູບ + ຊື່ລາວ + ຊື່ອັງກິດຂະໜາດນ້ອຍ, ຄືກັນກັບ card ສິນຄ້າ ແຕ່ `aspect-[16/9]`) · **ຜົນງານ/ຂ່າວ** (ຮູບ `aspect-video object-cover` + ວັນທີ + ຫົວຂໍ້) · **ຕຳແໜ່ງງານ** (ຫົວ + ສະຖານທີ່ + ວັນໝົດເຂດ + ປຸ່ມສະໝັກ).

### 8.4 Form ✅ (`Field`, `Input`, `Textarea`, `Select`, `Honeypot`)

```
Field:    block text-sm font-medium text-slate-700   (label ຫໍ່ input ເພື່ອໃຫ້ກົດ label ແລ້ວ focus input)
          required → <span className="text-red-600"> *</span>
Input:    mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base
          outline-none focus:border-brand focus:ring-2 focus:ring-brand/20
Textarea: rows=4 · ຄືກັນ
```

ກົດ:
- **ທຸກຟອມ** (RFQ, ແຈ້ງສ້ອມ, ສະໝັກງານ, ຕິດຕໍ່) ໃຊ້ component ເຫຼົ່ານີ້ ບໍ່ຂຽນ input ເອງ.
- `<Honeypot />` ໃນທຸກຟອມສາທາລະນະ (ປ້ອງກັນ bot).
- Validate ດ້ວຍ `zod` ຝັ່ງ server; ສົ່ງ error ກັບມາເປັນ field-level. 🆕 ສະແດງ error ໃຕ້ field: `mt-1 text-sm text-danger-ink` ແລະ ເພີ່ມ `aria-invalid` + `aria-describedby`; ຂອບ input ເປັນ `border-danger` ... `focus:ring-danger/20`.
- 🆕 ບໍ່ເຮັດ error ເປັນ `alert()`. ສະຫຼຸບ error ເທິງຟອມໃຊ້ກ່ອງ danger (§3.3) `role="alert"`.
- ໄຟລ໌ແນບ (ຮູບແຈ້ງສ້ອມ, CV): ບອກຂໍ້ຈຳກັດ (ຊະນິດ, ຂະໜາດ) ໃຕ້ field ດ້ວຍ `text-xs text-slate-500`.
- ເບີໂທ: `type="tel"` + `inputMode="tel"`; ອີເມວ: `type="email"`.
- ສຳເລັດ: ກ່ອງ success (§3.3) ສະແດງ **ເລກອ້າງອີງ** ເປັນ `font-mono` + ປຸ່ມ "ຕິດຕາມ" ຖ້າມີ.

### 8.5 Tabs, Filter, Search 🆕

- **ຄົ້ນຫາ**: input ມີໄອຄອນ `Search` ຊ້າຍ (`pl-10`), `h-10`, ປຸ່ມລ້າງ ×. ຄົ້ນຕາມ ຊື່ / ລຸ້ນ / ຍີ່ຫໍ້ (ຕາມ `PROJECT_PLAN.md`).
- **Filter pill** (ຍີ່ຫໍ້, ສະຖານະ): `rounded-full border px-3 py-1.5 text-sm`; active `border-brand bg-brand/5 text-brand font-semibold`; ປົກກະຕິ `border-slate-200 bg-white text-slate-600 hover:border-brand hover:text-brand`.
- **Tabs ໜ້າ detail** (ສະເປັກ / ມາດຕະຖານ / ດາວໂຫຼດ): underline `border-b-2 px-3 py-2.5 text-sm font-semibold`; active `border-brand text-brand`; ປົກກະຕິ `border-transparent text-slate-600`. Sync ກັບ `?tab=`.
- Filter ໃນມືຖື: ເປີດເປັນ sheet ຈາກລຸ່ມ ຫຼື `<details>` — ບໍ່ເອົາ sidebar filter ມາແຍ່ງພື້ນທີ່.

### 8.6 ຕາຕະລາງສະເປັກ 🆕

ສິນຄ້າເປັນຂໍ້ມູນເຕັກນິກ, ຕາຕະລາງ label–value ເປັນ component ສຳຄັນ:

```
<table class="w-full text-sm"> ຫໍ່ດ້ວຍ overflow-x-auto rounded-xl border border-slate-200
  tr: border-t border-slate-100 (ແຖວທຳອິດບໍ່ມີ)
  th (label): w-1/3 bg-slate-50 px-4 py-3 text-left font-medium text-slate-600
  td (value): px-4 py-3 text-slate-900
```

ໃນມືຖືແຄບ (< 480px) ອະນຸຍາດໃຫ້ `th`/`td` ຊ້ອນແນວຕັ້ງ (`block`). ຕົວເລກ/ໜ່ວຍ: `tabular-nums`; ໜ່ວຍບັນຈຸ (ເຊັ່ນ "25 test/ກ່ອງ") ຢູ່ໃນ variant selector, ບໍ່ຝັງໃນ spec.

### 8.7 Gallery ✅ (`Gallery.tsx`)

ຮູບໃຫຍ່ `aspect-[4/3] rounded-xl border bg-slate-50 object-contain` + ແຖວ thumbnail ກົດປ່ຽນ (`size-16 rounded-lg border`, active `border-brand ring-2 ring-brand/20`). ຕ້ອງ keyboard ໄດ້ (`<button>`, ບໍ່ແມ່ນ `<div onClick>`).

### 8.8 ໃບຂໍລາຄາ (RFQ cart) ✅ (`quote-store.ts`, `QuoteButtons.tsx`)

- `AddToQuoteButton`: ກົດແລ້ວປ່ຽນເປັນ `✓ ເພີ່ມແລ້ວ · ເບິ່ງ` (link ໄປ `/quote`) — ຮັກສາ pattern ນີ້; ບໍ່ເປີດ modal.
- ໜ້າ `/quote`: ລາຍການ (ຮູບນ້ອຍ + ຊື່ + variant + ປຸ່ມລຶບ + ຈຳນວນ) ໃນ card, ຟອມຂ້າງລຸ່ມ (ຊື່ອົງກອນ, ປະເພດລູກຄ້າ = ໂຮງໝໍ/ຄລີນິກ/ຕົວແທນ/ລັດ/ບຸກຄົນ, ຜູ້ຕິດຕໍ່, ເບີໂທ, ໝາຍເຫດ). ໃນ `lg` ແບ່ງ 2 ຖັນ: ລາຍການຊ້າຍ, ຟອມຂວາ (sticky).
- ກະຕ່າຫວ່າງ: empty state (§9.5) ພ້ອມປຸ່ມ "ເບິ່ງສິນຄ້າ".

### 8.9 ອື່ນໆ

| Component | ສະຫຼຸບ |
|---|---|
| `LangSwitch` ✅ | ສອງປຸ່ມ ລາວ / EN, ອັນທີ່ active ເປັນ `bg-brand text-white`; ຮັກສາ path ປັດຈຸບັນເມື່ອສະຫຼັບ |
| Breadcrumb 🆕 | `text-sm text-slate-600`, ຕົວຄັ່ນ `ChevronRight size-3.5 text-slate-300`, ໜ້າປັດຈຸບັນ `text-slate-900 font-medium` (ບໍ່ເປັນ link) — ໃຊ້ໃນ catalog / detail |
| Alert / Callout 🆕 | `rounded-xl border p-4 text-sm` ສູດ 3 ສີ §3.3 + ໄອຄອນ |
| Skeleton 🆕 | `animate-pulse rounded-lg bg-slate-200` ຮູບຮ່າງຕາມ card ຈິງ (ຕ້ອງການເມື່ອ filter ໂຫຼດຊ້າ) |
| Pagination 🆕 | ປຸ່ມ `size-9 rounded-lg border`, ໜ້າປັດຈຸບັນ `bg-brand text-white`; ຫຍໍ້ເປັນ `1 … 4 5 6 … 12` ເມື່ອເກີນ 7 ໜ້າ; ຫຼື "ໂຫຼດເພີ່ມ" ໃນມືຖື |
| Modal 🆕 | overlay `bg-black/60`, panel `rounded-2xl bg-white p-6 shadow-xl max-w-lg`; ປິດດ້ວຍ `Esc` + ກົດ overlay; focus trap. ໃຊ້ໜ້ອຍທີ່ສຸດ (ເວັບສາທາລະນະເກືອບບໍ່ຕ້ອງການ) |

---

## 9. Page pattern

ທຸກໜ້າຢູ່ໃນ `src/app/[lang]/...`, ໃຊ້ `<Container>` + `<PageTitle>` / `<SectionTitle>`. ໜ້າທຳອິດເທິງສຸດຂອງ `<main>` ໃຊ້ `py-8 sm:py-12`.

### 9.1 ໜ້າຫຼັກ (`/`)

1. **Hero:** ພື້ນ `bg-slate-50` ຫຼື ຮູບ `cover.jpg` ພ້ອມ overlay ນ້ຳເງິນ; H1 ຊື່ບໍລິສັດ + tagline; ສອງປຸ່ມ — `green` "ຂໍລາຄາ", `outline` "ເບິ່ງສິນຄ້າ".
2. **ທາງລັດ 6 ໝວດ** (grid §5.4).
3. **ສິນຄ້າພ້ອມສົ່ງ** (`SectionTitle` + "ເບິ່ງທັງໝົດ →" + `ProductGrid` 4–8 ລາຍການ).
4. **ຍີ່ຫໍ້** (ແຖວ logo ສີຈາງ `grayscale hover:grayscale-0`, ແຍກ "ຍີ່ຫໍ້ຂອງ XTK" ອອກຈາກ "ຍີ່ຫໍ້ທີ່ຈຳໜ່າຍ").
5. **ຈຸດເດັ່ນ:** 3 ອັນ (ປະສົບການ · ບໍລິການຫຼັງການຂາຍ · ເຈົ້າຂອງເປັນເພຊັດສະກອນ) — ໄອຄອນ `size-10 rounded-xl bg-brand/10 text-brand` + ຫົວ + ປະໂຫຍກດຽວ.
6. **ຜົນງານຫຼ້າສຸດ** (3 card), **CTA ປິດທ້າຍ** (ແຖບ `bg-brand text-white` + ປຸ່ມຂຽວ).

### 9.2 ໜ້າ Catalog (`/products`, `/products/[category]`)

Breadcrumb → `PageTitle` (ຊື່ໝວດ + intro) → ແຖວ filter/ຄົ້ນຫາ → `ProductGrid` → pagination. ໝວດທີ່ມີໝວດຍ່ອຍ: ສະແດງ card ໝວດຍ່ອຍກ່ອນ ແລ້ວຈຶ່ງຕາມດ້ວຍສິນຄ້າ.

### 9.3 ໜ້າສິນຄ້າ (`/product/[slug]`) ✅ route ມີ

Breadcrumb → 2 ຖັນ (`Gallery` | ຂໍ້ມູນ): ຍີ່ຫໍ້ (eyebrow) → H1 ຊື່ + ລຸ້ນ (`font-mono`) → badge ສະຖານະ + ມາດຕະຖານ → ຄຳອະທິບາຍສັ້ນ → **ຕົວເລືອກ (variant/ຂະໜາດບັນຈຸ)** → ປຸ່ມ: `AddToQuoteButton` (ຂຽວ) + WhatsApp + Messenger (outline). ຂ້າງລຸ່ມ tabs: ສະເປັກ (§8.6) / ລາຍລະອຽດ / ດາວໂຫຼດ (Brochure PDF). ສຸດທ້າຍ **"ໃຊ້ຮ່ວມກັບ"** (ເຄື່ອງວິເຄາະ ↔ ນ້ຳຢາ ↔ ເຈ້ຍພິມ) ເປັນ `ProductGrid` ນ້ອຍ.

ເລກທະບຽນ ອຢ: ສະແດງເປັນແຖວໃນສະເປັກ ສະເພາະເມື່ອມີ — **ບໍ່ສະແດງ "ຍັງບໍ່ມີ"**.

### 9.4 ໜ້າອື່ນ

| ໜ້າ | ໂຄງ |
|---|---|
| ຍີ່ຫໍ້ (`/brands`, `/brands/[slug]`) | grid logo; ໜ້າຍີ່ຫໍ້: logo + ປະເທດ + ປ້າຍຍີ່ຫໍ້ຕົນເອງ + `ProductGrid` ກອງຕາມຍີ່ຫໍ້ |
| ບໍລິການເຕັກນິກ (`/services`) | ຮູບແບບບໍລິການ (ຕິດຕັ້ງ, PM, Calibration, ສ້ອມ) ເປັນ card + ຟອມ "ແຈ້ງສ້ອມ" (ລຸ້ນ, Serial No, ອາການ, ຮູບ) → ເລກຕິດຕາມ |
| ຜົນງານ/ຂ່າວ (`/projects`) | grid card 1/2/3 ຖັນ; ໜ້າລາຍລະອຽດ = ບົດຄວາມ `max-w-3xl` + ຮູບ |
| Careers (`/careers`) | ລາຍການຕຳແໜ່ງ + ຟອມສະໝັກ (ແນບ CV) |
| ກ່ຽວກັບ (`/about`) | ປະຫວັດ (ຈົດທະບຽນ 2016), ຈຸດເດັ່ນ, ທີມ |
| ຕິດຕໍ່ (`/contact`) | 2 ຖັນ: ຂໍ້ມູນຕິດຕໍ່ + ຟອມ; ແຜນທີ່ (embed ຫຼື ລິ້ງ Google Maps, ພິກັດ 17.9991, 102.6105) |
| `/quote` | §8.8 |

### 9.5 Empty / Error / Loading

```tsx
<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
  <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand"><Icon className="size-6" /></div>
  <p className="font-semibold text-slate-900">ບໍ່ພົບສິນຄ້າ</p>
  <p className="text-sm text-slate-600">ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ລ້າງຕົວກອງ</p>
  <ButtonLink variant="outline" href="…">ລ້າງຕົວກອງ</ButtonLink>
</div>
```

ແຍກ 3 ກໍລະນີ: **ຍັງບໍ່ມີຂໍ້ມູນ** · **ກັ່ນຕອງແລ້ວບໍ່ພົບ** (ປຸ່ມລ້າງ) · **ຜິດພາດ** (ຂໍ້ຄວາມ + "ລອງໃໝ່"). ໜ້າ 404 ✅ (`[lang]/not-found.tsx`): ຂໍ້ຄວາມສອງພາສາ + ປຸ່ມກັບໜ້າຫຼັກ + ປຸ່ມຕິດຕໍ່. Loading: `loading.tsx` ຕໍ່ route ໃຊ້ skeleton ຮູບຮ່າງຄືກັບເນື້ອຫາຈິງ.

---

## 10. ຮູບພາບ ແລະ ໄອຄອນ

### 10.1 ໂລໂກ້ ແລະ asset

ໂລໂກ້ XTK = **ວົງຮີສີນ້ຳເງິນ** ມີ X (ໃບແດງ + ຂຽວ) ແລະ "TK" ຂາວ. ຕົ້ນສະບັບ `logo.jpg` ເປັນຮູບສີ່ຫຼ່ຽມ 1666×1666 ພື້ນຂາວ ແລະ ຂອບ anti-alias ຂາວ — ວາງເທິງພື້ນສີ (footer) ຈະເຫັນມຸມຂາວ. ແກ້ແລ້ວດ້ວຍການຕັດເປັນວົງຮີພື້ນໂປ່ງໃສ.

| ໄຟລ໌ | ຂະໜາດ | ໃຊ້ກັບ |
|---|---|---|
| `public/brand/logo.png` ✅ ໃໝ່ | 800×514, ພື້ນໂປ່ງໃສ (ຕັດວົງຮີ, ຂອບຍຸບ 3px ກັນເສດຂາວ) | **header, footer**, favicon, JSON-LD, OG ທີ່ບໍ່ມີ cover |
| `public/brand/logo.jpg` ✅ | 1666×1666 | ຕົ້ນສະບັບ — ເກັບອ້າງອີງ / ໜ້າ about (ພື້ນຂາວ) ເທົ່ານັ້ນ |
| `public/brand/cover.jpg` ✅ | — | OpenGraph, hero |
| `public/catalog/*`, `public/posts/*` ✅ | — | ຮູບສິນຄ້າ (`{ໝວດ}-{ລຳດັບ}.png`, `fb-{ຊື່}.jpg`), ຮູບຜົນງານ |
| `assets/legacy/` | — | ຕົ້ນສະບັບຈາກເວັບເກົ່າ — ບໍ່ໃຊ້ໃນ UI ໂດຍກົງ |

ກົດການວາງໂລໂກ້:
- **ເທິງພື້ນຂາວ / ເທົາອ່ອນ:** ວາງ `logo.png` ໄດ້ເລີຍ.
- **ເທິງພື້ນນ້ຳເງິນ (`brand`, `brand-dark`):** ວົງຮີນ້ຳເງິນຈະກືນພື້ນ → ຕ້ອງລ້ອມດ້ວຍ **ວົງແຫວນຂາວ** (`ring-2 ring-white/80`) ຫຼື ກ່ອງຂາວ `rounded-xl bg-white p-2`. ຫ້າມວາງດິບໆ.
- **ເທິງພື້ນຮູບ/ສີອື່ນ:** ໃຊ້ກ່ອງຂາວຮອງ.
- ບໍ່ຍືດ, ບໍ່ປ່ຽນສີ, ບໍ່ໃສ່ເງົາ; ອັດຕາສ່ວນ ≈ 1.55 : 1; ເວັ້ນພື້ນທີ່ອ້ອມ ≥ ¼ ຄວາມສູງ; ຄວາມສູງຕ່ຳສຸດ 32px (ຕ່ຳກວ່ານັ້ນ "TK" ອ່ານບໍ່ອອກ).
- Favicon: ວົງຮີບໍ່ເໝາະ ຊ່ອງ 32×32 ສີ່ຫຼ່ຽມ — ເຮັດ icon ແຍກ (ວົງຮີຕັດເຫຼືອສະເພາະ X ຂຽວ-ແດງ ເທິງພື້ນນ້ຳເງິນ) ເມື່ອມີ vector; ຕອນນີ້ໃຊ້ `logo.png`.

⚠️ ຍັງບໍ່ມີ SVG. `logo.png` ມາຈາກ raster; ໄຟລ໌ຕົ້ນສະບັບຈາກຜູ້ອອກແບບ (vector) ຍັງຕ້ອງຂໍ ສຳລັບງານພິມ ແລະ ໃບສະເໜີລາຄາ PDF.

### 10.2 ຮູບສິນຄ້າ

- **ຕ້ອງໃຊ້ `next/image`** ມີ `alt` (ຊື່ສິນຄ້າ) ແລະ `sizes` ທີ່ຖືກຕ້ອງ.
- ສັດສ່ວນ card `aspect-[4/3]`, ຮູບ `object-contain p-3` ເທິງ `bg-slate-50`. ຮູບສິນຄ້າຈາກເພສ Facebook ມີຂະໜາດ/ພື້ນຫຼັງບໍ່ເທົ່າກັນ — ຮັກສາກົດນີ້ເພື່ອບໍ່ໃຫ້ຕັດ.
- ຮູບຜົນງານ/ຂ່າວ: `aspect-video object-cover`.
- ຮູບທີ່ upload ໃໝ່ (ຜ່ານຫຼັງບ້ານ → `lib/storage.ts`): ຈຳກັດ 5MB, ແນະນຳດ້ານຍາວ ≥ 1000px, ແປງເປັນ WebP/AVIF ຜ່ານ `next/image`.
- ບໍ່ສະແດງຮູບ placeholder ທີ່ເປັນຮູບສິນຄ້າອື່ນ; ໃຊ້ກ່ອງ "ບໍ່ມີຮູບ" ✅.
- ເພື່ອຫຼີກລ່ຽງບັນຫາລິຂະສິດ: ຮູບທີ່ເອົາມາຈາກຜູ້ຜະລິດຕ້ອງໄດ້ຮັບອະນຸຍາດ/ມາຈາກ brochure ຂອງຕົວແທນ.

### 10.3 ໄອຄອນ 🆕

`lucide-react`, stroke 2px, ຂະໜາດ `size-4` (ໃນປຸ່ມ/ຂໍ້ຄວາມ) · `size-5` (nav, ຟອມ) · `size-6` (ຈຸດເດັ່ນ, empty). ສີ: ຕາມຂໍ້ຄວາມອ້ອມ (`currentColor`); ກ່ອງໄອຄອນ `bg-brand/10 text-brand`.

| ຄວາມໝາຍ | ໄອຄອນ | ຄວາມໝາຍ | ໄອຄອນ |
|---|---|---|---|
| ຄົ້ນຫາ | `Search` | ໂທລະສັບ | `Phone` |
| ໃບຂໍລາຄາ | `ClipboardList` | ແຊັດ | `MessageCircle` |
| ເພີ່ມ | `Plus` | ອີເມວ | `Mail` |
| ສຳເລັດ | `CheckCircle2` | ທີ່ຢູ່ | `MapPin` |
| ເຕືອນ / ຜິດພາດ | `AlertTriangle` / `AlertCircle` | ດາວໂຫຼດ | `Download` |
| ຕໍ່ໄປ | `ChevronRight` / `ArrowRight` | ສ້ອມ / ບໍລິການ | `Wrench` |
| ຂະຫຍາຍ | `ChevronDown` | ການຢາ | `Pill` |
| ປິດ | `X` | ອຸປະກອນການແພດ / ຫ້ອງວິໄຈ | `Stethoscope` / `FlaskConical` |
| ເອກະສານ | `FileText` | ເຄື່ອງໃຊ້ສິ້ນເປືອງ / ຄວາມປອດໄພ | `Syringe` / `ShieldCheck` |

---

## 11. ພາສາ, ຕົວເລກ, ເນື້ອຫາ

### 11.1 ສອງພາສາ ✅

- Route ແຍກ `/lo` ແລະ `/en` (`proxy.ts` redirect ຈາກ `/`), `<html lang>` ຕາມພາສາ, `hreflang` ໃຫ້ທັງສອງ.
- ຂໍ້ຄວາມ UI ຢູ່ `lib/i18n.ts` (`getDictionary(lang)`); ຂໍ້ມູນເນື້ອຫາມີສອງ field `titleLao` / `titleEng` ແລະ ເລືອກດ້ວຍ `pick(lang, lo, en)`. **ຫ້າມຝັງຂໍ້ຄວາມໃນ component** — ເພີ່ມເຂົ້າ dictionary.
- ຄຳສັບເທັກນິກ/ຊື່ສະເພາະ ຄົງເປັນອັງກິດ (CE, FDA, ISO, WhatsApp, Serial No, PM, Calibration, ຊື່ຍີ່ຫໍ້, ຊື່ລຸ້ນ).
- Layout ຕ້ອງຮັບໄດ້ທັງສອງພາສາ: ຂໍ້ຄວາມລາວມັກຍາວກວ່າ — ໃຊ້ `min-w-0`, `truncate`/`line-clamp`, **ບໍ່ກຳນົດຄວາມກວ້າງຕາຍຕົວ** ໃຫ້ປຸ່ມ.
- ບໍ່ມີ field ອັງກິດ → ສະແດງ field ລາວ (ແລະ ກົງກັນຂ້າມ) ເປັນ fallback, ບໍ່ສະແດງຄ່າວ່າງ.

### 11.2 ຕົວເລກ, ວັນທີ, ເບີໂທ

- ຂັ້ນຫຼັກພັນດ້ວຍ `,` (`15,000`); ທົດສະນິຍົມສະແດງສະເພາະເມື່ອມີ. ບໍ່ໃຊ້ກັບ ປີ, SKU, ເບີໂທ, ເລກອ້າງອີງ.
- ວັນທີ: `dd/MM/yyyy`, ເຂດເວລາ `Asia/Vientiane` ສະເໝີ. ຄ່າຫວ່າງ: `—`.
- ເບີໂທສະແດງແບບ `020 5589 2929`, link `tel:+8562055892929`; WhatsApp ໃຊ້ `wa.me` ຜ່ານ `whatsappLink()`.
- ສະກຸນເງິນ (ເມື່ອເປີດໄລຍະ 3): `2,400,000 ກີບ` ຫຼື `₭ 2,400,000`.

### 11.3 ຄຳສັບມາດຕະຖານ

| English | ລາວ | English | ລາວ |
|---|---|---|---|
| Products | ສິນຄ້າ | Request a quote | ຂໍລາຄາ |
| Brands | ຍີ່ຫໍ້ | Add to quote | ເພີ່ມເຂົ້າໃບຂໍລາຄາ |
| Services | ບໍລິການ | Ask via WhatsApp | ຖາມຜ່ານ WhatsApp |
| Projects | ຜົນງານ | Ask via Messenger | ຖາມຜ່ານ Messenger |
| Careers | ຮັບສະໝັກງານ | In stock | ພ້ອມສົ່ງ |
| About | ກ່ຽວກັບພວກເຮົາ | Pre-order | ສັ່ງຈອງ |
| Contact | ຕິດຕໍ່ | Search… | ຄົ້ນຫາ... |
| Submit | ສົ່ງ | Submitting… | ກຳລັງສົ່ງ... |
| No results | ບໍ່ພົບຜົນລັບ | Reference no. | ເລກອ້າງອີງ |

### 11.4 ນ້ຳສຽງ

ສຸພາບ, ກົງ, ເປັນທາງການພໍສົມຄວນ (ຜູ້ອ່ານເປັນໂຮງໝໍ/ລັດ). ປຸ່ມໃຊ້ຄຳກິລິຍາ ("ຂໍລາຄາ", "ສົ່ງຄຳຮ້ອງ"). Error ບອກວ່າເກີດຫຍັງ ແລະ ຕ້ອງເຮັດຫຍັງຕໍ່. **ບໍ່ອ້າງຄຳຂວັນທີ່ບໍ່ມີຫຼັກຖານ** (ເຊັ່ນ "ອັນດັບ 1") ແລະ ບໍ່ອ້າງການຮັບຮອງ/ເລກທະບຽນທີ່ຍັງບໍ່ໄດ້ຢືນຢັນກັບບໍລິສັດ (ເບິ່ງ README: ລາຍການທີ່ຕ້ອງຢືນຢັນ). ຫຼີກລ່ຽງ emoji ໃນ UI.

---

## 12. ຫຼັງບ້ານ (Admin)

ຫຼັງບ້ານ (ໄລຍະ 1: ສິນຄ້າ/ໝວດ/ຍີ່ຫໍ້/ໂພສ/ຕຳແໜ່ງງານ + ກ່ອງຮັບ RFQ, ແຈ້ງສ້ອມ, ໃບສະໝັກ; ໄລຍະ 2: CRM, ໃບສະເໜີລາຄາ PDF, ທະບຽນເຄື່ອງ) **ໃຊ້ token ດຽວກັນ** — ຍັງບໍ່ໄດ້ສ້າງ. ເມື່ອເລີ່ມ, ຂໍ້ຕັດສິນ:

| ເລື່ອງ | ຂໍ້ຕັດສິນ |
|---|---|
| ສີ ແລະ ຟອນ | ຄືກັບເວັບສາທາລະນະ (`brand` ນ້ຳເງິນ, `leaf` ຂຽວ, Noto Sans Lao). ບໍ່ເອົາມ່ວງຂອງ OCA. |
| Layout | Sidebar ຊ້າຍ `w-64` (ຫຍໍ້ໄດ້ເປັນ 72px) + topbar `h-14`; ໃຊ້ໂຄງດຽວກັບ §8 ຂອງ OCA ສະບັບຫຍໍ້. ເຂົ້າຜ່ານ route group `(admin)` ແຍກຈາກ `[lang]`. ຫຼັງບ້ານຮອງຮັບ **ລາວ ກັບ ອັງກິດ** ຕາມຜູ້ໃຊ້ ແຕ່ເລີ່ມດ້ວຍລາວ. |
| Component | ຕອນນັ້ນຈຶ່ງຕິດຕັ້ງ shadcn/ui (`new-york`, `cssVariables`) ຕາມ `SYSTEM_ARCHITECTURE.md`; map token shadcn (`--primary` = `brand`) ໃຫ້ກົງກັບ §3. |
| ຕາຕະລາງ | ຢືມຈາກ OCA §9.8: ແຖວຫົວ `bg-slate-50`, hover ແຖວ, checkbox ເລືອກຫຼາຍ, ຈັດລຽງ, pagination `10/30/50`, menu ⋮ ທ້າຍແຖວ, ລຶບຕ້ອງຜ່ານ confirm dialog. |
| Dark mode | **ບໍ່ເຮັດ** ຈົນກວ່າຈະມີຄວາມຕ້ອງການຈິງ. ຖ້າເຮັດ ໃຫ້ໃຊ້ semantic token ຕັ້ງແຕ່ຕົ້ນ (ບໍ່ສ້າງຊັ້ນ override ແບບ MTS/OCA). |
| ສະຖານະ | RFQ: ໃໝ່ / ກຳລັງຕິດຕໍ່ / ສົ່ງໃບສະເໜີ / ປິດ — ສີຕາມ §3.3 (info / warning / brand / success); ແຈ້ງສ້ອມ: ຮັບແລ້ວ / ກຳລັງສ້ອມ / ລໍຊິ້ນສ່ວນ / ສຳເລັດ. |
| Print | ໃບສະເໜີລາຄາ PDF ໄລຍະ 2: ໃຊ້ໂລໂກ້ເຕັມ ພື້ນຂາວ; ພິມ A4. |

---

## 13. Motion

ໜ້ອຍ ແລະ ບໍ່ລົບກວນ. ເວັບຕ້ອງໄວ ແລະ ຮູ້ສຶກໜ້າເຊື່ອຖື.

| ອົງປະກອບ | ການເຄື່ອນໄຫວ |
|---|---|
| ປຸ່ມ, link, nav | `transition-colors` (150ms) ✅ |
| Card ກົດໄດ້ | `transition-shadow` + `hover:shadow-md` ✅ |
| Chevron / accordion | `transition-transform duration-200` + `rotate-180` |
| Dropdown / modal | ເຂົ້າ `fade-in` + `zoom-in-95` 150–200ms ຈາກຈຸດກາງ (ບໍ່ slide) |
| Skeleton | `animate-pulse` |
| ໜ້າ | **ບໍ່ມີ** page transition, parallax, ຫຼື scroll animation |

ທຸກ animation ທີ່ວົນຊ້ຳ ຕ້ອງປິດໃນ `@media (prefers-reduced-motion: reduce)` (Tailwind: `motion-reduce:animate-none`, `motion-reduce:transition-none`).

---

## 14. Accessibility ແລະ Performance

| ເລື່ອງ | ມາດຕະຖານ |
|---|---|
| Contrast | ຂໍ້ຄວາມປົກກະຕິ ≥ 4.5:1 (ຕາຕະລາງເຕັມ §3.1). `brand` 10.3:1 ✔ · `leaf` `#00813c` 4.99:1 ✔ (ປຸ່ມ ແລະ ຂໍ້ຄວາມ) · `leaf-dark` 6.9:1 ✔ · `accent-dark` 6.0:1 ✔. **`leaf-bright` ແລະ `accent` (`#e92227`, 4.45:1) ບໍ່ໃຊ້ເປັນຕົວໜັງສືນ້ອຍ.** `slate-400` ໃຊ້ກັບ placeholder/ໄອຄອນເທົ່ານັ້ນ. |
| Focus | ຫ້າມ `outline-none` ໂດຍບໍ່ມີ ring ທົດແທນ (input ✅ ມີ `focus:ring-2`; ປຸ່ມ/link 🆕 ຕ້ອງເພີ່ມ `focus-visible`). Focus ring ເຫັນໄດ້ເທິງ nav ນ້ຳເງິນ (`focus-visible:outline-white`). |
| Skip link 🆕 | `<a href="#main" class="sr-only focus:not-sr-only …">` ໃນ layout; `<main id="main">`. |
| Landmark | `<header>`, `<nav aria-label>`, `<main>`, `<footer>` ✅ ໂຄງມີແລ້ວ — ໃສ່ `aria-label` ໃຫ້ nav; `aria-current="page"` ໃຫ້ລາຍການ active. |
| ປຸ່ມໄອຄອນ | ຕ້ອງມີ `aria-label`; ປຸ່ມແຊັດລອຍ ແລະ ປຸ່ມລຶບ/ປິດ ທຸກອັນ. |
| ຟອມ | `<label>` ຫໍ່ input ✅; error ຜູກດ້ວຍ `aria-describedby`; ຂໍ້ຄວາມສຳເລັດ/ຜິດພາດ `role="status"` / `role="alert"`; ຫ້າມຮັບແຕ່ສີ. |
| ຮູບ | `alt` ທີ່ມີຄວາມໝາຍ (ຊື່ສິນຄ້າ + ລຸ້ນ); ຮູບຕົກແຕ່ງ `alt=""`. |
| ພາສາ | `<html lang>` ຖືກຕ້ອງ ✅; ຂໍ້ຄວາມທີ່ປົນພາສາໃນບລັອກ ໃຫ້ໃສ່ `lang` ທີ່ element. |
| Keyboard | Tab ຕາມລຳດັບທີ່ເຫັນ; `Esc` ປິດ modal/dropdown; Gallery thumbnail ເປັນ `<button>`. |
| Motion | ເຄົາລົບ `prefers-reduced-motion` (§13). |
| Test hook | element ທີ່ໂຕ້ຕອບໄດ້ທີ່ສຳຄັນ ມີ `data-testid` (`button-add-to-quote`, `input-phone`, `card-product-{slug}`) |
| **Performance** | LCP < 2.5s, CLS < 0.1 ເທິງ 4G. ໃຊ້ `priority` ກັບຮູບ hero/ໂລໂກ້ເທົ່ານັ້ນ; ຮູບອື່ນ lazy (default). ບໍ່ມີ layout shift ຈາກຮູບ (ບອກ `width/height` ຫຼື `fill` ໃນ box ທີ່ມີ `aspect-*`). `font-display: swap`. ຫຼີກ client component ທີ່ບໍ່ຈຳເປັນ — ໜ້າສິນຄ້າເປັນ Server Component, ມີແຕ່ປຸ່ມເພີ່ມເຂົ້າໃບຂໍລາຄາ ແລະ Gallery ເປັນ client. |
| **SEO** | ແຕ່ລະໜ້າມີ `generateMetadata` (title, description, OG, `alternates.languages`); ສິນຄ້າມີ JSON-LD `Product` (ບໍ່ໃສ່ `offers` ຈົນກວ່າມີລາຄາ), ບໍລິສັດມີ `Organization` ✅. `sitemap.ts` + `robots.ts` ຕ້ອງມີກ່ອນເປີດໂດເມນ. |

---

## 15. ຂໍ້ຕັດສິນຈາກການສັງເຄາະ

ເອກະສານ OCA ເປັນລະບົບຫຼັງບ້ານຂະໜາດໃຫຍ່ (~150 ໜ້າ); XTVK ເປັນເວັບບໍລິສັດ + ແຄັດຕາລັອກ. ຕາຕະລາງນີ້ບອກວ່າຕັດ/ເອົາຫຍັງ ແລະ ເຫດຜົນ.

| # | ຫົວຂໍ້ | OCA | **XTVK ໃຊ້** | ເຫດຜົນ |
|---|---|---|---|---|
| 1 | ສີແບຣນ | ມ່ວງ `#7e22ce` (ວັດຈາກໂລໂກ້ OCA) | **ນ້ຳເງິນ `#2e3192` + ຂຽວ `#00813c` + ແດງ `#e92227`** (ວັດຈາກໂລໂກ້ XTK, ຂຽວປັບລົງໃຫ້ຜ່ານ AA) | ໃຊ້ວິທີດຽວກັບ OCA: ວັດ pixel ໂລໂກ້ ແລ້ວປັບ contrast |
| 2 | Dark mode | ບັງຄັບ, light/dark ເທົ່າທຽມ | **ບໍ່ມີ** (ເວັບສາທາລະນະ) | ຜູ້ຊົມເປັນຜູ້ຊື້ ອ່ານເນື້ອຫາ; ປະຢັດ token ແລະ ການທົດສອບ. ຄ່ອຍເພີ່ມທີ່ admin ຖ້າຈຳເປັນ |
| 3 | Type scale | ຂະຫຍາຍ +2px ທຸກຂັ້ນ | **Tailwind ມາດຕະຖານ** + `line-height: 1.75` ສຳລັບລາວ | ເນື້ອຫາເວັບອ່ານໄດ້ດີກວ່າດ້ວຍ scale ປົກກະຕິ; ບໍ່ຕ້ອງ override `@theme` ຫຼາຍ; ແກ້ບັນຫາອັກສອນລາວຜ່ານ line-height ແລະ ຂັ້ນຕ່ຳ 12px |
| 4 | Hex ໃນ className | ໃຊ້ຫຼາຍກວ່າ 30,000 ຄັ້ງ + override 440 ແຖວ | **ໃຊ້ token** (`bg-brand`, `text-leaf-dark`); neutral ໃຊ້ `slate-*` | ໂຄດປັດຈຸບັນເຮັດຢູ່ແລ້ວ — ຮັກສາ |
| 5 | Shell | Sidebar 280px + topbar 64px + ເມນູ RBAC | **Header + nav bar ສີນ້ຳເງິນ + footer** | ເວັບບໍລິສັດ, ບໍ່ແມ່ນ dashboard |
| 6 | Density | ໜາແໜ້ນ (ຄວບຄຸມ 36px, ຕົວ 10–11px) | **ໂລ່ງກວ່າ** (ຄວບຄຸມ ≥ 40px, ຕົວ ≥ 12px) | ມືຖື + ຜູ້ໃຊ້ທົ່ວໄປ; ບໍ່ແມ່ນພະນັກງານທີ່ຄຸ້ນເຄີຍ |
| 6b | ສີແດງ | ບໍ່ມີ (ແດງ = ອັນຕະລາຍ) | **`accent` ເປັນສີເນັ້ນຂອງແບຣນ** (ໃບແດງໃນໂລໂກ້) ແຍກຈາກ `danger` ດ້ວຍກົດການໃຊ້ | ໂລໂກ້ມີແດງ; ຕັດອອກຈະບໍ່ກົງແບຣນ |
| 7 | AI visual system (rainbow, Sparkles, FAB) | ມີ | **ບໍ່ມີ** | XTVK ບໍ່ມີຄຸນສົມບັດ AI ໃນໄລຍະ 1–3 |
| 8 | Component library | shadcn/ui ທັງໝົດ + Radix 27 package | **ຂຽນເອງ ໃນ `ui.tsx`** ຈົນຮອດຫຼັງບ້ານ | ໜ້າສາທາລະນະໃຊ້ນ້ອຍ component; ຫຼີກ bundle ໜັກ |
| 9 | Card | `rounded-2xl`, `shadow-none` | **`rounded-xl`** ✅ + `hover:shadow-md` | ຕາມໂຄດປັດຈຸບັນ |
| 10 | Table / Pagination / Bulk | ແບບຫຼັກຂອງລະບົບ | ເອົາໄປໃຊ້ໃນ **admin ເທົ່ານັ້ນ**; ເວັບສາທາລະນະໃຊ້ grid card + ຕາຕະລາງສະເປັກ | ສິນຄ້າເປັນ card ເບິ່ງເປັນພາບ |
| 11 | Toast | Radix Toast, ລຸ່ມຂວາ | **ບໍ່ມີ** ໃນເວັບສາທາລະນະ; ໃຊ້ກ່ອງ success inline ຫຼັງສົ່ງຟອມ | ຟອມສົ່ງແລ້ວນຳທາງໄປໜ້າຢືນຢັນ/ສະແດງເລກອ້າງອີງ ເຫັນຊັດກວ່າ toast ທີ່ຫາຍໄປ |
| 12 | ພາສາ | `lo` ຕາມ state ໃນ topbar | **Route ແຍກ `/lo` `/en`** ✅ | SEO + `hreflang` ຕາມ `SYSTEM_ARCHITECTURE.md` |
| 13 | Command palette, Date range, Signature pad ... | ມີ | **ບໍ່ເອົາ** | ບໍ່ກ່ຽວກັບເວັບບໍລິສັດ |
| 14 | Z-index 1010–2147483647 | ຫຼາຍຊັ້ນ | **ຊຸດນ້ອຍ `z-30`–`z-[70]`** (§7.5) | ບໍ່ມີ sidebar/overlay ຊ້ອນກັນຫຼາຍ |
| 15 | ກົດ "ບໍ່ hardcode hex" | ເປົ້າໝາຍ | **ບັງຄັບ** ໃນ PR | ຕັ້ງແຕ່ເລີ່ມ |
| 16 | Prefix `oca-` | `.oca-skeleton`... | **ບໍ່ໃສ່ prefix**; ໃຊ້ utility ຂອງ Tailwind | custom CSS ມີໜ້ອຍ |

### ຊ່ອງວ່າງທີ່ຕ້ອງຕັດສິນພ້ອມບໍລິສັດ

- ໂລໂກ້ vector (SVG/AI) ຈາກຜູ້ອອກແບບ — ຕອນນີ້ມີ PNG ພື້ນໂປ່ງໃສທີ່ຕັດເອງຈາກ JPG.
- ສີປະຈຳໝວດສິນຄ້າ (§3.4) — ຕ້ອງການ ຫຼື ບໍ່.
- ຮູບສິນຄ້າທີ່ໃຊ້ໄດ້ຖືກລິຂະສິດ (ຮູບເກົ່າ 35 ຮູບໃນ OneDrive ເສຍໄປ — ເບິ່ງ `README.md`).
- ເລກທະບຽນ ອຢ / ຍີ່ຫໍ້ຕົວແທນທາງການ — ກ່ອນສະແດງເປັນ badge ຢືນຢັນ.

---

## 16. Checklist ກ່ອນ merge UI

- [ ] ໂລໂກ້ເທິງພື້ນສີ ມີວົງແຫວນ/ກ່ອງຂາວ; ແດງ (`accent`) ໃຊ້ບໍ່ເກີນ 1 ຈຸດຕໍ່ viewport
- [ ] ບໍ່ມີ hex ຕາຍຕົວໃນ `className` — ໃຊ້ token / `slate-*`
- [ ] ເບິ່ງແລ້ວທີ່ 375px, 768px, 1280px; ບໍ່ມີ scroll ແນວນອນຂອງໜ້າ (ຍົກເວັ້ນ nav bar ແລະ ຕາຕະລາງ)
- [ ] ທຸກຂໍ້ຄວາມຜ່ານ dictionary / `pick()` ທັງ `lo` ແລະ `en`; ຂໍ້ຄວາມລາວຍາວບໍ່ລົ້ນ
- [ ] ມີ `lang` ຖືກຕ້ອງ ແລະ ເບິ່ງແລ້ວວ່າ line-height ຂອງອັກສອນລາວບໍ່ຖືກຕັດ
- [ ] ມີສະຖານະ loading, empty, error (ແລະ 404 ຂອງ route ນັ້ນ)
- [ ] ມີ CTA ຂຽວ (ຂໍລາຄາ) **ພຽງອັນດຽວ** ຕໍ່ມຸມມອງ
- [ ] ປຸ່ມ/link/input ມີ focus ທີ່ເຫັນໄດ້; ປຸ່ມໄອຄອນມີ `aria-label`
- [ ] ຮູບໃຊ້ `next/image` + `alt` + `sizes`; ບໍ່ມີ layout shift
- [ ] ຟອມມີ `Honeypot`, validate ດ້ວຍ zod ຝັ່ງ server, error ຜູກກັບ field
- [ ] ບໍ່ສະແດງລາຄາ, ເລກທະບຽນ, ຫຼື ການຮັບຮອງທີ່ຍັງບໍ່ໄດ້ຢືນຢັນ
- [ ] Card ໃຊ້ ຂອບ + `rounded-xl`; ເງົາສະເພາະ hover/ສິ່ງທີ່ລອຍ
- [ ] ກວດ `node_modules/next/dist/docs/` ເມື່ອໃຊ້ API ຂອງ Next ທີ່ບໍ່ແນ່ໃຈ (ຕາມ `AGENTS.md`)

---

*ເອກະສານນີ້ອະທິບາຍ "ມາດຕະຖານທີ່ຕ້ອງການ". ເມື່ອໂຄດຂອງ XTVK ແລະ ເອກະສານນີ້ຂັດກັນ ໃຫ້ແກ້ອັນໃດອັນໜຶ່ງໃຫ້ກົງກັນໃນ PR ດຽວກັນ.*
