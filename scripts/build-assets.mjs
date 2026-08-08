/**
 * Asset pipeline for Aashapura Super Market.
 *
 * The client supplied ~96 source images inside the `Aashapura images/` folder.
 * Those originals are the source of truth and are never modified. This script
 * copies them into `public/images/` with:
 *
 *   1. URL-safe slugified filenames. Several originals contain characters that
 *      are hostile to URLs / Windows filesystems, e.g.:
 *        - `Hero banner background:graphic/`     (colon in a directory name)
 *        - `Starting at ₹9" banner.png`          (stray quote + rupee sign)
 *        - `Nails & Lips.png`                    (ampersands)
 *   2. Sensible web dimensions. The raw assets total ~164MB (the logo alone is
 *      3.2MB) which would make the site unusable on mobile data.
 *   3. Converted to .webp, with the logo's huge transparent padding trimmed.
 *
 * Run with `--force` to regenerate assets that already exist.
 *
 * Output is gitignored — it is a derived artifact. `npm run build` runs this
 * automatically, so a fresh clone or CI deploy needs no extra step.
 */
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'Aashapura images')
const OUT = path.join(ROOT, 'public', 'images')
const FORCE = process.argv.includes('--force')

/** Slugify a label into a URL-safe token: "Nails & Lips" -> "nails-and-lips" */
export function slugify(input) {
  return input
    .normalize('NFKD')
    .replace(/['’"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

/**
 * Each source directory maps to an output directory, a max width, and a
 * strategy for turning the original filename into an output slug.
 */
const GROUPS = [
  {
    src: 'Aashapura Super Market Logo',
    out: 'brand',
    width: 480,
    trim: true,
    name: () => 'logo',
  },
  {
    src: 'Hero banner background:graphic',
    out: 'hero',
    width: 1600,
    name: () => 'hero-background',
  },
  {
    // Files are named 1.png .. 12.png and already have their category label
    // rendered into the artwork. Kept numeric so the data layer owns the order.
    src: 'Hero carousel category tiles',
    out: 'hero-tiles',
    width: 400,
    name: (base) => `tile-${base}`,
  },
  {
    src: 'Two Horizontal Promo Banners',
    out: 'promo-banners',
    width: 1200,
    name: (base) => {
      // `"Price Drop" banner` / `Starting at ₹9" banner`
      if (/price\s*drop/i.test(base)) return 'price-drop'
      if (/starting/i.test(base)) return 'starting-at-9'
      return slugify(base)
    },
  },
  { src: 'Promo Banner Grid', out: 'promo-grid', width: 700 },
  { src: 'Popular Near You', out: 'products', width: 600, name: productName },
  {
    // Nested one level deeper: `Grocery Category/<Category>/<Subcategory>.png`
    src: 'Grocery Category',
    out: 'categories',
    width: 400,
    nested: true,
  },
]

/**
 * The 11 "Popular Near You" photos were supplied with inconsistent casing and
 * possessive apostrophes. Normalise them onto the product ids used in
 * src/data/products.ts.
 */
const PRODUCT_ALIASES = {
  'surf excel': 'surf-excel',
  'aashirvaad aata': 'aashirvaad-aata',
  'parachute coconut hair oil': 'parachute-coconut-hair-oil',
  almonds: 'almonds',
  'daawat basmati rice': 'daawat-basmati-rice',
  cashew: 'cashew',
  "hair & shoulder's": 'head-and-shoulders',
  'fortune oil': 'fortune-oil',
  'amul milk': 'amul-milk',
  vim: 'vim',
  "banana's": 'bananas',
}

function productName(base) {
  const key = base.trim().toLowerCase()
  return PRODUCT_ALIASES[key] ?? slugify(base)
}

const IMAGE_RE = /\.(png|jpe?g|webp)$/i

async function collect(dir, group, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  const jobs = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (!group.nested) continue
      // Category folder name becomes a subdirectory: categories/<category>/
      jobs.push(...(await collect(full, group, slugify(entry.name))))
      continue
    }
    if (!IMAGE_RE.test(entry.name)) continue

    const base = entry.name.replace(IMAGE_RE, '')
    const slug = group.name ? group.name(base) : slugify(base)
    jobs.push({
      from: full,
      to: path.join(OUT, group.out, prefix, `${slug}.webp`),
      width: group.width,
      trim: group.trim ?? false,
    })
  }
  return jobs
}

async function run() {
  if (!existsSync(SRC)) {
    console.error(`[assets] source folder not found: ${SRC}`)
    process.exit(1)
  }

  const jobs = []
  for (const group of GROUPS) {
    const dir = path.join(SRC, group.src)
    if (!existsSync(dir)) {
      console.warn(`[assets] skipping missing group: ${group.src}`)
      continue
    }
    jobs.push(...(await collect(dir, group)))
  }

  let written = 0
  let skipped = 0
  let bytesIn = 0
  let bytesOut = 0

  for (const job of jobs) {
    await mkdir(path.dirname(job.to), { recursive: true })
    bytesIn += (await stat(job.from)).size

    if (!FORCE && existsSync(job.to)) {
      skipped += 1
      bytesOut += (await stat(job.to)).size
      continue
    }

    let img = sharp(job.from)
    // The logo is mostly transparent padding; trim it so it can be sized by
    // height in the header without appearing tiny.
    if (job.trim) img = img.trim({ threshold: 10 })
    const buf = await img
      .resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toBuffer()

    await writeFile(job.to, buf)
    bytesOut += buf.byteLength
    written += 1
  }

  const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`
  console.log(
    `[assets] ${jobs.length} images (${written} written, ${skipped} cached) ` +
      `${mb(bytesIn)} -> ${mb(bytesOut)}`,
  )

  if (jobs.length === 0) {
    console.error('[assets] no images matched — check the source folder layout')
    process.exit(1)
  }
}

// Only build when invoked directly. `verify-assets.mjs` imports `slugify` from
// this module and must not trigger a rebuild as a side effect.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  run().catch((err) => {
    console.error('[assets] failed:', err)
    process.exit(1)
  })
}
