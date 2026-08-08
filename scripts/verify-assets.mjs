/**
 * Guards against silent broken images.
 *
 * The data layer derives every artwork path from a category/subcategory NAME via
 * `slugify`. If a name in src/data/categories.ts drifts even slightly from the
 * supplied filename (a comma, an ampersand, an apostrophe), the path still
 * builds fine and the site just renders a broken image. This script fails loudly
 * instead.
 *
 * It extracts the string literals from the TAXONOMY block rather than importing
 * the TS module, so it stays dependency-free.
 */
import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { slugify } from './build-assets.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const IMAGES = path.join(ROOT, 'public', 'images')

const source = await readFile(path.join(ROOT, 'src', 'data', 'categories.ts'), 'utf8')

// Pull out the TAXONOMY object literal and read its keys (categories) and
// array members (subcategories).
const block = source.match(/const TAXONOMY[^=]*=\s*\{([\s\S]*?)\n\}/)
if (!block) {
  console.error('[verify] could not locate the TAXONOMY block in categories.ts')
  process.exit(1)
}

const expected = []
let currentCategory = null
for (const rawLine of block[1].split('\n')) {
  const line = rawLine.trim()
  // Category key: either `Fresh: [` or `'Personal Care': [`
  const key = line.match(/^'?([^':]+?)'?:\s*\[/)
  if (key) {
    currentCategory = slugify(key[1])
    // Handle a single-line array: `Beauty: ['Eyes', 'Face'],`
    const inline = line.slice(line.indexOf('[') + 1)
    for (const m of inline.matchAll(/'([^']+)'|"([^"]+)"/g)) {
      expected.push([currentCategory, m[1] ?? m[2]])
    }
    continue
  }
  if (!currentCategory) continue
  for (const m of line.matchAll(/'([^']+)'|"([^"]+)"/g)) {
    expected.push([currentCategory, m[1] ?? m[2]])
  }
}

const missing = []
for (const [categoryId, subName] of expected) {
  const rel = path.join('categories', categoryId, `${slugify(subName)}.webp`)
  if (!existsSync(path.join(IMAGES, rel))) missing.push(`${subName}  ->  images/${rel}`)
}

// Also confirm nothing supplied by the client is going unused.
const used = new Set(
  expected.map(([c, s]) => path.join('categories', c, `${slugify(s)}.webp`)),
)
const orphans = []
const categoryRoot = path.join(IMAGES, 'categories')
if (existsSync(categoryRoot)) {
  for (const dir of await readdir(categoryRoot)) {
    for (const file of await readdir(path.join(categoryRoot, dir))) {
      const rel = path.join('categories', dir, file)
      if (!used.has(rel)) orphans.push(`images/${rel}`)
    }
  }
}

// Fixed paths referenced directly by components.
const fixed = [
  'brand/logo.webp',
  'hero/hero-background.webp',
  'promo-banners/starting-at-9.webp',
  'promo-banners/price-drop.webp',
  'promo-grid/essentials-at-low-prices.webp',
  'promo-grid/millets-and-cereals.webp',
  'promo-grid/dry-fruits-and-nuts.webp',
  'promo-grid/milkshakes-and-juices.webp',
  ...Array.from({ length: 12 }, (_, i) => `hero-tiles/tile-${i + 1}.webp`),
]
for (const rel of fixed) {
  if (!existsSync(path.join(IMAGES, rel))) missing.push(`(fixed path)  ->  images/${rel}`)
}

if (missing.length) {
  console.error(`[verify] ${missing.length} referenced image(s) missing:`)
  for (const m of missing) console.error(`  - ${m}`)
}
if (orphans.length) {
  console.warn(`[verify] ${orphans.length} supplied image(s) not referenced by any subcategory:`)
  for (const o of orphans) console.warn(`  - ${o}`)
}
if (missing.length) process.exit(1)

console.log(
  `[verify] OK — ${expected.length} subcategories + ${fixed.length} fixed paths all resolve`,
)
