/**
 * ساس — Utility Helpers (Frontend)
 */

// ═══ Format currency ═══
export function formatCurrency(
  amount: number,
  currency = 'QAR',
  locale = 'ar-QA'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ═══ Format date ═══
export function formatDate(
  date: string | Date,
  locale = 'ar-QA'
): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(
  date: string | Date,
  locale = 'ar-QA'
): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// ═══ Relative time ═══
export function timeAgo(date: string | Date, locale = 'ar'): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (seconds < 60) return rtf.format(-seconds, 'second');
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), 'minute');
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hour');
  if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), 'day');
  if (seconds < 31536000) return rtf.format(-Math.floor(seconds / 2592000), 'month');
  return rtf.format(-Math.floor(seconds / 31536000), 'year');
}

// ═══ Validation helpers ═══
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Qatar & Gulf phone numbers
  return /^(\+?974|00974)?[3-9]\d{7}$/.test(phone.replace(/\s/g, ''));
}

// ═══ Order status labels (Arabic) ═══
export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  confirmed: 'مؤكد',
  processing: 'جاري التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  returned: 'مسترجع',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  paid: 'مدفوع',
  failed: 'فشل',
  refunded: 'مسترجع',
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'بانتظار الاستلام',
  picked_up: 'تم الاستلام',
  in_transit: 'في الطريق',
  out_for_delivery: 'خارج للتوصيل',
  delivered: 'تم التوصيل',
  returned: 'مرتجع',
  failed: 'فشل التوصيل',
};

// ═══ Clamp number ═══
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ═══ CN utility for className merging ═══
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
