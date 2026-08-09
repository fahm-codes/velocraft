import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import CarGraphic from '../components/CarGraphic';
import { Search, SlidersHorizontal, AlertCircle, ChevronDown, ArrowUpDown } from 'lucide-react';

export default function Catalog({ onSelectProduct, addToCart, showToast, globalSearchQuery }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [scale, setScale] = useState('All');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');

  // Savoy style Hero slider state
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "PORSCHE 911 GT3 RS (992)",
      desc: "Uncompromising track performance. Experience the peak of Stuttgart motorsport engineering in a 1:18 die-cast masterpiece.",
      category: "Supercar",
      id: "p1",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sports-car-on-a-road-in-the-woods-39906-large.mp4",
      bg: "linear-gradient(135deg, #1c050d 0%, #0a0b0d 100%)"
    },
    {
      title: "NISSAN SKYLINE GT-R R34",
      desc: "The legend of Bayside Blue. Re-live the golden era of Japanese grand tourers with Nismo's finest Z-Tune replica.",
      category: "JDM",
      id: "p51",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-headlights-of-a-car-parked-at-night-41580-large.mp4",
      bg: "linear-gradient(135deg, #050c1c 0%, #0a0b0d 100%)"
    },
    {
      title: "SHELBY MUSTANG GT500",
      desc: "Raw American V8 muscle. Eleanor finished in authentic striping and high-precision wood trim dashboard elements.",
      category: "Muscle",
      id: "p151",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-on-a-wet-track-40019-large.mp4",
      bg: "linear-gradient(135deg, #12141c 0%, #0a0b0d 100%)"
    }
  ];

  // Auto scroll timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products based on search, category and scale
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (globalSearchQuery) params.append('search', globalSearchQuery);
      if (category && category !== 'All') params.append('category', category);
      if (scale && scale !== 'All') params.append('scale', scale);

      const res = await apiFetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      // Apply client-side sorting
      let sorted = [...data];
      switch (sortBy) {
        case 'price-asc': sorted.sort((a, b) => a.price - b.price); break;
        case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
        case 'name-az': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'name-za': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
        default: break;
      }
      setProducts(sorted);
    } catch (err) {
      console.error(err);
      showToast('Error loading products catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [globalSearchQuery, category, scale, sortBy]);

  const handleScrollDown = () => {
    const el = document.getElementById('catalog-explore-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categories = ['All', 'Supercar', 'JDM', 'Classic', 'Muscle'];
  const scales = ['All', '1:18', '1:24', '1:43'];

  return (
    <div className="animate-fade-in">
      
      {/* Cinematic Image Hero Banner */}
      <header style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', borderRadius: '24px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: '#111' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <img 
            src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop" 
            alt="Hero Background"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
          />
        </div>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 1,
          color: '#fff',
          padding: '24px'
        }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(0,0,0,0.6)', color: '#ffffff' }}>
            PRECISION IN MOTION
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', marginBottom: '32px', textShadow: '0 2px 10px rgba(0,0,0,0.6)', color: '#ffffff', lineHeight: '1.6' }}>
            Experience the thrill of motorsport engineering with our premium die-cast replicas. Crafted for true automotive enthusiasts.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ padding: '14px 36px', fontSize: '1.1rem', borderRadius: '30px' }}
            onClick={handleScrollDown}
          >
            Explore Collection
          </button>
        </div>
      </header>

      {/* Bouncing Scroll Explorer prompt */}
      <div className="scroll-explore" onClick={handleScrollDown}>
        <span>Scroll to Explore Catalog</span>
        <ChevronDown size={18} className="scroll-icon-arrow" style={{ color: 'var(--accent-cyan)' }} />
      </div>

      {/* Catalog Search & Filtering Section */}
      <div 
        id="catalog-explore-section" 
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color)',
          padding: '16px 24px',
          borderRadius: '12px',
          marginBottom: '32px',
          scrollMarginTop: '80px'
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input 
            type="text" 
            placeholder="Search collection via Navbar..." 
            value={globalSearchQuery || ''}
            readOnly
            className="form-input" 
            style={{ paddingLeft: '48px', width: '300px', background: 'rgba(255,255,255,0.02)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <SlidersHorizontal size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Active Filters</span>
        </div>
      </div>
      <div className="catalog-layout">

        {/* Product Grid View */}
        <main style={{ width: '100%' }}>
          {/* Horizontal Filter & Sort Toolbar */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', padding: '16px 24px' }}>
            
            {/* Left: Result Count */}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              {!loading && `${products.length} model${products.length !== 1 ? 's' : ''} found`}
            </span>
            
            {/* Right: Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category:</span>
                <select 
                  className="sort-select"
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scale:</span>
                <select 
                  className="sort-select"
                  value={scale} 
                  onChange={e => setScale(e.target.value)}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
                >
                  {scales.map(s => <option key={s} value={s}>{s === 'All' ? 'All Scales' : s}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
                <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
                <select 
                  className="sort-select"
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="default">Default Order</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="name-az">Name: A → Z</option>
                  <option value="name-za">Name: Z → A</option>
                </select>
              </div>
            </div>
          </div>


          {loading ? (
            <div className="product-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card skeleton-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="skeleton-shimmer" style={{ height: '180px', borderRadius: '12px 12px 0 0' }}></div>
                  <div style={{ padding: '16px' }}>
                    <div className="skeleton-shimmer" style={{ height: '14px', width: '70%', borderRadius: '6px', marginBottom: '10px' }}></div>
                    <div className="skeleton-shimmer" style={{ height: '12px', width: '50%', borderRadius: '6px', marginBottom: '8px' }}></div>
                    <div className="skeleton-shimmer" style={{ height: '20px', width: '40%', borderRadius: '6px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
              <h3>No replicas matched your selection</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Try refining your search text or removing active filters.</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => {
                const isLowStock = product.stock > 0 && product.stock <= 5;
                const isOutOfStock = product.stock === 0;

                return (
                  <div 
                    key={product.id} 
                    className={`glass-card product-card ${isLowStock ? 'low-stock-alert' : ''}`}
                  >
                    <div 
                      className="product-img-wrapper" 
                      onClick={() => onSelectProduct(product.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="product-img" 
                        onError={(e) => {
                          // Fallback fallback graphic if photo error occurs
                          e.target.style.display = 'none';
                        }} 
                      />
                      {/* Promo SALE Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'var(--accent-red)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        boxShadow: '0 4px 10px rgba(255, 0, 85, 0.3)',
                        zIndex: 2,
                        letterSpacing: '0.5px'
                      }}>
                        10.10 SALE
                      </div>
                      
                      <div className="product-tag" style={{ right: '12px', left: 'auto' }}>
                        <span className="badge badge-info">{product.scale}</span>
                      </div>

                      {/* Savoy Ice Cream style sliding overlay details */}
                      <div className="product-hover-overlay">
                        <p className="product-hover-desc">{product.description}</p>
                        <div className="product-spec-row">
                          <span>Brand: <strong>{product.brand}</strong></span>
                          <span>Category: <strong>{product.category}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="product-card-body">
                      <h3 
                        className="product-title"
                        onClick={() => onSelectProduct(product.id)}
                        style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                        onMouseEnter={(e) => e.target.style.color = 'var(--accent-cyan)'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                      >
                        {product.name}
                      </h3>

                      <div className="product-footer" style={{ marginTop: '12px' }}>
                        <div className="product-price">৳ {product.price.toLocaleString()}</div>
                        
                        {isOutOfStock ? (
                          <span className="badge badge-danger">Out of stock</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <button 
                              className="btn btn-primary"
                              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                              onClick={() => addToCart(product)}
                            >
                              Add To Cart
                            </button>
                            {isLowStock && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 'bold' }}>
                                <AlertCircle size={10} /> Only {product.stock} left!
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


