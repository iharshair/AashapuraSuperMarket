import { Link } from 'react-router-dom'

interface CategoryCardProps {
  label: string
  image: string
  to: string
  /**
   * `tile` is for artwork that already contains its own label (the hero
   * carousel and promo grid). It renders the image edge-to-edge with no caption
   * so the text is never duplicated.
   */
  variant?: 'card' | 'tile'
  className?: string
  count?: number
}

/** The single category/subcategory card used everywhere on the site. */
export function CategoryCard({
  label,
  image,
  to,
  variant = 'card',
  className = '',
  count,
}: CategoryCardProps) {
  if (variant === 'tile') {
    return (
      <Link
        to={to}
        aria-label={label}
        className={`block overflow-hidden rounded-xl transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
      >
        <img
          src={image}
          alt={label}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className={`group flex flex-col items-center gap-2 rounded-xl p-1.5 text-center transition hover:bg-brand-50 ${className}`}
    >
      <div className="w-full overflow-hidden rounded-xl bg-brand-50/70">
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <span className="line-clamp-2 text-[11px] leading-tight font-semibold text-brand-900 sm:text-xs">
        {label}
      </span>
      {count != null && (
        <span className="-mt-1 text-[10px] text-brand-700/50">{count} items</span>
      )}
    </Link>
  )
}
