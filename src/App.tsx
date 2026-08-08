import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { CartProvider } from './context/CartContext'
import { LocationProvider } from './context/LocationContext'
import { HomePage } from './pages/HomePage'
import { AllProductsPage } from './pages/AllProductsPage'
import { PriceDropPage } from './pages/PriceDropPage'
import { CategoryPage } from './pages/CategoryPage'
import { SubcategoryPage } from './pages/SubcategoryPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { NotFoundPage } from './pages/NotFoundPage'

/**
 * Reset scroll on navigation. Without this, following a link from deep in a long
 * category page lands the user midway down the next page.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <LocationProvider>
      <CartProvider>
        <ScrollToTop />
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<AllProductsPage />} />
              <Route path="/price-drop" element={<PriceDropPage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/subcategory/:subcategoryId" element={<SubcategoryPage />} />
              <Route path="/product/:productId" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </LocationProvider>
  )
}
