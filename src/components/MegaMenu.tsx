import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../data/categories'
import { subcategoryCounts } from '../data/products'

interface MegaMenuProps {
  open: boolean
  onClose: () => void
}

/**
 * "Shop by Category" panel: every category and subcategory at once.
 *
 * On desktop this drops below the header as a full-width mega-menu; on mobile it
 * becomes a full-height scrollable sheet, since 76 subcategories will never fit
 * in a dropdown.
 */
export function MegaMenu({ open, onClose }: MegaMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Click-away backdrop. Sits below the panel but above page content. */}
      <div
        className="fixed inset-0 top-0 z-40 bg-brand-900/40"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="absolute inset-x-0 top-full z-50 max-h-[75vh] overflow-y-auto border-t border-brand-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="false"
        aria-label="Shop by category"
      >
        <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-6 px-4 py-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <div key={category.id}>
              <Link
                to={`/category/${category.id}`}
                onClick={onClose}
                className="mb-2 inline-block text-sm font-extrabold text-brand-900 hover:text-brand-600"
              >
                {category.name}
              </Link>
              <ul className="space-y-1">
                {category.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      to={`/subcategory/${sub.id}`}
                      onClick={onClose}
                      className="flex items-baseline justify-between gap-2 rounded-md px-1.5 py-1 text-xs text-brand-800/80 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      <span>{sub.name}</span>
                      <span className="shrink-0 text-[10px] text-brand-700/40">
                        {subcategoryCounts[sub.id] ?? 0}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
