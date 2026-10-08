# Nepal Test Filler — Project Requirements

## 1. Objective

Build a Chrome extension that automatically fills web forms with **realistic, synthetic Nepal-focused test data**.

The extension is intended primarily for developers, QA engineers, testers, and teams testing web applications that contain registration forms, profile forms, customer forms, employee forms, address forms, and other data-entry workflows.

The goal is to provide significantly more realistic Nepal-specific test data than generic fake-data extensions.

For example, instead of generating:

> John Smith / 123 Main Street / 555-1234

the extension should generate realistic synthetic data such as:

> Suman Adhikari / Itahari-6, Sunsari / 9841234567

The generated information must be **synthetic test data** and must not intentionally represent or reproduce real individuals.

---

# 2. Core Product Principle

The extension must **NOT use AI to generate every form value**.

The normal form-filling process must be:

```text
User clicks Fill
        ↓
Detect fields
        ↓
Identify field type
        ↓
Generate/select local test data
        ↓
Fill webpage
```

No Gemini API request should be required for normal form filling.

This ensures:

- Fast filling
- Low operating cost
- Offline capability
- Predictable results
- Consistent test data
- No unnecessary API calls
- Better privacy
- No dependency on Gemini availability

AI is an optional intelligence layer used only where it provides meaningful value.

---

# 3. AI Responsibilities

Gemini AI will have only two primary responsibilities.

## 3.1 Dataset Expansion

Gemini may be used during development or through an administrative dataset-generation workflow to expand the Nepal test-data dataset.

Examples:

- First names
- Last names
- Occupations
- Company names
- Common address patterns
- Educational institutions
- Business types
- Email patterns
- Other useful Nepal-specific test-data categories

Generated data must be reviewed and validated before being included in the production dataset.

AI-generated data should not be treated as authoritative geographic or regulatory information without validation.

---

## 3.2 Unidentified Field Recognition

When the extension encounters a field that its normal rule-based detector cannot identify, it may use Gemini to classify the field.

Example:

```text
Input:
name="cust_ref_no"
placeholder="Customer Reference"
label="Customer Reference Number"

        ↓

Gemini

        ↓

customerReference
```

The result should then be mapped to an existing local generator.

Example:

```text
customerReference
        ↓
Local generator
        ↓
Synthetic reference number
```

AI should **identify the field type**, not generate the final field value.

---

# 4. AI Must Not Be Used For

Gemini must not be called for ordinary fields that the extension already understands.

For example:

```text
Name
Email
Phone
Date of Birth
Gender
Province
District
Municipality
Ward
Address
Occupation
```

These should be handled locally.

The extension should not perform:

```text
Phone field
   ↓
Gemini
   ↓
Phone number
```

Instead:

```text
Phone field
   ↓
Local phone generator
   ↓
9841234567
```

---

# 5. Technology Stack

## Chrome Extension

- React
- TypeScript
- Vite
- Chrome Extension Manifest V3

## Extension Components

- Popup UI
- Content Script
- Background Service Worker
- Local data generator
- Field detection engine
- Field mapping engine
- Chrome Storage API

## AI

- Google Gemini API
- AI calls should be isolated behind a backend/API layer when runtime AI is required.
- Gemini API credentials must never be exposed directly inside the distributed Chrome extension.

---

# 6. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │      Gemini AI      │
                         │                     │
                         │ Dataset Expansion   │
                         │ Unknown Field       │
                         │ Recognition         │
                         └──────────┬──────────┘
                                    │
                              Optional AI
                                    │
                                    ▼
┌────────────────────────────────────────────────────────┐
│                 Chrome Extension                       │
│                                                        │
│  React Popup                                           │
│       │                                                │
│       ▼                                                │
│  Field Detection Engine                                │
│       │                                                │
│       ├──────── Known field ──────────────┐            │
│       │                                   ▼            │
│       │                           Local Generator      │
│       │                                   │            │
│       │                                   ▼            │
│       │                              Test Data         │
│       │                                                │
│       └──────── Unknown field ──→ Optional AI         │
│                                      │                 │
│                                      ▼                 │
│                              Field Classification      │
│                                      │                 │
│                                      ▼                 │
│                              Local Generator           │
│                                                        │
│                         Content Script                 │
│                              │                         │
│                              ▼                         │
│                         Web Form                       │
└────────────────────────────────────────────────────────┘
```

---

# 7. Main Features

## 7.1 One-Click Form Filling

The user should be able to open a webpage and click:

> Fill Page

The extension should scan the page, identify supported fields, generate a synthetic profile, and fill the form.

---

# 8. Supported Field Types

The initial version should support:

### Personal Information

- Full Name
- First Name
- Middle Name
- Last Name
- Gender
- Date of Birth
- Age

### Contact Information

- Email
- Mobile Number
- Telephone Number

### Nepal Address

- Province
- District
- Municipality
- Rural Municipality
- Metropolitan City
- Sub-Metropolitan City
- Ward
- Tole
- Address

### Professional Information

- Occupation
- Job Title
- Department
- Company Name

### General Test Data

- Username
- Password
- Number
- Date
- Text
- Textarea
- URL
- Reference Number

Additional field types can be added later.

---

# 9. Nepal Data Engine

The extension should maintain structured Nepal-focused datasets.

Example:

```text
data/
├── names/
│   ├── male.json
│   ├── female.json
│   └── surnames.json
│
├── geography/
│   ├── provinces.json
│   ├── districts.json
│   ├── municipalities.json
│   └── wards.json
│
├── occupations.json
├── companies.json
├── schools.json
└── addresses.json
```

The datasets should maintain relationships between values wherever applicable.

For example:

```text
Province
  ↓
