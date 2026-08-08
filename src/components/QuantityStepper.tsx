interface QuantityStepperProps {
  quantity: number
  onChange: (quantity: number) => void
  /** Upper bound, normally the product's stock. */
  max?: number
  size?: 'sm' | 'md'
}

/**
 * The +/- control that replaces the "Add" button once an item is in the cart —
 * the standard quick-commerce pattern.
 */
export function QuantityStepper({ quantity, onChange, max, size = 'sm' }: QuantityStepperProps) {
  const atMax = max != null && quantity >= max
  const pad = size === 'sm' ? 'h-8 text-sm' : 'h-11 text-base'

  return (
    <div
      className={`flex ${pad} w-full items-center justify-between overflow-hidden rounded-lg bg-brand-600 font-bold text-white`}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
        className="grid h-full flex-1 place-items-center transition hover:bg-brand-700"
      >
        <span aria-hidden="true">&minus;</span>
      </button>

      <span aria-live="polite" className="min-w-6 text-center tabular-nums">
        {quantity}
      </span>

      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={atMax}
        aria-label={atMax ? 'No more stock available' : 'Increase quantity'}
        className="grid h-full flex-1 place-items-center transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  )
}
