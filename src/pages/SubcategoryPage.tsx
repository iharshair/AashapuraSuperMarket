import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ProductListing } from '../components/ProductListing'
import { getCategory, getSubcategory } from '../data/categories'
import { productsBySubcategory } from '../data/products'
import { isSortKey, sortProducts, type SortKey } from '../lib/sorting'
import { NotFoundPage } from './NotFoundPage'

/** Filtered product grid for a single subcategory. */
export function SubcategoryPage() {
  const { subcategoryId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const [inStockOnly, setInStockOnly] = useState(false)

  const subcategory = getSubcategory(subcategoryId)
  const category = subcategory ? getCategory(subcategory.categoryId) : undefined

  const sortParam = params.get('sort')
  const sort: SortKey = isSortKey(sortParam) ? sortParam : 'price-asc'

  const visible = useMemo(() => {
    if (!subcategory) return []
    const base = productsBySubcategory(subcategory.id)
    const filtered = inStockOnly ? base.filter((p) => p.stock > 0) : base
    return sortProducts(filtered, sort)
  }, [subcategory, sort, inStockOnly])

  if (!subcategory || !category) {
    return <NotFoundPage message="That collection does not exist." />
  }

  const setSort = (next: SortKey) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('sort', next)
    setParams(nextParams, { replace: true })
  }

  return (
    <ProductListing
      title={subcategory.name}
      subtitle={`in ${category.name}`}
      products={visible}
      sort={sort}
      onSortChange={setSort}
      inStockOnly={inStockOnly}
      onInStockChange={setInStockOnly}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: category.name, to: `/category/${category.id}` },
        { label: subcategory.name },
      ]}
    />
  )
}
