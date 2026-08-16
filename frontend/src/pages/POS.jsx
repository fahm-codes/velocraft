import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { ShoppingCart, Search, CreditCard, Banknote, UserPlus, X, Trash2, Tag } from 'lucide-react';

export default function POS({ token, showToast }) {
  const [products, setProducts] = useState([]);
  const [posCart, setPosCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checkout states
  const [discountCode, setDiscountCode] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiFetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      showToast('Failed to load products for POS', 'error');
    }
  };

  const handleAddToCart = (product) => {
    setPosCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Only ${product.stock} left in stock`, 'error');
          return prev;
        }
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.stock <= 0) {
        showToast('Out of stock!', 'error');
        return prev;
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        price: product.discountPrice ? product.discountPrice : product.price, 
        originalPrice: product.price,
        quantity: 1, 
        stock: product.stock 
      }];
    });
  };

  const handleUpdateQty = (id, delta) => {
    setPosCart(prev => {
      return prev.map(item => {
        if (item.productId === id) {
          const newQty = item.quantity + delta;
          if (newQty > item.stock) {
            showToast('Max stock reached', 'error');
            return item;
          }
          if (newQty <= 0) return null; // mark for deletion
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean); // remove nulls
    });
  };

  const handleRemove = (id) => {
    setPosCart(prev => prev.filter(item => item.productId !== id));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (posCart.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await apiFetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          items: posCart,
          paymentMethod,
          walkInPhone,
          discountCode
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete POS sale');

      showToast('Sale Completed Successfully!', 'success');
      setPosCart([]);
      setDiscountCode('');
      setWalkInPhone('');
      fetchProducts(); // Refresh stock
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', marginTop: '20px', gap: '20px' }}>
      
      {/* Left Panel: Inventory / Scanner */}
      <div className="glass-card" style={{ flex: '2', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Scan Barcode or Search Model..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px', fontSize: '1.1rem' }}
              autoFocus
            />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', alignContent: 'start' }}>
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '12px',
                cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                opacity: p.stock > 0 ? 1 : 0.5,
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                transition: 'border-color 0.2s ease',
              }}
              onClick={() => p.stock > 0 && handleAddToCart(p)}
              onMouseEnter={(e) => { if(p.stock > 0) e.currentTarget.style.borderColor = 'var(--accent-cyan)' }}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ height: '80px', marginBottom: '12px' }}>
                <img src={p.imageUrl} alt={p.name} style={{ height: '100%', objectFit: 'contain' }} />
              </div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', height: '38px', overflow: 'hidden' }}>{p.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ color: p.discountPrice ? 'var(--accent-red)' : 'var(--accent-cyan)', fontWeight: 'bold' }}>
                  ৳{(p.discountPrice || p.price).toLocaleString()}
                </span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  {p.stock} left
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Cash Register */}
      <div className="glass-card" style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '350px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={20} style={{ color: 'var(--accent-cyan)' }} />
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Register Cart</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posCart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>Cart is empty</div>
          ) : (
            posCart.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>৳{item.price.toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                    <button onClick={() => handleUpdateQty(item.productId, -1)} style={{ background: 'none', border: 'none', color: '#fff', padding: '4px 8px', cursor: 'pointer' }}>-</button>
                    <span style={{ padding: '0 8px', fontSize: '0.9rem' }}>{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.productId, 1)} style={{ background: 'none', border: 'none', color: '#fff', padding: '4px 8px', cursor: 'pointer' }}>+</button>
                  </div>
                  <button onClick={() => handleRemove(item.productId)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Controls */}
        <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <UserPlus size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input type="text" className="form-input" placeholder="Customer Phone" value={walkInPhone} onChange={e => setWalkInPhone(e.target.value)} style={{ paddingLeft: '32px' }} />
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <Tag size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input type="text" className="form-input" placeholder="Promo Code" value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())} style={{ paddingLeft: '32px' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button 
              type="button"
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: paymentMethod === 'Cash' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)', background: paymentMethod === 'Cash' ? 'rgba(0, 229, 255, 0.1)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              onClick={() => setPaymentMethod('Cash')}
            >
              <Banknote size={18} /> Cash
            </button>
            <button 
              type="button"
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: paymentMethod === 'Card' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)', background: paymentMethod === 'Card' ? 'rgba(0, 229, 255, 0.1)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              onClick={() => setPaymentMethod('Card')}
            >
              <CreditCard size={18} /> Card/bKash
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Subtotal</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-cyan)', lineHeight: '1' }}>৳{subtotal.toLocaleString()}</span>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
            onClick={handleCheckout}
            disabled={posCart.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}
