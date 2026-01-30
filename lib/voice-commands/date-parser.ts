/**
 * Date parser for natural language date expressions
 * Supports English and Arabic date formats
 */

export function parseNaturalDate(text: string): Date | null {
  if (!text) return null;

  const normalized = text.toLowerCase().trim();

  // Try English parsing first
  const englishDate = parseEnglishDate(normalized);
  if (englishDate) return englishDate;

  // Try Arabic parsing
  const arabicDate = parseArabicDate(normalized);
  if (arabicDate) return arabicDate;

  return null;
}

function parseEnglishDate(text: string): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Tomorrow
  if (/\btomorrow\b/i.test(text)) {
    const date = new Date(today);
    date.setDate(date.getDate() + 1);
    return date;
  }

  // Today
  if (/\btoday\b/i.test(text)) {
    return new Date(today);
  }

  // Yesterday
  if (/\byesterday\b/i.test(text)) {
    const date = new Date(today);
    date.setDate(date.getDate() - 1);
    return date;
  }

  // Next [weekday]
  const nextWeekdayMatch = text.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (nextWeekdayMatch) {
    return getNextWeekday(nextWeekdayMatch[1]);
  }

  // This [weekday]
  const thisWeekdayMatch = text.match(/this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (thisWeekdayMatch) {
    return getThisWeekday(thisWeekdayMatch[1]);
  }

  // In X days
  const inDaysMatch = text.match(/in\s+(\d+)\s+days?/i);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1]);
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date;
  }

  // In X weeks
  const inWeeksMatch = text.match(/in\s+(\d+)\s+weeks?/i);
  if (inWeeksMatch) {
    const weeks = parseInt(inWeeksMatch[1]);
    const date = new Date(today);
    date.setDate(date.getDate() + weeks * 7);
    return date;
  }

  // In X months
  const inMonthsMatch = text.match(/in\s+(\d+)\s+months?/i);
  if (inMonthsMatch) {
    const months = parseInt(inMonthsMatch[1]);
    const date = new Date(today);
    date.setMonth(date.getMonth() + months);
    return date;
  }

  // Next week
  if (/\bnext\s+week\b/i.test(text)) {
    const date = new Date(today);
    date.setDate(date.getDate() + 7);
    return date;
  }

  // Next month
  if (/\bnext\s+month\b/i.test(text)) {
    const date = new Date(today);
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    return date;
  }

  // End of week (Sunday)
  if (/\bend\s+of\s+week\b/i.test(text)) {
    const date = new Date(today);
    const day = date.getDay();
    const daysUntilSunday = day === 0 ? 7 : 7 - day;
    date.setDate(date.getDate() + daysUntilSunday);
    return date;
  }

  // End of month
  if (/\bend\s+of\s+month\b/i.test(text)) {
    const date = new Date(today);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return date;
  }

  // Try to parse specific date formats
  // Format: "Feb 24", "February 24", "24 February", "2025-02-24"
  const datePatterns = [
    { regex: /(\d{4})-(\d{2})-(\d{2})/, parse: (m: RegExpMatchArray) => new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])) },
    { regex: /(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i, parse: (m: RegExpMatchArray) => parseMonthDay(text) },
    { regex: /(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)/i, parse: (m: RegExpMatchArray) => parseDayMonth(text) }
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      const date = pattern.parse(match);
      if (date && isValidDate(date)) {
        // If date is in the past, assume next year
        if (date < today && !text.includes('yesterday')) {
          date.setFullYear(date.getFullYear() + 1);
        }
        return date;
      }
    }
  }

  return null;
}

function parseArabicDate(text: string): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // غدا (tomorrow)
  if (/غدا/.test(text)) {
    const date = new Date(today);
    date.setDate(date.getDate() + 1);
    return date;
  }

  // اليوم (today)
  if (/اليوم/.test(text)) {
    return new Date(today);
  }

  // أمس (yesterday)
  if (/أمس/.test(text)) {
    const date = new Date(today);
    date.setDate(date.getDate() - 1);
    return date;
  }

  // الأسبوع القادم (next week)
  if (/الأسبوع\s+القادم/.test(text)) {
    const date = new Date(today);
    date.setDate(date.getDate() + 7);
    return date;
  }

  // الشهر القادم (next month)
  if (/الشهر\s+القادم/.test(text)) {
    const date = new Date(today);
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    return date;
  }

  return null;
}

function getNextWeekday(dayName: string): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  const targetDay = dayMap[dayName.toLowerCase()];
  const currentDay = today.getDay();

  let daysAhead = targetDay - currentDay;
  if (daysAhead <= 0) daysAhead += 7;

  const date = new Date(today);
  date.setDate(date.getDate() + daysAhead);
  return date;
}

function getThisWeekday(dayName: string): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  const targetDay = dayMap[dayName.toLowerCase()];
  const currentDay = today.getDay();

  let daysAhead = targetDay - currentDay;
  if (daysAhead < 0) daysAhead += 7;
  if (daysAhead === 0 && new Date().getHours() >= 12) daysAhead = 7; // If it's afternoon and same day, assume next week

  const date = new Date(today);
  date.setDate(date.getDate() + daysAhead);
  return date;
}

function parseMonthDay(text: string): Date | null {
  const monthMap: { [key: string]: number } = {
    'jan': 0, 'january': 0,
    'feb': 1, 'february': 1,
    'mar': 2, 'march': 2,
    'apr': 3, 'april': 3,
    'may': 4,
    'jun': 5, 'june': 5,
    'jul': 6, 'july': 6,
    'aug': 7, 'august': 7,
    'sep': 8, 'september': 8,
    'oct': 9, 'october': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
  };

  const regex = /(\w+)\s+(\d{1,2})/i;
  const match = text.match(regex);
  if (!match) return null;

  const monthStr = match[1].toLowerCase();
  const day = parseInt(match[2]);
  const month = monthMap[monthStr];

  if (month === undefined) return null;

  const date = new Date();
  date.setMonth(month);
  date.setDate(day);
  date.setHours(0, 0, 0, 0);

  return date;
}

function parseDayMonth(text: string): Date | null {
  const monthMap: { [key: string]: number } = {
    'jan': 0, 'january': 0,
    'feb': 1, 'february': 1,
    'mar': 2, 'march': 2,
    'apr': 3, 'april': 3,
    'may': 4,
    'jun': 5, 'june': 5,
    'jul': 6, 'july': 6,
    'aug': 7, 'august': 7,
    'sep': 8, 'september': 8,
    'oct': 9, 'october': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
  };

  const regex = /(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(\w+)/i;
  const match = text.match(regex);
  if (!match) return null;

  const day = parseInt(match[1]);
  const monthStr = match[2].toLowerCase();
  const month = monthMap[monthStr];

  if (month === undefined) return null;

  const date = new Date();
  date.setMonth(month);
  date.setDate(day);
  date.setHours(0, 0, 0, 0);

  return date;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
