const mexicanCountryCode = "52";

export const quotePhoneErrorMessage =
  "Escribe un teléfono de 10 dígitos. Puedes usar espacios, guiones, paréntesis o el prefijo +52.";

export function normalizeQuotePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits;
  }

  if (digits.length === mexicanCountryCode.length + 10 && digits.startsWith(mexicanCountryCode)) {
    return digits.slice(mexicanCountryCode.length);
  }

  return null;
}

export function isValidQuotePhone(value: string) {
  return normalizeQuotePhone(value) !== null;
}
