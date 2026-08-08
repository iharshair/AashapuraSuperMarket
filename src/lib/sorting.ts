import type { Product } from '../types'
import { discountPercent } from './format'

export type SortKey = 'price-asc' | 'price-desc' | 'discount' | 'name-asc'

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Discount: highest first' },
  { value: 'name-asc', label: 'Name: A to Z' },
]

export function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((o) => o.value === value)
}

/** Sort a product list without mutating the input. */
export function sortProducts(list: Product[], key: SortKey): Product[] {
  const copy = [...list]
  switch (key) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name))
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name))
    case 'discount':
      return copy.sort(
        (a, b) =>
          discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp) ||
          a.price - b.price,
      )
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
  }
}
