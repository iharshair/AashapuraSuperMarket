import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductListing } from '../components/ProductListing'
import { products, searchProducts } from '../data/products'
import { isSortKey, sortProducts, type SortKey } from '../lib/sorting'

/**
 * All Products — the destination of the "Starting at ₹9" banner.
 *
 * Defaults to cheapest-first via a real sort over the product data (not a
 * hardcoded order), and exposes the sort control so the page is not one-way.
 * `?q=` reuses this page for search results.
 */
export function AllProductsPage() {
  const [params, setParams] = useSearchParams()
  const [inStockOnly, setInStockOnly] = useState(false)

  const query = params.get('q')?.trim() ?? ''
  const sortParam = params.get('sort')
  const sort: SortKey = isSortKey(sortParam) ? sortParam : 'price-asc'

  const visible = useMemo(() => {
    const base = query ? searchProducts(query, Number.MAX_SAFE_INTEGER) : products
    const filtered = inStockOnly ? base.filter((p) => p.stock > 0) : base
    return sortProducts(filtered, sort)
  }, [query, sort, inStockOnly])

  const setSort = (next: SortKey) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('sort', next)
    setParams(nextParams, { replace: true })
  }

  return (
    <ProductListing
      title={query ? `Results for “${query}”` : 'All Products'}
      subtitle={query ? undefined : 'Everything we stock, cheapest first'}
      products={visible}
      sort={sort}
      onSortChange={setSort}
      inStockOnly={inStockOnly}
      onInStockChange={setInStockOnly}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: query ? 'Search' : 'All Products' }]}
      emptyMessage={
        query
          ? `We could not find anything matching “${query}”.`
          : 'No products available right now.'
      }
    />
  )
}
