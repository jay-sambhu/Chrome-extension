import { FillOptions, FillResult, SupportedFieldType, SyntheticPerson } from '../types';
import { scanFormFields } from './detector';

/**
 * Triggers native value change compatible with React, Vue, Angular and standard DOM.
 */
export function setNativeValue(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string
): void {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
}

/**
 * Triggers native checked change for Checkbox and Radio elements.
 */
export function setNativeChecked(element: HTMLInputElement, checked: boolean): void {
  const checkedSetter = Object.getOwnPropertyDescriptor(element, 'checked')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'checked')?.set;

  if (prototypeValueSetter && checkedSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, checked);
  } else if (checkedSetter) {
    checkedSetter.call(element, checked);
  } else {
    element.checked = checked;
  }

  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
}


/**
 * Finds the closest matching option for a select element.
 */
function fillSelectElement(select: HTMLSelectElement, targetValue: string): boolean {
  const options = Array.from(select.options);
  if (options.length === 0) return false;

  const targetLower = targetValue.toLowerCase();

  // Try exact value or text match
  let matchedOption = options.find(
    (opt) => opt.value.toLowerCase() === targetLower || opt.text.toLowerCase().includes(targetLower)
  );

  // If no match, check for partial match
  if (!matchedOption) {
    matchedOption = options.find((opt) => {
      const optText = opt.text.toLowerCase();
      return targetLower.split(' ').some((word) => word.length > 3 && optText.includes(word));
    });
  }

  // If still no match and options exist (skipping empty placeholder first option if present)
  if (!matchedOption && options.length > 1) {
    matchedOption = options[1].value !== '' ? options[1] : options[options.length - 1];
  } else if (!matchedOption) {
    matchedOption = options[0];
  }

  if (matchedOption) {
    setNativeValue(select, matchedOption.value);
    return true;
  }

  return false;
}

/**
 * Determines whether a given field category should be filled based on user options.
 */
function isCategoryEnabled(fieldType: SupportedFieldType, options: FillOptions): boolean {
  const { fillCategories } = options;

  switch (fieldType) {
    case 'fullName':
    case 'firstName':
    case 'middleName':
    case 'lastName':
    case 'gender':
    case 'dateOfBirth':
    case 'age':
      return fillCategories.personal;

    case 'email':
    case 'phone':
    case 'telephone':
      return fillCategories.contact;

    case 'province':
    case 'district':
    case 'municipality':
    case 'ward':
    case 'tole':
    case 'address':
      return fillCategories.address;

    case 'occupation':
    case 'jobTitle':
    case 'designation':
    case 'department':
    case 'companyName':
    case 'employeeId':
    case 'panNumber':
    case 'vatNumber':
    case 'businessName':
    case 'school':
    case 'subject':
      return fillCategories.professional;

    case 'studentId':
    case 'guardianName':
    case 'guardianPhone':
    case 'citizenshipNumber':
    case 'nationalId':
      return fillCategories.personal;

    case 'username':
    case 'password':
    case 'number':
    case 'date':
    case 'text':
    case 'textarea':
    case 'url':
    case 'referenceNumber':
      return true;

    case 'unknown':
    default:
      return false;
  }
}

/**
 * Maps a detected field type to the corresponding value from the synthetic person.
 */
