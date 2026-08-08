import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CategoryCard } from '../components/CategoryCard'
import { ProductListing } from '../components/ProductListing'
import { SectionHeading } from '../components/SectionHeading'
import { getCategory } from '../data/categories'
import { productsByCategory, subcategoryCounts } from '../data/products'
import { isSortKey, sortProducts, type SortKey } from '../lib/sorting'
import { NotFoundPage } from './NotFoundPage'

/**
 * Category landing page: the category's subcategory grid, followed by every
 * product in the category.
 */
export function CategoryPage() {
  const { categoryId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const [inStockOnly, setInStockOnly] = useState(false)

  const category = getCategory(categoryId)
  const sortParam = params.get('sort')
  const sort: SortKey = isSortKey(sortParam) ? sortParam : 'price-asc'

  const visible = useMemo(() => {
    if (!category) return []
    const base = productsByCategory(category.id)
    const filtered = inStockOnly ? base.filter((p) => p.stock > 0) : base
    return sortProducts(filtered, sort)
  }, [category, sort, inStockOnly])

  if (!category) {
    return <NotFoundPage message="That category does not exist." />
  }

  const setSort = (next: SortKey) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('sort', next)
    setParams(nextParams, { replace: true })
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-5 sm:pt-7">
        <SectionHeading title={`Shop ${category.name}`} subtitle="Pick a collection" />
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8">
          {category.subcategories.map((sub) => (
            <CategoryCard
              key={sub.id}
              label={sub.name}
              image={sub.image}
              to={`/subcategory/${sub.id}`}
              count={subcategoryCounts[sub.id]}
            />
          ))}
        </div>
      </section>

      <div className="mt-2 border-t border-brand-100">
        <ProductListing
          title={`All in ${category.name}`}
          products={visible}
          sort={sort}
          onSortChange={setSort}
          inStockOnly={inStockOnly}
          onInStockChange={setInStockOnly}
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: category.name }]}
        />
      </div>
    </>
  )
}
