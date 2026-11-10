import { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import { Page, PetCategory } from './types';

function AppContent() {
  const [page, setPage] = useState<Page>('home');
  const [activeCategory, setActiveCategory] = useState<PetCategory | 'All'>('All');
  const [cartOpen, setCartOpen] = useState(false);
  const { cartItems, cartTotal, clearCart } = useCart();

  const handleNavigate = (dest: Page) => {
    setPage(dest);
    if (dest === 'home') setActiveCategory('All');
  };

  return (
    <div className="app-wrapper">
      <Header
        activePage={page}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onNavigate={handleNavigate}
        onCartToggle={() => setCartOpen(true)}
      />

      {page === 'home' && <HomePage activeCategory={activeCategory} />}
      {page === 'checkout' && <CheckoutPage onNavigate={handleNavigate} cartItems={cartItems} cartTotal={cartTotal} onClearCart={clearCart} />}

      <CartSidebar
        show={cartOpen}
        onHide={() => setCartOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
