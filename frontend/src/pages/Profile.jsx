import React, { useState, useEffect } from 'react';
import { User, MapPin, Save, Landmark } from 'lucide-react';

export default function Profile({ user, showToast }) {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [zipCode, setZipCode] = useState('');

  // Load saved default address from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedAddr = localStorage.getItem(`velocraft_addr_${user.id}`);
      if (savedAddr) {
        const parsed = JSON.parse(savedAddr);
        setAddress(parsed.address || '');
        setCity(parsed.city || '');
        setDivision(parsed.division || 'Dhaka');
        setZipCode(parsed.zipCode || '');
      }
    }
  }, [user]);

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!address || !city || !zipCode) {
      showToast('Please fill out all address fields.', 'error');
      return;
    }

    const addrObj = { address, city, division, zipCode, country: 'Bangladesh' };
    localStorage.setItem(`velocraft_addr_${user.id}`, JSON.stringify(addrObj));
    showToast('Default shipping address saved successfully!', 'success');
  };

  const divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];

  return (
    <div className="animate-fade-in" style={{ marginTop: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <User size={28} style={{ color: 'var(--accent-cyan)' }} />
        <span>Shopper Profile Details</span>
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '32px' }}>
        {/* Left Side: User profile info card */}
        <div className="glass-card" style={{ height: 'fit-content', borderTop: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(0, 240, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--accent-cyan)'
            }}>
              <User size={40} style={{ color: 'var(--accent-cyan)' }} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{user?.name}</h2>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                {user?.role?.toUpperCase()} MEMBER
              </span>
            </div>

            <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.875rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>
                <div style={{ color: 'var(--text-primary)', marginTop: '2px', fontWeight: '500' }}>{user?.email}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Region/Country:</span>
                <div style={{ color: 'var(--text-primary)', marginTop: '2px', fontWeight: '500' }}>Bangladesh 🇧🇩</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Shipping address manager form */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>Default Delivery Address</span>
          </h2>

          <form onSubmit={handleSaveAddress}>
            <div className="form-group">
              <label className="form-label">Street Address / Area</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. House 45, Road 12, Dhanmondi" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City / District</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Dhaka" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Division</label>
                <select 
                  className="form-select"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                >
                  {divisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">ZIP / Postal Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 1209" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                />
              </div>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
              <Save size={16} />
              <span>Save Default Address</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
