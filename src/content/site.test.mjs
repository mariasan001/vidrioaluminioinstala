import assert from "node:assert/strict";
import test from "node:test";
import { site, whatsappUrl, phoneHref, whatsappPhoneNumber } from "./site.ts";

test("site contact numbers stay consistent", () => {
  assert.equal(site.phoneDigits, "7293813723");
  assert.equal(phoneHref, "tel:7293813723");
  assert.equal(whatsappPhoneNumber, "527293813723");
});

test("whatsappUrl encodes message and uses site number", () => {
  const href = whatsappUrl("Hola, quiero cotizar ventanas");
  assert.match(href, /^https:\/\/wa\.me\/527293813723\?text=/);
  assert.ok(href.includes(encodeURIComponent("Hola, quiero cotizar ventanas")));
  assert.equal(href.includes("527293813723"), true);
  assert.equal(href.includes("wa.me/527293813723?text="), true);
});

test("whatsappUrl does not hardcode a second phone path", () => {
  const href = whatsappUrl("test");
  assert.equal(href.startsWith(`https://wa.me/${site.whatsappNumber}?text=`), true);
});
