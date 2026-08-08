import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'asm.location.v1'

export interface DeliveryLocation {
  label: string
  /**
   * MOCK distance from the store in km. There is no geocoding in this pass, so
   * each serviceable area carries a hand-set distance purely to demonstrate the
   * delivery-fee UI. Replace with a routing-API result in the backend phase.
   */
  distanceKm: number
}

/**
 * Nearby areas around the store (Lohegaon, Pune). Distances are approximate and
 * for demo purposes only — they drive the fee estimator, not real billing.
 */
export const SERVICEABLE_AREAS: DeliveryLocation[] = [
  { label: 'Lohegaon', distanceKm: 1.2 },
  { label: 'Pune International Airport', distanceKm: 2.4 },
  { label: 'Vimannagar', distanceKm: 3.8 },
  { label: 'Dhanori', distanceKm: 4.6 },
  { label: 'Kharadi', distanceKm: 6.5 },
  { label: 'Viman Nagar Phoenix', distanceKm: 5.1 },
  { label: 'Wagholi', distanceKm: 8.2 },
  { label: 'Yerwada', distanceKm: 7.4 },
  { label: 'Koregaon Park', distanceKm: 9.1 },
  { label: 'Hadapsar', distanceKm: 11.3 },
]

interface LocationValue {
  location: DeliveryLocation | null
  setLocation: (location: DeliveryLocation | null) => void
}

const LocationContext = createContext<LocationValue | null>(null)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<DeliveryLocation | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: unknown = JSON.parse(raw)
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        typeof (parsed as DeliveryLocation).label === 'string' &&
        typeof (parsed as DeliveryLocation).distanceKm === 'number'
      ) {
        setLocationState(parsed as DeliveryLocation)
      }
    } catch {
      // Ignore unreadable storage; the user can re-pick their area.
    }
  }, [])

  const setLocation = useCallback((next: DeliveryLocation | null) => {
    setLocationState(next)
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Non-fatal — selection still applies for this session.
    }
  }, [])

  const value = useMemo(() => ({ location, setLocation }), [location, setLocation])
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useDeliveryLocation(): LocationValue {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useDeliveryLocation must be used inside <LocationProvider>')
  return ctx
}
