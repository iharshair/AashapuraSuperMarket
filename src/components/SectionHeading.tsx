import { Link } from 'react-router-dom'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  /** Renders a "See all" link on the right when provided. */
  seeAllTo?: string
  seeAllLabel?: string
}

/** The single heading treatment used above every homepage and listing section. */
export function SectionHeading({
  title,
  subtitle,
  seeAllTo,
  seeAllLabel = 'See all',
}: SectionHeadingProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4 sm:mb-4">
      <div className="min-w-0">
        <h2 className="text-lg font-extrabold tracking-tight text-brand-900 sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-brand-700/70 sm:text-sm">{subtitle}</p>
        )}
      </div>

      {seeAllTo && (
        <Link
          to={seeAllTo}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-50 sm:text-sm"
        >
          {seeAllLabel} &rsaquo;
        </Link>
      )}
    </div>
  )
}
