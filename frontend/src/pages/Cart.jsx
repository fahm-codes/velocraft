import React, { useState } from 'react';
import CarGraphic from '../components/CarGraphic';
import { Trash2, CreditCard, ArrowRight, ArrowLeft, Zap } from 'lucide-react';
import OneTapCheckout from '../components/OneTapCheckout';

export default function Cart({ 
  cart, 
  onUpdateQty, 
  onRemoveItem, 
  setCurrentPage, 
  user, 
  token,
  showToast,
  onClearCart,
  onOpenLoginModal 
}) {
  const [showOneTap, setShowOneTap] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 18000 ? 0 : (subtotal > 0 ? 1200 : 0);
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '80px 24px', maxWidth: '600px', margin: '40px auto' }}>
        <h2 style={{ marginBottom: '12px' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
          Explore the catalog and select from our high-precision collectible models to start building your collection.
        </p>
        <button className="btn btn-primary" onClick={() => setCurrentPage('catalog')}>
          <ArrowLeft size={16} />
          <span>Browse Replica Catalog</span>
        </button>
      </div>
    );
  }

  const handleCheckoutClick = () => {
    if (!user) {
      onOpenLoginModal();
    } else {
      setCurrentPage('checkout');
    }
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Your Collection Cart</h1>

      <div className="cart-layout">
        {/* Left Side: Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.map(item => (
            <div key={item.productId} className="glass-card cart-item" style={{ padding: '16px' }}>
              <div style={{ width: '100px', height: '70px', background: '#0d0f14', borderRadius: '6px', overflow: 'hidden' }}>
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              <div className="cart-item-info">
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{item.brand.toUpperCase()}</span>
                <h3 style={{ fontSize: '1.05rem', margin: '2px 0 6px' }}>{item.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Unit Price: ৳ {item.price.toLocaleString()}
                </span>
              </div>

              {/* Quantity selectors */}
              <div className="cart-qty-ctrl">
                <button 
                  className="qty-btn" 
                  onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span style={{ width: '24px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                <button 
                  className="qty-btn" 
                  onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                >
                  +
                </button>
              </div>

              {/* Price and deletion */}
              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  ৳ {(item.price * item.quantity).toLocaleString()}
                </div>
                <button 
                  onClick={() => onRemoveItem(item.productId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-rose)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Order Summary Panel */}
        <aside>
          <div className="glass-card" style={{ borderTop: '4px solid var(--accent-cyan)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Collection Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
                <span>৳ {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Insured Delivery</span>
                <span>{shipping === 0 ? <strong style={{ color: 'var(--accent-green)' }}>FREE</strong> : `৳ ${shipping.toLocaleString()}`}</span>
              </div>
              {shipping > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  Add <strong>৳ {(18000 - subtotal).toLocaleString()}</strong> more for FREE shipping!
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px',
              marginBottom: '24px'
            }}>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Estimated Total</span>
              <span style={{ fontStyle: 'normal', fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                ৳ {total.toLocaleString()}
              </span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', marginBottom: '12px' }}
              onClick={handleCheckoutClick}
            >
              <CreditCard size={16} />
              <span>{user ? 'Standard Checkout' : 'Login to Finalize Purchase'}</span>
              <ArrowRight size={16} />
            </button>

            {user && (
              <button 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  marginBottom: '12px',
                  background: 'linear-gradient(90deg, #00e5ff 0%, #0077ff 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(0,229,255,0.3)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={() => setShowOneTap(true)}
              >
                <Zap size={16} fill="#000" color="#000" />
                <span style={{ color: '#000', fontWeight: 'bold' }}>One-Tap Buy</span>
              </button>
            )}

            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '10px' }}
              onClick={() => setCurrentPage('catalog')}
            >
              <span>Continue Shopping</span>
            </button>
          </div>
        </aside>
      </div>

      {showOneTap && (
        <OneTapCheckout 
          items={cart}
          user={user}
          token={token}
          onClose={() => setShowOneTap(false)}
          onSuccess={() => {
            setShowOneTap(false);
            onClearCart();
            setCurrentPage('orders');
            showToast('Order placed successfully!', 'success');
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
