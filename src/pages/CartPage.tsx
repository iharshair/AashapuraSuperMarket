import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useDeliveryLocation } from '../context/LocationContext'
import { productImage } from '../data/products'
import { money } from '../lib/format'
import { quoteDelivery } from '../lib/delivery'
import { deliveryConfig } from '../config/store'
import { QuantityStepper } from '../components/QuantityStepper'

export function CartPage() {
  const { detailed, subtotal, savings, itemCount, setQuantity, remove, clear } = useCart()
  const { location } = useDeliveryLocation()

  // Until an area is chosen we cannot show a fee, so the summary shows the
  // charge as pending rather than guessing at zero.
  const quote = location ? quoteDelivery(location.distanceKm) : null
  const total = subtotal + (quote?.fee ?? 0)

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-brand-50">
          <svg viewBox="0 0 24 24" className="size-10 text-brand-300" aria-hidden="true">
            <path
              d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.55L20.5 8H6.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-extrabold sm:text-2xl">Your cart is empty</h1>
        <p className="mt-2 text-sm text-brand-700/70">
          Add fresh produce, daily essentials and more to get started.
        </p>
        <Link
          to="/products?sort=price-asc"
          className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-3xl">Your cart</h1>
          <p className="mt-1 text-xs text-brand-700/70 sm:text-sm">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg px-3 py-1.5 text-xs font-bold text-sale-600 transition hover:bg-sale-600/10"
        >
          Clear cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* -------------------------------------------------- line items */}
        <ul className="divide-y divide-brand-100 rounded-2xl border border-brand-100">
          {detailed.map(({ product, quantity, lineTotal, lineMrpTotal }) => (
            <li key={product.id} className="flex gap-3 p-3 sm:gap-4 sm:p-4">
              <Link
                to={`/product/${product.id}`}
                className="size-18 shrink-0 overflow-hidden rounded-lg bg-brand-50 sm:size-22"
              >
                <img
                  src={productImage(product)}
                  alt={product.name}
                  className="h-full w-full object-contain p-1"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  to={`/product/${product.id}`}
                  className="line-clamp-2 text-sm font-semibold hover:text-brand-600 sm:text-base"
                >
                  {product.name}
                </Link>
                <p className="mt-0.5 text-xs text-brand-700/60">{product.unit}</p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-extrabold">{money(product.price)}</span>
                  {product.mrp > product.price && (
                    <span className="text-xs text-brand-700/50 line-through">
                      {money(product.mrp)}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex items-center gap-3">
                  <div className="w-26">
                    <QuantityStepper
                      quantity={quantity}
                      max={product.stock}
                      onChange={(q) => setQuantity(product.id, q)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="text-xs font-bold text-brand-700/60 transition hover:text-sale-600"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-extrabold sm:text-base">{money(lineTotal)}</p>
                {lineMrpTotal > lineTotal && (
                  <p className="text-xs text-brand-700/50 line-through">{money(lineMrpTotal)}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* ----------------------------------------------------- summary */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-2xl border border-brand-100 p-4">
            <h2 className="text-sm font-extrabold">Order summary</h2>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-700/70">Item total</dt>
                <dd className="font-semibold">{money(subtotal)}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-brand-700/70">Delivery</dt>
                <dd className="font-semibold">
                  {!quote ? (
                    <span className="text-xs font-bold text-brand-600">Set location</span>
                  ) : quote.isFree ? (
                    <span className="text-brand-600">FREE</span>
                  ) : (
                    money(quote.fee)
                  )}
                </dd>
              </div>

              {quote && !quote.isFree && (
                <p className="text-[11px] leading-relaxed text-brand-700/60">
                  {location?.label} is ~{quote.distanceKm} km away. First{' '}
                  {deliveryConfig.freeRadiusKm} km free, {quote.billableKm} km billed at ₹
                  {deliveryConfig.ratePerKmBeyondFreeRadius}/km.
                </p>
              )}

              <div className="flex justify-between border-t border-brand-100 pt-2.5 text-base">
                <dt className="font-extrabold">To pay</dt>
                <dd className="font-extrabold">{money(total)}</dd>
              </div>
            </dl>

            {savings > 0 && (
              <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700">
                You save {money(savings)} on this order
              </p>
            )}

            <Link
              to="/checkout"
              className="mt-4 block rounded-xl bg-brand-600 py-3 text-center text-sm font-extrabold text-white transition hover:bg-brand-700"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products?sort=price-asc"
              className="mt-2 block py-2 text-center text-xs font-bold text-brand-600 hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
