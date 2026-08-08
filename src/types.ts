/**
 * Domain types for the Aashapura Super Market storefront.
 *
 * These are deliberately shaped the way a REST/DB payload would be, so that
 * swapping the mock data in `src/data/` for real API calls later is a data-layer
 * change only — no component rewrites.
 */

/** A top-level category, e.g. "Fresh" or "Cooking Essentials". */
export interface Category {
  /** URL-safe id, e.g. "cooking-essentials". Used in routes. */
  id: string
  name: string
  subcategories: Subcategory[]
}

/** A second-level category, e.g. "Fresh Fruits" under "Fresh". */
export interface Subcategory {
  /** URL-safe id, e.g. "fresh-fruits". Unique across the whole catalogue. */
  id: string
  name: string
  /** Parent category id. */
  categoryId: string
  /** Path to the supplied artwork under /images/categories/. */
  image: string
}

export interface Product {
  id: string
  name: string
  /** Parent category id — every product belongs to exactly one. */
  categoryId: string
  /** Parent subcategory id — every product belongs to exactly one. */
  subcategoryId: string
  /** Selling price in rupees. */
  price: number
  /** Maximum retail price, shown struck through when higher than `price`. */
  mrp: number
  /** Pack size shown on the card, e.g. "500 g", "1 L", "1 pc". */
  unit: string
  /** Units on hand. 0 renders the card as out of stock. */
  stock: number
  /**
   * Admin-controlled flag. When true the product appears on the Price Drop
   * page reached from the homepage "Price Drop" banner.
   */
  isPriceDrop?: boolean
  /**
   * Admin-controlled pin for the "Popular Near You" row. Lower numbers sort
   * first. When no product is pinned the row falls back to cheapest-first.
   */
  isPopularNearYou?: number
  /**
   * Own photograph if the client supplied one. Products without a photo fall
   * back to their subcategory artwork via `productImage()`.
   */
  image?: string
  description?: string
}

export interface CartLine {
  productId: string
  quantity: number
}

export type PaymentMethod = 'online' | 'cod'

export interface DeliveryDetails {
  name: string
  phone: string
  addressLine: string
  landmark: string
  pincode: string
}
