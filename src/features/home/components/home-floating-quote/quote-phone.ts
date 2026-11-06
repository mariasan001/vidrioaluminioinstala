const internationalPrefix = "+52";
const nationalCharacters = /^[\d\s()-]*$/;
const nationalSeparators = /[\s()-]/g;

export const quotePhoneErrorMessage =
  "Escribe un teléfono de 10 dígitos. Puedes usar espacios, guiones, paréntesis o el prefijo +52.";

export function normalizeQuotePhone(value: string) {
  const trimmed = value.trim();
  let national = trimmed;

  if (trimmed.startsWith("+")) {
    if (!trimmed.startsWith(internationalPrefix)) {
      return null;
    }

    national = trimmed.slice(internationalPrefix.length);
  }

  if (!nationalCharacters.test(national)) {
    return null;
  }

  const digits = national.replace(nationalSeparators, "");

  if (!/^\d{10}$/.test(digits)) {
    return null;
  }

  return digits;
}

export function isValidQuotePhone(value: string) {
  return normalizeQuotePhone(value) !== null;
}
