# Nepal Test Filler — Improvements & Future Roadmap Checklist

This document details upcoming improvements, feature enhancements, and quality-of-life suggestions for **Nepal Test Filler**, categorized by priority and technical scope.

---

## 📌 Priority Summary

| Category | Focus Area | Impact | Priority |
| :--- | :--- | :--- | :---: |
| **Section 1** | Nepali Real-World Data & Localization | Devanagari script, dual addresses, BS datepicker, Gov IDs, FinTech | 🔥 **High** |
| **Section 2** | Form Interaction & DOM Engine | Undo/Clear, inline floating trigger, multi-step wizard, Shadow DOM | ⚡ **Medium-High** |
| **Section 3** | AI & Gemini Classifier Refinements | Test API Key button, local banking prompts, model selection | 🤖 **Medium** |
| **Section 4** | User Experience & Customization | Custom persona presets, Copy JSON to clipboard, Light/Dark mode | 🎨 **Medium** |
| **Section 5** | Release Readiness & Automation | Local demo HTML page, GitHub Actions CI, Chrome Store assets | 🧪 **Release** |

---

## 1. 🇳🇵 Nepali Real-World Data & Localization (High Priority)

### 1.1 Devanagari Script (नेपाली युनिकोड) Support
- [x] **Dual Script Generator Engine**:
  - Add support for generating both English (Romanized) and Nepali Devanagari unicode text (`राम बहादुर श्रेष्ठ`, `काठमाडौँ महानगरपालिका`, `बागमती प्रदेश`, `शिक्षक`).
- [x] **Popup & Options Script Toggle**:
  - Add a toggle switch in Popup and Settings: `Fill Script: English (Default) | नेपाली (Devanagari)`.
- [x] **Field-Level Script Auto-Detection**:
  - Automatically detect Devanagari requirements if the field label or placeholder is in Devanagari script (e.g., `नाम (नेपालीमा)`, `ठेगाना`).

### 1.2 Permanent vs. Current/Temporary Address Distinction
- [x] **Prefix/Context Detection**:
  - Distinguish between **Permanent Address** (स्थायी ठेगाना) and **Temporary / Current Address** (अस्थायी / हालको ठेगाना) using label heuristics (`permanent_`, `temp_`, `current_`, `sthayee_`, `asthyee_`).
- [x] **Same-as-Permanent Checkbox Auto-Sync**:
  - Detect and trigger "Same as Permanent Address" checkboxes (`#same_as_permanent`, `input[name*="sameAsPermanent"]`) to mirror realistic user behavior.
- [x] **Distinct Location Generation**:
  - If both addresses are present and independent, generate coherent dual addresses (e.g., Permanent: Syangja District, Current: Kathmandu Metropolitan City).

### 1.3 Nepali Calendar (Bikram Sambat) & Datepicker Integration
- [x] **Popular Nepali Datepicker Library Hooks**:
  - Native integration with `nepali.datepicker.v4.min.js`, Hamro Patro calendar widgets, and Nepali Datepicker jQuery plugins.
- [x] **Split BS Date Dropdowns**:
  - Detect separate dropdowns for BS Year (वि.सं. वर्ष: २०४०–२०८२), BS Month (महिना: बैशाख–चैत), and BS Day (गते: १–३२).
- [x] **Custom Format Formatting**:
  - Support common input formats: `YYYY/MM/DD`, `YYYY-MM-DD`, and Nepali numeric characters (`२०५५/०२/१४`).

### 1.4 Government & Official Document Identifiers
- [x] **Citizenship Issue Details**:
  - Citizenship issue district (`citizenship_issue_district`) matched to persona province/district.
  - Citizenship issue date in BS (`citizenship_issue_date_bs`) mathematically verified after the birth year.
- [x] **National ID (राष्ट्रिय परिचयपत्र) & Passport Details**:
  - 10-digit National ID format with standard prefix patterns.
  - MRP/E-Passport number (`PA` / `PC` series + 7 digits) and issuing authority (Department of Passports, Kathmandu / DAO).
- [x] **Driving License Details**:
  - Driving license number (`01-06-XXXXXXXX`), category selection (Category A: Motorcycle, Category B: Car/Jeep).

### 1.5 FinTech, Banking & Digital Wallet Test Data
- [x] **Commercial Banks & Branches**:
  - Authentic list of Nepal Rastra Bank licensed Commercial Banks (Nabil Bank, NIC Asia, Global IME, Sanima Bank, etc.).
  - Realistic branch names and 14–16 digit synthetic account numbers.
- [x] **Digital Wallet IDs**:
  - eSewa ID / Khalti ID (aligned with generated 98XXXXXXXX mobile number).