District
  ↓
Municipality
  ↓
Ward
```

The generator should avoid producing invalid combinations such as:

```text
Province: Koshi
District: Kathmandu
```

---

# 10. Synthetic Person Generation

The system should generate a complete synthetic person rather than generating every field independently.

Example:

```json
{
  "firstName": "Suman",
  "lastName": "Adhikari",
  "fullName": "Suman Adhikari",
  "gender": "Male",
  "dateOfBirth": "1996-08-14",
  "phone": "9841234567",
  "email": "suman.adhikari47@example.test",
  "province": "Koshi Province",
  "district": "Sunsari",
  "municipality": "Itahari Sub-Metropolitan City",
  "ward": 6,
  "occupation": "Software Developer"
}
```

All fields derived from this profile should remain internally consistent.

---

# 11. Email Generation

Email addresses should be generated locally.

Example:

```text
suman.adhikari47@example.test
bikash.rai82@example.test
priya.gurung31@example.test
```

The preferred domain for synthetic testing should be a reserved/non-production test domain where appropriate, rather than accidentally contacting real users.

---

# 12. Phone Number Generation

Phone numbers should follow realistic Nepali formats.

Example:

```text
98XXXXXXXX
97XXXXXXXX
96XXXXXXXX
```

The generator should create synthetic values and should not intentionally use known real phone numbers.

---

# 13. Field Detection

The extension should inspect multiple attributes when identifying an input:

- `name`
- `id`
- `placeholder`
- `type`
- `autocomplete`
- `aria-label`
- associated `<label>`
- nearby text
- form field context

Example:

```text
name="mobile_number"
placeholder="Enter mobile number"

        ↓

Detected as:

phone
```

Rule-based detection should always be attempted first.

---

# 14. Unknown Field Recognition

If no rule confidently identifies a field:

```text
Input
 ↓
Rule-based detector
 ↓
Unknown
 ↓
Optional Gemini classification
 ↓
Field type
 ↓
Local generator
```

The AI response should use a controlled set of supported field types.

For example:

```json
{
  "fieldType": "phone",
  "confidence": 0.96
}
```

The AI should not be allowed to invent arbitrary generator types.

---

# 15. AI Result Caching

AI classification results should be cached where practical.

For example:

```text
cust_ref_no
Customer Reference Number
        ↓
customerReference
```

Once classified, the extension should avoid repeatedly asking Gemini about the same field pattern.

Possible cache key:

```text
hash(
  name +
  id +
  placeholder +
  label
)
```

---

# 16. React Application Compatibility

The extension must support modern JavaScript frameworks where practical, especially:

- React
- Next.js applications
- Vue
- Angular

The form-filling engine must correctly trigger input/change events so that controlled inputs detect the inserted values.

For React-controlled inputs, simply modifying:

```javascript
element.value = value;
```

is not sufficient.

The extension should dispatch the appropriate DOM events.

---

# 17. Form Elements

The initial implementation should support:

- `<input>`
- `<textarea>`
- `<select>`
- Checkbox
- Radio buttons

Future versions may support:

- Custom dropdowns
- Date picker components
- React Select
- Material UI controls
- Ant Design controls
- Other framework-specific components

---

# 18. User Interface

The popup should remain simple.

Example:

```text
┌─────────────────────────────┐
│ 🇳🇵 Nepal Test Filler       │
│                             │
│ Profile                     │
│ [ General Person       ▼ ]  │
│                             │
│ Data                        │
│ ☑ Personal                 │
│ ☑ Contact                  │
│ ☑ Address                  │
│ ☑ Professional             │
│                             │
│ [ Generate New Data ]       │
│                             │
│ [      Fill Page      ]     │
└─────────────────────────────┘
```

---

# 19. Profiles

The extension should eventually support different test-data profiles.

Initial profiles:

```text
General Person
Student
Employee
Business Owner
Teacher
Farmer
```

Each profile can define which fields should be generated.

Example:

```text
Student

