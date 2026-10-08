# Nepal Test Filler — Chrome Web Store Information

## Summary & Listing Information

- **Extension Name**: Nepal Test Filler
- **Short Description**: Automatically fill web forms with realistic, synthetic Nepal-focused test data.
- **Detailed Description**:
  Nepal Test Filler is an offline-first developer and QA tool designed to streamline form testing across web applications. Instead of filling generic placeholder values, it populates registration, profile, and checkout forms with realistic, synthetic Nepali data—including internally consistent provinces, districts, municipalities, and wards, realistic mobile numbers (98/97 prefixes), and tailored test emails.

  Key Features:
  - **One-Click Form Filling**: Automatically detects form inputs on any webpage and fills them instantly.
  - **Framework Compatible**: Works seamlessly with React, Next.js, Vue, and Angular controlled inputs.
  - **Internally Consistent Addresses**: Matches real Nepal provinces, districts, municipalities, and ward numbers.
  - **Customizable Profiles & Categories**: Easily toggle personal, contact, address, and professional test datasets.
  - **100% Local & Private**: All data generation runs directly in your browser without transmitting sensitive form data.

- **Category**: Developer Tools
- **Version**: 0.1.0

## Permissions Justification

| Permission | Justification |
| :--- | :--- |
| `storage` | Required to save user preferences, selected profiles, and custom field mapping rules locally. |
| `activeTab` | Required to detect form fields and inject synthetic test data into the currently active tab when the user clicks "Fill Page". |
| `scripting` | Required to programmatically inject the form-filling engine if the page was loaded before the extension was installed. |

## Host Permissions
None. All form filling operates strictly through the user's explicit interaction via `activeTab`.

## Privacy & Data Use
- **Single Purpose**: Form autofilling with synthetic Nepal-focused test data.
- **Data Collection**: None. The extension does not collect, track, or transmit any user data or webpage form values.
- **Offline First**: All synthetic personas and address trees are generated completely offline using local algorithms.
