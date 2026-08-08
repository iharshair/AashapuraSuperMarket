import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { CartLine, Product } from '../types'
import { getProduct } from '../data/products'

const STORAGE_KEY = 'asm.cart.v1'

type Action =
  | { type: 'add'; productId: string; quantity?: number }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }
  | { type: 'hydrate'; lines: CartLine[] }

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'hydrate':
      return action.lines

    case 'add': {
      const step = action.quantity ?? 1
      const existing = state.find((l) => l.productId === action.productId)
      if (!existing) return [...state, { productId: action.productId, quantity: step }]
      return state.map((l) =>
        l.productId === action.productId ? { ...l, quantity: l.quantity + step } : l,
      )
    }

    case 'setQuantity': {
      if (action.quantity <= 0) return state.filter((l) => l.productId !== action.productId)
      return state.map((l) =>
        l.productId === action.productId ? { ...l, quantity: action.quantity } : l,
      )
    }

    case 'remove':
      return state.filter((l) => l.productId !== action.productId)

    case 'clear':
      return []
  }
}

/** A cart line joined to its product, for rendering. */
export interface DetailedCartLine {
  product: Product
  quantity: number
  lineTotal: number
  lineMrpTotal: number
}

interface CartValue {
  lines: CartLine[]
  detailed: DetailedCartLine[]
  /** Total number of individual units in the cart (drives the header badge). */
  itemCount: number
  /** Number of distinct products in the cart. */
  lineCount: number
  subtotal: number
  /** Total MRP, so the cart can show total savings. */
  mrpTotal: number
  savings: number
  quantityOf: (productId: string) => number
  add: (productId: string, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

const CartContext = createContext<CartValue | null>(null)

function readStoredCart(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Drop anything that no longer exists in the catalogue, otherwise a stale
    // cart from an older build would crash the joins below.
    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== 'object' || entry === null) return []
      const { productId, quantity } = entry as Partial<CartLine>
      if (typeof productId !== 'string' || typeof quantity !== 'number') return []
      if (quantity <= 0 || !getProduct(productId)) return []
      return [{ productId, quantity: Math.floor(quantity) }]
    })
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, [] as CartLine[])

  // Hydrate after mount so the reducer's initial state stays pure.
  useEffect(() => {
    const stored = readStoredCart()
    if (stored.length) dispatch({ type: 'hydrate', lines: stored })
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // Storage can be unavailable (private mode, quota). The cart still works
      // for the current session, so this is intentionally non-fatal.
    }
  }, [lines])

  const detailed = useMemo<DetailedCartLine[]>(
    () =>
      lines.flatMap((line) => {
        const product = getProduct(line.productId)
        if (!product) return []
        return [
          {
            product,
            quantity: line.quantity,
            lineTotal: product.price * line.quantity,
            lineMrpTotal: product.mrp * line.quantity,
          },
        ]
      }),
    [lines],
  )

  const quantityOf = useCallback(
    (productId: string) => lines.find((l) => l.productId === productId)?.quantity ?? 0,
    [lines],
  )

  const value = useMemo<CartValue>(() => {
    const subtotal = detailed.reduce((sum, l) => sum + l.lineTotal, 0)
    const mrpTotal = detailed.reduce((sum, l) => sum + l.lineMrpTotal, 0)
    return {
      lines,
      detailed,
      itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
      lineCount: detailed.length,
      subtotal,
      mrpTotal,
      savings: Math.max(0, mrpTotal - subtotal),
      quantityOf,
      add: (productId, quantity) => dispatch({ type: 'add', productId, quantity }),
      setQuantity: (productId, quantity) =>
        dispatch({ type: 'setQuantity', productId, quantity }),
      remove: (productId) => dispatch({ type: 'remove', productId }),
      clear: () => dispatch({ type: 'clear' }),
    }
  }, [lines, detailed, quantityOf])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
