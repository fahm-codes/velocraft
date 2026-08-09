import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  MessageSquare, 
  Globe, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Camera,
  Settings
} from 'lucide-react';

export default function Profile({ user, showToast, onLogout }) {
  const [showAddressForm, setShowAddressForm] = useState(false);
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
    setShowAddressForm(false);
  };
  
  const handleFeatureClick = (featureName) => {
    showToast(`${featureName} feature coming soon!`, 'info');
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
      
      <h1 style={{ fontSize: '1.75rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px' }}>
        <Settings size={26} style={{ color: 'var(--accent-cyan)' }} />
        <span>Account Settings</span>
      </h1>

      {/* Profile Header Card */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', marginBottom: '24px', borderTop: '4px solid var(--accent-cyan)' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(0, 240, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--accent-cyan)',
            overflow: 'hidden'
          }}>
            <User size={40} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <button style={{
            position: 'absolute',
            bottom: 0,
            right: -4,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}>
            <Camera size={14} />
          </button>
        </div>
        
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{user?.name}</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '6px' }}>{user?.email}</div>
          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
            {user?.role?.toUpperCase()} MEMBER
          </span>
        </div>
      </div>

      {/* Settings List */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        
        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s' }}
          onClick={() => handleFeatureClick('Account Information Update')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <User size={20} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: '500' }}>Account Information</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
        </div>

        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s' }}
          onClick={() => setShowAddressForm(!showAddressForm)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <MapPin size={20} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: '500' }}>Address Book</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-muted)', transform: showAddressForm ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
        </div>

        {showAddressForm && (
          <div style={{ padding: '24px', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
            <form onSubmit={handleSaveAddress}>
              <div className="form-group">
                <label className="form-label">Street Address / Area</label>
                <input type="text" className="form-input" placeholder="e.g. House 45, Road 12, Dhanmondi" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Division</label>
                  <select className="form-select" value={division} onChange={(e) => setDivision(e.target.value)}>
                    {['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Zip / Postal Code</label>
                <input type="text" className="form-input" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', width: '100%' }}>Save Address</button>
            </form>
          </div>
        )}

        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s' }}
          onClick={() => handleFeatureClick('Message Center')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <MessageSquare size={20} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: '500' }}>Messages</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
        </div>

        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s' }}
          onClick={() => handleFeatureClick('Language Settings')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Globe size={20} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: '500' }}>Language</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>English</span>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s' }}
          onClick={() => handleFeatureClick('Account Security')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: '500' }}>Account Security</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
        </div>

        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', cursor: 'pointer', transition: '0.2s' }}
          onClick={() => handleFeatureClick('Help & Feedback')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <HelpCircle size={20} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: '500' }}>Help / Feedback</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
        </div>

      </div>

      <button 
        onClick={onLogout}
        className="btn" 
        style={{ width: '100%', marginTop: '24px', padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}
      >
        <LogOut size={20} />
        <span>Log Out</span>
      </button>

    </div>
  );
}
