import {
  FillOptions,
  FillResult,
  FillScript,
  PageFieldInspection,
  SupportedFieldType,
  SyntheticPerson,
} from '../types';
import { scanFormFields } from './detector';
import { FieldMappingRule, matchDomainRule } from '../services/domainMapping';
import {
  BS_MONTHS,
  detectDateFormat,
  formatBsDate,
  splitBsDate,
  syncCompanionDateInput,
  triggerNepaliDatepickerHooks,
} from '../generator/nepaliCalendar';
import { toEnglishNumerals, toNepaliNumerals } from '../generator/devanagariEngine';

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
  if (element.checked === checked) {
    return;
  }

  // Triggering click matches authentic user interaction in browsers/JSDOM
  element.click();

  if (element.checked !== checked) {
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
}


/**
 * Matches a select option against BS month names, aliases, and numbers.
 */
function matchBsMonthOption(
  options: HTMLOptionElement[],
  targetValue: string,
  altValue?: string
): HTMLOptionElement | undefined {
  const allTargets = [targetValue, altValue].filter(Boolean) as string[];
  const monthInfo = BS_MONTHS.find((m) =>
    allTargets.some((t) => {
      const tNorm = t.toLowerCase().trim();
      const tEng = toEnglishNumerals(tNorm);
      return (
        m.nameEn.toLowerCase() === tNorm ||
        m.nameNp === t.trim() ||
        m.number.toString() === tEng ||
        m.number.toString().padStart(2, '0') === tEng ||
        m.aliases.some((a) => a.toLowerCase() === tNorm)
      );
    })
  );

  if (!monthInfo) return undefined;

  return options.find((opt) => {
    const val = opt.value.trim();
    const text = opt.text.trim();
    const valEng = toEnglishNumerals(val);
    const textEng = toEnglishNumerals(text);
    const numStr = monthInfo.number.toString();
    const padNumStr = monthInfo.number.toString().padStart(2, '0');

    return (
      val.toLowerCase() === monthInfo.nameEn.toLowerCase() ||
      text.toLowerCase().includes(monthInfo.nameEn.toLowerCase()) ||
      val === monthInfo.nameNp ||
      text.includes(monthInfo.nameNp) ||
      valEng === numStr ||
      valEng === padNumStr ||
      textEng === numStr ||
      textEng === padNumStr ||
      monthInfo.aliases.some(
        (a) => val.toLowerCase() === a.toLowerCase() || text.toLowerCase().includes(a.toLowerCase())
      )
    );
  });
}

/**
 * Matches a select option against numeric values (years, days, wards) across English & Devanagari numerals.
 */
function matchNumericOption(
  options: HTMLOptionElement[],
  targetValue: string,
  altValue?: string
): HTMLOptionElement | undefined {
  const allTargets = [targetValue, altValue].filter(Boolean) as string[];
  const targetEngNums = allTargets
    .map((t) => toEnglishNumerals(t).replace(/[^0-9]/g, '').trim())
    .filter(Boolean);

  if (targetEngNums.length === 0) return undefined;

  for (const tNum of targetEngNums) {
    const cleanT = tNum.replace(/^0+/, '');
    const matched = options.find((opt) => {
      const valEng = toEnglishNumerals(opt.value).replace(/[^0-9]/g, '').replace(/^0+/, '').trim();
      const textEng = toEnglishNumerals(opt.text).replace(/[^0-9]/g, '').replace(/^0+/, '').trim();
      return (valEng && valEng === cleanT) || (textEng && textEng === cleanT);
    });
    if (matched) return matched;
  }

  return undefined;
}

/**
 * Matches a select option against driving license categories (A, B, K, motorcycle, car, etc.).
 */
