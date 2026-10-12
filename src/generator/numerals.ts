// Kept dependency-free: the content script imports this on every page.

/**
 * Maps English numerals 0-9 to Nepali Devanagari numerals ०-९.
 */
export function toNepaliNumerals(input: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return input.toString().replace(/[0-9]/g, (digit) => nepaliDigits[parseInt(digit, 10)]);
}

/**
 * Maps Nepali Devanagari numerals ०-९ to English numerals 0-9.
 */
export function toEnglishNumerals(input: string): string {
  const nepaliToEnglish: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  return input.replace(/[०-९]/g, (char) => nepaliToEnglish[char] ?? char);
}
