import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Notification from './components/Notification';

// Pages
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import SupportTickets from './pages/SupportTickets';
import CRM from './pages/CRM';
import Profile from './pages/Profile';
import Footer from './components/Footer';

export default function App() {
  // Authentication state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('velocraft_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('velocraft_token') || null;
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('velocraft_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Routing state
  const [currentPage, setCurrentPage] = useState('catalog'); // catalog, product-detail, cart, checkout, orders, tickets, crm-*
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Search state
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // UI states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('velocraft_cart', JSON.stringify(cart));
  }, [cart]);

  // Toast notifier triggers
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleClearToast = () => {
    setToast({ message: '', type: 'success' });
  };

  // Auth Operations
  const handleAuthSuccess = (userObj, tokenStr) => {
    setUser(userObj);
    setToken(tokenStr);
    localStorage.setItem('velocraft_user', JSON.stringify(userObj));
    localStorage.setItem('velocraft_token', tokenStr);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('velocraft_user');
    localStorage.removeItem('velocraft_token');
    setCurrentPage('catalog');
    showToast('Signed out successfully', 'success');
  };

  // Cart Operations
  const handleAddToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === product.id);
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const newQty = updatedCart[existingItemIndex].quantity + quantity;
        
        // Stock cap check
        if (newQty > product.stock) {
          showToast(`Cannot add more. Warehouse stock is capped at ${product.stock} units.`, 'error');
          return prevCart;
        }

        updatedCart[existingItemIndex].quantity = newQty;
        showToast(`Updated quantity of ${product.name} in cart!`, 'success');
        return updatedCart;
      } else {
        showToast(`Added ${product.name} to cart!`, 'success');
        return [...prevCart, {
          productId: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: quantity
        }];
      }
    });
  };

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart(prevCart => 
      prevCart.map(item => item.productId === productId ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    showToast('Item removed from collection cart', 'success');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Navigation handlers
  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    setCurrentPage('product-detail');
  };

  // Guard routing for admin CRM access
  useEffect(() => {
    if (currentPage.startsWith('crm') && (!user || user.role !== 'admin')) {
      setCurrentPage('catalog');
      showToast('Unauthorized. Admin access required.', 'error');
    }
  }, [currentPage, user]);

  return (
    <div className="app-container">
      <Navbar 
        user={user} 
        cart={cart}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
        onOpenLoginModal={() => setShowLoginModal(true)}
        globalSearchQuery={globalSearchQuery}
        setGlobalSearchQuery={(val) => {
          setGlobalSearchQuery(val);
          if (currentPage !== 'catalog') setCurrentPage('catalog');
        }}
      />

      <main className="main-content">
        {/* Render pages depending on active tab state */}
        {currentPage === 'catalog' && (
          <Catalog 
            onSelectProduct={handleSelectProduct}
            addToCart={handleAddToCart}
            showToast={showToast}
            globalSearchQuery={globalSearchQuery}
          />
        )}

        {currentPage === 'product-detail' && (
          <ProductDetail 
            productId={selectedProductId}
            onBack={() => setCurrentPage('catalog')}
            addToCart={handleAddToCart}
            showToast={showToast}
          />
        )}

        {currentPage === 'cart' && (
          <Cart 
            cart={cart}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            setCurrentPage={setCurrentPage}
            user={user}
            onOpenLoginModal={() => setShowLoginModal(true)}
          />
        )}

        {currentPage === 'checkout' && (
          <Checkout 
            cart={cart}
            token={token}
            user={user}
            onClearCart={handleClearCart}
            setCurrentPage={setCurrentPage}
            showToast={showToast}
          />
        )}

        {currentPage === 'crm' && user && (
          <CRM 
            token={token}
            user={user}
            setCurrentPage={setCurrentPage}
            showToast={showToast}
          />
        )}

        {currentPage === 'profile' && user && (
          <Profile 
            token={token} 
            user={user} 
            showToast={showToast} 
          />
        )}

        {currentPage === 'orders' && user && (
          <OrderHistory 
            token={token} 
            showToast={showToast} 
          />
        )}

        {currentPage === 'tickets' && user && (
          <SupportTickets 
            token={token} 
            user={user} 
            showToast={showToast} 
          />
        )}

        {/* 404 Fallback */}
        {!['catalog', 'product-detail', 'cart', 'checkout', 'crm', 'profile', 'orders', 'tickets'].includes(currentPage) && (
          <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '80px 24px', maxWidth: '500px', margin: '60px auto' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '12px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-rose))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
            <h2 style={{ marginBottom: '16px', fontSize: '1.3rem' }}>Page Not Found</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>The page you are looking for does not exist or has been moved.</p>
            <button className="btn btn-primary" onClick={() => setCurrentPage('catalog')}>Return to Catalog</button>
          </div>
        )}
      </main>

      <Footer />

      {/* Shared Modals & Banners */}
      <AuthModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onAuthSuccess={handleAuthSuccess}
        showToast={showToast}
      />

      <Notification 
        message={toast.message} 
        type={toast.type} 
        onClose={handleClearToast} 
      />
    </div>
  );
}
