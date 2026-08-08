# Aashapura Super Market — Storefront

Front-end for a local grocery/kirana supermarket in Lohegaon, Pune. Quick-commerce
shopping experience adapted for the web: browse → search → cart → checkout, with no
account or login anywhere in the flow.

**This pass is front-end only.** There is no backend, database, authentication or
payment gateway. All catalogue data is mock data in `src/data/`, shaped so it can be
swapped for API calls without touching components.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server (regenerates web images first) |
| `npm run build` | Generate images, typecheck, production build |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | TypeScript only |
| `npm run assets` | Regenerate `public/images` (add `--force` to overwrite) |
| `npm run verify:assets` | Assert every referenced image actually exists |

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · React Router 7. No UI component
library — the shared primitives in `src/components/` are the design system.

## Images

The client's originals live in **`Aashapura images/`** and are the source of truth;
nothing modifies them. `scripts/build-assets.mjs` copies them into `public/images/`
as resized `.webp` with URL-safe names.

This step is not cosmetic: the originals total **163 MB** (the logo alone is 3.2 MB),
which would be unusable on mobile data. The pipeline brings that to **2.4 MB**. It
also fixes filenames that are hostile to URLs and to Windows — a colon in
`Hero banner background:graphic/`, a stray quote and a `₹` in
`Starting at ₹9" banner.png`.

`public/images/` is gitignored because it is derived. `npm run build` regenerates it,
so a fresh clone or a CI deploy needs no extra step.

Category artwork is resolved by slugifying the subcategory name, so a name that drifts
from its filename would silently render a broken image. `npm run verify:assets` guards
against that and also reports any supplied image that nothing references.

## Architecture

```
src/
  config/store.ts     Business info, editable copy, delivery rules
  types.ts            Domain types (API-shaped)
  data/
    categories.ts     11 categories → 76 subcategories, hero + promo tiles
    products.ts       Mock catalogue (245 products)
  context/
    CartContext.tsx   Cart reducer, persisted to localStorage
    LocationContext.tsx  Chosen delivery area
  lib/                money/discount formatting, sorting, delivery pricing
  components/         Shared UI, one implementation per pattern
  pages/              One file per route
```

Everything the client is likely to want changed without a developer lives in
`src/config/store.ts` — contact details, the hero headline, and the delivery rules.

### Routes

`/` · `/products` · `/price-drop` · `/category/:categoryId` ·
`/subcategory/:subcategoryId` · `/product/:productId` · `/cart` · `/checkout`

`/products` also serves search results via `?q=`, and all listing pages accept
`?sort=price-asc|price-desc|discount|name-asc`.

### Ready for the admin panel

`Product` already carries the fields an admin panel will need to control:

| Field | Purpose |
| --- | --- |
| `category` / `subcategory` | Exactly one of each per product; drives all routing |
| `price` / `mrp` | `mrp` renders struck through, with the discount % badge |
| `isPriceDrop` | Feature a product on the Price Drop page |
| `isPopularNearYou` | Numeric pin for the homepage row; unpinned falls back to cheapest-first |
| `stock` | `0` renders the card as out of stock |
| `unit` | Pack size shown on the card |

Wiring a backend means replacing the exports in `src/data/`. Component code reads
those helpers only.

---

## Open questions for the client

Please confirm these — several are assumptions, and two are problems in the supplied
files.

### 1. Three promo-grid images are misnamed

Verified by opening each original in `Aashapura images/Promo Banner Grid/`. The
artwork is rotated one position relative to the filenames:

| Filename | Artwork it actually contains |
| --- | --- |
| `Millets & Cereals.png` | Dry Fruits & Nuts |
| `Dry Fruits & Nuts.png` | Milkshakes & Juices |
| `Milkshakes & Juices.png` | Millets & Cereals |
| `Essentials at Low Prices.png` | correct |

Worked around in `promoGridTiles` (`src/data/categories.ts`) by pointing each label at
the file that genuinely holds its artwork, so the site is correct today. Please
resupply with corrected names and that mapping can be deleted. The 76 category images
are **not** affected.

### 2. The hero background has conflicting text baked into it

`Hero Section.png` has **"DEALS STARTING FROM JUST ₹7"** rendered into the image. That
fights the delivery-promise headline this section is specified to carry, and it
contradicts the **₹9** promo banner directly below it. It is currently pushed back
with a blur and a heavy scrim so it reads as texture. A clean plate with no text would
be much better — please confirm whether the offer is ₹7 or ₹9.

### 3. Delivery-fee rounding — assumption

Distance beyond the free 4 km is **rounded up to the next whole km**. So 6.5 km bills
3 km (₹120), not 2.5 km (₹100). Not confirmed by you. Toggle `roundUpToWholeKm` in
`src/config/store.ts` for exact fractional billing.

### 4. No maximum delivery distance

None is defined, so nothing is rejected on distance. Set `maxDistanceKm` when you
decide a cutoff.

### 5. Placeholder hero copy

**"Delivery under 19 Minutes"** is placeholder wording. Edit `heroCopy` in
`src/config/store.ts`.

### 6. Prices and pack sizes are demo values

You supplied 11 product photographs and their real names, but no pricing. **All prices,
pack sizes and stock levels in this build are invented** for demonstration, including
those on the 11 "Popular Near You" products. Nothing here is a real price.

### 7. No email address yet

The footer email row is hidden rather than showing an invented address. Add `email` to
`src/config/store.ts` when you have one.

### 8. Delivery areas are mocked

There is no geolocation. The area picker offers a hand-written list of nearby areas
with approximate distances purely so the fee UI can be demonstrated. Real distance
calculation needs a routing API in the backend phase.

### 9. Product detail page had no reference design

Built to standard quick-commerce conventions: large image, pack-size selector, price
with MRP and discount, add to cart, details, related products.

---

## Not in this pass

No backend, database or real authentication. No payment gateway — choosing "Online
Payment" is UI only and charges nothing. No real geolocation. Placing an order clears
the cart and shows a local confirmation; nothing is transmitted.
