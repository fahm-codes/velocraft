import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, ShoppingBag, Landmark, Smartphone, ShieldCheck, Lock, Check, Truck } from 'lucide-react';

export default function Checkout({ cart, token, user, onClearCart, setCurrentPage, showToast }) {
  // Address states
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Dhaka');
  const [zipCode, setZipCode] = useState('');
  const [country] = useState('Bangladesh');

  // Payment Method selected: sslcommerz, bkash, nagad, rocket, upay, bank, visa
  const [paymentType, setPaymentType] = useState('sslcommerz'); // default to SSLCommerz

  // MFS fields (for direct checkout)
  const [walletNumber, setWalletNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  // Bank BD fields (for direct checkout)
  const [bankName, setBankName] = useState('Dutch-Bangla Bank (DBBL)');
  const [bankAccount, setBankAccount] = useState('');
  const [bankRef, setBankRef] = useState('');

  // Visa fields (for direct checkout)
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // SSLCommerz Portal states
  const [showSslPortal, setShowSslPortal] = useState(false);
  const [sslTab, setSslTab] = useState('mfs'); // cards, mfs, internet
  const [sslSelectedMfs, setSslSelectedMfs] = useState('bkash'); // bkash, nagad, rocket, upay
  const [sslPhone, setSslPhone] = useState('');
  const [sslOtp, setSslOtp] = useState('');
  const [sslPin, setSslPin] = useState('');
  const [sslOtpStep, setSslOtpStep] = useState(1); // 1: input phone, 2: input OTP, 3: input PIN
  
  const [sslCardHolder, setSslCardHolder] = useState('');
  const [sslCardNumber, setSslCardNumber] = useState('');
  const [sslCardExpiry, setSslCardExpiry] = useState('');
  const [sslCardCvv, setSslCardCvv] = useState('');

  const [loading, setLoading] = useState(false);

  // Promo / Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isFreeShipping, setIsFreeShipping] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0);
  
  let shipping = 0;
  if (!isFreeShipping) {
    if (paymentType === 'cod') {
      if (state.toLowerCase() === 'dhaka') {
        shipping = 130; // 80 delivery + 50 safety charge
      } else {
        shipping = 200; // 150 delivery + 50 safety charge
      }
    }
  }

  const discountAmount = subtotal * appliedDiscount;
  const total = (subtotal - discountAmount) + shipping;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'SUPER10') {
      setAppliedDiscount(0.10); // 10% off
      setIsFreeShipping(true);
      showToast('SUPER10 applied! 10% off and Free Delivery.', 'success');
    } else {
      setAppliedDiscount(0);
      setIsFreeShipping(false);
      showToast('Invalid or expired promo code.', 'error');
    }
  };

  // Load default address from profile on mount
  useEffect(() => {
    if (user) {
      const savedAddr = localStorage.getItem(`velocraft_addr_${user.id}`);
      if (savedAddr) {
        const parsed = JSON.parse(savedAddr);
        setAddress(parsed.address || '');
        setCity(parsed.city || '');
        setState(parsed.division || 'Dhaka');
        setZipCode(parsed.zipCode || '');
      }
    }
  }, [user]);

  // Handle direct / standard gateway checkout submission
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    // Address validations
    if (!address || !city || !state || !zipCode) {
      showToast('Please fill out all address fields.', 'error');
      return;
    }

    if (paymentType === 'sslcommerz') {
      // Trigger SSLCommerz mock gateway pop-up
      setShowSslPortal(true);
      setSslOtpStep(1);
      setSslPhone('');
      setSslOtp('');
      setSslPin('');
      return;
    }

    // Direct MFS validations
    let paymentMethodString = '';

    if (['bkash', 'nagad', 'rocket', 'upay'].includes(paymentType)) {
      if (!walletNumber || !trxId) {
        showToast('Please fill in Wallet Number and Transaction ID.', 'error');
        return;
      }
      if (!walletNumber.startsWith('01') || walletNumber.length < 11) {
        showToast('Please enter a valid 11-digit Bangladeshi mobile number.', 'error');
        return;
      }
      const names = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', upay: 'uPay' };
      paymentMethodString = `Direct ${names[paymentType]} (No: ${walletNumber}, TrxID: ${trxId})`;
    } else if (paymentType === 'bank') {
      if (!bankAccount || !bankRef) {
        showToast('Please enter your Bank Account Number and Reference ID.', 'error');
        return;
      }
      paymentMethodString = `Direct Bank Transfer (${bankName}, Acc: ${bankAccount}, Ref: ${bankRef})`;
    } else if (paymentType === 'visa') {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        showToast('Please fill in card details.', 'error');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 12) {
        showToast('Please enter a valid Visa card number.', 'error');
        return;
      }
      paymentMethodString = `Direct Visa Card (ending in ${cardNumber.slice(-4)})`;
    } else if (paymentType === 'cod') {
      paymentMethodString = 'Cash on Delivery';
    }

    executeOrderSubmission(paymentMethodString);
  };

  // Complete mock order placement
  const executeOrderSubmission = async (paymentMethodDetails) => {
    setLoading(true);
    try {
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity
        })),
        shippingAddress: { address, city, state, zipCode, country },
        paymentMethod: paymentMethodDetails
      };

      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      showToast('Order placed successfully!', 'success');
      onClearCart();
      setCurrentPage('orders');
    } catch (err) {
      console.error(err);
      if (err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('unauthorized')) {
        showToast('Session expired. Please sign out and sign back in to continue.', 'error');
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setLoading(false);
      setShowSslPortal(false);
    }
  };

  // Handle pay now inside SSLCommerz modal
  const handleSslPay = () => {
    let paymentDetails = '';

    if (sslTab === 'mfs') {
      if (!sslPhone || sslPhone.length < 11 || !sslPhone.startsWith('01')) {
        showToast('Please enter a valid 11-digit wallet number.', 'error');
        return;
      }
      if (sslOtpStep === 1) {
        // Switch to OTP page
        setSslOtpStep(2);
        showToast('Mock OTP code sent to your phone number.', 'success');
        return;
      }
      if (sslOtpStep === 2) {
        if (!sslOtp || sslOtp.length < 4) {
          showToast('Please enter the 4-digit verification code.', 'error');
          return;
        }
        // Switch to PIN page
        setSslOtpStep(3);
        return;
      }
      if (sslOtpStep === 3) {
        if (!sslPin || sslPin.length < 4) {
          showToast('Please enter your secure 4-digit PIN.', 'error');
          return;
        }
        const names = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', upay: 'uPay' };
        const randomTrx = 'SSL' + Math.floor(10000000 + Math.random() * 90000000);
        paymentDetails = `SSLCommerz MFS - ${names[sslSelectedMfs]} (No: ${sslPhone}, TrxID: ${randomTrx})`;
      }
    } else if (sslTab === 'cards') {
      if (!sslCardHolder || !sslCardNumber || !sslCardExpiry || !sslCardCvv) {
        showToast('Please complete all card details.', 'error');
        return;
      }
      const randomTrx = 'SSL' + Math.floor(10000000 + Math.random() * 90000000);
      paymentDetails = `SSLCommerz Card - Visa/Mastercard (Acc: ${sslCardHolder}, TrxID: ${randomTrx})`;
    } else if (sslTab === 'internet') {
      const randomTrx = 'SSL' + Math.floor(10000000 + Math.random() * 90000000);
      paymentDetails = `SSLCommerz Net Banking (TrxID: ${randomTrx})`;
    }

    if (paymentDetails) {
      executeOrderSubmission(paymentDetails);
    }
  };

  const divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
  const bdBanks = ['Dutch-Bangla Bank (DBBL)', 'BRAC Bank PLC', 'The City Bank Ltd', 'Eastern Bank PLC (EBL)', 'Mutual Trust Bank (MTB)'];

  // Official Logo Local Paths
  const LOGOS = {
    sslcommerz: '/images/sslcommerz.svg',
    bkash: '/images/bkash.svg',
    nagad: '/images/nagad.svg',
    rocket: '/images/rocket.svg',
    upay: '/images/upay.svg',
    visa: '/images/visa.svg',
    mastercard: '/images/mastercard.svg',
    bank: '/images/bank.svg',
    cod: '/images/cod.svg'
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '20px' }}>
      <button 
        onClick={() => setCurrentPage('cart')} 
        className="btn btn-secondary" 
        style={{ marginBottom: '24px', padding: '8px 16px' }}
      >
        <ArrowLeft size={16} />
        <span>Return to Cart</span>
      </button>

      <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Checkout Verification</h1>

      <div className="cart-layout">
        {/* Left Column forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Shipping address info */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>1. Delivery Destination (Bangladesh Only)</span>
            </h2>

            <div className="form-group">
              <label className="form-label">Street Address / Area</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="House 12, Road 4, Dhanmondi R/A" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">City / District</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Dhaka" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Division</label>
                <select 
                  className="form-select"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  {divisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">ZIP / Postal Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="1209" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value="Bangladesh" 
                  disabled
                  style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>

          {/* Payment gateways with real logos */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>2. Local Payment Portal</span>
            </h2>

            {/* Recommended payment header */}
            <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Select payment gateway option below:
            </div>

            {/* SSLCommerz primary option */}
            <button
              type="button"
              className={`btn ${paymentType === 'sslcommerz' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPaymentType('sslcommerz')}
              style={{
                width: '100%',
                height: '70px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                border: '1px solid',
                borderColor: paymentType === 'sslcommerz' ? 'var(--accent-cyan)' : 'var(--border-color)',
                background: paymentType === 'sslcommerz' ? 'rgba(0, 240, 255, 0.06)' : 'rgba(255,255,255,0.01)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: paymentType === 'sslcommerz' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {paymentType === 'sslcommerz' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>SSLCommerz Gateways</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All Cards, bKash, Nagad, Rocket, uPay, Net Banking</div>
                </div>
              </div>
              <img src={LOGOS.sslcommerz} alt="SSLCommerz" style={{ height: '36px', objectFit: 'contain' }} />
            </button>

            {/* Alternative Direct Payment Grid Selector */}
            <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Alternative direct payments:
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {[
                { id: 'bkash', name: 'Direct bKash', logo: LOGOS.bkash },
                { id: 'nagad', name: 'Direct Nagad', logo: LOGOS.nagad },
                { id: 'rocket', name: 'Direct Rocket', logo: LOGOS.rocket },
                { id: 'upay', name: 'Direct uPay', logo: LOGOS.upay },
                { id: 'bank', name: 'Direct Bank BD', logo: LOGOS.bank },
                { id: 'visa', name: 'Direct Visa', logo: LOGOS.visa },
                { id: 'cod', name: 'Cash on Delivery', logo: LOGOS.cod }
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  className={`payment-card-btn ${paymentType === method.id ? 'active' : ''}`}
                  onClick={() => setPaymentType(method.id)}
                >
                  <img src={method.logo} alt={method.name} style={{ height: '26px', maxWidth: '100%', objectFit: 'contain' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{method.name}</span>
                </button>
              ))}
            </div>

            {/* Direct fields (rendered only if direct checkout selected) */}
            {paymentType === 'sslcommerz' && (
              <div className="animate-fade-in" style={{
                background: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                <span>You will be forwarded to the secure SSLCommerz merchant interface to finalize payment.</span>
              </div>
            )}

            {['bkash', 'nagad', 'rocket', 'upay'].includes(paymentType) && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  background: 'rgba(0, 240, 255, 0.03)',
                  border: '1px solid rgba(0, 240, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  Send money to Merchant Wallet <strong>01700-000000</strong>. Enter wallet number and TrxID below.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Sender Wallet Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 017XXXXXXXX" 
                      maxLength="11"
                      value={walletNumber}
                      onChange={(e) => setWalletNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Transaction ID (TrxID)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. TRK99382B7" 
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentType === 'bank' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  background: 'rgba(0, 240, 255, 0.03)',
                  border: '1px solid rgba(0, 240, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  Wire to: <strong>102-120-49938</strong> (Velocraft BD, BRAC Bank Ltd, Dhanmondi Branch).
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Select Bank Provider</label>
                  <select 
                    className="form-select"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  >
                    {bdBanks.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Your Account Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 210-992-384" 
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Reference ID</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. REF-28372" 
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentType === 'visa' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cardholder Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Alex Mercer" 
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Visa Card Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="4242 4242 4242 4242" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength="19"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expiration Date</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="MM/YY" 
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength="5"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Security Code (CVV)</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="CVV" 
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentType === 'cod' && (
              <div className="animate-fade-in" style={{
                background: 'rgba(0, 240, 255, 0.03)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Cash on Delivery Selected</span>
                </div>
                <span>You will pay the total amount of <strong>৳ {total.toLocaleString()}</strong> to the courier agent when the parcel is delivered.</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>* Notice: All Cash on Delivery orders require a brief phone confirmation from our customer service team before processing.</span>
              </div>
            )}

          </div>
        </div>

        {/* Right Side summary panel */}
        <aside>
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Order Review
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
              {cart.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{item.quantity}x</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span>৳ {(item.discountPrice || item.price).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Promo Code UI */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Promo Code (Try 'SUPER10')"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="form-input"
                style={{ padding: '8px 12px' }}
              />
              <button 
                onClick={handleApplyCoupon}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
              >
                Apply
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>৳ {subtotal.toLocaleString()}</span>
              </div>
              {appliedDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--accent-red)' }}>
                  <span>Discount ({appliedDiscount * 100}%)</span>
                  <span>- ৳ {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Delivery</span>
                <span style={{ color: isFreeShipping ? 'var(--accent-green)' : 'inherit', fontWeight: isFreeShipping ? 'bold' : 'normal' }}>
                  {isFreeShipping ? 'FREE' : `৳ ${shipping.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px',
              marginBottom: '24px'
            }}>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Total Due</span>
              <span style={{ fontStyle: 'normal', fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                ৳ {total.toLocaleString()}
              </span>
            </div>

            <button 
              onClick={handleCheckoutSubmit}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px' }}
              disabled={loading}
            >
              <CheckCircle2 size={16} />
              <span>{loading ? 'Processing Transaction...' : paymentType === 'sslcommerz' ? 'Pay via SSLCommerz' : 'Submit Order'}</span>
            </button>
          </div>
        </aside>
      </div>

      {/* --- MOCK SSLCOMMERZ TRANSACTION OVERLAY MODAL --- */}
      {showSslPortal && (
        <div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.9)', zIndex: 2000 }}>
          <div className="animate-slide-up" style={{
            width: '100%',
            maxWidth: '750px',
            background: '#ffffff',
            color: '#1e293b',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateRows: '70px 1fr',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            fontFamily: 'sans-serif'
          }}>
            
            {/* Header: SSLCommerz branding bar */}
            <div style={{
              background: '#0e1829',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              borderBottom: '4px solid #f2235e'
            }}>
              <img src={LOGOS.sslcommerz} alt="SSLCommerz Gateway" style={{ height: '32px', objectFit: 'contain' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>
                <Lock size={14} />
                <span>100% Secured Payment</span>
              </div>
            </div>

            {/* Gateway Body Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', height: '420px' }}>
              
              {/* Left Column: Merchant Details */}
              <div style={{
                background: '#f8fafc',
                borderRight: '1px solid #e2e8f0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Merchant</span>
                  <h3 style={{ fontSize: '1.1rem', margin: '4px 0 16px', color: '#0f172a' }}>Velocraft BD</h3>
                  
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Client Info</span>
                  <div style={{ fontSize: '0.85rem', margin: '4px 0 16px', color: '#334155' }}>
                    <strong>{user?.name}</strong><br />
                    {user?.email}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Payable</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f2235e', marginTop: '4px' }}>
                    ৳ {total.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive payment tabs */}
              <div style={{ display: 'grid', gridTemplateRows: '50px 1fr' }}>
                {/* Gateway Tab selection headers */}
                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#f1f5f9'
                }}>
                  {[
                    { id: 'cards', label: 'Cards' },
                    { id: 'mfs', label: 'Mobile Banking (MFS)' },
                    { id: 'internet', label: 'Net Banking' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSslTab(tab.id)}
                      style={{
                        flexGrow: 1,
                        background: sslTab === tab.id ? '#ffffff' : 'transparent',
                        border: 'none',
                        borderBottom: sslTab === tab.id ? '3px solid #f2235e' : 'none',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        color: sslTab === tab.id ? '#0f172a' : '#64748b',
                        transition: '0.2s'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content viewports */}
                <div style={{ padding: '24px', overflowY: 'auto' }}>
                  
                  {/* --- CARD PAYMENT PORTAL --- */}
                  {sslTab === 'cards' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <img src={LOGOS.visa} alt="Visa" style={{ height: '22px' }} />
                        <img src={LOGOS.mastercard} alt="Mastercard" style={{ height: '22px' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0f172a' }}>Enter Debit / Credit Card Info</span>
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <span className="form-label" style={{ color: '#64748b' }}>Cardholder Name</span>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="MD. SUNNY" 
                          value={sslCardHolder} 
                          onChange={(e) => setSslCardHolder(e.target.value.toUpperCase())}
                          style={{ borderColor: '#cbd5e1', color: '#0f172a', padding: '10px' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <span className="form-label" style={{ color: '#64748b' }}>Card Number</span>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="4321 9988 2233 4455" 
                          value={sslCardNumber} 
                          onChange={(e) => setSslCardNumber(e.target.value)}
                          style={{ borderColor: '#cbd5e1', color: '#0f172a', padding: '10px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <span className="form-label" style={{ color: '#64748b' }}>Expiration Date</span>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="MM/YY" 
                            maxLength="5"
                            value={sslCardExpiry} 
                            onChange={(e) => setSslCardExpiry(e.target.value)}
                            style={{ borderColor: '#cbd5e1', color: '#0f172a', padding: '10px' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <span className="form-label" style={{ color: '#64748b' }}>CVV / CVC</span>
                          <input 
                            type="password" 
                            className="form-input" 
                            placeholder="CVV" 
                            maxLength="3"
                            value={sslCardCvv} 
                            onChange={(e) => setSslCardCvv(e.target.value)}
                            style={{ borderColor: '#cbd5e1', color: '#0f172a', padding: '10px' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setShowSslPortal(false)}
                          style={{ width: '40%', color: '#334155', background: '#e2e8f0' }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary" 
                          onClick={handleSslPay}
                          style={{ width: '60%', background: '#10b981', color: '#fff', border: 'none' }}
                        >
                          Pay Now ৳ {total.toLocaleString()}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- MFS (BKASH/NAGAD/ROCKET/UPAY) PORTAL --- */}
                  {sslTab === 'mfs' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* Logo selectors */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {[
                          { id: 'bkash', logo: LOGOS.bkash, name: 'bKash', activeColor: 'rgba(226, 19, 110, 0.1)' },
                          { id: 'nagad', logo: LOGOS.nagad, name: 'Nagad', activeColor: 'rgba(245, 127, 32, 0.1)' },
                          { id: 'rocket', logo: LOGOS.rocket, name: 'Rocket', activeColor: 'rgba(140, 52, 141, 0.1)' },
                          { id: 'upay', logo: LOGOS.upay, name: 'uPay', activeColor: 'rgba(255, 205, 5, 0.1)' }
                        ].map(mfs => (
                          <button
                            key={mfs.id}
                            type="button"
                            onClick={() => { setSslSelectedMfs(mfs.id); setSslOtpStep(1); }}
                            style={{
                              padding: '10px',
                              borderRadius: '8px',
                              border: sslSelectedMfs === mfs.id ? '2px solid #f2235e' : '1px solid #cbd5e1',
                              background: sslSelectedMfs === mfs.id ? mfs.activeColor : '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '64px'
                            }}
                          >
                            <img src={mfs.logo} alt={mfs.name} style={{ height: '24px', objectFit: 'contain' }} />
                          </button>
                        ))}
                      </div>

                      {/* Step 1: Input Mobile Wallet */}
                      {sslOtpStep === 1 && (
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                            Your official MFS Account Number (11 Digits):
                          </span>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. 01712345678" 
                            maxLength="11"
                            value={sslPhone} 
                            onChange={(e) => setSslPhone(e.target.value)}
                            style={{ borderColor: '#cbd5e1', color: '#0f172a', padding: '12px' }}
                          />
                        </div>
                      )}

                      {/* Step 2: Verification code */}
                      {sslOtpStep === 2 && (
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            We have sent a verification code to <strong>{sslPhone}</strong>. Enter it here:
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#f2235e', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                            (Enter any 4-digit code e.g. 1234)
                          </span>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="OTP Code" 
                            maxLength="4"
                            value={sslOtp} 
                            onChange={(e) => setSslOtp(e.target.value)}
                            style={{ borderColor: '#cbd5e1', color: '#0f172a', padding: '12px', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                          />
                        </div>
                      )}

                      {/* Step 3: Enter PIN */}
                      {sslOtpStep === 3 && (
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            Validation complete. Please input your secure wallet PIN code:
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                            (Enter any 4-digit pin e.g. 9988)
                          </span>
                          <input 
                            type="password" 
                            className="form-input" 
                            placeholder="Wallet PIN" 
                            maxLength="4"
                            value={sslPin} 
                            onChange={(e) => setSslPin(e.target.value)}
                            style={{ borderColor: '#cbd5e1', color: '#0f172a', padding: '12px', letterSpacing: '4px', textAlign: 'center' }}
                          />
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setShowSslPortal(false)}
                          style={{ width: '40%', color: '#334155', background: '#e2e8f0' }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary" 
                          onClick={handleSslPay}
                          style={{ width: '60%', background: '#10b981', color: '#fff', border: 'none' }}
                        >
                          {sslOtpStep === 1 ? 'Next Step' : sslOtpStep === 2 ? 'Confirm OTP' : `Pay ৳ ${total.toLocaleString()}`}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- NET BANKING PORTAL --- */}
                  {sslTab === 'internet' && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 'bold' }}>Select Your Bank Link</span>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px'
                      }}>
                        {[
                          'Citytouch (City Bank)',
                          'DBBL Nexus Pay',
                          'Bank Asia Internet Banking',
                          'EBL Skybanking',
                          'MTB Internet Banking'
                        ].map((bank, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={handleSslPay}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              color: '#334155',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                      
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setShowSslPortal(false)}
                        style={{ width: '100%', color: '#334155', background: '#e2e8f0', marginTop: '16px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}



