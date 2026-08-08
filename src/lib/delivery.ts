import { deliveryConfig } from '../config/store'

export interface DeliveryQuote {
  distanceKm: number
  /** Distance actually charged for, after the free radius and any rounding. */
  billableKm: number
  fee: number
  isFree: boolean
  /**
   * True when the distance exceeds a configured serviceability limit. Always
   * false today because no maximum distance has been defined by the client.
   */
  outOfRange: boolean
}

/**
 * Compute the delivery fee for a distance in km.
 *
 * Rule: free within `freeRadiusKm`; beyond that, `ratePerKmBeyondFreeRadius`
 * applies only to the distance past the free radius (not the total distance).
 *
 * There is no backend and no geocoding in this pass, so callers supply a mock
 * distance. Swapping in a real distance from a routing API later requires no
 * change to this function.
 */
export function quoteDelivery(distanceKm: number): DeliveryQuote {
  const { freeRadiusKm, ratePerKmBeyondFreeRadius, roundUpToWholeKm, maxDistanceKm } =
    deliveryConfig

  const safeDistance = Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm : 0
  const outOfRange = maxDistanceKm != null && safeDistance > maxDistanceKm

  if (safeDistance <= freeRadiusKm) {
    return { distanceKm: safeDistance, billableKm: 0, fee: 0, isFree: true, outOfRange }
  }

  const excess = safeDistance - freeRadiusKm
  const billableKm = roundUpToWholeKm ? Math.ceil(excess) : excess

  return {
    distanceKm: safeDistance,
    billableKm,
    fee: Math.round(billableKm * ratePerKmBeyondFreeRadius),
    isFree: false,
    outOfRange,
  }
}

/** Human-readable summary of the delivery policy, for the footer and checkout. */
export function deliveryPolicyText(): string {
  const { freeRadiusKm, ratePerKmBeyondFreeRadius } = deliveryConfig
  return `Free delivery within ${freeRadiusKm} km of the store. Beyond ${freeRadiusKm} km, ₹${ratePerKmBeyondFreeRadius} per km applies to the distance past the first ${freeRadiusKm} km.`
}

/**
 * Straight-line (haversine) distance in km. Used only by the mock distance
 * estimator at checkout so that entering a pincode/area produces a plausible
 * number. Real road distance needs a routing API in the backend phase.
 */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
