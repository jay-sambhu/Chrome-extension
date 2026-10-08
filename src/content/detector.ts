import { DetectedField } from '../types';

export function getFieldLabel(element: HTMLElement): string {
  // 1. Explicit <label for="id">
  if (element.id) {
    const labelElem = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (labelElem && labelElem.textContent) {
      return labelElem.textContent.trim();
    }
  }

  // 2. Enclosing <label>
  const parentLabel = element.closest('label');
  if (parentLabel && parentLabel.textContent) {
    return parentLabel.textContent.trim();
  }

  // 3. aria-label or aria-labelledby
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel.trim();
  }

  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelledByElem = document.getElementById(ariaLabelledBy);
    if (labelledByElem && labelledByElem.textContent) {
      return labelledByElem.textContent.trim();
    }
  }

  // 4. Preceding sibling or nearby text (within container)
  const prevSibling = element.previousElementSibling;
  if (prevSibling && prevSibling.textContent && prevSibling.textContent.length < 50) {
    return prevSibling.textContent.trim();
  }

  return '';
}

export function extractFieldSignals(element: HTMLElement): string {
  const label = getFieldLabel(element);
  const name = element.getAttribute('name') || '';
  const id = element.getAttribute('id') || '';
  const placeholder = element.getAttribute('placeholder') || '';
  const autocomplete = element.getAttribute('autocomplete') || '';
  const title = element.getAttribute('title') || '';
  const className = typeof element.className === 'string' ? element.className : '';

  const raw = `${label} ${name} ${id} ${placeholder} ${autocomplete} ${title} ${className}`;
  return raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._\-]/g, ' ')
    .toLowerCase();
}


