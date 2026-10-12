export const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
/** Monday-first order, matching the design's day pickers. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const MINUTE = 60_000;

export const startOfDay = (d: Date | number) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

/** '08.00' — Indonesian clock format used throughout the design. */
export const fmtTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}.${String(minutes % 60).padStart(2, '0')}`;

/** 'Senin, 12 Okt' */
export const fmtDate = (ms: number) => {
  const d = new Date(ms);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

/** 'Senin, 12 Oktober' */
export const fmtDateLong = (ms: number) => {
  const d = new Date(ms);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** 'Oktober 2026' */
export const fmtMonth = (ms: number) => {
  const d = new Date(ms);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** Whole days from today (negative = past). */
export const daysFromToday = (ms: number) =>
  Math.round((startOfDay(ms) - startOfDay(Date.now())) / (24 * 60 * MINUTE));

export const addDays = (ms: number, n: number) => startOfDay(ms + n * 24 * 60 * MINUTE);

/** Monday of the week containing `ms`. */
export const startOfWeek = (ms: number) => {
  const d = new Date(startOfDay(ms));
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
};
