export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export interface JDate {
  y: number;
  m: number;
  d: number;
}

const fmt = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

export function toJalali(date: Date): JDate {
  const parts = fmt.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}


export function fromJalali(j: JDate): Date | null {
  for (let i = 0; i < 400; i++) {
    const c = new Date(j.y + 621, 2, 1 + i, 12);
    const x = toJalali(c);
    if (x.y === j.y && x.m === j.m && x.d === j.d) return c;
  }
  return null;
}

export function jalaliMonthLength(y: number, m: number): number {
  if (m <= 6) return 31;
  if (m <= 11) return 30;
  return fromJalali({ y, m: 12, d: 30 }) ? 30 : 29;
}