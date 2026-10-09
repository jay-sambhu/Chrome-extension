# Nepal Test Filler — Project Implementation Checklist & Roadmap

This document outlines the detailed checklist for all development phases of the **Nepal Test Filler** Chrome extension, following the specifications defined in [Nepal Test Filler — Project Requirements.md](file:///home/devxgamer/Nepali%20Filler/Nepal%20Test%20Filler%20%E2%80%94%20Project%20Requirements.md).

---

## 📌 Phase Overview Status

| Phase | Description | Status |
| :--- | :--- | :---: |
| **Phase 1** | Core Extension Boilerplate (React, Vite, TS, MV3, Basic Detector & Filler) | ✅ **Completed** |
| **Phase 2** | Nepal Data Engine (Hierarchical Geography, Names, Contacts, Institutions) | ✅ **Completed** |
| **Phase 3** | Synthetic Person Generator (Consistency Engine & Persona Profiles) | ✅ **Completed** |
| **Phase 4** | Advanced Field Detection (Romanized Nepali & Heuristic Detection) | ✅ **Completed** |
| **Phase 5** | Gemini Integration (Unknown Field Classifier & Dataset Expansion) | ✅ **Completed** |
| **Phase 6** | Website-Specific Mapping (Domain Overrides & Storage Engine) | ✅ **Completed** |
| **Phase 7** | Advanced Profiles & Form Controls (Student, Employee, Farmer, Shortcuts) | ✅ **Completed** |

---

## ✅ Phase 1 — Core Extension (Completed)
- [x] Git repository initialization and baseline backup commits.
- [x] Manifest V3 boilerplate with React 19, TypeScript, and Vite 8 (`@crxjs/vite-plugin`).
- [x] Extension icons generation (16×16, 48×48, 128×128 PNG) with Nepal flag/crimson motif.
- [x] Basic field detection engine inspecting `name`, `id`, `placeholder`, `<label>`, `aria-label`, and `type`.
- [x] Framework-compatible form filler (`setNativeValue`, `setNativeChecked`) supporting React, Vue, Angular controlled inputs.
- [x] Starter Nepal dataset (provinces, key districts, municipalities, names, and phone numbers).
- [x] Modern Nepal-themed popup UI (crimson `#DC143C` & slate dark mode) with persona preview and 1-click filling.
- [x] Background service worker initializing default `chrome.storage.local` settings.
- [x] Comprehensive unit test suite with 13 passing tests via Vitest.
- [x] Chrome Web Store metadata and permissions justification document ([CHROMEWEBSTORE.md](file:///home/devxgamer/Nepali%20Filler/CHROMEWEBSTORE.md)).

---

## ✅ Phase 2 — Nepal Data Engine (Completed)

Exhaustive, verified Nepali datasets stored in structured JSON formats with typed querying and helper APIs.

### 2.1 Geography Hierarchy (`src/data/geography/`)
- [x] **Provinces Dataset** (`provinces.json`):
  - [x] All 7 provinces: Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, Sudurpashchim.
  - [x] English names, official Nepali Devanagari names, and provincial capitals.
- [x] **Districts Dataset** (`districts.json`):
  - [x] All 77 districts mapped strictly to their respective province.
  - [x] Official landline area codes (`01`, `021`, `061`, `071`, `081`, `091`, etc.) and headquarters.
- [x] **Municipalities & Local Bodies** (`municipalities.json`):
  - [x] All 6 Metropolitan Cities (Kathmandu, Lalitpur, Bharatpur, Pokhara, Biratnagar, Birgunj).
  - [x] All 11 Sub-Metropolitan Cities (Janakpur, Ghorahi, Tulsipur, Itahari, Dharan, Butwal, Hetauda, Dhangadhi, Nepalgunj, Kalaiya, Jitpursimara).
  - [x] Principal Municipalities and Rural Municipalities (Gaunpalika).
  - [x] Valid maximum ward count limits per local body (e.g., KMC: 32 wards, Pokhara: 33 wards).
- [x] **Toles and Landmarks** (`toles.json`):
  - [x] Popular toles, chowks, and road names categorized across major urban centers.

### 2.2 Names & Demographics (`src/data/names/`)
- [x] **First Names** (`maleNames.json`, `femaleNames.json`):
  - [x] 200+ authentic Nepali male first names.
  - [x] 200+ authentic Nepali female first names.
- [x] **Surnames** (`surnames.json`):
  - [x] 150+ authentic surnames representing all major Nepali ethnic groups:
    - Khas-Arya (Adhikari, Sharma, Dahal, Karki, Bhattarai, etc.)
    - Newar (Shrestha, Maharjan, Shakya, Bajracharya, Dangol, etc.)
    - Janajati / Kirat / Gurung / Magar / Tamang (Gurung, Magar, Rai, Limbu, Tamang, Thapa, etc.)
    - Madhesi & Tharu (Chaudhary, Yadav, Shah, Mahato, Jha, Mandal, etc.)

### 2.3 Contact & Organization Information (`src/data/`)
- [x] **Phone Number & Telecom** (`telecom.json`):
  - [x] NTC mobile series (`984`, `985`, `986`, `974`, `975`, `976`).
  - [x] Ncell mobile series (`980`, `981`, `982`, `970`).
  - [x] Landline numbers with official district area codes.
- [x] **Email Generator**:
  - [x] Reserved synthetic domains (`example.test`, `testmail.com.np`, `synthetic.np`, `devtest.np`).
  - [x] Natural email naming patterns (`first.last`, `firstlastNN`).
- [x] **Occupations & Companies** (`occupations.json`, `companies.json`):
  - [x] Authentic Nepali company names (Danphe Digital, Himalayan Cloud, Sagarmatha InfoSys, etc.).
  - [x] Common occupations across Tech, Engineering, Healthcare, Finance, Education, Hospitality, Media.
- [x] **Educational Institutions** (`institutions.json`):
  - [x] Major universities (Tribhuvan University, Kathmandu University, Pokhara University, etc.).
  - [x] Prominent colleges and high schools across Nepal.
- [x] **Typed Engine Query Layer** (`src/generator/nepalDataEngine.ts`):
  - [x] Static querying API with full test coverage in `tests/nepalDataEngine.test.ts`.

---

## ✅ Phase 3 — Synthetic Person Generator (Completed)

Logically unified, internally consistent personas with support for 6 archetypes.

- [x] **Geographic Consistency Engine**:
  - [x] Strict hierarchical resolution: `Province` ➔ `District` ➔ `Municipality` ➔ `Ward`.
  - [x] Zero invalid combinations (e.g., Koshi Province + Kathmandu District is impossible).
  - [x] Coherent formatted address strings (`Tole, Ward-N, Municipality, District, Province`).
- [x] **Demographic & Persona Consistency**:
  - [x] Gender-aligned first names and honorifics (Mr., Ms., Mrs., Mx.).
  - [x] Age calculation mathematically coupled with `Date of Birth` (`age === currentYear - birthYear`).
  - [x] Landline telephone numbers automatically coupled to the generated address's district area code (`01` Kathmandu/Lalitpur/Bhaktapur, `061` Kaski, `021` Morang, `091` Kailali, etc.).
- [x] **Persona Archetypes**:
  - [x] **General Person**: Standard citizen profile, age 22–65, standard occupation.
  - [x] **Student**: Age 16–24, high school/college/university, student ID, guardian name & phone.
  - [x] **Employee**: Age 23–58, corporate designation, employee ID, 9-digit PAN number, work email, salary.
  - [x] **Business Owner**: Age 28–65, registered business name, business type, PAN & VAT number, registered office address.
  - [x] **Teacher**: Age 25–62, academic subject, faculty, institution, faculty ID.
  - [x] **Farmer**: Age 28–68, agricultural cooperative, crop focus.
- [x] **Testing**:
  - [x] Unit tests running 1,000 randomized iterations asserting zero geographic mismatch bugs and full parity.

---

## ✅ Phase 4 — Advanced Field Detection (Completed)

Significantly improve the rule-based detection engine to achieve near-100% accuracy on real-world Nepali and international web forms.

- [x] **Multi-Signal Scoring System**:
  - [x] Weighted scoring across:
    1. Input `type` and `autocomplete` attributes.
    2. Explicit `<label for="...">` and wrapping `<label>`.
    3. Input `name` and `id` tokens.
    4. Input `placeholder` text.
    5. Accessibility attributes (`aria-label`, `aria-labelledby`, `aria-describedby`).
    6. Neighboring DOM sibling text and parent container headers.
- [x] **Romanized Nepali & Devanagari Vocabulary Support**:
  - [x] Names: `naam`, `pehelo naam`, `bichko naam`, `thar` / `पहिलो नाम`, `थर`.
  - [x] Address: `thegana`, `jilla`, `pradesh`, `nagar palika`, `gau palika`, `wada`, `tole`, `chowk` / `ठेगाना`, `जिल्ला`, `प्रदेश`, `वडा`.
  - [x] Identity: `nagrikta`, `rastriya parichayapatra`, `pan`, `janma darta` / `नागरिकता`, `प्यान`.
  - [x] Contact: `phone`, `samparka`, `chalbhasa`, `patralaya` / `सम्पर्क`, `मोबाइल`.
  - [x] Professional: `pesha`, `karyalaya`, `sanstha`, `pad` / `पेशा`, `संस्था`.
- [x] **Composite Form Layout Detection**:
  - [x] Detection of split address fields (separate Province dropdown, District dropdown, Municipality dropdown, Ward input).
  - [x] Detection of split name inputs (First Name + Last Name vs. Single Full Name).
  - [x] Support for non-standard form layouts (tables, floating label frameworks, Material UI, Tailwind forms).
- [x] **Comprehensive Test Suite**:
  - [x] 9 targeted test cases in `tests/detector.test.ts` covering multi-signal weighting, autocomplete priority, Devanagari labels, Romanized tokens, and aria labels.

---

## ✅ Phase 5 — Gemini Integration (Isolated & Local-First) (Completed)

Incorporate Google Gemini strictly as an optional intelligence layer without compromising local speed or privacy.

- [x] **Architectural Boundaries (Strict Requirements Compliance)**:
  - [x] Form filling operates 100% offline without Gemini.
  - [x] Zero Gemini calls for fields identified by the local rule engine.
  - [x] No API keys hardcoded into extension distribution files.
  - [x] Secure user-provided API key stored in `chrome.storage.local` (or backend proxy option).
- [x] **Unknown Field Classifier**:
  - [x] Triggered only when a field fails local detection and user has opted into AI classification.
  - [x] Privacy sanitization: payload contains **only** `{ domain, name, id, placeholder, label, type }` — never webpage content or user data.
  - [x] Structured Output: prompts Gemini to classify into the strict `SupportedFieldType` enum with confidence score.
- [x] **Classification Caching Engine**:
  - [x] Hash key generator: `hash(domain + name + id + placeholder + label)`.
  - [x] Persist classification results in `chrome.storage.local` so Gemini is never queried twice for the same field pattern.
- [x] **Administrative Dataset Expansion Script**:
  - [x] Node.js development script using `@google/genai` to expand names, occupations, toles, and institutions for new releases.
  - [x] Automated validation step to ensure newly generated synthetic entries meet schema constraints before merging into JSON datasets.
- [x] **Comprehensive Test Suite**:
  - [x] 8 targeted tests in `tests/geminiClassifier.test.ts` for sanitization, hash consistency, prompt generation, offline boundary fallback, cache hits, and error handling.
  - [x] 11 targeted tests in `tests/datasetExpansion.test.ts` for schema validation of names, occupations, companies, and institutions.

---

## ✅ Phase 6 — Website-Specific Mapping (Completed)

Empower power-users and QA engineers to configure domain-specific field overrides.

- [x] **Custom Field Mapper UI**:
  - [x] In-popup field inspector showing detected vs. unknown fields on the active page.
  - [x] Dropdown to manually map any unclassified or custom field to any synthetic generator type.
- [x] **Domain Mapping Storage Engine**:
  - [x] Save mapping rules per hostname (e.g., `esewa.com.np`, `khalti.com`, `internal-portal.local`).
  - [x] Mapping precedence hierarchy:
    ```text
    Custom Domain Mapping (Highest Priority)
             ↓
    Rule-Based Local Detector
             ↓
    Cached AI Classification
             ↓
    Optional Live AI Classification
             ↓
    Generic Fallback / Skip
    ```
- [x] **Mapping Management Settings**:
  - [x] View all saved domain mappings for active page.
  - [x] Edit / delete mappings with instant UI feedback.
- [x] **Comprehensive Test Suite**:
  - [x] 9 targeted tests in `tests/domainMapping.test.ts` for domain normalization, CRUD storage, and selector/name/regex matching.

---

## ✅ Phase 7 — Advanced Controls & Specialized Profiles (Completed)

Expand form-filling flexibility with domain-specific archetypes and browser productivity enhancements.

- [x] **Specialized Test Profiles**:
  - [x] **Student**:
    - Student ID / Roll Number generator (`STU-YYYY-XXXX`).
    - Associated School/College/University (`school`).
    - Academic faculty and grade/level (`faculty`, `grade`).
    - Guardian Name & Guardian Phone number (`guardianName`, `guardianPhone`).
  - [x] **Employee**:
    - Employee ID (`EMP-XXXXX`).
    - Department, Designation, and Corporate Email (`name@company.com.np`).
    - PAN number format (`XXXXXXXXX`) and Salary (`XX,000 NPR`).
  - [x] **Business Owner**:
    - Business Name, Registration Type (Pvt Ltd, Proprietorship, Partnership).
    - Synthetic VAT/PAN number (`panNumber`, `vatNumber`).
    - Registered Office Address (`registeredAddress`).
  - [x] **Farmer / Agriculture**:
    - Agricultural occupation and cooperative name (`cooperative`).
    - Crop type (`cropType`: Paddy, Maize, Tea, Cardamom, Coffee, Vegetables).
    - Rural municipality and rural ward focus with `preferRural` generator.
  - [x] **Teacher / Faculty**:
    - Subject specialization, academic faculty, faculty staff ID, and institution.
  - [x] **National IDs & Bikram Sambat (BS) Dates**:
    - `convertAdToBs()` AD-to-BS calendar converter.
    - Nepali citizenship number (`DD-01-YY-XXXXX`) and 10-digit National ID (`nationalId`).
- [x] **Keyboard Shortcuts & Context Menus**:
  - [x] `Alt+Shift+F`: Instantly fills active tab without opening the popup.
  - [x] `Alt+Shift+R`: Re-generates synthetic profile and re-fills.
  - [x] Context Menu item: Right-click on form / editable field to trigger filling with Nepali test data.
- [x] **Custom Form Controls Support**:
  - [x] React-Select, Material-UI Autocomplete, Ant Design Dropdowns (`[role="combobox"]`, `aria-autocomplete`, `.ant-select-selection-search-input`).
  - [x] Custom checkbox and radio groups built with styled elements (`[role="checkbox"]`, `[role="radio"]`, `aria-checked`).
  - [x] Date picker components supporting both Gregorian (AD) and Bikram Sambat (BS) date formats.
- [x] **Extension Options & Settings Page**:
  - [x] Dedicated options UI (`src/options/index.html`, `src/options/App.tsx`) with dark crimson/slate aesthetics.
  - [x] Configure default archetype profiles with real-time synthetic data preview.
  - [x] Manage, inspect, and delete website-specific domain mappings.
  - [x] Configure Gemini API key and view/clear classification cache.
  - [x] Export and restore settings & rules backup as JSON files.
- [x] **Comprehensive Test Suite**:
  - [x] 12 targeted tests in `tests/advancedProfiles.test.ts` for specialized profile schemas, BS date conversion, and field detection.
  - [x] 4 targeted tests in `tests/customControls.test.ts` for custom ARIA checkboxes, radios, comboboxes, and specialized values.
  - [x] All 9 test suites (77 tests total) passing cleanly with 100% green status.

---

## 🚀 Pre-Release & Chrome Web Store Checklist
- [x] Manifest security review: ensure minimal permissions (`storage`, `activeTab`, `scripting`).
- [x] Complete unit and integration test suite passing cleanly with 100% green status (25 test files, 268 tests).
- [x] Production build verification with clean bundle size analysis.
- [x] Review against [CHROMEWEBSTORE.md](file:///home/devxgamer/Nepali%20Filler/CHROMEWEBSTORE.md) and prepare screenshots (1280×800) and promotional tiles (440×280, 920×680).
