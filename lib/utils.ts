import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(value?: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/[₹]|rs\.?\b/i.test(trimmed)) return trimmed;

  const numericOnly = /^[\d,.\s]+$/.test(trimmed);
  if (numericOnly) {
    const num = Number(trimmed.replace(/,/g, ''));
    if (!Number.isNaN(num)) {
      return `₹${num.toLocaleString('en-IN')}`;
    }
  }

  return `₹${trimmed}`;
}

// Accepts an optional leading +91/91/0 country/trunk prefix; the remaining
// digits must be exactly a 10-digit Indian mobile/landline number.
const PHONE_DIGITS_PATTERN = /^(?:\+?91|0)?(\d{10})$/;

export function normalizePhone(value?: string | null): string | null {
  if (!value) return null;
  const digitsOnly = value.replace(/[\s-]/g, '');
  const match = digitsOnly.match(PHONE_DIGITS_PATTERN);
  return match ? match[1] : null;
}

export function isValidPhone(value?: string | null): boolean {
  return normalizePhone(value) !== null;
}
