import { useId } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'
import { SORT_OPTIONS, type SortKey } from '../lib/sorting'

interface ProductListingProps {
  title: string
  subtitle?: string
  products: Product[]
  sort: SortKey
  onSortChange: (sort: SortKey) => void
  /** Optional in-stock filter, rendered as a checkbox beside the sort control. */
  inStockOnly?: boolean
  onInStockChange?: (value: boolean) => void
  breadcrumbs?: Array<{ label: string; to?: string }>
  /** Shown instead of the grid when there is nothing to list. */
  emptyMessage?: string
}

/**
 * Shared layout for every product listing page (All Products, Price Drop,
 * Category, Subcategory) so the sort/filter controls and empty states behave
 * identically everywhere.
 */
export function ProductListing({
  title,
  subtitle,
  products,
  sort,
  onSortChange,
  inStockOnly,
  onInStockChange,
  breadcrumbs,
  emptyMessage = 'No products here yet. Please check back soon.',
}: ProductListingProps) {
  const sortId = useId()

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-7">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-brand-700/60">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && <span aria-hidden="true">/</span>}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-brand-600 hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-brand-800">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 text-xs text-brand-700/70 sm:text-sm">
            {products.length} {products.length === 1 ? 'product' : 'products'}
            {subtitle ? ` · ${subtitle}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onInStockChange && (
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-brand-800 sm:text-sm">
              <input
                type="checkbox"
                checked={inStockOnly ?? false}
                onChange={(e) => onInStockChange(e.target.checked)}
                className="size-4 accent-brand-600"
              />
              In stock only
            </label>
          )}

          <div className="flex items-center gap-2">
            <label htmlFor={sortId} className="text-xs font-semibold text-brand-700/70">
              Sort
            </label>
            <select
              id={sortId}
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
              className="h-9 rounded-lg border border-brand-100 bg-white px-2 text-xs font-semibold text-brand-900 focus:border-brand-400 focus:outline-none sm:text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-10 text-center">
          <p className="text-sm font-semibold text-brand-800">{emptyMessage}</p>
          <Link
            to="/products"
            className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
