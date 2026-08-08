import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { heroTiles } from '../data/categories'
import { heroCopy } from '../config/store'

/**
 * Hero banner: delivery promise + the auto-animating category strip.
 *
 * The strip moves a fixed distance, pauses, moves again, looping forever. That
 * rhythm lives in the `hero-marquee` keyframes (src/index.css); the track holds
 * two copies of the tiles so the -50% endpoint is pixel-identical to the start
 * and the loop never visibly resets.
 *
 * Auto-motion pauses while the user hovers, focuses a tile, or drags/swipes, and
 * resumes shortly after they stop. Manual arrows switch the strip to a plain
 * scroller so the two mechanisms never fight over the same transform.
 */
export function Hero() {
  const [paused, setPaused] = useState(false)
  /** Set once the user takes manual control; auto-motion does not come back. */
  const [manual, setManual] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    },
    [],
  )

  const holdThenResume = () => {
    setPaused(true)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setPaused(false), 2500)
  }

  const nudge = (direction: 1 | -1) => {
    setManual(true)
    setPaused(true)
    // Wait a frame so the track has re-rendered as a scrollable strip before
    // scrolling it, otherwise scrollBy runs against the animated element.
    requestAnimationFrame(() => {
      const el = scrollerRef.current
      if (!el) return
      el.scrollBy({ left: direction * Math.max(280, el.clientWidth * 0.6), behavior: 'smooth' })
    })
  }

  const tiles = manual ? heroTiles : [...heroTiles, ...heroTiles]

  return (
    <section className="relative overflow-hidden">
      {/*
        Supplied hero artwork used as a background texture.

        NOTE: the source graphic has its own promotional wording baked into it
        ("DEALS STARTING FROM JUST ₹7"), which would otherwise compete with the
        delivery-promise headline this section is specified to carry — and it
        contradicts the ₹9 promo banner below. Until the client supplies a clean
        plate, it is pushed back with a slight blur and a heavy scrim so it reads
        as texture rather than as a second, conflicting message.
      */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/hero/hero-background.webp"
          alt=""
          className="h-full w-full scale-105 object-cover blur-[3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-900/85 to-brand-800/70" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 pb-5 sm:pt-10 sm:pb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-400 px-3 py-1 text-[11px] font-extrabold text-brand-900 sm:text-xs">
          <BoltIcon />
          {heroCopy.badge}
        </span>

        <h1 className="mt-3 max-w-xl text-2xl leading-tight font-extrabold text-white sm:text-4xl lg:text-5xl">
          {heroCopy.headline}
        </h1>
        <p className="mt-2 max-w-lg text-sm text-white/80 sm:text-base">{heroCopy.subhead}</p>

        {/* ------------------------------------------- category strip */}
        <div
          className={`relative mt-5 sm:mt-7 ${paused ? 'hero-marquee-paused' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => !manual && setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => !manual && setPaused(false)}
          onTouchStart={holdThenResume}
          onPointerDown={holdThenResume}
        >
          <div
            ref={scrollerRef}
            className={
              manual
                ? 'scroll-row no-scrollbar pb-1'
                : 'edge-fade-x flex overflow-hidden'
            }
          >
            <div
              className={
                manual
                  ? 'flex gap-3'
                  : 'hero-marquee-track flex w-max gap-3'
              }
            >
              {tiles.map((tile, index) => (
                <Link
                  key={`${tile.label}-${index}`}
                  to={tile.to}
                  aria-label={tile.label}
                  // The duplicated half is decorative; keep it out of the tab
                  // order and the accessibility tree.
                  aria-hidden={!manual && index >= heroTiles.length}
                  tabIndex={!manual && index >= heroTiles.length ? -1 : undefined}
                  className="w-24 shrink-0 overflow-hidden rounded-xl shadow-lg transition hover:-translate-y-1 sm:w-30"
                >
                  {/* Label is already rendered into the supplied artwork. */}
                  <img
                    src={tile.image}
                    alt=""
                    loading={index < 6 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Previous categories"
            className="absolute top-1/2 -left-2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-800 shadow-lg transition hover:bg-white md:grid"
          >
            <Chevron className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="More categories"
            className="absolute top-1/2 -right-2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-800 shadow-lg transition hover:bg-white md:grid"
          >
            <Chevron />
          </button>
        </div>
      </div>
    </section>
  )
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
      <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" fill="currentColor" />
    </svg>
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
