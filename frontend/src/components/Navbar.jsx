import React, { useState } from 'react';
import { ShoppingCart, User, ShieldAlert, LogOut, Ticket, History, Car, ChevronDown } from 'lucide-react';

export default function Navbar({ 
  user, 
  cart, 
  currentPage, 
  setCurrentPage, 
  onLogout, 
  onOpenLoginModal 
}) {
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="navbar">
      <a href="#catalog" className="nav-brand" onClick={(e) => { e.preventDefault(); setCurrentPage('catalog'); }}>
        <Car size={26} className="text-cyan-400" style={{ color: 'var(--accent-cyan)' }} />
        <span>VELOCRAFT</span>
      </a>

      <div className="nav-links">
        <a 
          href="#catalog" 
          className={`nav-link ${currentPage === 'catalog' || currentPage === 'product-detail' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setCurrentPage('catalog'); }}
        >
          Catalog
        </a>


        <a 
          href="#cart" 
          className={`nav-link ${currentPage === 'cart' || currentPage === 'checkout' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setCurrentPage('cart'); }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-12px',
                background: 'var(--accent-cyan)',
                color: '#000',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                borderRadius: '9999px',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartItemsCount}
              </span>
            )}
          </div>
        </a>

        {user && user.role === 'admin' && (
          <button 
            className="btn btn-secondary" 
            style={{ 
              borderColor: 'var(--accent-cyan)', 
              color: 'var(--accent-cyan)',
              padding: '6px 12px',
              fontSize: '0.85rem'
            }}
            onClick={() => setCurrentPage(currentPage === 'crm' ? 'catalog' : 'crm')}
          >
            <ShieldAlert size={15} />
            <span>{currentPage === 'crm' ? 'Exit Portal' : 'CRM Portal'}</span>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="nav-link"
                style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1' }}>Hello,</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.2' }}>{user.name}</strong>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {showProfileMenu && (
                <div className="glass-card" style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '10px',
                  width: '200px',
                  padding: '8px',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <button className="crm-sidebar-btn" onClick={() => { setCurrentPage('profile'); setShowProfileMenu(false); }}>
                    <User size={16} /> My Account
                  </button>
                  <button className="crm-sidebar-btn" onClick={() => { setCurrentPage('orders'); setShowProfileMenu(false); }}>
                    <History size={16} /> My Orders
                  </button>
                  <button className="crm-sidebar-btn" onClick={() => { setCurrentPage('tickets'); setShowProfileMenu(false); }}>
                    <Ticket size={16} /> Support Tickets
                  </button>
                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
                  <button className="crm-sidebar-btn" onClick={() => { onLogout(); setShowProfileMenu(false); }} style={{ color: 'var(--accent-rose)' }}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenLoginModal} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
