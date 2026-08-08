import { currency } from '../config/store'

/** Format a rupee amount, omitting decimals for whole numbers. */
export function money(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  const body = Number.isInteger(rounded)
    ? rounded.toLocaleString('en-IN')
    : rounded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${currency}${body}`
}

/** Whole-number discount percentage, or 0 when there is no saving. */
export function discountPercent(price: number, mrp: number): number {
  if (mrp <= 0 || price >= mrp) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}

/** Turn a label into a URL-safe id. Mirrors scripts/build-assets.mjs. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/['’"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}
