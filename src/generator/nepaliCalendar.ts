import { toNepaliNumerals } from './devanagariEngine';

export interface BsMonthInfo {
  number: number; // 1 to 12
  nameEn: string;
  nameNp: string;
  aliases: string[];
}

export const BS_MONTHS: BsMonthInfo[] = [
  { number: 1, nameEn: 'Baishakh', nameNp: 'बैशाख', aliases: ['baishakh', 'baisakh', 'vaishakh', 'वैशाख', 'बैशाख'] },
  { number: 2, nameEn: 'Jestha', nameNp: 'जेठ', aliases: ['jestha', 'jeth', 'ज्येष्ठ', 'जेठ'] },
  { number: 3, nameEn: 'Ashadh', nameNp: 'असार', aliases: ['ashadh', 'asar', 'aashadh', 'आषाढ', 'असार'] },
  { number: 4, nameEn: 'Shrawan', nameNp: 'साउन', aliases: ['shrawan', 'saun', 'sawan', 'श्रावण', 'साउन'] },
  { number: 5, nameEn: 'Bhadra', nameNp: 'भदौ', aliases: ['bhadra', 'bhadau', 'भाद्र', 'भदौ'] },
  { number: 6, nameEn: 'Ashwin', nameNp: 'असोज', aliases: ['ashwin', 'asoj', 'aswin', 'आश्विन', 'असोज'] },
  { number: 7, nameEn: 'Kartik', nameNp: 'कार्तिक', aliases: ['kartik', 'katik', 'कार्तिक'] },
  { number: 8, nameEn: 'Mangsir', nameNp: 'मंसिर', aliases: ['mangsir', 'mansir', 'margashirsha', 'मार्ग', 'मंसिर'] },
  { number: 9, nameEn: 'Poush', nameNp: 'पुस', aliases: ['poush', 'paush', 'pus', 'पौष', 'पुस'] },
  { number: 10, nameEn: 'Magh', nameNp: 'माघ', aliases: ['magh', 'माघ'] },
  { number: 11, nameEn: 'Falgun', nameNp: 'फागुन', aliases: ['falgun', 'phagun', 'फाल्गुन', 'फागुन'] },
  { number: 12, nameEn: 'Chaitra', nameNp: 'चैत', aliases: ['chaitra', 'chait', 'चैत्र', 'चैत'] },
];

/**
 * Converts AD YYYY-MM-DD date to approximate Nepali Bikram Sambat (BS) YYYY-MM-DD.
 * Nepal BS calendar is approximately +56.7 years ahead (Baishakh 1 aligns with mid-April).
 */
