import { useEffect, useState } from 'react'
import { SERVICEABLE_AREAS, useDeliveryLocation } from '../context/LocationContext'
import { quoteDelivery } from '../lib/delivery'
import { deliveryConfig, store, store_address_full } from '../config/store'
import { money } from '../lib/format'

interface LocationModalProps {
  open: boolean
  onClose: () => void
}

/**
 * "Set Delivery Location" picker.
 *
 * There is no geolocation or geocoding in this pass. The user picks from a list
 * of nearby areas, each carrying a MOCK distance, which is enough to exercise
 * the delivery-fee UI end to end. The real flow will geocode a typed address.
 */
export function LocationModal({ open, onClose }: LocationModalProps) {
  const { location, setLocation } = useDeliveryLocation()
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    // Prevent the page behind the sheet from scrolling.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  const matches = SERVICEABLE_AREAS.filter((a) =>
    a.label.toLowerCase().includes(filter.trim().toLowerCase()),
  )

  return (
    <div
      className="fixed inset-0 z-100 flex items-end justify-center bg-brand-900/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 sm:max-w-md sm:rounded-2xl sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="location-title" className="text-lg font-extrabold">
              Set delivery location
            </h2>
            <p className="mt-0.5 text-xs text-brand-700/60">
              Pick your area to see delivery charges.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-full text-brand-700 transition hover:bg-brand-50"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search your area or society…"
          aria-label="Search area"
          className="mt-4 h-11 w-full rounded-xl border border-brand-100 bg-brand-50/60 px-3 text-sm focus:border-brand-400 focus:bg-white focus:outline-none"
        />

        <ul className="mt-3 space-y-1.5">
          {matches.map((area) => {
            const quote = quoteDelivery(area.distanceKm)
            const active = location?.label === area.label
            return (
              <li key={area.label}>
                <button
                  type="button"
                  onClick={() => {
                    setLocation(area)
                    onClose()
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                    active
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-brand-100 hover:border-brand-300 hover:bg-brand-50/60'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{area.label}</span>
                    <span className="block text-xs text-brand-700/60">
                      ~{area.distanceKm} km from store
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      quote.isFree
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-accent-400/30 text-brand-800'
                    }`}
                  >
                    {quote.isFree ? 'FREE' : money(quote.fee)}
                  </span>
                </button>
              </li>
            )
          })}

          {matches.length === 0 && (
            <li className="rounded-xl bg-brand-50 p-3 text-xs text-brand-700/70">
              We could not find that area in this demo list. Call us on{' '}
              <a href={`tel:+${store.phoneRaw}`} className="font-bold underline">
                {store.phone}
              </a>{' '}
              and we will confirm whether we deliver there.
            </li>
          )}
        </ul>

        <p className="mt-4 border-t border-brand-100 pt-3 text-[11px] leading-relaxed text-brand-700/60">
          Free delivery within {deliveryConfig.freeRadiusKm} km of our store at{' '}
          {store_address_full}. Beyond that, ₹{deliveryConfig.ratePerKmBeyondFreeRadius}/km applies
          to the extra distance. Distances shown are approximate demo values.
        </p>
      </div>
    </div>
  )
}
