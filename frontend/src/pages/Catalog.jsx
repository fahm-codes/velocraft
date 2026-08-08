import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import CarGraphic from '../components/CarGraphic';
import { Search, SlidersHorizontal, AlertCircle, ChevronDown, ArrowUpDown } from 'lucide-react';

export default function Catalog({ onSelectProduct, addToCart, showToast }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
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
      if (search) params.append('search', search);
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
  }, [search, category, scale, sortBy]);

  const handleScrollDown = () => {
    const el = document.getElementById('catalog-explore-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categories = ['All', 'Supercar', 'JDM', 'Classic', 'Muscle'];
  const scales = ['All', '1:18', '1:24', '1:43'];

  return (
    <div className="animate-fade-in">
      
      {/* Savoy-style Interactive Hero Carousel Slider */}
      <header className="hero-slider">
        <div 
          className="slider-wrapper" 
          style={{ 
            transform: `translateX(-${activeSlide * 100}%)`,
            width: `${slides.length * 100}%` 
          }}
        >
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className={`slider-slide ${activeSlide === index ? 'active' : ''}`}
              style={{ background: slide.bg }}
            >
              <div className="slider-content">
                <span className="badge badge-info" style={{ width: 'fit-content' }}>{slide.category.toUpperCase()} EDITION</span>
                <h1 className="slider-title">{slide.title}</h1>
                <p className="slider-desc">{slide.desc}</p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: 'fit-content', padding: '12px 24px', marginTop: '10px' }}
                  onClick={() => onSelectProduct(slide.id)}
                >
                  Explore Details
                </button>
              </div>
              <div className="slider-image-container">
                <div className="slider-image-glow"></div>
                <div className="slider-car-graphic">
                  <video 
                    src={slide.videoUrl}
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    style={{
                      width: '100%',
                      height: '240px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      animation: 'slowFloat 6s ease-in-out infinite'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Indicator Dots */}
        <div className="slider-controls">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${activeSlide === index ? 'active' : ''}`}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
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
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by model name, brand or details..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '48px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <SlidersHorizontal size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Active Filters</span>
        </div>
      </div>

      <div className="catalog-layout">
        {/* Sidebar Controls */}
        <aside className="filter-sidebar">
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>Categories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map(cat => {
                  const bulletColors = {
                    All: 'var(--text-secondary)',
                    Supercar: '#ff0055',
                    JDM: '#00f0ff',
                    Classic: '#d4af37',
                    Muscle: '#bd00ff'
                  };
                  return (
                    <button
                      key={cat}
                      className={`crm-sidebar-btn ${category === cat ? 'active' : ''}`}
                      onClick={() => setCategory(cat)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: bulletColors[cat] || 'var(--text-secondary)',
                        boxShadow: `0 0 6px ${bulletColors[cat] || 'transparent'}`
                      }}></span>
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>Scale Ratio</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scales.map(s => (
                  <button
                    key={s}
                    className={`crm-sidebar-btn ${scale === s ? 'active' : ''}`}
                    onClick={() => setScale(s)}
                  >
                    {s === 'All' ? 'All Scales' : s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid View */}
        <main>
          {/* Sort Controls & Result Count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {!loading && `${products.length} model${products.length !== 1 ? 's' : ''} found`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
              <select 
                className="sort-select"
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="default">Default Order</option>
                <option value="price-asc">Price: Low â†’ High</option>
                <option value="price-desc">Price: High â†’ Low</option>
                <option value="name-az">Name: A â†’ Z</option>
                <option value="name-za">Name: Z â†’ A</option>
              </select>
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
                      {/* Real Image representation overlaying fallback vector if needed */}
                      <div className="product-tag">
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
                        <div className="product-price">à§³ {product.price.toLocaleString()}</div>
                        
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