export function detectFieldType(element: HTMLElement): DetectedField {
  const tagName = element.tagName.toLowerCase();
  const inputType = (element.getAttribute('type') || (tagName === 'textarea' ? 'textarea' : 'text')).toLowerCase();
  const signals = extractFieldSignals(element);
  const label = getFieldLabel(element);
  const name = element.getAttribute('name') || undefined;
  const id = element.getAttribute('id') || undefined;

  // 1. Password detection
  if (inputType === 'password' || /password|pwd|passcode/i.test(signals)) {
    return { element, type: 'password', confidence: 0.99, label, name, id };
  }

  // 2. Email detection
  if (inputType === 'email' || /\b(email|e-mail|mail)\b/i.test(signals)) {
    return { element, type: 'email', confidence: 0.98, label, name, id };
  }

  // 3. Telephone / Landline detection
  if (/\b(telephone|landline|tel\s*num(ber)?)\b/i.test(signals)) {
    return { element, type: 'telephone', confidence: 0.95, label, name, id };
  }

  // 4. Mobile / Phone detection
  if (
    inputType === 'tel' ||
    /\b(mobile|cellphone|phone|contact\s*num(ber)?|whatsapp)\b/i.test(signals)
  ) {
    return { element, type: 'phone', confidence: 0.95, label, name, id };
  }


  // 4. Date of Birth & Age
  if (
    /\b(dob|birth[-_\s]?date|date[-_\s]?of[-_\s]?birth|birth[-_\s]?day)\b/i.test(signals) ||
    (inputType === 'date' && /birth/i.test(signals))
  ) {
    return { element, type: 'dateOfBirth', confidence: 0.95, label, name, id };
  }

  if (/\b(age|umar|umer)\b/i.test(signals) && !/stage|message|agent|image/i.test(signals)) {
    return { element, type: 'age', confidence: 0.9, label, name, id };
  }

  // 5. Gender
  if (/\b(gender|sex|linga)\b/i.test(signals)) {
    return { element, type: 'gender', confidence: 0.95, label, name, id };
  }

  // 6. Name variants (First, Middle, Last, Full)
  if (/\b(first[-_\s]?name|given[-_\s]?name|fname|pehelo[-_\s]?naam)\b/i.test(signals)) {
    return { element, type: 'firstName', confidence: 0.95, label, name, id };
  }

  if (/\b(middle[-_\s]?name|mname|bichko[-_\s]?naam)\b/i.test(signals)) {
    return { element, type: 'middleName', confidence: 0.95, label, name, id };
  }

  if (/\b(last[-_\s]?name|surname|family[-_\s]?name|lname|thar)\b/i.test(signals)) {
    return { element, type: 'lastName', confidence: 0.95, label, name, id };
  }

  if (
    /\b(full[-_\s]?name|name|your[-_\s]?name|applicant[-_\s]?name|customer[-_\s]?name|employee[-_\s]?name|naam)\b/i.test(signals) &&
    !/user[-_\s]?name|company[-_\s]?name|domain[-_\s]?name|file[-_\s]?name/i.test(signals)
  ) {
    return { element, type: 'fullName', confidence: 0.9, label, name, id };
  }

  // 7. Nepal Address components
  if (/\b(province|pradesh|state)\b/i.test(signals)) {
    return { element, type: 'province', confidence: 0.95, label, name, id };
  }

  if (/\b(district|jilla)\b/i.test(signals)) {
    return { element, type: 'district', confidence: 0.95, label, name, id };
  }

  if (/\b(municipality|nagarpalika|gaupalika|metro|sub[-_\s]?metro|city|local[-_\s]?level)\b/i.test(signals)) {
    return { element, type: 'municipality', confidence: 0.95, label, name, id };
  }

  if (/\b(ward|wada|ward[-_\s]?no|ward[-_\s]?num(ber)?)\b/i.test(signals)) {
    return { element, type: 'ward', confidence: 0.95, label, name, id };
  }

  if (/\b(tole|chowk|street|road|marga)\b/i.test(signals)) {
    return { element, type: 'tole', confidence: 0.9, label, name, id };
  }

  if (/\b(address|thegana|location|residential[-_\s]?address|permanent[-_\s]?address|temporary[-_\s]?address)\b/i.test(signals)) {
    return { element, type: 'address', confidence: 0.92, label, name, id };
  }

  // 8. Professional / Employment
  if (/\b(occupation|profession|pesha)\b/i.test(signals)) {
    return { element, type: 'occupation', confidence: 0.9, label, name, id };
  }

  if (/\b(job[-_\s]?title|designation|position|role)\b/i.test(signals)) {
    return { element, type: 'jobTitle', confidence: 0.9, label, name, id };
  }

  if (/\b(department|dept)\b/i.test(signals)) {
    return { element, type: 'department', confidence: 0.9, label, name, id };
  }

  if (/\b(company|organization|organisation|employer|workplace|institution)\b/i.test(signals)) {
    return { element, type: 'companyName', confidence: 0.9, label, name, id };
  }

  // 9. Username / General credentials
  if (/\b(username|user[-_\s]?id|login[-_\s]?id|handle)\b/i.test(signals)) {
    return { element, type: 'username', confidence: 0.9, label, name, id };
  }

  // 10. URL
  if (inputType === 'url' || /\b(website|url|homepage|web[-_\s]?link)\b/i.test(signals)) {
    return { element, type: 'url', confidence: 0.9, label, name, id };
  }

  // 11. Reference Number
  if (/\b(ref[-_\s]?no|reference[-_\s]?(num|number|code)|cust[-_\s]?ref)\b/i.test(signals)) {
    return { element, type: 'referenceNumber', confidence: 0.85, label, name, id };
  }

  // 12. Generic HTML5 type mappings
  if (inputType === 'number') {
    return { element, type: 'number', confidence: 0.7, label, name, id };
  }

  if (inputType === 'date') {
    return { element, type: 'date', confidence: 0.7, label, name, id };
  }

  if (tagName === 'textarea' || inputType === 'textarea') {
    return { element, type: 'textarea', confidence: 0.6, label, name, id };
  }

  if (inputType === 'text') {
    return { element, type: 'text', confidence: 0.5, label, name, id };
  }

  return { element, type: 'unknown', confidence: 0.0, label, name, id };
}

export function scanFormFields(root: Document | HTMLElement = document): DetectedField[] {
  const selector = 'input:not([type="hidden"]):not([type="submit"]):not([type="reset"]):not([type="button"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';
  const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));

  return elements.map(detectFieldType);
}
