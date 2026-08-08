import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductListing } from '../components/ProductListing'
import { priceDropProducts } from '../data/products'
import { isSortKey, sortProducts, type SortKey } from '../lib/sorting'

/**
 * Price Drop — the destination of the "Price Drop" banner.
 *
 * Lists only products where `isPriceDrop === true`. That flag is intended to be
 * toggled per product from the future admin panel; the mock data seeds a spread
 * of them across categories so the page has content to demo.
 */
export function PriceDropPage() {
  const [params, setParams] = useSearchParams()
  const [inStockOnly, setInStockOnly] = useState(false)

  const sortParam = params.get('sort')
  const sort: SortKey = isSortKey(sortParam) ? sortParam : 'discount'

  const visible = useMemo(() => {
    const base = priceDropProducts()
    const filtered = inStockOnly ? base.filter((p) => p.stock > 0) : base
    return sortProducts(filtered, sort)
  }, [sort, inStockOnly])

  const setSort = (next: SortKey) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('sort', next)
    setParams(nextParams, { replace: true })
  }

  return (
    <ProductListing
      title="Price Drop"
      subtitle="Reduced prices, while stocks last"
      products={visible}
      sort={sort}
      onSortChange={setSort}
      inStockOnly={inStockOnly}
      onInStockChange={setInStockOnly}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Price Drop' }]}
      emptyMessage="No price drops are running at the moment."
    />
  )
}
