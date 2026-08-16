import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Box, Truck, CheckSquare, Calendar, CreditCard, Star, XCircle } from 'lucide-react';

export default function OrderHistory({ token, setCurrentPage, showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await apiFetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? data : order
        )
      );

      showToast('Order cancelled successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const handleReorder = async (orderId) => {
    try {
      const res = await apiFetch(`/api/orders/${orderId}/reorder`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to prepare reorder');
      }

      const existingCart = JSON.parse(localStorage.getItem('velocraft_cart') || '[]');

      const mergedCart = [...existingCart];

      data.items.forEach(item => {
        const existing = mergedCart.find(
          cartItem => cartItem.productId === item.productId
        );

        if (existing) {
          existing.quantity += item.quantity;
        } else {
          mergedCart.push({
            productId: item.productId,
            name: item.name,
            brand: item.brand,
            category: item.category,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: item.quantity
          });
        }
      });

      localStorage.setItem('velocraft_cart', JSON.stringify(mergedCart));

      if (data.unavailable?.length) {
        showToast(
          `Some items unavailable: ${data.unavailable.join(', ')}`,
          'error'
        );
      } else {
        showToast('Previous order added to cart', 'success');
      }

      setCurrentPage('cart');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const handleConfirmReceived = async (orderId) => {
    try {
      const res = await apiFetch(`/api/orders/${orderId}/received`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm delivery');
      }

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? data : order
        )
      );

      showToast('Order marked as received', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiFetch('/api/orders/my-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load order history');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Box size={16} style={{ color: '#fbbf24' }} />;
      case 'Processing': return <Box size={16} style={{ color: '#60a5fa' }} />;
      case 'Shipped': return <Truck size={16} style={{ color: '#3b82f6' }} />;
      case 'Delivered': return <CheckSquare size={16} style={{ color: '#34d399' }} />;
      default: return null;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Processing': return 'badge-info';
      case 'Shipped': return 'badge-info';
      case 'Delivered': return 'badge-success';
      default: return 'badge-info';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
        Fetching purchase ledger...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ marginTop: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Box size={28} style={{ color: 'var(--accent-cyan)' }} />
        <span>My Digital Garage</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Your personal collection of acquired models.
      </p>

      {/* --- DARAZ STYLE ORDER STATUS GRID --- */}
      <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', padding: '16px 20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <CreditCard size={24} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>To Pay</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <Box size={24} style={{ color: 'var(--text-secondary)' }} />
            {orders.filter(o => o.status === 'Processing').length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -8, background: 'var(--accent-red)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                {orders.filter(o => o.status === 'Processing').length}
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>To Ship</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <Truck size={24} style={{ color: 'var(--text-secondary)' }} />
            {orders.filter(o => o.status === 'Shipped').length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -8, background: 'var(--accent-red)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                {orders.filter(o => o.status === 'Shipped').length}
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>To Receive</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Star size={24} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>To Review</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <XCircle size={24} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Cancellation</span>
        </div>
      </div>


      {/* --- THE DIGITAL GARAGE GRID --- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {orders.flatMap(order => order.items.map(item => ({ ...item, orderId: order.id, status: order.status }))).map((car, idx) => (
          <div key={`${car.orderId}-${idx}`} className="glass-card" style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            borderRadius: '16px',
            background: 'linear-gradient(180deg, #11131a 0%, #0a0b0e 100%)',
            border: '1px solid rgba(0, 229, 255, 0.1)',
            boxShadow: 'inset 0 0 20px rgba(0,229,255,0.05), 0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {/* Neon Floor Grid */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(0deg, rgba(0,229,255,0.1) 0%, transparent 100%)', borderTop: '1px solid rgba(0,229,255,0.2)', transform: 'perspective(100px) rotateX(60deg)', transformOrigin: 'bottom' }}></div>
            
            <div style={{ padding: '24px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span className={`badge ${getStatusBadgeClass(car.status)}`} style={{ fontSize: '0.7rem' }}>
                  {car.status}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Order #{car.orderId}</span>
              </div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <img 
                  src={car.imageUrl} 
                  alt={car.name}
                  style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.8))', transition: 'transform 0.3s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>

              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{car.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{car.brand} • {car.category}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty Slots to encourage more purchases */}
        {[...Array(Math.max(0, 4 - orders.flatMap(o => o.items).length))].map((_, i) => (
          <div key={`empty-${i}`} className="glass-card" style={{ 
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '280px',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onClick={() => setCurrentPage('catalog')}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          >
            <Box size={32} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Empty Slot</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>Expand Collection</span>
          </div>
        ))}
      </div>
      {orders.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Start your collection by adding items to your cart.
          </p>
        </div>
      )}
    </div>
  );
}




