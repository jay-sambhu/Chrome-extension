import { toNepaliNumerals } from './numerals';

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
 * Number of days in each Bikram Sambat month (Baishakh..Chaitra) for BS 1970–2100.
 * BS 2000–2083 is the officially published calendar (cross-checked against three
 * independent open-source converters, which agree on every cell). Years outside
 * that window come from the nepali-datetime / bikram-sambat datasets; years after
 * 2083 are provisional projections and may shift by a day once officially published.
 */
export const BS_CALENDAR_START_YEAR = 1970;
export const BS_CALENDAR_END_YEAR = 2100;

const BS_MONTH_DAYS: ReadonlyArray<ReadonlyArray<number>> = [
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 1970
  [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30], // 1971
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 1972
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 1973
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 1974
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 1975
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 1976
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 1977
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 1978
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 1979
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 1980
  [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], // 1981
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 1982
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 1983
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 1984
  [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], // 1985
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 1986
  [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 1987
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 1988
  [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], // 1989
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 1990
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 1991
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 1992
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 1993
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 1994
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 1995
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 1996
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 1997
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 1998
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 1999
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2000
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2001
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2002
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2003
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2004
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2005
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2006
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2007
  [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31], // 2008
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2009
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2010
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2011
  [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], // 2012
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2013
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2014
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2015
  [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], // 2016
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2017
  [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2018
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2019
  [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2020
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2021
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 2022
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2023
  [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2024
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2025
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2026
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2027
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2028
  [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30], // 2029
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2030
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2031
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2032
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2033
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2034
  [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31], // 2035
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2036
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2037
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2038
  [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], // 2039
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2040
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2041
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2042
  [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], // 2043
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2044
  [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2045
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2046
  [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2047
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2048
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 2049
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2050
  [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2051
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2052
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 2053
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2054
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2055
  [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30], // 2056
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2057
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2058
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2059
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2060
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2061
  [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31], // 2062
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2063
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2064
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2065
  [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31], // 2066
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2067
  [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2068
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2069
  [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30], // 2070
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2071
  [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30], // 2072
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2073
  [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2074
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2075
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 2076
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2077
  [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30], // 2078
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2079
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30], // 2080
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31], // 2081
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2082
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30], // 2083
  [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30], // 2084
  [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30], // 2085
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2086
  [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30], // 2087
  [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30], // 2088
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2089
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2090
  [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30], // 2091
  [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2092
  [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2093
  [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30], // 2094
  [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30], // 2095
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31], // 2096
  [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30], // 2097
  [31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 29, 31], // 2098
  [31, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30, 30], // 2099
  [31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30], // 2100
];

/** Reference anchor: 1943-04-14 AD === 2000-01-01 BS. */
const BS_ANCHOR_YEAR = 2000;
const AD_ANCHOR_UTC = Date.UTC(1943, 3, 14);
const MS_PER_DAY = 86_400_000;

export interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatParts({ year, month, day }: DateParts): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseIsoParts(dateStr: string): DateParts | null {
  const match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(dateStr.trim());
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** Cumulative day offsets of each BS year start relative to 1970-01-01 BS (length = years + 1). */
const BS_YEAR_START_OFFSETS: number[] = BS_MONTH_DAYS.reduce<number[]>(
  (acc, months) => {
    acc.push(acc[acc.length - 1] + months.reduce((sum, d) => sum + d, 0));
    return acc;
  },
  [0]
);

/**
 * Returns the number of days in a BS month, or 0 when the year/month is outside the supported table.
 */
export function getBsMonthDays(year: number, month: number): number {
  if (year < BS_CALENDAR_START_YEAR || year > BS_CALENDAR_END_YEAR || month < 1 || month > 12) return 0;
  return BS_MONTH_DAYS[year - BS_CALENDAR_START_YEAR][month - 1];
}

/**
 * Converts AD calendar parts to BS calendar parts. Returns null if invalid or out of range.
 */
export function adPartsToBs(ad: DateParts): DateParts | null {
  const utc = Date.UTC(ad.year, ad.month - 1, ad.day);
  const check = new Date(utc);
  if (
    isNaN(utc) ||
    check.getUTCFullYear() !== ad.year ||
    check.getUTCMonth() !== ad.month - 1 ||
    check.getUTCDate() !== ad.day
  ) {
    return null;
  }

  // Days since 1970-01-01 BS
  let offset = Math.round((utc - AD_ANCHOR_UTC) / MS_PER_DAY) + BS_YEAR_START_OFFSETS[BS_ANCHOR_YEAR - BS_CALENDAR_START_YEAR];
  if (offset < 0 || offset >= BS_YEAR_START_OFFSETS[BS_YEAR_START_OFFSETS.length - 1]) return null;

  let yearIndex = 0;
  while (BS_YEAR_START_OFFSETS[yearIndex + 1] <= offset) yearIndex++;
  const year = BS_CALENDAR_START_YEAR + yearIndex;
  offset -= BS_YEAR_START_OFFSETS[yearIndex];

  let month = 1;
  while (offset >= getBsMonthDays(year, month)) {
    offset -= getBsMonthDays(year, month);
    month++;
  }

  return { year, month, day: offset + 1 };
}

/**
 * Converts BS calendar parts to AD calendar parts. Returns null if invalid or out of range.
 */
export function bsPartsToAd(bs: DateParts): DateParts | null {
  const monthDays = getBsMonthDays(bs.year, bs.month);
  if (!monthDays || bs.day < 1 || bs.day > monthDays) return null;

  let offset = bs.day - 1;
  for (let m = 1; m < bs.month; m++) offset += getBsMonthDays(bs.year, m);
  offset +=
    BS_YEAR_START_OFFSETS[bs.year - BS_CALENDAR_START_YEAR] -
    BS_YEAR_START_OFFSETS[BS_ANCHOR_YEAR - BS_CALENDAR_START_YEAR];

  const d = new Date(AD_ANCHOR_UTC + offset * MS_PER_DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/**
 * Converts an AD date string (YYYY-MM-DD) to the exact Nepali Bikram Sambat (BS) date string (YYYY-MM-DD)
 * using the BS month-length table. Returns '' for invalid or unsupported dates.
 */
export function convertAdToBs(adDateStr: string): string {
  const parts = parseIsoParts(adDateStr);
  if (!parts) return '';
  const bs = adPartsToBs(parts);
  return bs ? formatParts(bs) : '';
}

/**
 * Converts a BS date string (YYYY-MM-DD) to the AD date string (YYYY-MM-DD).
 * Returns '' for invalid or unsupported dates.
 */
export function convertBsToAd(bsDateStr: string): string {
  const parts = parseIsoParts(bsDateStr);
  if (!parts) return '';
  const ad = bsPartsToAd(parts);
  return ad ? formatParts(ad) : '';
}

/**
 * Formats a JS Date (local calendar day) as an AD YYYY-MM-DD string.
 */
export function toAdDateString(date: Date): string {
  return formatParts({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
}

/**
 * Today's date in BS (based on the local calendar day).
 */
export function getTodayBs(today: Date = new Date()): string {
  return convertAdToBs(toAdDateString(today));
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