### 1.6 Blood Group Field Support
- [ ] **Blood Group Generator**:
  - Support for `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-` dropdowns and radio selections (essential for medical, hospital, college, and driving license forms).

---

## 2. ⚡ Form Interaction & DOM Engine (Medium-High Priority)

### 2.1 Undo / Clear Form Functionality
- [ ] **Form Snapshot Before Fill**:
  - Capture initial field values before populating test data.
- [ ] **1-Click "Clear / Revert Form" Button**:
  - Add an undo button in the popup and via keyboard shortcut (`Alt+Shift+U`) to clear or restore previous form state.

### 2.2 Inline Floating Quick-Fill Trigger (Badge)
- [ ] **Discreet Field Badge**:
  - Optional discreet floating icon displayed beside detected forms/inputs (similar to 1Password / Bitwarden).
- [ ] **1-Click Fill Without Opening Popup**:
  - Clicking the badge instantly fills the target input or entire form with synthetic data.
- [ ] **User Setting to Enable/Disable**:
  - Configurable in Options page so developers can turn it off if preferred.

### 2.3 Multi-Step Wizard & SPA Persistence
- [ ] **Session Persona Retention**:
  - Save the currently active synthetic person in `sessionStorage` per browser tab.
  - Multi-step application wizards (Step 1: Personal -> Step 2: Address -> Step 3: Education) will retain the exact same persona instead of generating new random individuals on every page.

### 2.4 Shadow DOM & `<iframe>` Form Filling
- [ ] **Deep DOM Traversal**:
  - Traverse open Shadow DOM roots (`element.shadowRoot`) in custom web components.
- [ ] **Cross-Frame Filling**:
  - Handle embedded `<iframe>` elements commonly used in payment gateway modal dialogues (eSewa / Khalti checkout forms).

---

## 3. 🤖 AI & Gemini Classifier Refinements (Medium Priority)

### 3.1 "Test Connection" Button
- [ ] **Instant API Key Validation**:
  - Add a "Test Connection" button in the Gemini Settings section to verify API key validity and quota balance with instant user feedback.

### 3.2 Nepali Administrative Prompt Context
- [ ] **Domain Vocabulary Injection**:
  - Augment Gemini classification prompts with common Nepali bureaucratic tokens (`dastur`, `dharauti`, `nikasa`, `marfat`, `bujhaune`, `dastakhat`, `kaifiyat`) for higher classification accuracy.

### 3.3 Dynamic Model Selector
- [ ] **Model Options Upgrade**:
  - Update model selection to include `gemini-2.5-flash`, `gemini-2.5-pro`, and `gemini-1.5-flash` with fallback to `gemini-3.5-flash-lite`.

---

## 4. 🎨 User Experience & Customization (Medium Priority)

### 4.1 Custom Persona Presets
- [ ] **Save Custom Profiles**:
  - Allow QA testers to configure and save custom persona presets (e.g., "QA SuperAdmin", "Biratnagar Retailer", "Pokhara Foreign Student").
- [ ] **Preset Switching in Popup**:
  - Quick dropdown selector in popup to switch between default archetypes and user-saved custom presets.

### 4.2 Copy Persona as JSON / Clipboard Export
- [ ] **Export to Clipboard**:
  - "Copy Persona as JSON" button in popup for direct pasting into Postman, Swagger, or API payload testing.

### 4.3 Light / Dark Theme Toggle
- [ ] **Theme Preference**:
  - Add toggle for Light Theme alongside the existing Dark Crimson/Slate theme with auto-detection of `prefers-color-scheme`.

---

## 5. 🧪 Release Readiness & Automation (Release Readiness)

### 5.1 Local Demo Test Form Page
- [ ] **Interactive Test Bench (`demo/index.html`)**:
  - Create a local HTML page showcasing standard and non-standard Nepali forms (Loksewa layout, eSewa payment form, university admission, BS datepicker).
  - Serve locally via Vite for testing and rapid QA validation.

### 5.2 GitHub Actions CI Pipeline
- [ ] **Automated CI Workflow (`.github/workflows/ci.yml`)**:
  - Run `npm run typecheck`, `npm run build`, and `npm test` on every push and pull request.

### 5.3 Chrome Web Store Marketing Assets
- [ ] **Store Screenshots (1280×800)**:
  - Generate clean screenshots demonstrating popup, 1-click filling, BS dates, and domain overrides.
- [ ] **Promotional Banner (440×280 & 920×680)**:
  - Design branded crimson & slate promotional tile highlighting Nepal test data specialization.
