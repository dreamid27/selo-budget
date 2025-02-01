import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatAmount(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Convert to number and format with thousand separators
  const formatted = new Intl.NumberFormat('id-ID').format(Number(digits) || 0);

  return `Rp ${formatted}`;
}

export function parseAmount(formattedValue: string): number {
  // Remove currency symbol, thousand separators, and any other non-digit characters
  const digits = formattedValue.replace(/\D/g, '');
  return Number(digits) || 0;
}
