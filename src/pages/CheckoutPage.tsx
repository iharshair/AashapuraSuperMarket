import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { SERVICEABLE_AREAS, useDeliveryLocation } from '../context/LocationContext'
import { money } from '../lib/format'
import { quoteDelivery } from '../lib/delivery'
import { deliveryConfig, store } from '../config/store'
import type { DeliveryDetails, PaymentMethod } from '../types'

type Errors = Partial<Record<keyof DeliveryDetails, string>>

const EMPTY: DeliveryDetails = {
  name: '',
  phone: '',
  addressLine: '',
  landmark: '',
  pincode: store.address.pincode,
}

/**
 * Checkout: delivery details, order summary, payment method. No account or login
 * is required anywhere in the flow.
 *
 * Nothing is submitted to a server — on place-order we clear the cart and show a
 * local confirmation. Wiring a real order API and a payment gateway is a
 * backend-phase task.
 */
export function CheckoutPage() {
  const { detailed, subtotal, savings, itemCount, clear } = useCart()
  const { location, setLocation } = useDeliveryLocation()

  const [details, setDetails] = useState<DeliveryDetails>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [payment, setPayment] = useState<PaymentMethod>('cod')
  /**
   * Snapshot of the order taken at submit time. Placing an order clears the
   * cart, so the confirmation screen cannot read live cart state — it would
   * report a total of zero plus delivery.
   */
  const [placedOrder, setPlacedOrder] = useState<{
    id: string
    total: number
    payment: PaymentMethod
    firstName: string
  } | null>(null)

  const quote = location ? quoteDelivery(location.distanceKm) : null
  const total = subtotal + (quote?.fee ?? 0)

  const summaryLines = useMemo(() => detailed.slice(0, 4), [detailed])

  // ------------------------------------------------------ order placed
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100">
          <svg viewBox="0 0 24 24" className="size-9 text-brand-600" aria-hidden="true">
            <path
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-extrabold">Order placed</h1>
        <p className="mt-2 text-sm text-brand-700/70">
          Thank you, {placedOrder.firstName || 'friend'}. Your order{' '}
          <span className="font-bold text-brand-800">{placedOrder.id}</span> has been received.
        </p>
        <p className="mt-1 text-sm text-brand-700/70">
          {placedOrder.payment === 'cod'
            ? `Please keep ${money(placedOrder.total)} ready for cash on delivery.`
            : `Payment of ${money(placedOrder.total)} will be collected online once the gateway is live.`}
        </p>

        <div className="mt-5 rounded-xl bg-accent-400/20 p-3 text-left">
          <p className="text-xs leading-relaxed text-brand-800">
            This is a front-end demo, so no order was actually transmitted. To confirm a real
            order today, message us on{' '}
            <a
              href={store.whatsappUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-bold underline"
            >
              WhatsApp
            </a>{' '}
            or call{' '}
            <a href={`tel:+${store.phoneRaw}`} className="font-bold underline">
              {store.phone}
            </a>
            .
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Back to shopping
        </Link>
      </div>
    )
  }

  // -------------------------------------------------------- empty cart
  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-extrabold sm:text-2xl">Nothing to check out</h1>
        <p className="mt-2 text-sm text-brand-700/70">Your cart is empty.</p>
        <Link
          to="/products?sort=price-asc"
          className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  const update = (field: keyof DeliveryDetails, value: string) => {
    setDetails((d) => ({ ...d, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const validate = (): boolean => {
    const next: Errors = {}
    if (details.name.trim().length < 2) next.name = 'Please enter your full name.'
    // Indian mobile numbers: 10 digits starting 6-9, tolerating spaces and +91.
    const digits = details.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '')
    if (!/^[6-9]\d{9}$/.test(digits)) next.phone = 'Enter a valid 10-digit mobile number.'
    if (details.addressLine.trim().length < 10)
      next.addressLine = 'Please include flat/house, building and street.'
    if (!/^\d{6}$/.test(details.pincode.trim())) next.pincode = 'Enter a 6-digit pincode.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const placeOrder = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      // Move focus to the first invalid field so the error is not missed on mobile.
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]')
      first?.focus()
      return
    }
    // Capture the order before clearing the cart — see `placedOrder` above.
    setPlacedOrder({
      id: `ASM${Date.now().toString().slice(-8)}`,
      total,
      payment,
      firstName: details.name.trim().split(/\s+/)[0] ?? '',
    })
    clear()
    window.scrollTo({ top: 0 })
  }

  const fieldClass = (field: keyof DeliveryDetails) =>
    `h-11 w-full rounded-xl border bg-white px-3 text-sm focus:outline-none ${
      errors[field]
        ? 'border-sale-600 focus:border-sale-600'
        : 'border-brand-100 focus:border-brand-400'
    }`

  return (
    <form onSubmit={placeOrder} className="mx-auto max-w-7xl px-4 py-5 sm:py-7">
      <h1 className="text-xl font-extrabold tracking-tight sm:text-3xl">Checkout</h1>
      <p className="mt-1 text-xs text-brand-700/70 sm:text-sm">
        No account needed — just tell us where to deliver.
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* ------------------------------------------ delivery details */}
          <section className="rounded-2xl border border-brand-100 p-4">
            <h2 className="text-sm font-extrabold">Delivery details</h2>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="co-name" className="mb-1 block text-xs font-semibold">
                  Full name
                </label>
                <input
                  id="co-name"
                  value={details.name}
                  onChange={(e) => update('name', e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'co-name-error' : undefined}
                  autoComplete="name"
                  className={fieldClass('name')}
                />
                {errors.name && (
                  <p id="co-name-error" className="mt-1 text-xs font-semibold text-sale-600">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="co-phone" className="mb-1 block text-xs font-semibold">
                  Mobile number
                </label>
                <input
                  id="co-phone"
                  type="tel"
                  inputMode="tel"
                  value={details.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'co-phone-error' : undefined}
                  autoComplete="tel"
                  placeholder="10-digit mobile"
                  className={fieldClass('phone')}
                />
                {errors.phone && (
                  <p id="co-phone-error" className="mt-1 text-xs font-semibold text-sale-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="co-pincode" className="mb-1 block text-xs font-semibold">
                  Pincode
                </label>
                <input
                  id="co-pincode"
                  inputMode="numeric"
                  value={details.pincode}
                  onChange={(e) => update('pincode', e.target.value)}
                  aria-invalid={Boolean(errors.pincode)}
                  aria-describedby={errors.pincode ? 'co-pincode-error' : undefined}
                  autoComplete="postal-code"
                  className={fieldClass('pincode')}
                />
                {errors.pincode && (
                  <p id="co-pincode-error" className="mt-1 text-xs font-semibold text-sale-600">
                    {errors.pincode}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="co-address" className="mb-1 block text-xs font-semibold">
                  Flat / house, building, street
                </label>
                <textarea
                  id="co-address"
                  rows={3}
                  value={details.addressLine}
                  onChange={(e) => update('addressLine', e.target.value)}
                  aria-invalid={Boolean(errors.addressLine)}
                  aria-describedby={errors.addressLine ? 'co-address-error' : undefined}
                  autoComplete="street-address"
                  className={`w-full rounded-xl border bg-white p-3 text-sm focus:outline-none ${
                    errors.addressLine
                      ? 'border-sale-600 focus:border-sale-600'
                      : 'border-brand-100 focus:border-brand-400'
                  }`}
                />
                {errors.addressLine && (
                  <p id="co-address-error" className="mt-1 text-xs font-semibold text-sale-600">
                    {errors.addressLine}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="co-landmark" className="mb-1 block text-xs font-semibold">
                  Landmark <span className="font-normal text-brand-700/50">(optional)</span>
                </label>
                <input
                  id="co-landmark"
                  value={details.landmark}
                  onChange={(e) => update('landmark', e.target.value)}
                  className={fieldClass('landmark')}
                />
              </div>
            </div>
          </section>

          {/* ------------------------------------------------ area + fee */}
          <section className="rounded-2xl border border-brand-100 p-4">
            <h2 className="text-sm font-extrabold">Delivery area</h2>
            <p className="mt-1 text-xs text-brand-700/60">
              Distances are approximate demo values. Real distance-based charges will be
              calculated from your address once geolocation is connected.
            </p>

            <label htmlFor="co-area" className="mt-3 mb-1 block text-xs font-semibold">
              Nearest area
            </label>
            <select
              id="co-area"
              value={location?.label ?? ''}
              onChange={(e) => {
                const area = SERVICEABLE_AREAS.find((a) => a.label === e.target.value)
                setLocation(area ?? null)
              }}
              className="h-11 w-full rounded-xl border border-brand-100 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none"
            >
              <option value="">Select your area…</option>
              {SERVICEABLE_AREAS.map((area) => (
                <option key={area.label} value={area.label}>
                  {area.label} (~{area.distanceKm} km)
                </option>
              ))}
            </select>

            <div className="mt-3 rounded-xl bg-brand-50 p-3">
              {!quote ? (
                <p className="text-xs font-semibold text-brand-800">
                  Select an area to see your delivery charge.
                </p>
              ) : quote.isFree ? (
                <p className="text-xs font-semibold text-brand-700">
                  Free delivery — you are within {deliveryConfig.freeRadiusKm} km of the store.
                </p>
              ) : (
                <p className="text-xs leading-relaxed text-brand-800">
                  <span className="font-bold">Delivery charge {money(quote.fee)}.</span> Your area
                  is ~{quote.distanceKm} km away. The first {deliveryConfig.freeRadiusKm} km are
                  free; the remaining {quote.billableKm} km are billed at ₹
                  {deliveryConfig.ratePerKmBeyondFreeRadius}/km.
                </p>
              )}
            </div>
          </section>

          {/* -------------------------------------------------- payment */}
          <section className="rounded-2xl border border-brand-100 p-4">
            <h2 className="text-sm font-extrabold">Payment method</h2>
            <div className="mt-3 space-y-2">
              <PaymentOption
                value="cod"
                checked={payment === 'cod'}
                onChange={setPayment}
                title="Cash on Delivery"
                description="Pay the delivery partner in cash when your order arrives."
              />
              <PaymentOption
                value="online"
                checked={payment === 'online'}
                onChange={setPayment}
                title="Online Payment"
                description="UPI, card or netbanking. Gateway integration is pending — selecting this will not charge you yet."
                badge="Coming soon"
              />
            </div>
          </section>
        </div>

        {/* ----------------------------------------------------- summary */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-2xl border border-brand-100 p-4">
            <h2 className="text-sm font-extrabold">
              Order summary{' '}
              <span className="font-normal text-brand-700/60">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </h2>

            <ul className="mt-3 space-y-1.5 text-xs">
              {summaryLines.map(({ product, quantity, lineTotal }) => (
                <li key={product.id} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate text-brand-800/80">
                    {product.name} × {quantity}
                  </span>
                  <span className="shrink-0 font-semibold">{money(lineTotal)}</span>
                </li>
              ))}
              {detailed.length > summaryLines.length && (
                <li className="text-brand-700/60">
                  + {detailed.length - summaryLines.length} more{' '}
                  {detailed.length - summaryLines.length === 1 ? 'item' : 'items'}
                </li>
              )}
            </ul>

            <dl className="mt-3 space-y-2 border-t border-brand-100 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-700/70">Item total</dt>
                <dd className="font-semibold">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-700/70">Delivery</dt>
                <dd className="font-semibold">
                  {!quote ? (
                    <span className="text-xs font-bold text-brand-600">Select area</span>
                  ) : quote.isFree ? (
                    <span className="text-brand-600">FREE</span>
                  ) : (
                    money(quote.fee)
                  )}
                </dd>
              </div>
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

            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-brand-600 py-3 text-sm font-extrabold text-white transition hover:bg-brand-700"
            >
              Place order · {money(total)}
            </button>

            <Link
              to="/cart"
              className="mt-2 block py-2 text-center text-xs font-bold text-brand-600 hover:underline"
            >
              Back to cart
            </Link>
          </div>
        </aside>
      </div>
    </form>
  )
}

interface PaymentOptionProps {
  value: PaymentMethod
  checked: boolean
  onChange: (value: PaymentMethod) => void
  title: string
  description: string
  badge?: string
}

function PaymentOption({
  value,
  checked,
  onChange,
  title,
  description,
  badge,
}: PaymentOptionProps) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
        checked ? 'border-brand-600 bg-brand-50' : 'border-brand-100 hover:border-brand-300'
      }`}
    >
      <input
        type="radio"
        name="payment"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-0.5 size-4 shrink-0 accent-brand-600"
      />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold">{title}</span>
          {badge && (
            <span className="rounded-full bg-accent-400/40 px-2 py-0.5 text-[10px] font-extrabold text-brand-800">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-brand-700/70">
          {description}
        </span>
      </span>
    </label>
  )
}
