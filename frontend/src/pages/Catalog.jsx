import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import CarGraphic from '../components/CarGraphic';
import { Search, SlidersHorizontal, AlertCircle, ChevronDown, ArrowUpDown, Zap, Gift, Truck, CreditCard } from 'lucide-react';

export default function Catalog({ onSelectProduct, addToCart, showToast, globalSearchQuery }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [scale, setScale] = useState('All');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');

  // Savoy style Hero slider state
  const [activeSlide, setActiveSlide] = useState(0);

  // Flash Sale Timer State
  const [flashSaleTime, setFlashSaleTime] = useState({ h: 2, m: 59, s: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) {
          s -= 1;
        } else {
          s = 59;
          if (m > 0) {
            m -= 1;
          } else {
            m = 59;
            if (h > 0) h -= 1;
          }
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Automatic Hero Carousel Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleScrollDown = () => {
    const el = document.getElementById('catalog-explore-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categories = ['All', 'Supercar', 'JDM', 'Classic', 'Muscle'];
  const scales = ['All', '1:18', '1:24', '1:43'];

  return (
    <div className="animate-fade-in">
      
      {/* Cinematic Image Hero Banner & Campaign Carousel */}
      <header style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', borderRadius: '24px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: '#111' }}>
        
        {/* Slide 0: Supercar Brand */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
          opacity: activeSlide === 0 ? 1 : 0, transition: 'opacity 1s ease-in-out'
        }}>
          <img 
            src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop" 
            alt="Hero Background"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(0,0,0,0.6)', color: '#ffffff' }}>
              PRECISION IN MOTION
            </h1>
            <p style={{ fontSize: '1.1rem', maxWidth: '600px', marginBottom: '32px', textShadow: '0 2px 10px rgba(0,0,0,0.6)', color: '#ffffff', lineHeight: '1.6' }}>
              Experience the thrill of motorsport engineering with our premium die-cast replicas. Crafted for true automotive enthusiasts.
            </p>
            <button className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1.1rem', borderRadius: '30px' }} onClick={handleScrollDown}>
              Explore Collection
            </button>
          </div>
        </div>

        {/* Slide 1: Promo Campaign */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
          opacity: activeSlide === 1 ? 1 : 0, transition: 'opacity 1s ease-in-out'
        }}>
          <img 
            src="/campaign_red.jpg" 
            alt="Campaign Background"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(255,0,0,0.8)', color: '#ff2a5f' }}>
              10.10 SUPER SALE
            </h1>
            <p style={{ fontSize: '1.25rem', maxWidth: '700px', marginBottom: '32px', textShadow: '0 2px 10px rgba(0,0,0,0.8)', color: '#ffffff', lineHeight: '1.6', fontWeight: '500' }}>
              The biggest event of the year is here. Use promo code <strong style={{ color: 'var(--accent-cyan)' }}>SUPER10</strong> for 10% off your entire order plus absolutely FREE Delivery!
            </p>
            <button className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1.1rem', borderRadius: '30px', background: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={handleScrollDown}>
              Shop The Sale Now
            </button>
          </div>
        </div>

        {/* Slide 2: Free Delivery Campaign */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
          opacity: activeSlide === 2 ? 1 : 0, transition: 'opacity 1s ease-in-out',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
            <Truck size={64} style={{ color: '#fff', marginBottom: '16px' }} />
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em', color: '#ffffff' }}>
              NATIONWIDE FREE DELIVERY
            </h1>
            <p style={{ fontSize: '1.25rem', maxWidth: '600px', marginBottom: '32px', color: '#ecfdf5', lineHeight: '1.6' }}>
              We now deliver anywhere in Bangladesh completely free of charge. No minimum order required!
            </p>
          </div>
        </div>

        {/* Slide 3: Bank Offers */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
          opacity: activeSlide === 3 ? 1 : 0, transition: 'opacity 1s ease-in-out',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
            <CreditCard size={64} style={{ color: '#fff', marginBottom: '16px' }} />
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em', color: '#ffffff' }}>
              BANK PARTNER OFFERS
            </h1>
            <p style={{ fontSize: '1.25rem', maxWidth: '600px', marginBottom: '32px', color: '#eff6ff', lineHeight: '1.6' }}>
              Get an extra 20% OFF when paying with City Bank, DBBL, or EBL Credit Cards.
            </p>
          </div>
        </div>
      </header>

      {/* --- DARAZ STYLE FEATURE GRID --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', gap: '16px', overflowX: 'auto', paddingBottom: '10px' }}>
        {[
          { icon: <Zap size={24} color="#f97316" />, label: 'Flash Sale' },
          { icon: <Gift size={24} color="#ec4899" />, label: 'Vouchers' },
          { icon: <Truck size={24} color="#10b981" />, label: 'Free Shipping' },
          { icon: <CreditCard size={24} color="#3b82f6" />, label: 'Bank Offers' }
        ].map((feature, idx) => (
          <div key={idx} className="glass-card" style={{ flex: '1', minWidth: '100px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', textAlign: 'center' }} onClick={handleScrollDown}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              {feature.icon}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{feature.label}</span>
          </div>
        ))}
      </div>

      {/* --- FLASH SALE SECTION --- */}
      <div className="glass-card" style={{ marginBottom: '40px', borderTop: '4px solid var(--accent-red)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
              <Zap size={24} fill="var(--accent-red)" /> Flash Sale
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ending in</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ background: 'var(--accent-red)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{String(flashSaleTime.h).padStart(2, '0')}</div>
                <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>:</span>
                <div style={{ background: 'var(--accent-red)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{String(flashSaleTime.m).padStart(2, '0')}</div>
                <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>:</span>
                <div style={{ background: 'var(--accent-red)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{String(flashSaleTime.s).padStart(2, '0')}</div>
              </div>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', fontWeight: '600', cursor: 'pointer' }} onClick={handleScrollDown}>SHOP MORE &gt;</button>
        </div>
        
        {/* Flash Sale Horizontal Scroll */}
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollSnapType: 'x mandatory' }}>
          {products.filter(p => p.discountPrice).map(product => (
            <div 
              key={`flash-${product.id}`} 
              className="product-card" 
              style={{ minWidth: '220px', width: '220px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', scrollSnapAlign: 'start', cursor: 'pointer' }}
              onClick={() => onSelectProduct(product.id)}
            >
              <div style={{ position: 'relative', height: '160px' }}>
                <img src={product.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={product.name} />
                <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-red)', color: '#fff', padding: '4px 10px', borderBottomLeftRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </div>
              </div>
              <div style={{ padding: '12px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '1.1rem' }}>৳ {(product.discountPrice || (product.price / 2)).toLocaleString()}</span>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>৳ {product.price.toLocaleString()}</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255, 42, 95, 0.2)', height: '6px', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
                  <div style={{ width: '85%', background: 'var(--accent-red)', height: '100%' }}></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-red)', marginTop: '4px' }}>Only 3 left!</div>
              </div>
            </div>
          ))}
        </div>
      </div>

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