export function getFieldValue(type: SupportedFieldType, person: SyntheticPerson): string {
  switch (type) {
    case 'fullName':
      return person.fullName;
    case 'firstName':
      return person.firstName;
    case 'middleName':
      return person.middleName || '';
    case 'lastName':
      return person.lastName;
    case 'gender':
      return person.gender;
    case 'dateOfBirth':
      return person.dateOfBirth;
    case 'age':
      return person.age.toString();
    case 'email':
      return person.email;
    case 'phone':
      return person.phone;
    case 'telephone':
      return person.telephone;
    case 'province':
      return person.address.province;
    case 'district':
      return person.address.district;
    case 'municipality':
      return person.address.municipality;
    case 'ward':
      return person.address.ward.toString();
    case 'tole':
      return person.address.tole;
    case 'address':
      return person.address.fullAddress;
    case 'occupation':
      return person.occupation;
    case 'jobTitle':
      return person.jobTitle;
    case 'designation':
      return person.designation || person.jobTitle;
    case 'department':
      return person.department;
    case 'companyName':
      return person.companyName;
    case 'businessName':
      return person.businessName || person.companyName;
    case 'studentId':
      return person.studentId || 'STD-2026-1024';
    case 'school':
      return person.school || person.companyName;
    case 'guardianName':
      return person.guardianName || person.fullName;
    case 'guardianPhone':
      return person.guardianPhone || person.phone;
    case 'employeeId':
      return person.employeeId || 'EMP-10293';
    case 'panNumber':
      return person.panNumber || '102938475';
    case 'citizenshipNumber':
      return person.citizenshipNumber || `27-01-78-${Math.floor(10000 + Math.random() * 90000)}`;
    case 'nationalId':
      return person.nationalId || `NID-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    case 'vatNumber':
      return person.vatNumber || `VAT-${person.panNumber || '102938475'}`;
    case 'subject':
      return person.subject || 'Computer Science';
    case 'username':
      return person.username;
    case 'password':
      return person.password;

    case 'url':
      return `https://${person.username}.example.test`;
    case 'referenceNumber':
      return `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    case 'number':
      return Math.floor(10 + Math.random() * 90).toString();
    case 'date':
      return person.dateOfBirth;
    case 'textarea':
      return `Synthetic test profile for ${person.fullName}. Address: ${person.address.fullAddress}.`;
    case 'text':
      return person.fullName;
    default:
      return '';
  }
}

/**
 * Helper to fill a single DOM element based on resolved field type.
 */
function fillFieldElement(
  elem: HTMLElement,
  fieldType: SupportedFieldType,
  person: SyntheticPerson,
  fieldIdentifier: string | undefined,
  details: FillResult['details']
): boolean {
  const tagName = elem.tagName.toLowerCase();
  const inputType = (elem.getAttribute('type') || '').toLowerCase();

  // Handle Checkboxes & Radio buttons
  if (tagName === 'input' && (inputType === 'checkbox' || inputType === 'radio')) {
    const inputElem = elem as HTMLInputElement;
    if (fieldType === 'gender' && inputType === 'radio') {
      const val = inputElem.value.toLowerCase();
      const genderLower = person.gender.toLowerCase();
      if (val.includes(genderLower) || genderLower.includes(val)) {
        setNativeChecked(inputElem, true);
        details.push({ field: fieldIdentifier || 'radio_gender', type: fieldType, value: true });
        return true;
      }
    } else if (inputType === 'checkbox') {
      if (/terms|agree|policy/i.test(fieldIdentifier || '')) {
        setNativeChecked(inputElem, true);
        details.push({ field: fieldIdentifier || 'checkbox', type: fieldType, value: true });
        return true;
      }
    }
    return false;
  }

  // Handle Select elements
  if (tagName === 'select') {
    const selectElem = elem as HTMLSelectElement;
    const targetVal = getFieldValue(fieldType, person);
    if (targetVal && fillSelectElement(selectElem, targetVal)) {
      details.push({ field: fieldIdentifier || 'select', type: fieldType, value: targetVal });
      return true;
    }
    return false;
  }

  // Handle Input and Textarea elements
  if (tagName === 'input' || tagName === 'textarea') {
    const inputElem = elem as HTMLInputElement | HTMLTextAreaElement;
    const value = getFieldValue(fieldType, person);
    if (value) {
      setNativeValue(inputElem, value);
      details.push({ field: fieldIdentifier || 'input', type: fieldType, value });
      return true;
    }
  }

  return false;
}

/**
 * Fills detected fields on the webpage using the synthetic person and user options.
 * Runs 100% offline using local heuristic rule engine.
 */
export function fillPage(
  person: SyntheticPerson,
  options: FillOptions,
  root: Document | HTMLElement = document
): FillResult {
  const detected = scanFormFields(root);
  const details: FillResult['details'] = [];
  let fieldsFilledCount = 0;

  for (const field of detected) {
    if (!isCategoryEnabled(field.type, options)) {
      continue;
    }

    const filled = fillFieldElement(field.element, field.type, person, field.name || field.id, details);
    if (filled) {
      fieldsFilledCount++;
    }
  }

  return {
    success: true,
    fieldsFilledCount,
    details,
  };
}

/**
 * Asynchronous page filler that executes local detection first, and optionally
 * uses Gemini to classify unknown fields if opted-in and configured.
 */
export async function fillPageAsync(
  person: SyntheticPerson,
  options: FillOptions,
  geminiConfig?: import('../types').GeminiConfig,
  root: Document | HTMLElement = document
): Promise<FillResult> {
  const detected = scanFormFields(root);
  const details: FillResult['details'] = [];
  let fieldsFilledCount = 0;
  const unhandledUnknowns: typeof detected = [];

  for (const field of detected) {
    if (field.type !== 'unknown' && field.type !== 'text' && isCategoryEnabled(field.type, options)) {
      const filled = fillFieldElement(field.element, field.type, person, field.name || field.id, details);
      if (filled) fieldsFilledCount++;
    } else if (field.type === 'text' && field.confidence > 0.4 && isCategoryEnabled(field.type, options)) {
      const filled = fillFieldElement(field.element, field.type, person, field.name || field.id, details);
      if (filled) fieldsFilledCount++;
    } else {
      unhandledUnknowns.push(field);
    }
  }

  // If AI classification is enabled and configured, classify unhandled fields
  if (
    options.enableAiClassification &&
    geminiConfig?.enabled &&
    geminiConfig.apiKey &&
    unhandledUnknowns.length > 0
  ) {
    const { classifyUnknownField } = await import('../services/geminiClassifier');
    const domain =
      typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';

    for (const field of unhandledUnknowns) {
      const elem = field.element as HTMLInputElement;
      const payload: import('../types').FieldClassificationPayload = {
        domain,
        name: field.name,
        id: field.id,
        placeholder: elem.placeholder,
        label: field.label,
        type: elem.getAttribute('type') || elem.tagName.toLowerCase(),
      };

      const classification = await classifyUnknownField(payload, geminiConfig);
      if (classification.fieldType !== 'unknown' && isCategoryEnabled(classification.fieldType, options)) {
        const filled = fillFieldElement(
          field.element,
          classification.fieldType,
          person,
          field.name || field.id,
          details
        );
        if (filled) fieldsFilledCount++;
      }
    }
  }

  return {
    success: true,
    fieldsFilledCount,
    details,
  };
}
