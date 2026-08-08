import { Link } from 'react-router-dom'

export function NotFoundPage({ message = 'We could not find that page.' }: { message?: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-5xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-3 text-xl font-extrabold sm:text-2xl">{message}</h1>
      <p className="mt-2 text-sm text-brand-700/70">
        The link may be out of date, or the item may no longer be stocked.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Go to homepage
        </Link>
        <Link
          to="/products"
          className="rounded-xl border border-brand-200 px-5 py-2.5 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
        >
          Browse all products
        </Link>
      </div>
    </div>
  )
}
