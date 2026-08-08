import { Link, useParams } from 'react-router-dom'
import { getProduct, productImage, relatedProducts } from '../data/products'
import { getCategory, getSubcategory } from '../data/categories'
import { discountPercent, money } from '../lib/format'
import { deliveryConfig, store } from '../config/store'
import { useCart } from '../context/CartContext'
import { QuantityStepper } from '../components/QuantityStepper'
import { ScrollRow } from '../components/ScrollRow'
import { ProductCard } from '../components/ProductCard'
import { SectionHeading } from '../components/SectionHeading'
import { NotFoundPage } from './NotFoundPage'

/**
 * Product detail page following standard quick-commerce conventions (no
 * reference screenshot was supplied for this page).
 */
export function ProductDetailPage() {
  const { productId = '' } = useParams()
  const { quantityOf, add, setQuantity } = useCart()

  const product = getProduct(productId)
  if (!product) return <NotFoundPage message="That product does not exist." />

  const category = getCategory(product.categoryId)
  const subcategory = getSubcategory(product.subcategoryId)
  const quantity = quantityOf(product.id)
  const discount = discountPercent(product.price, product.mrp)
  const outOfStock = product.stock <= 0
  const related = relatedProducts(product, 12)

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-7">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-brand-700/60">
          <li>
            <Link to="/" className="hover:text-brand-600 hover:underline">
              Home
            </Link>
          </li>
          {category && (
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              <Link
                to={`/category/${category.id}`}
                className="hover:text-brand-600 hover:underline"
              >
                {category.name}
              </Link>
            </li>
          )}
          {subcategory && (
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              <Link
                to={`/subcategory/${subcategory.id}`}
                className="hover:text-brand-600 hover:underline"
              >
                {subcategory.name}
              </Link>
            </li>
          )}
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* --------------------------------------------------- image */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-brand-50/50">
          {discount > 0 && (
            <span className="absolute top-3 left-3 z-10 rounded-lg bg-sale-600 px-2 py-1 text-xs font-extrabold text-white">
              {discount}% OFF
            </span>
          )}
          <img
            src={productImage(product)}
            alt={product.name}
            className={`aspect-square w-full object-contain p-6 ${
              outOfStock ? 'opacity-40 grayscale' : ''
            }`}
          />
        </div>

        {/* --------------------------------------------------- details */}
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-3xl">{product.name}</h1>
          {subcategory && (
            <Link
              to={`/subcategory/${subcategory.id}`}
              className="mt-1 inline-block text-xs font-semibold text-brand-600 hover:underline sm:text-sm"
            >
              More in {subcategory.name}
            </Link>
          )}

          {/*
            Only one pack size exists per product in the mock data. The selector
            is rendered as a single active option so the layout already matches
            what a multi-variant product will look like once the client supplies
            more sizes.
          */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold text-brand-700/70">Pack size</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-xl border-2 border-brand-600 bg-brand-50 px-3 py-2 text-sm font-bold text-brand-800">
                {product.unit}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-2.5">
            <span className="text-2xl font-extrabold sm:text-3xl">{money(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-base text-brand-700/50 line-through">
                  {money(product.mrp)}
                </span>
                <span className="rounded-md bg-sale-600/10 px-2 py-0.5 text-xs font-extrabold text-sale-600">
                  Save {money(product.mrp - product.price)}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-brand-700/60">Inclusive of all taxes</p>

          <div className="mt-5 max-w-xs">
            {outOfStock ? (
              <div className="rounded-xl bg-brand-50 p-3 text-center text-sm font-bold text-brand-700/70">
                Out of stock
                <p className="mt-1 text-xs font-normal">
                  Call us on{' '}
                  <a href={`tel:+${store.phoneRaw}`} className="font-bold underline">
                    {store.phone}
                  </a>{' '}
                  to check restocking.
                </p>
              </div>
            ) : quantity > 0 ? (
              <div className="flex items-center gap-3">
                <div className="w-36">
                  <QuantityStepper
                    quantity={quantity}
                    max={product.stock}
                    size="md"
                    onChange={(q) => setQuantity(product.id, q)}
                  />
                </div>
                <Link
                  to="/cart"
                  className="rounded-xl bg-accent-400 px-5 py-3 text-sm font-extrabold text-brand-900 transition hover:bg-accent-500"
                >
                  Go to cart
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => add(product.id)}
                className="h-12 w-full rounded-xl bg-brand-600 text-base font-extrabold text-white transition hover:bg-brand-700"
              >
                Add to cart
              </button>
            )}

            {!outOfStock && product.stock <= 5 && (
              <p className="mt-2 text-xs font-bold text-sale-600">
                Only {product.stock} left in stock
              </p>
            )}
          </div>

          {product.description && (
            <div className="mt-6 border-t border-brand-100 pt-4">
              <h2 className="text-sm font-extrabold">Product details</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-800/80">
                {product.description}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:max-w-sm">
                <dt className="text-brand-700/60">Pack size</dt>
                <dd className="font-semibold">{product.unit}</dd>
                {category && (
                  <>
                    <dt className="text-brand-700/60">Category</dt>
                    <dd className="font-semibold">{category.name}</dd>
                  </>
                )}
                {subcategory && (
                  <>
                    <dt className="text-brand-700/60">Collection</dt>
                    <dd className="font-semibold">{subcategory.name}</dd>
                  </>
                )}
              </dl>
            </div>
          )}

          <div className="mt-5 rounded-xl bg-brand-50 p-3.5">
            <p className="text-xs font-extrabold text-brand-800">Delivery</p>
            <p className="mt-1 text-xs leading-relaxed text-brand-800/75">
              Free within {deliveryConfig.freeRadiusKm} km of our Lohegaon store. Beyond that, ₹
              {deliveryConfig.ratePerKmBeyondFreeRadius}/km on the extra distance.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10 border-t border-brand-100 pt-6">
          <SectionHeading
            title="You may also like"
            subtitle={subcategory ? `More from ${subcategory.name}` : undefined}
          />
          <ScrollRow ariaLabel="Related products">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} variant="row" />
            ))}
          </ScrollRow>
        </section>
      )}
    </div>
  )
}
