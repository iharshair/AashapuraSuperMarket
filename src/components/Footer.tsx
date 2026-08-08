import { Link } from 'react-router-dom'
import { categories } from '../data/categories'
import { store, store_address_full } from '../config/store'
import { deliveryPolicyText } from '../lib/delivery'

export function Footer() {
  return (
    <footer className="mt-10 border-t border-brand-100 bg-brand-900 text-white/90">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* ------------------------------------------------------ brand */}
        <div>
          <div className="inline-flex rounded-xl bg-white p-2">
            <img
              src="/images/brand/logo.webp"
              alt={store.name}
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="mt-3 text-sm font-bold text-white">{store.name}</p>
          <p className="text-xs text-white/60">{store.nameLocal}</p>
          <p className="mt-2 text-sm text-white/70">{store.tagline}</p>
        </div>

        {/* ---------------------------------------------------- contact */}
        <div>
          <h3 className="mb-3 text-sm font-extrabold text-accent-400">Reach us</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`tel:+${store.phoneRaw}`} className="hover:text-accent-400">
                {store.phone}
              </a>
            </li>
            <li>
              <a
                href={store.whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 hover:text-accent-400"
              >
                <WhatsAppIcon />
                Chat on WhatsApp
              </a>
            </li>
            {/*
              The client has not supplied an email yet, so the row is omitted
              rather than filled with a placeholder address.
            */}
            {store.email && (
              <li>
                <a href={`mailto:${store.email}`} className="hover:text-accent-400">
                  {store.email}
                </a>
              </li>
            )}
            <li className="pt-1 text-white/70">{store.openingHours}</li>
          </ul>
        </div>

        {/* ---------------------------------------------------- address */}
        <div>
          <h3 className="mb-3 text-sm font-extrabold text-accent-400">Store address</h3>
          <p className="text-sm leading-relaxed text-white/80">{store_address_full}</p>
          <a
            href={store.mapsUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold transition hover:bg-white/20"
          >
            <PinIcon />
            Get directions
          </a>
          <p className="mt-2 text-[11px] text-white/45">
            {store.coordinates.lat}, {store.coordinates.lng}
          </p>
        </div>

        {/* -------------------------------------------------- categories */}
        <div>
          <h3 className="mb-3 text-sm font-extrabold text-accent-400">Shop</h3>
          <ul className="grid grid-cols-1 gap-1 text-sm">
            {categories.slice(0, 8).map((category) => (
              <li key={category.id}>
                <Link to={`/category/${category.id}`} className="text-white/75 hover:text-accent-400">
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/products" className="font-bold text-white hover:text-accent-400">
                All products &rsaquo;
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* --------------------------------------------- delivery policy */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="rounded-xl bg-white/5 p-3.5">
            <p className="text-xs font-extrabold text-accent-400">Delivery information</p>
            <p className="mt-1 text-xs leading-relaxed text-white/70">{deliveryPolicyText()}</p>
          </div>

          <p className="mt-4 text-center text-[11px] text-white/40">
            © {new Date().getFullYear()} {store.name}. Prices and product images shown are
            indicative and pending final confirmation.
          </p>
        </div>
      </div>
    </footer>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="currentColor">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.4 1.27 4.84L2 22l5.34-1.4a9.9 9.9 0 0 0 4.7 1.2c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.35-.54.05-1.03.24-2.9-.6-2.25-1-3.66-3.37-3.77-3.52-.11-.16-.9-1.25-.9-2.38 0-1.13.6-1.68.81-1.9.2-.23.44-.28.6-.28h.42c.14 0 .32-.03.5.38.18.42.65 1.6.7 1.72.06.12.1.26.02.42-.08.16-.15.26-.3.42-.14.16-.3.35-.43.47-.14.14-.29.29-.13.57.16.28.7 1.16 1.5 1.88.94.83 1.73 1.09 2 1.21.26.12.42.1.57-.06.16-.16.68-.79.86-1.06.18-.27.36-.22.6-.13.25.09 1.55.73 1.82.86.27.14.45.2.51.32.06.11.06.66-.18 1.34Z" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
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
