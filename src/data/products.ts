import type { Product } from '../types'
import { getSubcategory, subcategories } from './categories'
import { slugify } from '../lib/format'

/**
 * MOCK CATALOGUE — replace with API data in the backend phase.
 *
 * Every one of the 76 subcategories is seeded so that no listing page is ever
 * empty during review. Prices are plausible demo values, NOT client-confirmed.
 *
 * Seed shape: [name, price, mrp, unit]
 */
type Seed = [string, number, number, string]

const CATALOGUE: Record<string, Seed[]> = {
  // ---------------------------------------------------------------- 1. Fresh
  'fresh-fruits': [
    ['Shimla Apple', 145, 165, '1 kg'],
    ['Nagpur Orange', 90, 100, '1 kg'],
    ['Pomegranate', 110, 130, '500 g'],
  ],
  'fresh-vegetables': [
    ['Tomato', 32, 40, '1 kg'],
    ['Onion', 30, 38, '1 kg'],
    ['Potato', 28, 35, '1 kg'],
    ['Coriander Leaves', 12, 15, '100 g'],
  ],
  'milk-and-milk-products': [
    ['Amul Butter', 285, 295, '500 g'],
    ['Amul Masti Dahi', 45, 50, '400 g'],
    ['Nestlé A+ Slim Milk', 78, 85, '1 L'],
  ],
  'cheese-paneer-and-tofu': [
    ['Amul Cheese Slices', 135, 150, '200 g'],
    ['Fresh Malai Paneer', 95, 110, '200 g'],
    ['Britannia Cheese Cubes', 140, 155, '200 g'],
  ],
  'ice-cream-and-frozen': [
    ['Amul Vanilla Ice Cream Tub', 180, 210, '700 ml'],
    ['Cornetto Chocolate Cone', 65, 70, '110 ml'],
    ['McCain French Fries', 145, 165, '420 g'],
  ],
  'cakes-rusk-and-more': [
    ['Britannia Premium Rusk', 55, 60, '300 g'],
    ['Chocolate Truffle Cake Slice', 85, 95, '150 g'],
    ['Britannia Fruit Cake', 70, 75, '250 g'],
  ],

  // ------------------------------ 2. Biscuits, Drinks & Packaged Foods
  'chocolates-and-candies': [
    ['Cadbury Dairy Milk', 45, 50, '55 g'],
    ['Nestlé KitKat', 20, 20, '27 g'],
    ['Alpenliebe Gold', 35, 40, '100 g'],
  ],
  'biscuits-and-cookies': [
    ['Parle-G Gold', 30, 35, '200 g'],
    ['Britannia Good Day Cashew', 45, 50, '200 g'],
    ['Oreo Vanilla Creme', 40, 45, '120 g'],
  ],
  'breakfast-cereals': [
    ["Kellogg's Corn Flakes", 185, 210, '475 g'],
    ['Quaker Oats', 165, 180, '1 kg'],
    ['Bagrrys Muesli', 320, 360, '500 g'],
  ],
  'indian-sweets': [
    ['Haldiram Soan Papdi', 95, 110, '250 g'],
    ['Kaju Katli', 420, 460, '250 g'],
    ['Gulab Jamun Tin', 180, 200, '500 g'],
  ],
  'ready-to-cook-and-eat': [
    ['MTR Poha Mix', 55, 62, '160 g'],
    ['Gits Idli Mix', 95, 105, '500 g'],
    ['Haldiram Paneer Butter Masala', 110, 125, '285 g'],
  ],
  'drinks-and-juices': [
    ['Real Mixed Fruit Juice', 110, 125, '1 L'],
    ['Coca-Cola', 40, 45, '750 ml'],
    ['Tropicana Orange Delight', 105, 120, '1 L'],
    ['Rooh Afza Sharbat', 175, 195, '750 ml'],
  ],
  'chips-and-namkeens': [
    ['Haldiram Aloo Bhujia', 55, 60, '200 g'],
    ["Lay's Classic Salted", 20, 20, '52 g'],
    ['Kurkure Masala Munch', 20, 20, '90 g'],
  ],
  'pickles-chutney-and-flavouring': [
    ['Mothers Recipe Mango Pickle', 95, 110, '500 g'],
    ['Priya Lemon Pickle', 85, 95, '300 g'],
    ['Ching Secret Green Chutney', 65, 75, '190 g'],
  ],
  'spread-sauces-and-ketchup': [
    ['Kissan Fresh Tomato Ketchup', 95, 110, '850 g'],
    ['Nutella Hazelnut Spread', 385, 420, '350 g'],
    ['Veeba Mayonnaise', 105, 120, '250 g'],
  ],
  'noodles-pasta-and-vermicelli': [
    ['Maggi 2-Minute Noodles', 60, 66, '4 x 70 g'],
    ['Del Monte Penne Pasta', 95, 110, '500 g'],
    ['Bambino Roasted Vermicelli', 45, 50, '400 g'],
  ],
  'tea-and-coffee': [
    ['Tata Tea Premium', 265, 290, '500 g'],
    ['Red Label Natural Care', 285, 310, '500 g'],
    ['Nescafé Classic', 320, 350, '100 g'],
    ['Bru Instant Coffee', 175, 195, '100 g'],
  ],

  // ------------------------------------------------- 3. Cooking Essentials
  ghee: [
    ['Amul Pure Cow Ghee', 640, 700, '1 L'],
    ['Gowardhan Cow Ghee', 610, 660, '1 L'],
    ['Patanjali Desi Ghee', 585, 640, '500 ml'],
  ],
  'dals-and-pulses': [
    ['Toor Dal', 165, 185, '1 kg'],
    ['Moong Dal', 140, 155, '1 kg'],
    ['Chana Dal', 95, 110, '1 kg'],
    ['Rajma Chitra', 155, 175, '1 kg'],
  ],
  'atta-flours-and-sooji': [
    ['Besan (Gram Flour)', 85, 95, '500 g'],
    ['Maida Refined Flour', 45, 52, '500 g'],
    ['Bombay Rava Sooji', 48, 55, '500 g'],
  ],
  'dry-fruits-and-nuts': [
    ['Walnut Kernels', 340, 380, '200 g'],
    ['Raisins (Kishmish)', 120, 135, '250 g'],
    ['Pistachio Roasted & Salted', 320, 360, '200 g'],
  ],
  'edible-oils': [
    ['Saffola Gold Oil', 185, 205, '1 L'],
    ['Dhara Mustard Oil', 165, 180, '1 L'],
    ['Figaro Olive Oil', 480, 540, '500 ml'],
  ],
  rice: [
    ['India Gate Basmati Classic', 180, 200, '1 kg'],
    ['Kolam Rice', 78, 88, '1 kg'],
    ['Sona Masoori Rice', 85, 95, '1 kg'],
  ],
  'salt-sugar-and-jaggery': [
    ['Tata Salt', 28, 30, '1 kg'],
    ['Sugar', 52, 58, '1 kg'],
    ['Organic Jaggery Blocks', 78, 88, '500 g'],
  ],
  'masala-spices-and-mukhwas': [
    ['Everest Turmeric Powder', 42, 48, '200 g'],
    ['MDH Garam Masala', 88, 98, '100 g'],
    ['Everest Red Chilli Powder', 95, 105, '200 g'],
    ['Mixed Mukhwas', 65, 75, '200 g'],
  ],
  'wheat-and-soya': [
    ['Sharbati Wheat Grain', 340, 380, '10 kg'],
    ['Nutrela Soya Chunks', 68, 78, '200 g'],
    ['Soya Flour', 72, 82, '500 g'],
  ],
  'sabudana-poha-and-murmura': [
    ['Sabudana (Sago)', 78, 88, '500 g'],
    ['Thick Poha', 42, 48, '500 g'],
    ['Murmura (Puffed Rice)', 35, 40, '250 g'],
  ],
  'millets-and-organic': [
    ['Organic Ragi Flour', 95, 110, '500 g'],
    ['Bajra Whole', 68, 78, '1 kg'],
    ['Organic Quinoa', 285, 320, '500 g'],
    ['Jowar Flour', 72, 82, '500 g'],
  ],

  // ----------------------------------------------------- 4. Personal Care
  'bath-and-hand-wash': [
    ['Dove Cream Beauty Bar', 62, 70, '100 g'],
    ['Lifebuoy Handwash Refill', 99, 115, '750 ml'],
    ['Santoor Sandal Soap', 38, 44, '4 x 100 g'],
  ],
  'deo-and-fragrances': [
    ['Fogg Scent Napoleon', 285, 320, '100 ml'],
    ['Nivea Fresh Active Deo', 210, 240, '150 ml'],
    ['Engage Perfume Spray', 240, 275, '120 ml'],
  ],
  'feminine-hygiene': [
    ['Whisper Ultra Clean XL', 190, 215, '30 pads'],
    ['Stayfree Secure Cottony', 145, 165, '20 pads'],
    ['Sirona Intimate Wash', 235, 265, '100 ml'],
  ],
  'hair-care': [
    ['Dove Intense Repair Shampoo', 265, 299, '650 ml'],
    ['Indulekha Bringha Oil', 320, 360, '100 ml'],
  ],
  'oral-care': [
    ['Colgate Strong Teeth', 105, 118, '200 g'],
    ['Sensodyne Fresh Mint', 165, 185, '150 g'],
    ['Oral-B Toothbrush Pack', 99, 115, '3 pcs'],
    ['Listerine Cool Mint', 185, 210, '500 ml'],
  ],
  'health-and-wellness': [
    ['Horlicks Classic Malt', 285, 320, '500 g'],
    ['Dabur Chyawanprash', 285, 320, '500 g'],
    ['Digital Thermometer', 220, 260, '1 pc'],
  ],
  'mens-grooming': [
    ['Gillette Mach3 Cartridges', 320, 360, '4 pcs'],
    ['Beardo Beard Oil', 285, 320, '50 ml'],
    ['Nivea Men Shaving Foam', 195, 220, '200 ml'],
  ],
  'skin-care': [
    ['Nivea Soft Cream', 175, 199, '200 ml'],
    ['Ponds Super Light Gel', 165, 185, '147 ml'],
    ['Lakmé Sun Expert SPF 50', 240, 270, '50 ml'],
  ],

  // ------------------------------------------------------------ 5. Beauty
  eyes: [
    ['Maybelline Colossal Kajal', 210, 240, '0.35 g'],
    ['Lakmé Eyeconic Mascara', 340, 380, '9 ml'],
    ['Insight Eyeshadow Palette', 420, 480, '1 pc'],
  ],
  'beauty-accessories': [
    ['Makeup Blender Sponge Set', 165, 199, '4 pcs'],
    ['Professional Brush Set', 480, 560, '8 pcs'],
    ['Cotton Pads', 85, 95, '100 pcs'],
  ],
  face: [
    ['Lakmé 9to5 Foundation', 480, 550, '30 ml'],
    ['Maybelline Fit Me Compact', 285, 320, '8 g'],
    ['Blush Duo Palette', 320, 380, '1 pc'],
  ],
  'nails-and-lips': [
    ['Maybelline Sensational Lipstick', 340, 399, '3.9 g'],
    ['Nail Polish Set', 199, 240, '3 pcs'],
    ['Nivea Lip Balm', 145, 165, '4.8 g'],
  ],

  // ----------------------------------------------------- 6. Mom & Baby Care
  'diapers-and-wipes': [
    ['Pampers All Round Protection M', 720, 799, '56 pcs'],
    ['Huggies Wonder Pants L', 680, 750, '48 pcs'],
    ['Himalaya Baby Wipes', 185, 210, '72 pcs'],
  ],
  'bath-hygiene-and-grooming': [
    ['Johnson Baby Shampoo', 195, 220, '200 ml'],
    ['Himalaya Baby Powder', 145, 165, '200 g'],
    ['Sebamed Baby Wash', 340, 390, '200 ml'],
  ],
  'food-and-feeding': [
    ['Cerelac Wheat Apple', 285, 320, '300 g'],
    ['Philips Feeding Bottle', 420, 480, '260 ml'],
    ['Nestum Rice Cereal', 265, 295, '300 g'],
  ],

  // -------------------------------------------------------------- 7. Home
  'pooja-needs': [
    ['Cycle Agarbatti Pack', 85, 95, '100 sticks'],
    ['Pure Camphor Tablets', 120, 140, '100 g'],
    ['Brass Diya Set', 285, 340, '4 pcs'],
    ['Cotton Wicks', 35, 40, '200 pcs'],
  ],
  'bags-and-travel-luggage': [
    ['Wildcraft Backpack 35 L', 1450, 1799, '1 pc'],
    ['Trolley Suitcase 24 inch', 2850, 3499, '1 pc'],
    ['Jute Shopping Bag', 145, 175, '1 pc'],
  ],
  furniture: [
    ['Folding Plastic Chair', 780, 950, '1 pc'],
    ['Wall Mount Shelf', 640, 799, '1 pc'],
    ['Foldable Study Table', 1850, 2299, '1 pc'],
  ],
  dishwash: [
    ['Vim Dishwash Liquid Refill', 185, 210, '1.8 L'],
    ['Scotch-Brite Scrub Pad', 45, 52, '3 pcs'],
  ],
  'fresheners-and-repellents': [
    ['Odonil Room Freshener', 78, 88, '48 g'],
    ['Good Knight Gold Flash Refill', 95, 110, '45 ml'],
    ['All Out Ultra Refill', 85, 95, '45 ml'],
  ],
  'shoe-care': [
    ['Cherry Blossom Shoe Polish', 68, 78, '40 g'],
    ['Shoe Cleaning Brush', 95, 115, '1 pc'],
    ['Sneaker Cleaning Wipes', 165, 190, '20 pcs'],
  ],
  'basic-electricals': [
    ['LED Bulb 9W', 95, 120, '1 pc'],
    ['Extension Board 4 Socket', 320, 399, '1 pc'],
    ['AA Alkaline Batteries', 145, 170, '4 pcs'],
  ],
  'detergents-and-cleaners': [
    ['Ariel Matic Front Load', 420, 470, '2 kg'],
    ['Harpic Power Plus', 185, 210, '1 L'],
    ['Lizol Floor Cleaner', 225, 255, '975 ml'],
  ],
  'home-needs': [
    ['Plastic Bucket 20 L', 285, 340, '1 pc'],
    ['Cloth Drying Stand', 1150, 1399, '1 pc'],
    ['Hangers Set', 199, 240, '12 pcs'],
  ],
  'decor-and-gifting': [
    ['LED Fairy String Lights', 185, 230, '10 m'],
    ['Artificial Flower Vase Set', 480, 580, '1 pc'],
    ['Photo Frame Collage', 420, 520, '6 pcs'],
  ],
  'home-and-cleaning-tools': [
    ['Spin Mop with Bucket', 899, 1099, '1 pc'],
    ['Microfibre Cleaning Cloth', 165, 199, '4 pcs'],
    ['Floor Wiper', 245, 290, '1 pc'],
  ],
  'furnishing-and-personal-wear': [
    ['Cotton Bath Towel', 340, 420, '1 pc'],
    ['Double Bedsheet Set', 780, 999, '1 set'],
    ['Cotton Socks', 145, 180, '3 pairs'],
  ],
  'games-toys-and-activities': [
    ['Ludo & Snakes Board Game', 185, 230, '1 pc'],
    ['Building Blocks Set', 480, 599, '100 pcs'],
    ['Playing Cards', 65, 80, '2 decks'],
  ],

  // ------------------------------------------------------- 8. Kitchenware
  'kitchen-tools': [
    ['Stainless Steel Peeler', 85, 105, '1 pc'],
    ['Silicone Spatula Set', 245, 299, '4 pcs'],
    ['Manual Atta Chakki Sieve', 165, 199, '1 pc'],
  ],
  'cutting-and-chopping': [
    ['Chef Knife 8 inch', 385, 460, '1 pc'],
    ['Bamboo Chopping Board', 340, 420, '1 pc'],
    ['Vegetable Chopper', 445, 549, '1 pc'],
  ],
  'gas-stove': [
    ['2 Burner Gas Stove', 2450, 2999, '1 pc'],
    ['Gas Lighter', 95, 120, '1 pc'],
    ['Stove Drip Tray', 185, 225, '2 pcs'],
  ],
  'flask-bottle-and-tiffin-boxes': [
    ['Milton Thermosteel Flask', 785, 949, '500 ml'],
    ['Steel Lunch Box 3 Container', 545, 660, '1 set'],
    ['Copper Water Bottle', 480, 599, '1 L'],
  ],
  'containers-and-storage': [
    ['Airtight Container Set', 545, 680, '5 pcs'],
    ['Steel Storage Drum 10 kg', 785, 940, '1 pc'],
    ['Glass Jar with Lid', 245, 299, '1 L'],
  ],
  'pots-and-pans': [
    ['Non-Stick Tawa 28 cm', 685, 840, '1 pc'],
    ['Pressure Cooker 3 L', 1450, 1799, '1 pc'],
    ['Steel Kadai 24 cm', 780, 950, '1 pc'],
  ],

  // --------------------------------------------------------- 9. Tableware
  dining: [
    ['Dinner Plate Set', 680, 840, '6 pcs'],
    ['Melamine Serving Bowl', 285, 350, '2 pcs'],
    ['Steel Thali Set', 545, 660, '4 pcs'],
  ],
  barware: [
    ['Glass Tumbler Set', 385, 470, '6 pcs'],
    ['Steel Cocktail Shaker', 445, 549, '1 pc'],
    ['Ice Cube Tray', 145, 180, '2 pcs'],
  ],
  'cups-mugs-and-more': [
    ['Ceramic Coffee Mug Set', 385, 470, '4 pcs'],
    ['Steel Tea Cups', 245, 299, '6 pcs'],
    ['Insulated Travel Mug', 445, 549, '350 ml'],
  ],
  cutlery: [
    ['Steel Spoon Set', 185, 230, '12 pcs'],
    ['Fork & Knife Set', 285, 350, '12 pcs'],
    ['Serving Ladle Set', 245, 299, '3 pcs'],
  ],

  // ----------------------------------------- 10. School, Office & Stationery
  'art-craft-and-hobby': [
    ['Camlin Oil Pastels', 145, 175, '25 shades'],
    ['Acrylic Paint Set', 285, 350, '12 tubes'],
    ['Craft Glue Stick', 45, 55, '3 pcs'],
  ],
  'notebooks-and-paper-products': [
    ['Classmate Ruled Notebook', 65, 75, '172 pages'],
    ['A4 Copier Paper Ream', 340, 399, '500 sheets'],
    ['Spiral Notepad', 85, 99, '160 pages'],
  ],
  'office-supplies': [
    ['Stapler with Pins', 145, 180, '1 pc'],
    ['File Folder Set', 185, 225, '10 pcs'],
    ['Sticky Notes Pack', 95, 115, '400 sheets'],
  ],
  'writing-instruments-and-accessories': [
    ['Cello Gel Pen Pack', 85, 100, '10 pcs'],
    ['Apsara Pencils', 45, 52, '10 pcs'],
    ['Highlighter Set', 120, 145, '5 pcs'],
  ],
  'party-accessories': [
    ['Birthday Balloons', 95, 120, '50 pcs'],
    ['Party Decoration Kit', 285, 350, '1 set'],
    ['Number Candle', 65, 80, '1 pc'],
  ],
  'school-supplies': [
    ['Geometry Box', 185, 225, '1 set'],
    ['School Water Bottle', 245, 299, '750 ml'],
    ['Pencil Pouch', 145, 180, '1 pc'],
  ],

  // ----------------------------------------------------- 11. Disposables
  'food-wrapping-essentials': [
    ['Aluminium Foil', 145, 175, '72 m'],
    ['Cling Film Wrap', 120, 145, '30 m'],
    ['Butter Paper Sheets', 85, 100, '50 sheets'],
  ],
  'home-hygiene': [
    ['Garbage Bags Medium', 145, 175, '90 pcs'],
    ['Disposable Gloves', 165, 199, '100 pcs'],
    ['Toilet Seat Sanitizer', 185, 215, '200 ml'],
  ],
  'plates-and-cutlery': [
    ['Disposable Paper Plates', 95, 115, '50 pcs'],
    ['Areca Leaf Plates', 185, 225, '25 pcs'],
    ['Disposable Spoons', 65, 80, '100 pcs'],
  ],
  'tissues-and-napkins': [
    ['Origami Face Tissues', 95, 110, '200 pulls'],
    ['Kitchen Paper Towel', 145, 170, '2 rolls'],
    ['Paper Napkins', 65, 78, '100 pcs'],
  ],
}

