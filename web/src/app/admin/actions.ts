"use server";

import { AdminRole, PostType, QuoteStatus, RelationType, StockStatus, TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { endSession, hashPassword, loginAllowed, recordLogin, requireAdmin, startSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { savePublicFile } from "@/lib/storage";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const strOrNull = (fd: FormData, key: string) => str(fd, key) || null;
const flag = (fd: FormData, key: string) => fd.get(key) === "on";
const all = (fd: FormData, key: string) => fd.getAll(key).map((v) => String(v).trim());
const files = (fd: FormData, key: string) => fd.getAll(key).filter((f): f is File => f instanceof File && f.size > 0);

/** "2,400,000" -> 2400000; empty -> null; garbage -> undefined (caller reports an error). */
function money(raw: string): number | null | undefined {
  const cleaned = raw.replace(/[,\s₭]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 && value < 1e12 ? value : undefined;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const isUnique = (error: unknown) => typeof error === "object" && error !== null && "code" in error && error.code === "P2002";

function back(path: string, key: "saved" | "error", value = "1"): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`);
}

function refresh() {
  revalidatePath("/", "layout");
}

/* ---------- session ---------- */

export async function login(formData: FormData) {
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!loginAllowed(email)) back("/admin/login", "error", "locked");
  const user = await db.adminUser.findUnique({ where: { email } });
  const ok = Boolean(user?.isActive && verifyPassword(password, user.passwordHash));
  recordLogin(email, ok);
  if (!ok || !user) back("/admin/login", "error", "invalid");
  await startSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* ---------- site settings ---------- */

export async function setShowPrices(formData: FormData) {
  await requireAdmin();
  const value = formData.get("showPrices") === "on" ? "true" : "false";
  await db.siteSetting.upsert({ where: { key: "showPrices" }, update: { value }, create: { key: "showPrices", value } });
  refresh();
  back("/admin", "saved");
}

/* ---------- products ---------- */

const productSchema = z.object({
  titleLao: z.string().min(1),
  titleEng: z.string().min(1),
  categoryId: z.string().min(1),
  stockStatus: z.enum(StockStatus),
});

export async function saveProduct(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const page = id ? `/admin/products/${id}` : "/admin/products/new";

  const parsed = productSchema.safeParse({
    titleLao: str(formData, "titleLao"),
    titleEng: str(formData, "titleEng"),
    categoryId: str(formData, "categoryId"),
    stockStatus: str(formData, "stockStatus"),
  });
  if (!parsed.success) back(page, "error", "ກະລຸນາໃສ່ຊື່ (ລາວ ແລະ ອັງກິດ) ແລະ ເລືອກໝວດ");

  const price = money(str(formData, "priceLAK"));
  if (price === undefined) back(page, "error", "ລາຄາສິນຄ້າບໍ່ຖືກຕ້ອງ");

  const variants = all(formData, "variantNameLao").map((nameLao, i) => ({
    id: all(formData, "variantId")[i],
    sku: all(formData, "variantSku")[i],
    nameLao,
    nameEng: all(formData, "variantNameEng")[i] || nameLao,
    packSize: all(formData, "variantPack")[i] || null,
    priceLAK: money(all(formData, "variantPrice")[i]),
    stockStatus: all(formData, "variantStock")[i] === "IN_STOCK" ? StockStatus.IN_STOCK : StockStatus.PRE_ORDER,
  })).filter((v) => v.nameLao);
  if (variants.some((v) => v.priceLAK === undefined)) back(page, "error", "ລາຄາຂອງຕົວເລືອກບໍ່ຖືກຕ້ອງ");

  const uploaded: string[] = [];
  for (const file of files(formData, "imageFiles")) {
    const url = await savePublicFile(file);
    if (!url) back(page, "error", "ຮູບຕ້ອງເປັນ JPG, PNG ຫຼື WebP ແລະ ບໍ່ເກີນ 8 MB");
    uploaded.push(url);
  }
  let brochurePdfUrl = strOrNull(formData, "brochurePdfUrl");
  const brochure = files(formData, "brochureFile")[0];
  if (brochure) {
    brochurePdfUrl = await savePublicFile(brochure);
    if (!brochurePdfUrl) back(page, "error", "Brochure ຕ້ອງເປັນ PDF ແລະ ບໍ່ເກີນ 8 MB");
  }

  const labelsLao = all(formData, "specLabelLao");
  const specifications = labelsLao
    .map((labelLao, i) => ({ labelLao, labelEng: all(formData, "specLabelEng")[i] || labelLao, value: all(formData, "specValue")[i] }))
    .filter((s) => s.labelLao && s.value);

  // Pairs of (other product, type); blanks, the product itself and repeats are dropped.
  const pairs = (idKey: string, typeKey: string) => {
    const types = all(formData, typeKey);
    const seen = new Map<string, RelationType>();
    all(formData, idKey).forEach((otherId, i) => {
      const type = z.enum(RelationType).safeParse(types[i]);
      if (otherId && otherId !== id && type.success && !seen.has(otherId)) seen.set(otherId, type.data);
    });
    return [...seen];
  };
  const usedWith = pairs("outTo", "outType");
  const worksWith = pairs("inFrom", "inType");

  const baseSku = str(formData, "sku") || `XTK-${Date.now().toString(36).toUpperCase()}`;
  const data = {
    sku: baseSku,
    slug: slugify(str(formData, "slug")) || slugify(parsed.data.titleEng) || baseSku.toLowerCase(),
    modelNumber: strOrNull(formData, "modelNumber"),
    titleLao: parsed.data.titleLao,
    titleEng: parsed.data.titleEng,
    shortDescLao: strOrNull(formData, "shortDescLao"),
    shortDescEng: strOrNull(formData, "shortDescEng"),
    fullDescLao: strOrNull(formData, "fullDescLao"),
    fullDescEng: strOrNull(formData, "fullDescEng"),
    categoryId: parsed.data.categoryId,
    brandId: strOrNull(formData, "brandId"),
    stockStatus: parsed.data.stockStatus,
    images: [...all(formData, "image").filter(Boolean), ...uploaded],
    brochurePdfUrl,
    fddRegNumber: strOrNull(formData, "fddRegNumber"),
    certifications: str(formData, "certifications").split(",").map((c) => c.trim()).filter(Boolean),
    specifications,
    priceLAK: price,
    showPrice: flag(formData, "showPrice"),
    isFeatured: flag(formData, "isFeatured"),
    isPublished: flag(formData, "isPublished"),
  };

  let savedId = id;
  let keptVariants = 0;
  try {
    await db.$transaction(async (tx) => {
      const product = id ? await tx.product.update({ where: { id }, data }) : await tx.product.create({ data });
      savedId = product.id;
      const existing = await tx.productVariant.findMany({ where: { productId: product.id }, include: { _count: { select: { quotationItems: true } } } });
      const keep = new Set(variants.flatMap((v) => (v.id ? [v.id] : [])));
      for (const old of existing.filter((v) => !keep.has(v.id))) {
        // A variant that appears in a past quotation must stay; it is only hidden from this form once it has no history.
        if (old._count.quotationItems > 0) keptVariants += 1;
        else await tx.productVariant.delete({ where: { id: old.id } });
      }
      await tx.productRelation.deleteMany({ where: { OR: [{ fromId: product.id }, { toId: product.id }] } });
      await tx.productRelation.createMany({
        data: [
          ...usedWith.map(([toId, type]) => ({ fromId: product.id, toId, type })),
          ...worksWith.map(([fromId, type]) => ({ fromId, toId: product.id, type })),
        ],
        skipDuplicates: true,
      });
      for (const [i, v] of variants.entries()) {
        const fields = { nameLao: v.nameLao, nameEng: v.nameEng, packSize: v.packSize, priceLAK: v.priceLAK ?? null, stockStatus: v.stockStatus };
        if (v.id && existing.some((e) => e.id === v.id)) await tx.productVariant.update({ where: { id: v.id }, data: fields });
        else await tx.productVariant.create({ data: { ...fields, productId: product.id, sku: v.sku || `${product.sku}-${Date.now().toString(36)}${i}`.toUpperCase() } });
      }
    });
  } catch (error) {
    if (isUnique(error)) back(page, "error", "ລະຫັດ (SKU) ຫຼື slug ຊ້ຳກັບສິນຄ້າອື່ນ");
    throw error;
  }
  refresh();
  back(`/admin/products/${savedId}`, keptVariants ? "error" : "saved", keptVariants ? `ບັນທຶກແລ້ວ ແຕ່ມີ ${keptVariants} ຕົວເລືອກທີ່ເຄີຍຢູ່ໃນໃບຂໍລາຄາ ຈຶ່ງລຶບບໍ່ໄດ້` : "1");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const used = await db.quotationItem.count({ where: { productId: id } });
  if (used > 0) back(`/admin/products/${id}`, "error", "ສິນຄ້ານີ້ເຄີຍຢູ່ໃນໃບຂໍລາຄາ ລຶບບໍ່ໄດ້. ໃຫ້ປິດ \"ເຜີຍແຜ່\" ແທນ.");
  await db.product.delete({ where: { id } });
  refresh();
  back("/admin/products", "saved");
}

/* ---------- brands and categories ---------- */

export async function saveBrand(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) back("/admin/brands", "error", "ກະລຸນາໃສ່ຊື່ຍີ່ຫໍ້");
  const data = { name, slug: slugify(str(formData, "slug")) || slugify(name), country: strOrNull(formData, "country"), website: strOrNull(formData, "website"), isHouseBrand: flag(formData, "isHouseBrand") };
  try {
    if (id) await db.brand.update({ where: { id }, data });
    else await db.brand.create({ data });
  } catch (error) {
    if (isUnique(error)) back("/admin/brands", "error", "slug ຊ້ຳກັບຍີ່ຫໍ້ອື່ນ");
    throw error;
  }
  refresh();
  back("/admin/brands", "saved");
}

export async function deleteBrand(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  if ((await db.product.count({ where: { brandId: id } })) > 0) back("/admin/brands", "error", "ຍັງມີສິນຄ້າໃຊ້ຍີ່ຫໍ້ນີ້ຢູ່ ລຶບບໍ່ໄດ້");
  await db.brand.delete({ where: { id } });
  refresh();
  back("/admin/brands", "saved");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const nameLao = str(formData, "nameLao");
  const nameEng = str(formData, "nameEng");
  if (!nameLao || !nameEng) back("/admin/categories", "error", "ກະລຸນາໃສ່ຊື່ໝວດທັງລາວ ແລະ ອັງກິດ");
  const parentId = strOrNull(formData, "parentId");
  if (parentId && parentId === id) back("/admin/categories", "error", "ໝວດຈະເປັນໝວດແມ່ຂອງຕົວເອງບໍ່ໄດ້");
  const data = { nameLao, nameEng, slug: slugify(str(formData, "slug")) || slugify(nameEng), parentId, sortOrder: Number(str(formData, "sortOrder")) || 0 };
  try {
    if (id) await db.category.update({ where: { id }, data });
    else await db.category.create({ data });
  } catch (error) {
    if (isUnique(error)) back("/admin/categories", "error", "slug ຊ້ຳກັບໝວດອື່ນ");
    throw error;
  }
  refresh();
  back("/admin/categories", "saved");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const [products, children] = await Promise.all([db.product.count({ where: { categoryId: id } }), db.category.count({ where: { parentId: id } })]);
  if (products + children > 0) back("/admin/categories", "error", "ໝວດນີ້ຍັງມີສິນຄ້າ ຫຼື ໝວດຍ່ອຍ ລຶບບໍ່ໄດ້");
  await db.category.delete({ where: { id } });
  refresh();
  back("/admin/categories", "saved");
}

/* ---------- inboxes ---------- */

export async function setQuoteStatus(formData: FormData) {
  await requireAdmin("SALES");
  const status = z.enum(QuoteStatus).parse(str(formData, "status"));
  await db.quotation.update({ where: { id: str(formData, "id") }, data: { status } });
  back("/admin/quotes", "saved");
}

export async function updateTicket(formData: FormData) {
  await requireAdmin("TECHNICIAN");
  const status = z.enum(TicketStatus).parse(str(formData, "status"));
  await db.serviceTicket.update({ where: { id: str(formData, "id") }, data: { status, assignedTech: strOrNull(formData, "assignedTech") } });
  back("/admin/tickets", "saved");
}

/* ---------- jobs and posts ---------- */

export async function saveJob(formData: FormData) {
  await requireAdmin("HR");
  const id = str(formData, "id");
  const title = str(formData, "title");
  const description = str(formData, "description");
  const requirements = str(formData, "requirements");
  if (!title || !description || !requirements) back("/admin/jobs", "error", "ກະລຸນາໃສ່ຕຳແໜ່ງ, ລາຍລະອຽດ ແລະ ເງື່ອນໄຂ");
  const data = {
    title, description, requirements,
    department: str(formData, "department") || "-",
    positions: Math.max(1, Number(str(formData, "positions")) || 1),
    location: str(formData, "location") || "Vientiane Capital",
    benefits: strOrNull(formData, "benefits"),
    isActive: flag(formData, "isActive"),
  };
  if (id) await db.jobOpening.update({ where: { id }, data });
  else await db.jobOpening.create({ data });
  refresh();
  back("/admin/jobs", "saved");
}

export async function deleteJob(formData: FormData) {
  await requireAdmin("HR");
  const id = str(formData, "id");
  // Applicants point at the opening, so an opening with applications is closed instead of deleted.
  if ((await db.jobApplicant.count({ where: { jobId: id } })) > 0) {
    await db.jobOpening.update({ where: { id }, data: { isActive: false } });
    refresh();
    back("/admin/jobs", "error", "ຕຳແໜ່ງນີ້ມີຜູ້ສະໝັກແລ້ວ ຈຶ່ງປິດຮັບສະໝັກແທນການລຶບ");
  }
  await db.jobOpening.delete({ where: { id } });
  refresh();
  back("/admin/jobs", "saved");
}

export async function savePost(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const page = id ? `/admin/posts/${id}` : "/admin/posts/new";
  const titleLao = str(formData, "titleLao");
  const bodyLao = str(formData, "bodyLao");
  if (!titleLao || !bodyLao) back(page, "error", "ກະລຸນາໃສ່ຫົວຂໍ້ ແລະ ເນື້ອຫາ (ລາວ)");

  const uploaded: string[] = [];
  for (const file of files(formData, "imageFiles")) {
    const url = await savePublicFile(file);
    if (!url) back(page, "error", "ຮູບຕ້ອງເປັນ JPG, PNG ຫຼື WebP ແລະ ບໍ່ເກີນ 8 MB");
    uploaded.push(url);
  }
  const existing = id ? await db.post.findUnique({ where: { id }, select: { publishedAt: true } }) : null;
  const publish = flag(formData, "isPublished");
  const data = {
    type: z.enum(PostType).parse(str(formData, "type")),
    titleLao,
    titleEng: strOrNull(formData, "titleEng"),
    bodyLao,
    bodyEng: strOrNull(formData, "bodyEng"),
    slug: slugify(str(formData, "slug")) || slugify(str(formData, "titleEng")) || `post-${Date.now().toString(36)}`,
    images: [...all(formData, "image").filter(Boolean), ...uploaded],
    publishedAt: publish ? (existing?.publishedAt ?? new Date()) : null,
  };
  const productRefs = all(formData, "productIds").filter(Boolean).map((pid) => ({ id: pid }));
  let savedId = id;
  try {
    savedId = id
      ? (await db.post.update({ where: { id }, data: { ...data, products: { set: productRefs } } })).id
      : (await db.post.create({ data: { ...data, products: { connect: productRefs } } })).id;
  } catch (error) {
    if (isUnique(error)) back(page, "error", "slug ຊ້ຳກັບໂພສອື່ນ");
    throw error;
  }
  refresh();
  back(`/admin/posts/${savedId}`, "saved");
}

export async function deletePost(formData: FormData) {
  await requireAdmin("SALES");
  await db.post.delete({ where: { id: str(formData, "id") } });
  refresh();
  back("/admin/posts", "saved");
}

/* ---------- admin users ---------- */

export async function saveUser(formData: FormData) {
  const me = await requireAdmin();
  const id = str(formData, "id");
  // Stops the last admin from locking everyone out of this page.
  if (id === me.id && (!flag(formData, "isActive") || str(formData, "role") !== "ADMIN")) back("/admin/users", "error", "ປິດ ຫຼື ລົດບົດບາດບັນຊີຂອງຕົນເອງບໍ່ໄດ້");
  const password = String(formData.get("password") ?? "");
  const email = str(formData, "email").toLowerCase();
  const name = str(formData, "name");
  if (!name || !z.string().email().safeParse(email).success) back("/admin/users", "error", "ກະລຸນາໃສ່ຊື່ ແລະ ອີເມວທີ່ຖືກຕ້ອງ");
  if ((!id || password) && password.length < 10) back("/admin/users", "error", "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 10 ຕົວອັກສອນ");
  const data = { name, email, role: z.enum(AdminRole).parse(str(formData, "role")), isActive: flag(formData, "isActive"), ...(password ? { passwordHash: hashPassword(password) } : {}) };
  try {
    if (id) await db.adminUser.update({ where: { id }, data });
    else await db.adminUser.create({ data: { ...data, passwordHash: hashPassword(password) } });
  } catch (error) {
    if (isUnique(error)) back("/admin/users", "error", "ອີເມວນີ້ມີຢູ່ແລ້ວ");
    throw error;
  }
  back("/admin/users", "saved");
}
