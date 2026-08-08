import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface ScrollRowProps {
  children: ReactNode
  /** Extra classes for the scrolling track. */
  className?: string
  ariaLabel?: string
}

/**
 * Horizontal scroller used by "Popular Near You" and the related-products row.
 *
 * Swipe/drag works natively on touch. On pointer devices, arrow buttons appear
 * and are hidden at each end so users are never offered a dead control.
 */
export function ScrollRow({ children, className = '', ariaLabel }: ScrollRowProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setAtStart(el.scrollLeft <= 2)
    // `max <= 2` means the content fits and no arrows are needed at all.
    setAtEnd(max <= 2 || el.scrollLeft >= max - 2)
  }, [])

  useEffect(() => {
    sync()
    const el = trackRef.current
    if (!el) return
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [sync])

  const nudge = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: direction * Math.max(240, el.clientWidth * 0.8), behavior: 'smooth' })
  }

  const showArrows = !(atStart && atEnd)

  return (
    <div className="group relative">
      <div
        ref={trackRef}
        onScroll={sync}
        className={`scroll-row no-scrollbar pb-1 ${className}`}
        aria-label={ariaLabel}
      >
        {children}
      </div>

      {showArrows && !atStart && (
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Scroll left"
          className="absolute top-1/2 left-0 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-brand-100 bg-white/95 text-brand-800 shadow-md transition hover:bg-white md:grid"
        >
          <Chevron className="rotate-180" />
        </button>
      )}
      {showArrows && !atEnd && (
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="Scroll right"
          className="absolute top-1/2 right-0 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-brand-100 bg-white/95 text-brand-800 shadow-md transition hover:bg-white md:grid"
        >
          <Chevron />
        </button>
      )}
    </div>
  )
}

function Chevron({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-5 ${className}`} aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