/**
 * The 11 products the client photographed. These are the client's REAL product
 * names; the weights and prices below are demo placeholders pending real
 * pricing. Each carries its own photo plus a `isPopularNearYou` pin so the
 * homepage row shows them in the client's supplied order.
 */
type PopularSeed = [
  name: string,
  price: number,
  mrp: number,
  unit: string,
  subcategoryId: string,
  imageSlug: string,
  pin: number,
]

const POPULAR_NEAR_YOU: PopularSeed[] = [
  ['Surf Excel Easy Wash', 98, 105, '1 kg', 'detergents-and-cleaners', 'surf-excel', 1],
  ['Aashirvaad Atta', 235, 250, '5 kg', 'atta-flours-and-sooji', 'aashirvaad-aata', 2],
  [
    'Parachute Coconut Hair Oil',
    90,
    95,
    '200 ml',
    'hair-care',
    'parachute-coconut-hair-oil',
    3,
  ],
  ['Almonds', 180, 200, '200 g', 'dry-fruits-and-nuts', 'almonds', 4],
  ['Daawat Basmati Rice', 120, 130, '1 kg', 'rice', 'daawat-basmati-rice', 5],
  ['Cashew', 220, 240, '200 g', 'dry-fruits-and-nuts', 'cashew', 6],
  ['Head & Shoulders Shampoo', 199, 210, '180 ml', 'hair-care', 'head-and-shoulders', 7],
  ['Fortune Sunflower Oil', 150, 165, '1 L', 'edible-oils', 'fortune-oil', 8],
  ['Amul Taaza Milk', 28, 28, '500 ml', 'milk-and-milk-products', 'amul-milk', 9],
  ['Vim Dishwash Gel', 99, 105, '500 ml', 'dishwash', 'vim', 10],
  ['Bananas', 60, 65, '1 dozen', 'fresh-fruits', 'bananas', 11],
]

