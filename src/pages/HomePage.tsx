import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { SectionHeading } from '../components/SectionHeading'
import { ScrollRow } from '../components/ScrollRow'
import { ProductCard } from '../components/ProductCard'
import { CategoryCard } from '../components/CategoryCard'
import { categories, promoGridTiles } from '../data/categories'
import { popularNearYou, subcategoryCounts } from '../data/products'

export function HomePage() {
  const popular = popularNearYou(12)

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-7xl px-4">
        {/* ------------------------------- two horizontal promo banners */}
        <section className="grid gap-3 py-5 sm:grid-cols-2 sm:gap-4 sm:py-7">
          {/*
            Both banners carry their own headline in the supplied artwork, so
            they are rendered as pure images with an accessible label instead of
            an overlaid caption.
          */}
          <Link
            to="/products?sort=price-asc"
            aria-label="Starting at ₹9 — browse all products from lowest price"
            className="overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <img
              src="/images/promo-banners/starting-at-9.webp"
              alt="Starting at ₹9"
              className="h-full w-full object-cover"
            />
          </Link>

          <Link
            to="/price-drop"
            aria-label="Price Drop — see products with reduced prices"
            className="overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <img
              src="/images/promo-banners/price-drop.webp"
              alt="Price Drop"
              className="h-full w-full object-cover"
            />
          </Link>
        </section>

        {/* -------------------------------------------- popular near you */}
        <section className="py-4 sm:py-6">
          <SectionHeading
            title="Popular Near You"
            subtitle="Everyday favourites your neighbours are buying"
            seeAllTo="/products?sort=price-asc"
          />
          <ScrollRow ariaLabel="Popular products near you">
            {popular.map((product) => (
              <ProductCard key={product.id} product={product} variant="row" />
            ))}
          </ScrollRow>
        </section>

        {/* ------------------------------------------- promo banner grid */}
        <section className="py-4 sm:py-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
            {promoGridTiles.map((tile) => (
              <CategoryCard
                key={tile.label}
                label={tile.label}
                image={tile.image}
                to={tile.to}
                variant="tile"
                className="shadow-sm"
              />
            ))}
          </div>
        </section>

        {/* --------------------------------------- main category sections */}
        {categories.map((category) => (
          <section key={category.id} className="border-t border-brand-100 py-5 sm:py-7">
            <SectionHeading
              title={category.name}
              subtitle={`${category.subcategories.length} collections`}
              seeAllTo={`/category/${category.id}`}
            />
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8">
              {category.subcategories.map((sub) => (
                <CategoryCard
                  key={sub.id}
                  label={sub.name}
                  image={sub.image}
                  to={`/subcategory/${sub.id}`}
                  count={subcategoryCounts[sub.id]}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
