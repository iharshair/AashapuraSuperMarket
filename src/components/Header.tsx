import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { categories } from '../data/categories'
import { store } from '../config/store'
import { useCart } from '../context/CartContext'
import { useDeliveryLocation } from '../context/LocationContext'
import { SearchBar } from './SearchBar'
import { MegaMenu } from './MegaMenu'
import { LocationModal } from './LocationModal'

/** Scroll distance after which the two tiers merge into one compact bar. */
const MERGE_AT = 96

/**
 * Two-tier header that merges into a single compact sticky row on scroll.
 *
 * At rest: [logo | search | location | cart] over a scrollable category strip.
 * Scrolled: one row — [logo | Shop by Category | search | location | cart] —
 * with the category strip collapsed into the "Shop by Category" trigger.
 */
export function Header() {
  const [merged, setMerged] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [locationOpen, setLocationOpen] = useState(false)
  const { itemCount } = useCart()
  const { location } = useDeliveryLocation()
  const route = useLocation()

  useEffect(() => {
    const onScroll = () => {
      // Hysteresis: separate thresholds for merging and un-merging stop the
      // header flickering when the user hovers around the trigger point.
      setMerged((current) => {
        const y = window.scrollY
        if (!current && y > MERGE_AT) return true
        if (current && y < MERGE_AT - 40) return false
        return current
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mega-menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [route.pathname, route.search])

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="relative">
          {/* ---------------------------------------------------- Tier 1 */}
          {/*
            `relative z-50` keeps both tiers above the mega-menu's own backdrop
            (z-40). Without it the scrim dims the header too, which makes the
            "Shop by Category" trigger look disabled while its panel is open.
          */}
          <div className="relative z-50 mx-auto flex max-w-7xl items-center gap-2 bg-white px-3 sm:gap-4 sm:px-4">
            <Link
              to="/"
              aria-label={`${store.name} home`}
              className={`shrink-0 transition-all duration-300 ${
                merged ? 'py-1.5' : 'py-2 sm:py-3'
              }`}
            >
              <img
                src="/images/brand/logo.webp"
                alt={store.name}
                className={`w-auto object-contain transition-all duration-300 ${
                  merged ? 'h-9 sm:h-10' : 'h-11 sm:h-14'
                }`}
              />
            </Link>

            {/* Only present in the merged bar — the collapsed category strip. */}
            {merged && (
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 lg:flex"
              >
                <BurgerIcon />
                Shop by Category
              </button>
            )}

            <SearchBar className="min-w-0 flex-1" compact={merged} />

            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="hidden max-w-45 shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-brand-50 md:flex"
            >
              <PinIcon />
              <span className="min-w-0">
                <span className="block text-[10px] leading-tight text-brand-700/60">
                  Deliver to
                </span>
                <span className="block truncate text-xs font-bold text-brand-900">
                  {location ? location.label : 'Set location'}
                </span>
              </span>
            </button>

            <Link
              to="/cart"
              className="relative flex shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 font-bold text-white transition hover:bg-brand-700"
            >
              <CartIcon />
              <span className="hidden text-sm sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-accent-400 px-1 text-[11px] font-extrabold text-brand-900">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* ---------------------------------------------------- Tier 2 */}
          {/*
            Collapsed by max-height rather than unmounted, so the merge reads as
            one continuous motion instead of a layout jump.
          */}
          <div
            className={`relative z-50 overflow-hidden border-brand-100 bg-white transition-all duration-300 ease-out ${
              merged ? 'max-h-0 border-t-0 opacity-0' : 'max-h-16 border-t opacity-100'
            }`}
          >
            <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 sm:px-4">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                className="my-2 flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-700 sm:text-sm"
              >
                <BurgerIcon />
                <span className="hidden sm:inline">Shop by Category</span>
                <span className="sm:hidden">Categories</span>
              </button>

              <nav
                aria-label="Product categories"
                className="scroll-row no-scrollbar min-w-0 flex-1 py-2"
              >
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-brand-800 transition hover:bg-brand-50 hover:text-brand-600 sm:text-sm"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <MegaMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </div>
      </header>

      {/* Mobile location bar: the header row has no space for it under md. */}
      <button
        type="button"
        onClick={() => setLocationOpen(true)}
        className="flex w-full items-center gap-2 bg-brand-50 px-3 py-2 text-left md:hidden"
      >
        <PinIcon />
        <span className="truncate text-xs font-semibold text-brand-900">
          {location ? `Delivering to ${location.label}` : 'Set your delivery location'}
        </span>
        <span className="ml-auto shrink-0 text-xs font-bold text-brand-600">Change</span>
      </button>

      <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  )
}

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5 shrink-0 text-brand-600" aria-hidden="true">
      <path
        d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.55L20.5 8H6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  )
}
