import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Box, Truck, CheckSquare, Calendar, CreditCard } from 'lucide-react';

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
    <div className="animate-fade-in" style={{ marginTop: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShoppingBag size={28} style={{ color: 'var(--accent-cyan)' }} />
        <span>Your Purchase Ledger</span>
      </h1>

      {orders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <h3 style={{ marginBottom: '8px' }}>No orders recorded</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
            You haven't placed any orders yet. Start your collection by adding items to your cart.
          </p>
          <button className="btn btn-primary" onClick={() => setCurrentPage('catalog')}>
            Explore Replicas
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-card" style={{ padding: '24px' }}>
              {/* Order Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Identifier</span>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginTop: '2px' }}>#{order.id}</h3>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Calendar size={14} />
                    <span>{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{item.quantity}x</span>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.brand}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: '500' }}>৳ {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Shopper Order Actions */}
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px',
                marginTop: '4px',
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
              }}>
                {order.status === 'Pending' && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                )}

                {order.status === 'Delivered' && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleReorder(order.id)}
                  >
                    Reorder
                  </button>
                )}

                {order.status === 'Delivered' && !order.receivedAt && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleConfirmReceived(order.id)}
                  >
                    Confirm Received
                  </button>
                )}

                {order.status === 'Delivered' && order.receivedAt && (
                  <span style={{
                    color: 'var(--accent-cyan)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    alignSelf: 'center'
                  }}>
                    ✓ Received
                  </span>
                )}
              </div>

              {/* Order Footer summary */}
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <div>
                  <strong>Shipping Destination:</strong>
                  <div style={{ marginTop: '2px', color: 'var(--text-muted)' }}>
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <CreditCard size={12} />
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.9rem' }}>Amount Charged:</span>{' '}
                    <strong style={{ fontSize: '1.25rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
                      ৳ {order.totalAmount.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