/**
 * Products the admin has flagged for the Price Drop page. In production this is
 * a boolean column toggled from the admin panel; here it is a curated id list so
 * the page has representative content across several categories.
 */
const PRICE_DROP_IDS = new Set([
  'surf-excel-easy-wash',
  'aashirvaad-atta',
  'fortune-sunflower-oil',
  'almonds',
  'cashew',
  'amul-pure-cow-ghee',
  'tata-tea-premium',
  'saffola-gold-oil',
  'kelloggs-corn-flakes',
  'dove-intense-repair-shampoo',
  'pampers-all-round-protection-m',
  'ariel-matic-front-load',
  'spin-mop-with-bucket',
  'pressure-cooker-3-l',
  'toor-dal',
  'india-gate-basmati-classic',
  'colgate-strong-teeth',
  'maybelline-sensational-lipstick',
  'wildcraft-backpack-35-l',
  'organic-quinoa',
])

/**
 * Deterministic pseudo-random stock so the out-of-stock state is demonstrable
 * without being random on every render. A couple of items land on 0 by design.
 */
function seededStock(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 9973
  const value = hash % 60
  return value < 2 ? 0 : value
}

function build(): Product[] {
  const list: Product[] = []
  const seen = new Set<string>()

  const push = (product: Product) => {
    if (seen.has(product.id)) {
      throw new Error(
        `Duplicate product id "${product.id}". Product names must be unique across the catalogue.`,
      )
    }
    seen.add(product.id)
    list.push(product)
  }

  for (const [name, price, mrp, unit, subcategoryId, imageSlug, pin] of POPULAR_NEAR_YOU) {
    const subcategory = getSubcategory(subcategoryId)
    if (!subcategory) throw new Error(`Unknown subcategory "${subcategoryId}" for "${name}"`)
    const id = slugify(name)
    push({
      id,
      name,
      categoryId: subcategory.categoryId,
      subcategoryId,
      price,
      mrp,
      unit,
      stock: seededStock(id) || 24,
      isPriceDrop: PRICE_DROP_IDS.has(id),
      isPopularNearYou: pin,
      image: `/images/products/${imageSlug}.webp`,
      description: `${name} in a ${unit} pack — an everyday essential, always stocked fresh.`,
    })
  }

  for (const [subcategoryId, seeds] of Object.entries(CATALOGUE)) {
    const subcategory = getSubcategory(subcategoryId)
    if (!subcategory) {
      throw new Error(`CATALOGUE references unknown subcategory "${subcategoryId}"`)
    }
    for (const [name, price, mrp, unit] of seeds) {
      const id = slugify(name)
      push({
        id,
        name,
        categoryId: subcategory.categoryId,
        subcategoryId,
        price,
        mrp,
        unit,
        stock: seededStock(id),
        isPriceDrop: PRICE_DROP_IDS.has(id),
        description: `${name} available in ${unit} pack, from our ${subcategory.name} range.`,
      })
    }
  }

  return list
}