Name
Date of Birth
Gender
Guardian
Phone
Email
School
Address
District
Municipality
```

---

# 20. Website-Specific Field Mapping

The extension should eventually support custom field mappings.

Example:

```text
Website:
mywebsite.com

Field:
cust_ref_no

Mapped Type:
customerReference
```

The mapping should be stored locally using Chrome Storage.

This allows the extension to become highly reliable on websites with custom field names.

---

# 21. Privacy

The default filling process should be completely local.

```text
Generate data
      ↓
Local extension
      ↓
Fill page
```

No generated test data should be uploaded to a server during normal filling.

AI should only be contacted when:

1. Expanding datasets through an authorized workflow.
2. An unknown field requires classification and the user has enabled AI assistance.

The extension should never collect or upload unrelated webpage content.

---

# 22. Security

The extension must follow Chrome extension security best practices.

Do not:

- Store Gemini API keys directly in the extension.
- Send entire webpages to Gemini unnecessarily.
- Upload user-entered personal information.
- Collect passwords from webpages.
- Send sensitive form values to external services.

When AI classification is required, only the minimum field metadata necessary for classification should be sent.

For example:

```json
{
  "name": "cust_ref_no",
  "placeholder": "Customer Reference",
  "label": "Customer Reference Number",
  "type": "text"
}
```

The actual value entered by the user must not be included.

---

# 23. Performance Requirements

Normal form filling should not require network access.

Target behavior:

```text
Click Fill
    ↓
Scan page
    ↓
Generate data
    ↓
Fill fields
```

The process should feel immediate for normal forms.

Gemini should not be called when the local detector already knows the field type.

---

# 24. Error Handling

If a field cannot be identified:

```text
Unknown field
```

The extension should not guess dangerously.

Possible behavior:

```text
Unknown field detected

[Ask AI]
[Skip]
[Map Manually]
```

The user should be able to manually map the field.

---

# 25. Development Phases

## Phase 1 — Core Extension

- React
- TypeScript
- Vite
- Manifest V3
- Popup
- Content script
- Basic field detection
- Basic form filling

## Phase 2 — Nepal Data Engine

- Names
- Surnames
- Phone numbers
- Emails
- Provinces
- Districts
- Municipalities
- Wards
- Occupations
- Addresses

## Phase 3 — Synthetic Person Generator

Create internally consistent profiles instead of independent random values.

## Phase 4 — Advanced Field Detection

Improve rule-based detection using:

- Name
- ID
- Placeholder
- Labels
- ARIA
- Autocomplete
- Nearby text

## Phase 5 — Gemini Integration

Implement AI only for:

- Dataset expansion
- Unknown field classification

## Phase 6 — Website-Specific Mapping

Add:

- Custom field mapping
- Saved mappings
- Domain-specific configurations

## Phase 7 — Advanced Controls

Add:

- Student profile
- Employee profile
- Business profile
- Farmer profile
- Teacher profile
- Custom data generation
- More framework-specific form controls

---

# 26. MVP Success Criteria

The MVP will be considered successful when a user can:

1. Install the extension.
2. Open a supported website.
3. Click the extension.
4. Select a test-data profile.
5. Generate a realistic synthetic Nepali person.
6. Automatically detect common form fields.
7. Fill the form with one click.
8. Correctly handle React-controlled inputs.
9. Generate internally consistent Nepal addresses.
10. Generate realistic Nepali phone/email formats.
11. Fill common `<input>`, `<textarea>`, `<select>`, checkbox, and radio fields.
12. Handle unknown fields without breaking the form.
13. Optionally use Gemini to classify an unknown field.
14. Continue normal operation without AI when AI is unavailable.

---

# 27. Final Product Vision

The final product should be positioned as:

> **A Nepal-focused realistic test-data and form-filling Chrome extension for developers and QA teams.**

The core philosophy is:

```text
                  LOCAL FIRST
                      │
        ┌─────────────┴─────────────┐
        │                           │
  Deterministic                  AI Assisted
  Data Generation                Intelligence
        │                           │
        │                    ┌──────┴──────┐
        │                    │             │
        │               Dataset        Unknown
        │               Expansion      Fields
        │
        ▼
   Fast + Private + Reliable
```

AI should **enhance the extension**, not become a dependency for basic functionality.

The architecture should therefore be designed so that the extension remains fully useful even when Gemini is disabled, unavailable, or out of quota.