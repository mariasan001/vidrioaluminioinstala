import assert from "node:assert/strict";
import { isValidQuotePhone, normalizeQuotePhone } from "./quote-phone.ts";

const localNumber = "7293813723";

const validPhones = [
  "7293813723",
  "729 381 3723",
  "729-381-3723",
  "(729) 381-3723",
  "(729)3813723",
  "+52 729 381 3723",
  "+527293813723",
  "+52 (729) 381-3723",
  "+52 729-381-3723",
];

const invalidPhones = [
  "",
  "   ",
  "729381372",
  "729 381 372",
  "(729) 381-372",
  "72938137231",
  "123456789012",
  "+52 729 381 372",
  "+52 729 381 37234",
  "+521 729 381 3723",
  "0052 729 381 3723",
  "abcdefghij",
];

for (const phone of validPhones) {
  assert.equal(normalizeQuotePhone(phone), localNumber, phone);
  assert.equal(isValidQuotePhone(phone), true, phone);
}

for (const phone of invalidPhones) {
  assert.equal(normalizeQuotePhone(phone), null, phone);
  assert.equal(isValidQuotePhone(phone), false, phone);
}

console.log(`quote-phone: ${validPhones.length} formatos válidos y ${invalidPhones.length} rechazados`);