export const products: Product[] = build()

const productById = new Map(products.map((p) => [p.id, p]))
export const getProduct = (id: string): Product | undefined => productById.get(id)

/** Resolve the image for a product, falling back to its subcategory artwork. */
export function productImage(product: Product): string {
  if (product.image) return product.image
  return getSubcategory(product.subcategoryId)?.image ?? '/images/brand/logo.webp'
}

export const byPriceAsc = (a: Product, b: Product): number => a.price - b.price

export const productsByCategory = (categoryId: string): Product[] =>
  products.filter((p) => p.categoryId === categoryId)

export const productsBySubcategory = (subcategoryId: string): Product[] =>
  products.filter((p) => p.subcategoryId === subcategoryId)

export const priceDropProducts = (): Product[] =>
  products.filter((p) => p.isPriceDrop).sort(byPriceAsc)

/**
 * "Popular Near You" row.
 *
 * Admin-pinned products come first in pin order; the row is then topped up with
 * the cheapest remaining in-stock products, which is the default behaviour the
 * client asked for.
 */
export function popularNearYou(limit = 12): Product[] {
  const pinned = products
    .filter((p) => p.isPopularNearYou != null)
    .sort((a, b) => a.isPopularNearYou! - b.isPopularNearYou!)

  const filler = products
    .filter((p) => p.isPopularNearYou == null && p.stock > 0)
    .sort(byPriceAsc)

  return [...pinned, ...filler].slice(0, limit)
}

