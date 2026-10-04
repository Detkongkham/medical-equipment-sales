/** Digits for wa.me links: local Lao numbers (020 5589 2929) get the 856 country code, +856 / 00856 forms are cleaned. */
export function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("856")) return digits;
  if (digits.startsWith("0")) return `856${digits.slice(1)}`;
  return digits;
}

export const waLink = (phone: string, text?: string) => `https://wa.me/${waNumber(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