export function convertAdToBs(adDateStr: string): string {
  const parts = adDateStr.split('-');
  if (parts.length !== 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';

  const isAfterNewYear = month > 4 || (month === 4 && day >= 14);
  const bsYear = isAfterNewYear ? year + 57 : year + 56;
  const bsMonth = ((month - 4 + 12) % 12) + 1;
  const bsDay = Math.min(day, 30);

  const bsMonthStr = bsMonth.toString().padStart(2, '0');
  const bsDayStr = bsDay.toString().padStart(2, '0');
  return `${bsYear}-${bsMonthStr}-${bsDayStr}`;
}

export type BsDateFormat = 'YYYY-MM-DD' | 'YYYY/MM/DD' | 'DD/MM/YYYY' | 'DD-MM-YYYY';

/**
 * Splits a standard BS date string (YYYY-MM-DD) into components and month names.
 */
export function splitBsDate(bsDateStr: string): {
  year: string;
  month: string;
  day: string;
  monthNum: number;
  monthNameEn: string;
  monthNameNp: string;
} {
  const clean = bsDateStr.replace(/[.\/]/g, '-');
  const parts = clean.split('-');
  const year = parts[0] || '2055';
  const month = (parts[1] || '01').padStart(2, '0');
  const day = (parts[2] || '15').padStart(2, '0');
  const monthNum = parseInt(month, 10);

  const monthInfo = BS_MONTHS[Math.max(0, Math.min(11, monthNum - 1))];

  return {
    year,
    month,
    day,
    monthNum,
    monthNameEn: monthInfo.nameEn,
    monthNameNp: monthInfo.nameNp,
  };
}

/**
 * Detects expected date format from element placeholder, pattern, or attributes.
 */
export function detectDateFormat(element: HTMLElement): BsDateFormat {
  const placeholder = (element.getAttribute('placeholder') || '').toUpperCase();
  const pattern = (element.getAttribute('pattern') || '').toUpperCase();
  const dataFormat = (
    element.getAttribute('data-format') ||
    element.getAttribute('data-date-format') ||
    ''
  ).toUpperCase();

  const signals = `${placeholder} ${pattern} ${dataFormat}`;

  if (signals.includes('DD/MM/YYYY') || signals.includes('DD/MM/YY')) {
    return 'DD/MM/YYYY';
  }
  if (signals.includes('DD-MM-YYYY') || signals.includes('DD-MM-YY')) {
    return 'DD-MM-YYYY';
  }
  if (signals.includes('YYYY/MM/DD') || signals.includes('/') || signals.includes('२०००/००/००')) {
    return 'YYYY/MM/DD';
  }
  return 'YYYY-MM-DD';
}

/**
 * Formats a BS date according to desired layout and script (English vs Devanagari numerals).
 */
export function formatBsDate(
  bsDateStr: string,
  options?: {
    format?: BsDateFormat;
    script?: 'en' | 'np';
  }
): string {
  const { year, month, day } = splitBsDate(bsDateStr);
  const format = options?.format || 'YYYY-MM-DD';
  const script = options?.script || 'en';

  let result = '';
  switch (format) {
    case 'YYYY/MM/DD':
      result = `${year}/${month}/${day}`;
      break;
    case 'DD/MM/YYYY':
      result = `${day}/${month}/${year}`;
      break;
    case 'DD-MM-YYYY':
      result = `${day}-${month}-${year}`;
      break;
    case 'YYYY-MM-DD':
    default:
      result = `${year}-${month}-${day}`;
      break;
  }

  if (script === 'np') {
    return toNepaliNumerals(result);
  }
  return result;
}

/**
 * Synchronizes companion hidden or paired date inputs (e.g. AD <-> BS companion fields).
 */
export function syncCompanionDateInput(
  element: HTMLInputElement,
  dateValue: string,
  targetType: 'ad' | 'bs'
): void {
  const form = element.closest('form') || element.parentElement;
  if (!form || !dateValue) return;

  const rawName = element.name || element.id || '';
  const baseName = rawName.replace(/_?(?:bs|ad|eng|nepali)$/i, '');

  const selectors =
    targetType === 'ad'
      ? [
          baseName ? `input[name="${baseName}_ad"]` : '',
          baseName ? `input[name="${baseName}Ad"]` : '',
          baseName ? `input[name="${baseName}_eng"]` : '',
          baseName ? `input[name="${baseName}_english"]` : '',
          baseName ? `input[id="${baseName}_ad"]` : '',
          baseName ? `input[id="${baseName}Ad"]` : '',
          baseName ? `input[id="${baseName}_eng"]` : '',
          baseName ? `input[id="${baseName}_english"]` : '',
          'input[data-english-date]',
          'input[data-ad-date]',
          'input[data-ad-target]',
        ].filter(Boolean)
      : [
          baseName ? `input[name="${baseName}_bs"]` : '',
          baseName ? `input[name="${baseName}Bs"]` : '',
          baseName ? `input[name="${baseName}_nep"]` : '',
          baseName ? `input[name="${baseName}_nepali"]` : '',
          baseName ? `input[id="${baseName}_bs"]` : '',
          baseName ? `input[id="${baseName}Bs"]` : '',
          baseName ? `input[id="${baseName}_nep"]` : '',
          baseName ? `input[id="${baseName}_nepali"]` : '',
          'input[data-nepali-date]',
          'input[data-bs-date]',
          'input[data-bs-target]',
        ].filter(Boolean);

  const companion = form.querySelector<HTMLInputElement>(selectors.join(', '));
  if (companion && companion !== element && (!companion.value || companion.type === 'hidden')) {
    companion.value = dateValue;
    companion.dispatchEvent(new Event('input', { bubbles: true }));
    companion.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

/**
 * Dispatches events and triggers library hooks for popular Nepali datepicker widgets:
 * - nepali.datepicker.v4.min.js / nepali-date-picker
 * - Hamro Patro calendar widgets
 * - jQuery Nepali Datepicker plugins
 */
export function triggerNepaliDatepickerHooks(
  element: HTMLInputElement,
  formattedBsDate: string,
  adDate?: string
): void {
  // 1. Dispatch DOM events listened to by datepicker plugins
  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new CustomEvent('dateSelect', { detail: { date: formattedBsDate }, bubbles: true }));
  element.dispatchEvent(new CustomEvent('nepaliDatePicker.change', { detail: { date: formattedBsDate }, bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));

  // 2. jQuery integration if present on window
  try {
    const win = element.ownerDocument.defaultView as any;
    if (win && typeof win.$ === 'function') {
      const $elem = win.$(element);
      if ($elem && typeof $elem.trigger === 'function') {
        $elem.trigger('change');
        $elem.trigger('nepaliDatePicker.change', [formattedBsDate]);
      }
    }
  } catch {
    // Non-blocking
  }

  // 3. Sibling/Companion Hidden Field Synchronization
  if (adDate) {
    syncCompanionDateInput(element, adDate, 'ad');
  }
}