/** Simple client-side search across name, subcategory and category labels. */
export function searchProducts(query: string, limit = 24): Product[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const scored: Array<{ product: Product; score: number }> = []

  for (const product of products) {
    const name = product.name.toLowerCase()
    const sub = getSubcategory(product.subcategoryId)?.name.toLowerCase() ?? ''
    let score = -1
    if (name.startsWith(q)) score = 0
    else if (name.includes(q)) score = 1
    else if (sub.includes(q)) score = 2
    if (score >= 0) scored.push({ product, score })
  }

  return scored
    .sort((a, b) => a.score - b.score || a.product.price - b.product.price)
    .slice(0, limit)
    .map((s) => s.product)
}

/** Related products for the detail page: same subcategory, then same category. */
export function relatedProducts(product: Product, limit = 10): Product[] {
  const sameSub = products.filter(
    (p) => p.subcategoryId === product.subcategoryId && p.id !== product.id,
  )
  const sameCat = products.filter(
    (p) => p.categoryId === product.categoryId && p.subcategoryId !== product.subcategoryId,
  )
  return [...sameSub, ...sameCat].slice(0, limit)
}

/** Count of products per subcategory, used for listing page subtitles. */
export const subcategoryCounts: Record<string, number> = Object.fromEntries(
  subcategories.map((s) => [s.id, products.filter((p) => p.subcategoryId === s.id).length]),
)
