import {
  FillOptions,
  FillResult,
  PageFieldInspection,
  SupportedFieldType,
  SyntheticPerson,
} from '../types';
import { scanFormFields } from './detector';
import { FieldMappingRule, matchDomainRule } from '../services/domainMapping';

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
    case 'dateOfBirthBS':
    case 'age':
    case 'studentId':
    case 'school':
    case 'grade':
    case 'faculty':
    case 'guardianName':
    case 'guardianPhone':
    case 'citizenshipNumber':
    case 'nationalId':
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
    case 'salary':
    case 'businessName':
    case 'businessType':
    case 'cooperative':
    case 'cropType':
    case 'subject':
      return fillCategories.professional;

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
    case 'dateOfBirthBS':
      return person.dateOfBirthBS || '2055-01-15';
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
    case 'businessType':
      return person.businessType || 'Private Limited';
    case 'studentId':
      return person.studentId || 'STD-2026-1024';
    case 'school':
      return person.school || person.companyName;
    case 'grade':
      return person.grade || 'Bachelors Degree';
    case 'faculty':
      return person.faculty || 'Faculty of Science & Technology';
    case 'guardianName':
      return person.guardianName || person.fullName;
    case 'guardianPhone':
      return person.guardianPhone || person.phone;
    case 'employeeId':
      return person.employeeId || 'EMP-10293';
    case 'salary':
      return person.salary || '45,000 NPR';
    case 'panNumber':
      return person.panNumber || '102938475';
    case 'citizenshipNumber':
      return person.citizenshipNumber || `27-01-78-${Math.floor(10000 + Math.random() * 90000)}`;
    case 'nationalId':
      return person.nationalId || `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    case 'vatNumber':
      return person.vatNumber || (person.panNumber ? `VAT-${person.panNumber}` : 'VAT-102938475');
    case 'cooperative':
      return person.cooperative || 'Small Farmers Agriculture Cooperative Ltd.';
    case 'cropType':
      return person.cropType || 'Paddy (Dhan)';
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
  const role = elem.getAttribute('role') || '';

  // Handle Custom ARIA Checkbox & Radio
  if (role === 'checkbox') {
    elem.setAttribute('aria-checked', 'true');
    elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    details.push({ field: fieldIdentifier || 'custom_checkbox', type: fieldType, value: true });
    return true;
  }
  if (role === 'radio') {
    if (fieldType === 'gender') {
      const text = (elem.textContent || elem.getAttribute('value') || elem.getAttribute('aria-label') || '').toLowerCase();
      if (text.includes(person.gender.toLowerCase())) {
        elem.setAttribute('aria-checked', 'true');
        elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        details.push({ field: fieldIdentifier || 'custom_radio_gender', type: fieldType, value: true });
        return true;
      }
    }
  }

  // Handle HTML5 Checkboxes & Radio buttons
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

  // Handle Combobox / React-Select / Ant Design / MUI Autocomplete search input
  if (role === 'combobox' || elem.hasAttribute('aria-autocomplete') || elem.classList.contains('ant-select-selection-search-input')) {
    const value = getFieldValue(fieldType, person);
    if (value) {
      setNativeValue(elem as HTMLInputElement, value);
      elem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }));
      elem.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }));
      details.push({ field: fieldIdentifier || 'combobox', type: fieldType, value });
      return true;
    }
  }

  // Handle Standard Input and Textarea elements
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
 * Inspects all interactive form fields on the page, categorizing each field
 * according to the strict precedence hierarchy:
 * 1. Custom Domain Mapping Override
 * 2. Heuristic Rule-Based Detector
 * 3. Unmapped / Generic Fallback
 */
export function inspectPageFields(
  root: Document | HTMLElement = document,
  domainRules: FieldMappingRule[] = []
): PageFieldInspection[] {
  const detected = scanFormFields(root);
  const inspections: PageFieldInspection[] = [];

  detected.forEach((field, index) => {
    const elem = field.element as HTMLInputElement;
    const rule = matchDomainRule(elem, domainRules);

    if (rule) {
      inspections.push({
        index,
        name: field.name,
        id: field.id,
        placeholder: elem.placeholder,
        label: field.label,
        type: elem.getAttribute('type') || elem.tagName.toLowerCase(),
        detectedType: rule.targetType,
        confidence: 1.0,
        source: 'domain_override',
      });
    } else if (field.type !== 'unknown' && field.type !== 'text') {
      inspections.push({
        index,
        name: field.name,
        id: field.id,
        placeholder: elem.placeholder,
        label: field.label,
        type: elem.getAttribute('type') || elem.tagName.toLowerCase(),
        detectedType: field.type,
        confidence: field.confidence,
        source: 'heuristic',
      });
    } else if (field.type === 'text' && field.confidence > 0.4) {
      inspections.push({
        index,
        name: field.name,
        id: field.id,
        placeholder: elem.placeholder,
        label: field.label,
        type: elem.getAttribute('type') || elem.tagName.toLowerCase(),
        detectedType: field.type,
        confidence: field.confidence,
        source: 'heuristic',
      });
    } else {
      inspections.push({
        index,
        name: field.name,
        id: field.id,
        placeholder: elem.placeholder,
        label: field.label,
        type: elem.getAttribute('type') || elem.tagName.toLowerCase(),
        detectedType: 'unknown',
        confidence: 0,
        source: 'unmapped',
      });
    }
  });

  return inspections;
}

/**
 * Fills detected fields on the webpage using the synthetic person and user options.
 * Runs 100% offline using local heuristic rule engine and domain-specific rules.
 */
export function fillPage(
  person: SyntheticPerson,
  options: FillOptions,
  root: Document | HTMLElement = document,
  domainRules: FieldMappingRule[] = []
): FillResult {
  const detected = scanFormFields(root);
  const details: FillResult['details'] = [];
  let fieldsFilledCount = 0;

  for (const field of detected) {
    // 1. Check custom domain mapping overrides first (Highest priority!)
    const rule = matchDomainRule(field.element, domainRules);
    const resolvedType = rule ? rule.targetType : field.type;

    if (!isCategoryEnabled(resolvedType, options)) {
      continue;
    }

    const filled = fillFieldElement(field.element, resolvedType, person, field.name || field.id, details);
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
 * Asynchronous page filler that executes:
 * 1. Custom Domain Mapping Overrides (Highest priority)
 * 2. Local Heuristic Detection
 * 3. Optional Gemini AI classification for unhandled unknowns
 */
export async function fillPageAsync(
  person: SyntheticPerson,
  options: FillOptions,
  geminiConfig?: import('../types').GeminiConfig,
  root: Document | HTMLElement = document,
  domainRules: FieldMappingRule[] = []
): Promise<FillResult> {
  const detected = scanFormFields(root);
  const details: FillResult['details'] = [];
  let fieldsFilledCount = 0;
  const unhandledUnknowns: typeof detected = [];

  for (const field of detected) {
    // 1. Check custom domain mapping overrides first (Highest priority!)
    const rule = matchDomainRule(field.element, domainRules);
    if (rule) {
      if (isCategoryEnabled(rule.targetType, options)) {
        const filled = fillFieldElement(field.element, rule.targetType, person, field.name || field.id, details);
        if (filled) fieldsFilledCount++;
      }
      continue;
    }

    // 2. Rule-based local heuristic detector
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

  // 3. Optional Gemini AI classification for remaining unhandled fields
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
