import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchProducts } from '../data/products'
import { productImage } from '../data/products'
import { money } from '../lib/format'

interface SearchBarProps {
  className?: string
  compact?: boolean
}

/** Search input with a live suggestion dropdown. Purely client-side for now. */
export function SearchBar({ className = '', compact = false }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const listId = useId()

  const results = open && query.trim() ? searchProducts(query, 6) : []

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const q = query.trim()
    if (!q) return
    setOpen(false)
    navigate(`/products?q=${encodeURIComponent(q)}`)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={submit} role="search">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-brand-700/50"
          >
            <path
              d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 1 1 4 10.5a6.5 6.5 0 0 1 13 0Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search for products…"
            aria-label="Search for products"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            className={`w-full rounded-xl border border-brand-100 bg-brand-50/60 pl-9 pr-3 text-brand-900 placeholder:text-brand-700/40 transition focus:border-brand-400 focus:bg-white focus:outline-none ${
              compact ? 'h-9 text-sm' : 'h-10 text-sm sm:h-11 sm:text-base'
            }`}
          />
        </div>
      </form>

      {results.length > 0 && (
        <ul
          id={listId}
          className="absolute top-full z-50 mt-2 max-h-[70vh] w-full overflow-y-auto rounded-xl border border-brand-100 bg-white p-1.5 shadow-xl"
        >
          {results.map((product) => (
            <li key={product.id}>
              <Link
                to={`/product/${product.id}`}
                onClick={() => {
                  setOpen(false)
                  setQuery('')
                }}
                className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-brand-50"
              >
                <img
                  src={productImage(product)}
                  alt=""
                  className="size-10 shrink-0 rounded-md bg-brand-50 object-contain"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{product.name}</span>
                  <span className="block text-xs text-brand-700/60">{product.unit}</span>
                </span>
                <span className="shrink-0 text-sm font-bold">{money(product.price)}</span>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={submit}
              className="mt-1 w-full rounded-lg bg-brand-50 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
            >
              See all results for “{query.trim()}”
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
