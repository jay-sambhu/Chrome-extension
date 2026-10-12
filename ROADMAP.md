# Roadmap

Launch target: **1 Kartik 2083 (18 October 2026)**. Chrome Web Store review for extensions that run on all sites can take several days, so submit by **13–14 October** to launch on time.

Tick items off as they are done. Each item says why it matters, so it's clear what to cut if time runs short.

---

## 0. Before submitting (by 13 October)

- [x] **Commit and tag** the current work as `v1.0.0`.
- [x] **Privacy policy:** published at https://github.com/jay-sambhu/Chrome-extension/blob/main/PRIVACY.md (contact: dellizulter@gmail.com).
- [x] **Driving licence Category K = `ट`:** confirmed by the transport office question bank ("वर्ग ट/K (स्कुटर/मोपेड)").
- [ ] **Test by hand on real forms** with `dist/` loaded unpacked:
  - [ ] Lok Sewa (psc.gov.np) online application
  - [ ] A government KYC-style form (passport / nagarikta / DoTM)
  - [ ] eSewa or Khalti sandbox checkout
  - [x] React apps: ant.design form demos (48 fields), MUI text fields (47), demoqa practice form (8), all without page errors. Fixed on the way: "standard" mis-detected as a grade, and Fill failing while heavy pages were still loading
  - [ ] Google Forms
  - [ ] `demo/index.html`, all six tabs, in English and नेपाली
- [ ] **Test on Windows.** Most users are on Windows; check that Devanagari renders in the popup and on pages.
- [ ] **Test on macOS.** Check that Alt+Shift+F/R/U don't clash with typing special characters.
- [ ] **Fill in the store dashboard** from `CHROMEWEBSTORE.md`: listing text, 5 screenshots, promo tile, permission justifications, Privacy tab answers.
- [ ] Run `npm run package` and upload `nepal-test-filler-v1.0.0.zip`.

## 1. Launch week

- [ ] Add a short "how to use" note or video link to the listing.
- [ ] Create a simple feedback channel (GitHub Issues or a Google Form) and link it in the listing.
- [ ] Share in Nepali developer communities (Facebook groups, Discord, LinkedIn).
- [ ] Watch store reviews and fix crash-type problems first.

## 2. v1.1: trust and quality (next 2–4 weeks)

- [ ] **Narrower permissions (high impact).** Today the install prompt says "Read and change all your data on all websites". Move to `activeTab` + inject on click, and make the in-page button an opt-in that asks for site access. This means fewer scared users and faster store reviews.
- [ ] **Keep the per-tab persona out of the page.** Store it in `chrome.storage.session` keyed by tab instead of the page's own `sessionStorage`, which the website can read.
- [ ] **Move the real-browser test into the repo.** The Playwright e2e check (fill, gender, ward, iframes, undo, security) currently lives outside the repo; add it under `tests/e2e/` and run it in CI.
- [ ] **UI tests** for the popup and settings page with React Testing Library.
- [ ] **Calendar:** verify BS month lengths for 1975, 1989, 1991 and 1993 against an official patro (sources disagree there).
- [ ] **Custom dropdowns:** actually click the matching option in React-Select / MUI / AntD lists instead of typing and pressing ↓.
- [ ] **Rich text fields:** support `contenteditable` editors.
- [ ] **"Copy debug info" button** in settings (version, browser, detected fields) so bug reports are useful.
- [ ] **Accessibility check** of popup and settings with axe.
- [ ] **Optional "fill every text field" mode.** Fields with generic labels such as "Text input" are left empty today to avoid filling OTP or captcha boxes. Some testers will want everything filled.
- [ ] **New driving licence categories.** The government plans to move from 11 to 18 licence categories; update `drivingLicenseCategory` once DoTM publishes them.

## 3. v1.2: features users will ask for

- [ ] **Nepali UI language** (`_locales/ne`) and a Nepali store description.
- [ ] **Bulk export:** generate 10–1,000 personas as CSV/JSON for seeding test databases.
- [ ] **Locked values:** always use the same password or email domain for a site.
- [ ] **Sample files for upload fields:** dummy citizenship and passport images and a PDF.
- [ ] **Multi-step forms:** detect the next step automatically and fill it with the same person.
- [ ] **Share site rules with a team** (import from a URL or file).
- [ ] **AI assist:** classify all unknown fields in one Gemini request instead of one per field.

## 4. Later

- [ ] Microsoft Edge Add-ons store (same package, little work).
- [ ] Firefox version.
- [ ] Landing page with a live demo form.
- [ ] Larger name and tole datasets per region.

## Release routine

1. Bump `version` in `package.json` (the manifest reads it).
2. `npm test` and `npm run typecheck`.
3. Load `dist/` unpacked and try `demo/index.html`.
4. Retake store screenshots if the UI changed.
5. `npm run package`, upload, and write a short changelog entry.
