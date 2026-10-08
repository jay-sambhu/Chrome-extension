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
 * Fills detected fields on the webpage using the synthetic person and user options.
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

    const elem = field.element;
    const tagName = elem.tagName.toLowerCase();
    const inputType = (elem.getAttribute('type') || '').toLowerCase();

    // Handle Checkboxes & Radio buttons
    if (tagName === 'input' && (inputType === 'checkbox' || inputType === 'radio')) {
      const inputElem = elem as HTMLInputElement;
      if (field.type === 'gender' && inputType === 'radio') {
        const val = inputElem.value.toLowerCase();
        const genderLower = person.gender.toLowerCase();
        if (val.includes(genderLower) || genderLower.includes(val)) {
          setNativeChecked(inputElem, true);
          fieldsFilledCount++;
          details.push({ field: field.name || field.id || 'radio_gender', type: field.type, value: true });
        }
      } else if (inputType === 'checkbox') {
        // Only check if terms or general agreement
        if (/terms|agree|policy/i.test(field.name || field.id || '')) {
          setNativeChecked(inputElem, true);
          fieldsFilledCount++;
          details.push({ field: field.name || field.id || 'checkbox', type: field.type, value: true });
        }
      }
      continue;
    }

    // Handle Select elements
    if (tagName === 'select') {
      const selectElem = elem as HTMLSelectElement;
      const targetVal = getFieldValue(field.type, person);
      if (targetVal && fillSelectElement(selectElem, targetVal)) {
        fieldsFilledCount++;
        details.push({ field: field.name || field.id || 'select', type: field.type, value: targetVal });
      }
      continue;
    }

    // Handle Input and Textarea elements
    if (tagName === 'input' || tagName === 'textarea') {
      const inputElem = elem as HTMLInputElement | HTMLTextAreaElement;
      const value = getFieldValue(field.type, person);
      if (value) {
        setNativeValue(inputElem, value);
        fieldsFilledCount++;
        details.push({ field: field.name || field.id || 'input', type: field.type, value });
      }
    }
  }

  return {
    success: true,
    fieldsFilledCount,
    details,
  };
}
