import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { X, CreditCard, MapPin, Zap, CheckCircle, Loader2 } from 'lucide-react';

export default function OneTapCheckout({ items, user, token, onClose, onSuccess, showToast }) {
  const [step, setStep] = useState('confirm'); // 'confirm', 'processing', 'success'
  const [addressInfo, setAddressInfo] = useState({ address: '', city: '', division: 'Dhaka', zipCode: '' });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod', 'card'

  useEffect(() => {
    if (user) {
      const savedAddr = localStorage.getItem(`velocraft_addr_${user.id}`);
      if (savedAddr) {
        setAddressInfo(JSON.parse(savedAddr));
        setIsEditingAddress(false);
      } else {
        setIsEditingAddress(true);
      }
    }
  }, [user]);

  const subtotal = items.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0);
  
  // Fast delivery calc
  let shipping = 0;
  if (paymentMethod === 'cod') {
    shipping = addressInfo.division.toLowerCase() === 'dhaka' ? 130 : 200;
  }
  const total = subtotal + shipping;

  const handlePay = async () => {
    if (!addressInfo.address || !addressInfo.city || !addressInfo.zipCode) {
      setIsEditingAddress(true);
      showToast('Please provide a complete shipping address.', 'warning');
      return;
    }

    setStep('processing');

    try {
      // Save address if it was edited
      if (isEditingAddress) {
        localStorage.setItem(`velocraft_addr_${user.id}`, JSON.stringify(addressInfo));
      }

      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          items,
          shippingAddress: `${addressInfo.address}, ${addressInfo.city}, ${addressInfo.division} - ${addressInfo.zipCode}`,
          paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card (Simulated)'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Checkout failed');
      }

      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err) {
      showToast(err.message, 'error');
      setStep('confirm');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div 
        className="modal-content animate-slide-up" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          borderBottomLeftRadius: 0, 
          borderBottomRightRadius: 0, 
          padding: '24px',
          background: 'var(--bg-surface)',
          borderTop: '2px solid var(--accent-cyan)',
          position: 'relative'
        }}
      >
        {step === 'processing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={48} className="spin" style={{ color: 'var(--accent-cyan)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem' }}>Processing Payment...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Securely completing your transaction</p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
            <CheckCircle size={64} style={{ color: 'var(--accent-green)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-green)' }}>Payment Successful!</h3>
            <p style={{ color: 'var(--text-muted)' }}>Redirecting...</p>
          </div>
        )}

        {step === 'confirm' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} fill="var(--accent-cyan)" color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Express Checkout</h2>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Order Summary Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Paying to Velocraft</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>৳{total.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{items.length} Item(s)</div>
              </div>
            </div>

            {/* Address Selection */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> Deliver To
                </span>
                {!isEditingAddress && (
                  <button onClick={() => setIsEditingAddress(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', cursor: 'pointer' }}>Change</button>
                )}
              </div>
              
              {isEditingAddress ? (
                <div style={{ display: 'grid', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                  <input type="text" className="form-input" placeholder="Street Address" value={addressInfo.address} onChange={e => setAddressInfo({...addressInfo, address: e.target.value})} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" className="form-input" placeholder="City" value={addressInfo.city} onChange={e => setAddressInfo({...addressInfo, city: e.target.value})} />
                    <select className="form-input" value={addressInfo.division} onChange={e => setAddressInfo({...addressInfo, division: e.target.value})}>
                      <option>Dhaka</option>
                      <option>Chittagong</option>
                      <option>Sylhet</option>
                      <option>Rajshahi</option>
                    </select>
                  </div>
                  <input type="text" className="form-input" placeholder="Zip Code" value={addressInfo.zipCode} onChange={e => setAddressInfo({...addressInfo, zipCode: e.target.value})} />
                  <button className="btn btn-secondary" onClick={() => {
                    if(addressInfo.address && addressInfo.city && addressInfo.zipCode) setIsEditingAddress(false);
                  }}>Confirm Address</button>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem' }}>
                  {addressInfo.address}, {addressInfo.city}, {addressInfo.division} - {addressInfo.zipCode}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CreditCard size={14} /> Pay With
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div 
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: paymentMethod === 'cod' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)', background: paymentMethod === 'cod' ? 'rgba(0, 229, 255, 0.1)' : 'transparent', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem' }}
                  onClick={() => setPaymentMethod('cod')}
                >
                  Cash on Delivery
                </div>
                <div 
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: paymentMethod === 'card' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)', background: paymentMethod === 'card' ? 'rgba(0, 229, 255, 0.1)' : 'transparent', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem' }}
                  onClick={() => setPaymentMethod('card')}
                >
                  Card / Mobile
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '16px', 
                fontSize: '1.2rem', 
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #00e5ff 0%, #0077ff 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0,229,255,0.3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={handlePay}
            >
              <Zap size={20} fill="#000" />
              Pay ৳{total.toLocaleString()}
            </button>
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Secured by Velocraft Global Pay
            </div>
          </>
        )}
      </div>
    </div>
  );
}
