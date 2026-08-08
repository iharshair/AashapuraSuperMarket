/**
 * Single source of truth for client-owned copy and business rules.
 *
 * Everything the client is likely to want changed without a developer lives
 * here rather than being buried in markup. When the admin panel is built these
 * become editable settings rows.
 */

export const store = {
  name: 'Aashapura Super Market',
  tagline: 'Your neighbourhood kirana, now online',
  /** Devanagari wordmark as it appears in the supplied logo. */
  nameLocal: 'आशापुरा सुपर मार्केट',

  phone: '+91 90240 57758',
  /** Digits only, for tel: and wa.me links. */
  phoneRaw: '919024057758',
  whatsappUrl: 'https://wa.me/919024057758',

  /**
   * Client has not supplied an email yet. Left empty on purpose — the footer
   * hides the email row entirely while this is falsy rather than showing a
   * made-up address.
   */
  email: '',

  address: {
    area: 'Pune International Airport Area',
    locality: 'Lohegaon',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411047',
  },

  /**
   * The store is not listed on Google Maps yet, so we link out to the share
   * URL the client provided and use raw coordinates for any map UI.
   */
  coordinates: { lat: 18.586868, lng: 73.951114 },
  mapsUrl: 'https://maps.app.goo.gl/6EHkZg3YBqF1UUtt8',

  openingHours: '8:00 AM – 10:00 PM, all days',
} as const

export const store_address_full = [
  store.address.area,
  store.address.locality,
  store.address.city,
  `${store.address.state} ${store.address.pincode}`,
].join(', ')

/**
 * Homepage hero copy. The delivery-time promise is PLACEHOLDER wording pending
 * final sign-off from the client, which is exactly why it is a config value.
 */
export const heroCopy = {
  headline: 'Delivery under 19 Minutes',
  subhead: 'Fresh groceries, daily essentials and more — delivered to your door in Lohegaon.',
  badge: 'Free delivery within 4 km',
} as const

/**
 * Delivery pricing rules.
 *
 * ASSUMPTIONS FLAGGED TO CLIENT (see README):
 *  - `roundUpToWholeKm`: billable distance beyond the free radius is rounded up
 *    to the next whole kilometre. Not confirmed by the client — flip to false
 *    for exact fractional billing.
 *  - `maxDistanceKm: null`: no serviceability cutoff has been defined, so the
 *    UI must not reject any distance. Set a number here to enforce one.
 */
export const deliveryConfig = {
  freeRadiusKm: 4,
  ratePerKmBeyondFreeRadius: 40,
  roundUpToWholeKm: true,
  maxDistanceKm: null as number | null,
} as const

export const currency = '₹'
