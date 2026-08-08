import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { productImage } from '../data/products'
import { discountPercent, money } from '../lib/format'
import { useCart } from '../context/CartContext'
import { QuantityStepper } from './QuantityStepper'

interface ProductCardProps {
  product: Product
  /** Fixed-width variant for horizontal rows; grid cells use the fluid default. */
  variant?: 'grid' | 'row'
}

/** The single product card used in every grid and row across the site. */
export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const { quantityOf, add, setQuantity } = useCart()
  const quantity = quantityOf(product.id)
  const discount = discountPercent(product.price, product.mrp)
  const outOfStock = product.stock <= 0

  const width = variant === 'row' ? 'w-[150px] shrink-0 sm:w-[170px]' : 'w-full'

  return (
    <div
      className={`${width} flex flex-col rounded-xl border border-brand-100 bg-white p-2 transition hover:border-brand-300 hover:shadow-md sm:p-3`}
    >
      <Link
        to={`/product/${product.id}`}
        className="relative block overflow-hidden rounded-lg bg-brand-50/60"
      >
        {discount > 0 && (
          <span className="absolute top-0 left-0 z-10 rounded-br-lg bg-sale-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
            {discount}% OFF
          </span>
        )}
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`aspect-square w-full object-contain p-1 transition-transform duration-300 hover:scale-105 ${
            outOfStock ? 'opacity-40 grayscale' : ''
          }`}
        />
      </Link>

      <div className="mt-2 flex min-h-9 flex-1 flex-col">
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-2 text-xs leading-snug font-semibold text-brand-900 hover:text-brand-600 sm:text-sm"
        >
          {product.name}
        </Link>
        <p className="mt-0.5 text-[11px] text-brand-700/60 sm:text-xs">{product.unit}</p>
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-brand-900 sm:text-base">
            {money(product.price)}
          </p>
          {discount > 0 && (
            <p className="text-[11px] text-brand-700/50 line-through">{money(product.mrp)}</p>
          )}
        </div>

        <div className="w-[74px] shrink-0 sm:w-[86px]">
          {outOfStock ? (
            <span className="grid h-8 place-items-center rounded-lg bg-brand-50 text-[11px] font-bold text-brand-700/60">
              Out of stock
            </span>
          ) : quantity > 0 ? (
            <QuantityStepper
              quantity={quantity}
              max={product.stock}
              onChange={(q) => setQuantity(product.id, q)}
            />
          ) : (
            <button
              type="button"
              onClick={() => add(product.id)}
              className="h-8 w-full rounded-lg border border-brand-600 bg-brand-50 text-sm font-extrabold text-brand-700 transition hover:bg-brand-600 hover:text-white"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