function matchLicenseCategoryOption(
  options: HTMLOptionElement[],
  targetValue: string,
  altValue?: string
): HTMLOptionElement | undefined {
  const all = [targetValue, altValue].filter(Boolean) as string[];
  const isLicenseCat = all.some((s) => /category|वर्ग|motorcycle|car|scooter|license|सवारी/i.test(s));
  if (!isLicenseCat) return undefined;

  const catLetters: { en: string; np: string; keywords: string[] }[] = [
    { en: 'A', np: 'क', keywords: ['motorcycle', 'moped', 'bike', 'मोटरसाइकल'] },
    { en: 'B', np: 'ख', keywords: ['car', 'jeep', 'van', 'कार', 'भ्यान'] },
    { en: 'K', np: 'ट', keywords: ['scooter', 'स्कुटर'] },
  ];

  for (const cat of catLetters) {
    const matchesTarget = all.some((s) =>
      new RegExp(`(?:\\bcategory\\s*${cat.en}\\b|\\bवर्ग\\s*['"]?${cat.np}['"]?|\\b${cat.keywords.join('|')}\\b)`, 'i').test(s)
    );
    if (matchesTarget) {
      const found = options.find((opt) => {
        const val = opt.value.trim().toUpperCase();
        const text = opt.text.trim();
        return (
          val === cat.en ||
          val === cat.np ||
          text.includes(`Category ${cat.en}`) ||
          text.includes(`वर्ग ${cat.np}`) ||
          text.includes(`वर्ग '${cat.np}'`) ||
          cat.keywords.some((kw) => text.toLowerCase().includes(kw))
        );
      });
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Finds the closest matching option for a select element, supporting dual-script alternatives.
 */
function fillSelectElement(select: HTMLSelectElement, targetValue: string, altValue?: string): boolean {
  const options = Array.from(select.options);
  if (options.length === 0) return false;

  const targetLower = targetValue.toLowerCase();
  const altLower = altValue ? altValue.toLowerCase() : undefined;

  // 1. Try exact value or text match with primary target
  let matchedOption = options.find(
    (opt) => opt.value.toLowerCase() === targetLower || opt.text.toLowerCase().includes(targetLower)
  );

  // 2. If no match and alternative exists (e.g. English alternative for Devanagari or vice-versa)
  if (!matchedOption && altLower) {
    matchedOption = options.find(
      (opt) => opt.value.toLowerCase() === altLower || opt.text.toLowerCase().includes(altLower)
    );
  }

  // 3. BS Month option matching (Baishakh, बैशाख, 1, 01, etc.)
  if (!matchedOption) {
    matchedOption = matchBsMonthOption(options, targetValue, altValue);
  }

  // 4. Numeric option matching (years, days, wards across scripts)
  if (!matchedOption) {
    matchedOption = matchNumericOption(options, targetValue, altValue);
  }

  // 5. License Category option matching
  if (!matchedOption) {
    matchedOption = matchLicenseCategoryOption(options, targetValue, altValue);
  }

  // 5. Partial match with primary target
  if (!matchedOption) {
    matchedOption = options.find((opt) => {
      const optText = opt.text.toLowerCase();
      return targetLower.split(' ').some((word) => word.length > 3 && optText.includes(word));
    });
  }

  // 6. If still no match and options exist (skipping empty placeholder first option if present)
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
    case 'dateBS':
    case 'bsYear':
    case 'bsMonth':
    case 'bsDay':
    case 'age':
    case 'studentId':
    case 'school':
    case 'grade':
    case 'faculty':
    case 'guardianName':
    case 'guardianPhone':
    case 'citizenshipNumber':
    case 'citizenshipIssueDistrict':
    case 'citizenshipIssueDateBS':
    case 'citizenshipIssuedBy':
    case 'nationalId':
    case 'passportNumber':
    case 'passportIssueDate':
    case 'passportExpiryDate':
    case 'passportIssuedBy':
    case 'drivingLicenseNumber':
    case 'drivingLicenseCategory':
    case 'drivingLicenseIssueDate':
    case 'drivingLicenseExpiryDate':
      return fillCategories.personal;

    case 'email':
    case 'phone':
    case 'telephone':
      return fillCategories.contact;

    case 'province':
    case 'permanentProvince':
    case 'temporaryProvince':
    case 'currentProvince':
    case 'district':
    case 'permanentDistrict':
    case 'temporaryDistrict':
    case 'currentDistrict':
    case 'municipality':
    case 'permanentMunicipality':
    case 'temporaryMunicipality':
    case 'currentMunicipality':
    case 'ward':
    case 'permanentWard':
    case 'temporaryWard':
    case 'currentWard':
    case 'tole':
    case 'permanentTole':
    case 'temporaryTole':
    case 'currentTole':
    case 'address':
    case 'permanentAddress':
    case 'temporaryAddress':
    case 'currentAddress':
    case 'sameAsPermanent':
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
 * Maps a detected field type to the corresponding value from the synthetic person,
 * supporting both English and authentic Devanagari (नेपाली युनिकोड) scripts.
 */
export function getFieldValue(
  type: SupportedFieldType,
  person: SyntheticPerson,
  script?: FillScript,
  addressScope?: 'permanent' | 'temporary'
): string {
  const isTemporary =
    addressScope === 'temporary' ||
    type === 'temporaryAddress' ||
    type === 'currentAddress' ||
    type === 'temporaryProvince' ||
    type === 'currentProvince' ||
    type === 'temporaryDistrict' ||
    type === 'currentDistrict' ||
    type === 'temporaryMunicipality' ||
    type === 'currentMunicipality' ||
    type === 'temporaryWard' ||
    type === 'currentWard' ||
    type === 'temporaryTole' ||
    type === 'currentTole';

  if (script === 'np' && person.devanagari) {
    const dev = person.devanagari;
    switch (type) {
      case 'fullName':
        return dev.fullName;
      case 'firstName':
        return dev.firstName;
      case 'middleName':
        return dev.middleName || '';
      case 'lastName':
        return dev.lastName;
      case 'gender':
        return dev.gender;
      case 'province':
      case 'permanentProvince':
      case 'temporaryProvince':
      case 'currentProvince':
        return isTemporary
          ? dev.tempProvince || dev.currentProvince || dev.province
          : dev.permanentProvince || dev.province;
      case 'district':
      case 'permanentDistrict':
      case 'temporaryDistrict':
      case 'currentDistrict':
        return isTemporary
          ? dev.tempDistrict || dev.currentDistrict || dev.district
          : dev.permanentDistrict || dev.district;
      case 'municipality':
      case 'permanentMunicipality':
      case 'temporaryMunicipality':
      case 'currentMunicipality':
        return isTemporary
          ? dev.tempMunicipality || dev.currentMunicipality || dev.municipality
          : dev.permanentMunicipality || dev.municipality;
      case 'ward':
      case 'permanentWard':
      case 'temporaryWard':
      case 'currentWard': {
        const w = isTemporary
          ? dev.tempWard || dev.currentWard || dev.ward
          : dev.permanentWard || dev.ward;
        return w.replace('वडा नं. ', '');
      }
      case 'tole':
      case 'permanentTole':
      case 'temporaryTole':
      case 'currentTole':
        return isTemporary
          ? dev.tempTole || dev.currentTole || dev.tole
          : dev.permanentTole || dev.tole;
      case 'address':
      case 'permanentAddress':
      case 'temporaryAddress':
      case 'currentAddress':
        return isTemporary
          ? dev.tempFullAddress || dev.currentFullAddress || dev.fullAddress
          : dev.permanentFullAddress || dev.fullAddress;
      case 'occupation':
        return dev.occupation;
      case 'jobTitle':
        return dev.jobTitle;
      case 'designation':
        return dev.designation || dev.jobTitle;
      case 'department':
        return dev.department;
      case 'companyName':
        return dev.companyName;
      case 'businessName':
        return dev.businessName || dev.companyName;
      case 'businessType':
        return dev.businessType || 'प्राइभेट लिमिटेड';
      case 'school':
        return dev.school || dev.companyName;
      case 'grade':
        return dev.grade || 'स्नातक तह';
      case 'faculty':
        return dev.faculty || 'विज्ञान तथा प्रविधि संकाय';
      case 'guardianName':
        return dev.guardianName || dev.fullName;
      case 'cooperative':
        return dev.cooperative || 'साना किसान कृषि सहकारी संस्था लि.';
      case 'cropType':
        return dev.cropType || 'धान (Paddy)';
      case 'subject':
        return dev.subject || 'कम्प्युटर विज्ञान';
      case 'dateOfBirthBS':
      case 'dateBS': {
        const bsDate = person.dateOfBirthBS || '2055-01-15';
        return toNepaliNumerals(bsDate);
      }
      case 'bsYear': {
        const bsDate = person.dateOfBirthBS || '2055-01-15';
        return toNepaliNumerals(splitBsDate(bsDate).year);
      }
      case 'bsMonth': {
        const bsDate = person.dateOfBirthBS || '2055-01-15';
        return splitBsDate(bsDate).monthNameNp;
      }
      case 'bsDay': {
        const bsDate = person.dateOfBirthBS || '2055-01-15';
        return toNepaliNumerals(splitBsDate(bsDate).day);
      }
      case 'citizenshipNumber':
        return dev.citizenshipNumber || (person.citizenshipNumber ? toNepaliNumerals(person.citizenshipNumber) : '');
      case 'citizenshipIssueDistrict':
        return dev.citizenshipIssueDistrict || dev.permanentDistrict || dev.district;
      case 'citizenshipIssueDateBS':
        return dev.citizenshipIssueDateBS || (person.citizenshipIssueDateBS ? toNepaliNumerals(person.citizenshipIssueDateBS) : '');
      case 'citizenshipIssuedBy':
        return dev.citizenshipIssuedBy || 'जिल्ला प्रशासन कार्यालय';
      case 'nationalId':
        return dev.nationalId || (person.nationalId ? toNepaliNumerals(person.nationalId) : '');
      case 'passportNumber':
        return dev.passportNumber || person.passportNumber || '';
      case 'passportIssueDate':
        return dev.passportIssueDate || (person.passportIssueDate ? toNepaliNumerals(person.passportIssueDate) : '');
      case 'passportExpiryDate':
        return dev.passportExpiryDate || (person.passportExpiryDate ? toNepaliNumerals(person.passportExpiryDate) : '');
      case 'passportIssuedBy':
        return dev.passportIssuedBy || 'राहदानी विभाग';
      case 'drivingLicenseNumber':
        return dev.drivingLicenseNumber || (person.drivingLicenseNumber ? toNepaliNumerals(person.drivingLicenseNumber) : '');
      case 'drivingLicenseCategory':
        return dev.drivingLicenseCategory || person.drivingLicenseCategory || '';
      case 'drivingLicenseIssueDate':
        return dev.drivingLicenseIssueDate || (person.drivingLicenseIssueDate ? toNepaliNumerals(person.drivingLicenseIssueDate) : '');
      case 'drivingLicenseExpiryDate':
        return dev.drivingLicenseExpiryDate || (person.drivingLicenseExpiryDate ? toNepaliNumerals(person.drivingLicenseExpiryDate) : '');
      case 'textarea':
        return `${dev.fullName}को विवरण। ठेगाना: ${dev.fullAddress}। पेशा: ${dev.occupation}।`;
      case 'text':
        return dev.fullName;
    }
  }

  const targetAddress = isTemporary
    ? person.temporaryAddress || person.currentAddress || person.address
    : person.permanentAddress || person.address;

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
    case 'dateBS':
      return person.dateOfBirthBS || '2055-01-15';
    case 'bsYear': {
      const bsDate = person.dateOfBirthBS || '2055-01-15';
      return splitBsDate(bsDate).year;
    }
    case 'bsMonth': {
      const bsDate = person.dateOfBirthBS || '2055-01-15';
      return splitBsDate(bsDate).monthNameEn;
    }
    case 'bsDay': {
      const bsDate = person.dateOfBirthBS || '2055-01-15';
      return splitBsDate(bsDate).day;
    }
    case 'age':
      return person.age.toString();
    case 'email':
      return person.email;
    case 'phone':
      return person.phone;
    case 'telephone':
      return person.telephone;
    case 'province':
    case 'permanentProvince':
    case 'temporaryProvince':
    case 'currentProvince':
      return targetAddress.province;
    case 'district':
    case 'permanentDistrict':
    case 'temporaryDistrict':
    case 'currentDistrict':
      return targetAddress.district;
    case 'municipality':
    case 'permanentMunicipality':
    case 'temporaryMunicipality':
    case 'currentMunicipality':
      return targetAddress.municipality;
    case 'ward':
    case 'permanentWard':
    case 'temporaryWard':
    case 'currentWard':
      return targetAddress.ward.toString();
    case 'tole':
    case 'permanentTole':
    case 'temporaryTole':
    case 'currentTole':
      return targetAddress.tole;
    case 'address':
    case 'permanentAddress':
    case 'temporaryAddress':
    case 'currentAddress':
      return targetAddress.fullAddress;
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
    case 'citizenshipIssueDistrict':
      return person.citizenshipIssueDistrict || targetAddress.district;
    case 'citizenshipIssueDateBS':
      return person.citizenshipIssueDateBS || '2075-04-12';
    case 'citizenshipIssuedBy':
      return person.citizenshipIssuedBy || `District Administration Office, ${targetAddress.district}`;
    case 'nationalId':
      return person.nationalId || `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    case 'passportNumber':
      return person.passportNumber || 'PA1234567';
    case 'passportIssueDate':
      return person.passportIssueDate || '2020-05-15';
    case 'passportExpiryDate':
      return person.passportExpiryDate || '2030-05-14';
    case 'passportIssuedBy':
      return person.passportIssuedBy || 'Department of Passports, Kathmandu';
    case 'drivingLicenseNumber':
      return person.drivingLicenseNumber || '01-06-00123456';
    case 'drivingLicenseCategory':
      return person.drivingLicenseCategory || 'Category B: Car/Jeep/Van';
    case 'drivingLicenseIssueDate':
      return person.drivingLicenseIssueDate || '2021-03-10';
    case 'drivingLicenseExpiryDate':
      return person.drivingLicenseExpiryDate || '2026-03-09';
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
  details: FillResult['details'],
  script?: FillScript,
  addressScope?: 'permanent' | 'temporary'
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
      const matchGender =
        text.includes(person.gender.toLowerCase()) ||
        (person.devanagari && text.includes(person.devanagari.gender.toLowerCase()));
      if (matchGender) {
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
      const devGender = person.devanagari?.gender.toLowerCase();
      if (
        val.includes(genderLower) ||
        genderLower.includes(val) ||
        (devGender && (val.includes(devGender) || devGender.includes(val)))
      ) {
        setNativeChecked(inputElem, true);
        details.push({ field: fieldIdentifier || 'radio_gender', type: fieldType, value: true });
        return true;
      }
    } else if (inputType === 'checkbox') {
      if (
        fieldType === 'sameAsPermanent' ||
        /(?:same\s*as\s*(?:perm|permanent|sthayi|sthayee)|sameaspermanent|same_as_permanent|same_as_perm|same_perm|copy_permanent|same_address|sthayi_saraha|sthayee_sara)\b|स्थायी\s*(?:ठेगाना\s*)?(?:अनुसार|जस्तै|सरह)|हालको\s*ठेगाना\s*स्थायी\s*सरह/i.test(
          fieldIdentifier || ''
        ) ||
        /(?:same\s*as\s*(?:perm|permanent)|sameaspermanent|same_as_permanent)/i.test(
          `${elem.id || ''} ${elem.getAttribute('name') || ''} ${elem.getAttribute('aria-label') || ''}`
        )
      ) {
        setNativeChecked(inputElem, true);
        details.push({ field: fieldIdentifier || 'same_as_permanent', type: 'sameAsPermanent', value: true });
        return true;
      } else if (/terms|agree|policy/i.test(fieldIdentifier || '')) {
        setNativeChecked(inputElem, true);
        details.push({ field: fieldIdentifier || 'checkbox', type: fieldType, value: true });
        return true;
      }
    }
    return false;
  }

  // Handle BS Datepicker inputs (custom format detection, Nepali datepicker hooks, companion sync)
  if (fieldType === 'dateBS' || fieldType === 'dateOfBirthBS') {
    const bsDate = person.dateOfBirthBS || '2055-01-15';
    const format = detectDateFormat(elem);
    const targetScript = script === 'np' ? 'np' : 'en';
    const formattedBsDate = formatBsDate(bsDate, { format, script: targetScript });

    if (tagName === 'input') {
      const inputElem = elem as HTMLInputElement;
      setNativeValue(inputElem, formattedBsDate);
      triggerNepaliDatepickerHooks(inputElem, formattedBsDate, person.dateOfBirth);
      details.push({ field: fieldIdentifier || 'date_bs', type: fieldType, value: formattedBsDate });
      return true;
    }
  }

  const primaryValue = getFieldValue(fieldType, person, script, addressScope);
  const altValue =
    script === 'np'
      ? getFieldValue(fieldType, person, 'en', addressScope)
      : getFieldValue(fieldType, person, 'np', addressScope);

  // Handle Select elements
  if (tagName === 'select') {
    const selectElem = elem as HTMLSelectElement;
    if (primaryValue && fillSelectElement(selectElem, primaryValue, altValue)) {
      details.push({ field: fieldIdentifier || 'select', type: fieldType, value: primaryValue });
      return true;
    }
    return false;
  }

  // Handle Combobox / React-Select / Ant Design / MUI Autocomplete search input
  if (role === 'combobox' || elem.hasAttribute('aria-autocomplete') || elem.classList.contains('ant-select-selection-search-input')) {
    if (primaryValue) {
      setNativeValue(elem as HTMLInputElement, primaryValue);
      elem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }));
      elem.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }));
      details.push({ field: fieldIdentifier || 'combobox', type: fieldType, value: primaryValue });
      return true;
    }
  }

  // Handle Standard Input and Textarea elements
  if (tagName === 'input' || tagName === 'textarea') {
    const inputElem = elem as HTMLInputElement | HTMLTextAreaElement;
    if (primaryValue) {
      setNativeValue(inputElem, primaryValue);
      if (tagName === 'input' && (fieldType === 'dateOfBirth' || fieldType === 'date')) {
        syncCompanionDateInput(inputElem as HTMLInputElement, person.dateOfBirthBS || '2055-01-15', 'bs');
      }
      details.push({ field: fieldIdentifier || 'input', type: fieldType, value: primaryValue });
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

    const targetScript = field.script || options.fillScript || options.script || 'en';
    const filled = fillFieldElement(
      field.element,
      resolvedType,
      person,
      field.name || field.id,
      details,
      targetScript,
      field.addressScope
    );
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
    const targetScript = field.script || options.fillScript || options.script || 'en';

    // 1. Check custom domain mapping overrides first (Highest priority!)
    const rule = matchDomainRule(field.element, domainRules);
    if (rule) {
      if (isCategoryEnabled(rule.targetType, options)) {
        const filled = fillFieldElement(
          field.element,
          rule.targetType,
          person,
          field.name || field.id,
          details,
          targetScript,
          field.addressScope
        );
        if (filled) fieldsFilledCount++;
      }
      continue;
    }

    // 2. Rule-based local heuristic detector
    if (field.type !== 'unknown' && field.type !== 'text' && isCategoryEnabled(field.type, options)) {
      const filled = fillFieldElement(
        field.element,
        field.type,
        person,
        field.name || field.id,
        details,
        targetScript,
        field.addressScope
      );
      if (filled) fieldsFilledCount++;
    } else if (field.type === 'text' && field.confidence > 0.4 && isCategoryEnabled(field.type, options)) {
      const filled = fillFieldElement(
        field.element,
        field.type,
        person,
        field.name || field.id,
        details,
        targetScript,
        field.addressScope
      );
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
        const targetScript = field.script || options.fillScript || options.script || 'en';
        const filled = fillFieldElement(
          field.element,
          classification.fieldType,
          person,
          field.name || field.id,
          details,
          targetScript
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
