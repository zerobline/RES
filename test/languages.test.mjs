import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const en = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const de = readFileSync(new URL("../de/index.html", import.meta.url), "utf8");
const booking = readFileSync(new URL("../booking-form.js", import.meta.url), "utf8");

const posts = [
  "https://www.instagram.com/riehenenglishstudio/p/DdwOo5KisIW/",
  "https://www.instagram.com/riehenenglishstudio/p/De9pnPXCgpU/",
  "https://www.instagram.com/riehenenglishstudio/p/DerBjROCghv/"
];

test("english stays the default page and points at german", () => {
  assert.match(en, /<html lang="en-GB">/);
  assert.match(en, /rel="canonical" href="https:\/\/riehenenglishstudio\.ch\/"/);
  assert.match(en, /hreflang="de-CH" href="https:\/\/riehenenglishstudio\.ch\/de\/"/);
  assert.match(en, /aria-label="Language"/);
  assert.match(en, /aria-current="page">English</);
  assert.match(en, /href="\/de\/" lang="de-CH"/);
  assert.match(en, />Book a trial →</);
  assert.equal(en.includes("ß"), false);
});

test("german is a separate page in swiss standard german", () => {
  assert.match(de, /<html lang="de-CH">/);
  assert.match(de, /rel="canonical" href="https:\/\/riehenenglishstudio\.ch\/de\/"/);
  assert.match(de, /hreflang="en-GB" href="https:\/\/riehenenglishstudio\.ch\/"/);
  assert.match(de, /property="og:locale" content="de_CH"/);
  assert.match(de, /aria-label="Sprache"/);
  assert.match(de, /aria-current="page">Deutsch</);
  assert.match(de, />Probestunde buchen →</);
  assert.match(de, /Menü schliessen/);
  assert.match(de, /Wird gesendet…/);
  assert.match(de, /Übersetzung aus dem Englischen/);
  assert.equal(de.includes("ß"), false);
  assert.equal(de.includes("meta http-equiv=\"refresh\""), false);
  for (const leftover of ["What we do", "Book a trial", "Send message", "Select age", "Open menu", "See on Instagram"]) {
    assert.equal(de.includes(leftover), false, leftover);
  }
});

test("gallery links and lesson facts stay exact in both languages", () => {
  for (const page of [en, de]) {
    for (const url of posts) assert.equal(page.split(url).length - 1, 2);
    assert.match(page, /CHF <\/span>30/);
    assert.match(page, /CHF <\/span>20/);
    assert.match(page, /45–60/);
    assert.match(page, /2–3/);
    assert.match(page, /4–13/);
  }
  assert.match(de, /kostenlose Probestunde dauert eine Stunde/);
  assert.match(de, /nur in Schulwochen/);
  assert.match(de, /Studio in Riehen/);
  assert.match(de, /rosa Herz/);
});

test("german form keeps the same field names and posted age values", () => {
  assert.match(de, /name="trial-booking"/);
  assert.match(de, /action="\/"/);
  assert.match(de, /name="form-name" value="trial-booking"/);
  assert.match(de, /name="child_age"/);
  assert.match(de, /value="8 years old">8 Jahre/);
  assert.match(de, /name="bot-field"/);
  assert.match(booking, /fetchFn\("\/"/);
  assert.equal(/(?<!\.)\.\/images\//.test(de), false);
});
