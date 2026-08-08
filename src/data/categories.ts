import type { Category, Subcategory } from '../types'
import { slugify } from '../lib/format'

/**
 * The full catalogue taxonomy as supplied by the client: 11 categories and 76
 * subcategories. Ids and artwork paths are derived from the names by the same
 * slug rule the asset pipeline uses, so every subcategory resolves to its real
 * supplied image at /images/categories/<category>/<subcategory>.webp.
 *
 * Order is significant — it drives the order of the homepage sections and the
 * header category strip.
 */
const TAXONOMY: Record<string, string[]> = {
  Fresh: [
    'Fresh Fruits',
    'Fresh Vegetables',
    'Milk & Milk Products',
    'Cheese, Paneer & Tofu',
    'Ice Cream & Frozen',
    'Cakes, Rusk & More',
  ],
  'Biscuits, Drinks & Packaged Foods': [
    'Chocolates & Candies',
    'Biscuits & Cookies',
    'Breakfast Cereals',
    'Indian Sweets',
    'Ready To Cook & Eat',
    'Drinks & Juices',
    'Chips & Namkeens',
    'Pickles, Chutney & Flavouring',
    'Spread, Sauces & Ketchup',
    'Noodles, Pasta & Vermicelli',
    'Tea & Coffee',
  ],
  'Cooking Essentials': [
    'Ghee',
    'Dals & Pulses',
    'Atta, Flours & Sooji',
    'Dry Fruits & Nuts',
    'Edible Oils',
    'Rice',
    'Salt, Sugar & Jaggery',
    'Masala, Spices & Mukhwas',
    'Wheat & Soya',
    'Sabudana, Poha & Murmura',
    'Millets & Organic',
  ],
  'Personal Care': [
    'Bath & Hand Wash',
    'Deo & Fragrances',
    'Feminine Hygiene',
    'Hair Care',
    'Oral Care',
    'Health & Wellness',
    "Men's Grooming",
    'Skin Care',
  ],
  Beauty: ['Eyes', 'Beauty Accessories', 'Face', 'Nails & Lips'],
  'Mom & Baby Care': ['Diapers & Wipes', 'Bath, Hygiene & Grooming', 'Food & Feeding'],
  Home: [
    'Pooja Needs',
    'Bags & Travel Luggage',
    'Furniture',
    'Dishwash',
    'Fresheners & Repellents',
    'Shoe Care',
    'Basic Electricals',
    'Detergents & Cleaners',
    'Home Needs',
    'Decor & Gifting',
    'Home & Cleaning Tools',
    'Furnishing & Personal Wear',
    'Games, Toys & Activities',
  ],
  Kitchenware: [
    'Kitchen Tools',
    'Cutting & Chopping',
    'Gas Stove',
    'Flask, Bottle & Tiffin Boxes',
    'Containers & Storage',
    'Pots & Pans',
  ],
  Tableware: ['Dining', 'Barware', 'Cups, Mugs & More', 'Cutlery'],
  'School, Office & Stationery': [
    'Art, Craft & Hobby',
    'Notebooks & Paper Products',
    'Office Supplies',
    'Writing Instruments & Accessories',
    'Party Accessories',
    'School Supplies',
  ],
  Disposables: [
    'Food Wrapping Essentials',
    'Home Hygiene',
    'Plates & Cutlery',
    'Tissues & Napkins',
  ],
}

export const categories: Category[] = Object.entries(TAXONOMY).map(([name, subs]) => {
  const categoryId = slugify(name)
  return {
    id: categoryId,
    name,
    subcategories: subs.map((subName) => ({
      id: slugify(subName),
      name: subName,
      categoryId,
      image: `/images/categories/${categoryId}/${slugify(subName)}.webp`,
    })),
  }
})

export const subcategories: Subcategory[] = categories.flatMap((c) => c.subcategories)

const categoryById = new Map(categories.map((c) => [c.id, c]))
const subcategoryById = new Map(subcategories.map((s) => [s.id, s]))

export const getCategory = (id: string): Category | undefined => categoryById.get(id)
export const getSubcategory = (id: string): Subcategory | undefined => subcategoryById.get(id)

/**
 * The 12 tiles inside the hero banner carousel, in the client's specified
 * order. The supplied artwork (tile-1..tile-12) already has the label rendered
 * into the image, so `label` is used for alt text and links only — never drawn
 * over the tile.
 *
 * These are curated merchandising groupings rather than taxonomy nodes, so each
 * points at whichever category or subcategory route best matches it.
 */
export interface HeroTile {
  label: string
  image: string
  to: string
}

export const heroTiles: HeroTile[] = [
  { label: 'Daily Fresh', to: '/category/fresh' },
  { label: 'Hair Care', to: '/subcategory/hair-care' },
  { label: 'Detergents & Cleaners', to: '/subcategory/detergents-and-cleaners' },
  { label: 'Rice, Atta & Dal', to: '/category/cooking-essentials' },
  { label: 'Oil, Ghee & Sugar', to: '/subcategory/edible-oils' },
  { label: 'Tea, Coffee & More', to: '/subcategory/tea-and-coffee' },
  { label: 'Snacks & Cold Drinks', to: '/category/biscuits-drinks-and-packaged-foods' },
  { label: 'Cheese & Paneer', to: '/subcategory/cheese-paneer-and-tofu' },
  { label: 'Dryfruits & Spices', to: '/subcategory/dry-fruits-and-nuts' },
  { label: 'Oral Care', to: '/subcategory/oral-care' },
  { label: 'Beauty & Grooming', to: '/category/beauty' },
  { label: 'Home & Kitchen', to: '/category/kitchenware' },
].map((tile, i) => ({ ...tile, image: `/images/hero-tiles/tile-${i + 1}.webp` }))

/**
 * The four promo tiles below "Popular Near You". Each uses its supplied
 * artwork (label already baked in) and routes to the closest matching listing.
 */
export interface PromoTile {
  label: string
  image: string
  to: string
}

/**
 * NOTE — three of the four supplied promo-grid files are misnamed. Verified by
 * opening each original in `Aashapura images/Promo Banner Grid/`, the artwork is
 * rotated one position relative to the filenames:
 *
 *   Millets & Cereals.png    actually contains  "Dry Fruits & Nuts"
 *   Dry Fruits & Nuts.png    actually contains  "Milkshakes & Juices"
 *   Milkshakes & Juices.png  actually contains  "Millets & Cereals"
 *   Essentials at Low Prices.png                is correct
 *
 * Each label below therefore points at the file that genuinely holds its
 * artwork. The client's originals are left untouched as the source of truth; if
 * they resupply corrected filenames, delete this mapping and use the obvious
 * slug for each label. Flagged in the README.
 */
export const promoGridTiles: PromoTile[] = [
  {
    label: 'Essentials at Low Prices',
    image: '/images/promo-grid/essentials-at-low-prices.webp',
    to: '/products?sort=price-asc',
  },
  {
    label: 'Millets & Cereals',
    image: '/images/promo-grid/milkshakes-and-juices.webp',
    to: '/subcategory/millets-and-organic',
  },
  {
    label: 'Dry Fruits & Nuts',
    image: '/images/promo-grid/millets-and-cereals.webp',
    to: '/subcategory/dry-fruits-and-nuts',
  },
  {
    label: 'Milkshakes & Juices',
    image: '/images/promo-grid/dry-fruits-and-nuts.webp',
    to: '/subcategory/drinks-and-juices',
  },
]
