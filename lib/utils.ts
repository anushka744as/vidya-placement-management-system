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
