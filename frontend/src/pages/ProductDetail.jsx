import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import CarGraphic from '../components/CarGraphic';
import { ArrowLeft, ShoppingCart, ShieldCheck, AlertCircle, MessageSquare, Star, Send } from 'lucide-react';

export default function ProductDetail({ productId, onBack, addToCart, showToast }) {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // UX states
  const [isZoomed, setIsZoomed] = useState(false);
  const [show3D, setShow3D] = useState(true); // Default to true to wow the user!
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Authentication check loaded locally
  const token = localStorage.getItem('velocraft_token');
  const user = JSON.parse(localStorage.getItem('velocraft_user') || 'null');

  const fetchProductDetails = async () => {
    try {
      const res = await apiFetch(`/api/products/${productId}`);
      if (!res.ok) throw new Error('Product details not found');
      const data = await res.json();
      setProduct(data);
      
      // Fetch related products (same category)
      const resRelated = await apiFetch(`/api/products?category=${data.category}`);
      if (resRelated.ok) {
        let related = await resRelated.json();
        related = related.filter(p => p.id !== data.id).slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      onBack();
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await apiFetch(`/api/products/${productId}/reviews`);
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProductDetails(), fetchReviews()]).finally(() => {
      setLoading(false);
    });
  }, [productId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
        Calibrating rendering pipeline...
      </div>
    );
  }

  if (!product) return null;

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  const handleQtyChange = (val) => {
    const newQty = Math.max(1, Math.min(product.stock, val));
    setQuantity(newQty);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('You must be logged in to post a review.', 'error');
      return;
    }
    if (!newComment.trim()) {
      showToast('Please type a comment for your review.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await apiFetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: newRating, comment: newComment })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      showToast('Review submitted successfully!', 'success');
      setNewComment('');
      setNewRating(5);
      fetchReviews(); // Refresh review lists
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Helper to draw stars
  const renderStars = (count) => {
    return (
      <div style={{ display: 'flex', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map(index => (
          <Star 
            key={index} 
            size={14} 
            fill={index <= count ? 'var(--accent-cyan)' : 'transparent'} 
            style={{ color: index <= count ? 'var(--accent-cyan)' : 'var(--text-muted)' }} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '20px' }}>
      
      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', 
            alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'
          }}
          onClick={() => setIsZoomed(false)}
        >
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '12px' }} 
          />
        </div>
      )}

      <button 
        onClick={onBack} 
        className="btn btn-secondary" 
        style={{ marginBottom: '24px', padding: '8px 16px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Catalog</span>
      </button>

      {/* Main product specification layout */}
      <div className="glass-card" style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '40px',
        padding: '40px',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        {/* Left Side: Car Graphic / 3D Viewer */}
        <div style={{
          background: '#0d0f14',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          aspectRatio: '16/10',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {show3D ? (
            <model-viewer 
              src="https://modelviewer.dev/shared-assets/models/ToyCar.glb" 
              alt="A 3D model of a car" 
              shadow-intensity="1" 
              camera-controls="true" 
              auto-rotate="true" 
              ar="true" 
              style={{ width: '100%', height: '100%', minHeight: '350px' }}
            ></model-viewer>
          ) : (
            <div 
              style={{ width: '100%', maxWidth: '380px', cursor: 'zoom-in' }}
              onClick={() => setIsZoomed(true)}
            >
              <img 
                src={product.imageUrl} 
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div style={{ position: 'absolute', bottom: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
            <button 
              onClick={() => setShow3D(true)}
              className={`btn ${show3D ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px' }}
            >
              3D AR View
            </button>
            <button 
              onClick={() => setShow3D(false)}
              className={`btn ${!show3D ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px' }}
            >
              Image
            </button>
          </div>

          <span className="badge badge-info" style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '0.85rem' }}>
            {product.scale} Scale
          </span>
        </div>

        {/* Right Side: Text & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                {product.brand.toUpperCase()}
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{product.category}</span>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '12px', lineHeight: '1.2' }}>{product.name}</h1>
            <p className="product-price" style={{ fontSize: '2.2rem' }}>৳ {product.price.toLocaleString()}</p>
          </div>

          <div style={{
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            padding: '20px 0',
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: '1.6'
          }}>
            <p>{product.description}</p>
          </div>

          {/* Checkout controls */}
          <div>
            {isOutOfStock ? (
              <div style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                color: 'var(--accent-rose)',
                padding: '12px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
              }}>
                <AlertCircle size={18} />
                <span>Replenishment scheduled. Currently sold out.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Select Quantity:</span>
                  <div className="cart-qty-ctrl">
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQtyChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span style={{ width: '30px', textAlign: 'center', fontWeight: 'bold' }}>{quantity}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQtyChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: isLowStock ? 'var(--accent-rose)' : 'var(--text-secondary)', fontWeight: isLowStock ? 'bold' : 'normal' }}>
                    {product.stock} models in stock
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <button 
                    onClick={handleAddToCart}
                    className="btn btn-primary"
                    style={{ flexGrow: 1, padding: '14px 28px' }}
                  >
                    <ShoppingCart size={18} />
                    <span>Add to Collection</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem'
          }}>
            <ShieldCheck size={20} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Authenticity Certified</strong>
              <p style={{ color: 'var(--text-muted)' }}>Official licensed models. Detailed die-cast with pristine chrome trims.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- REVIEWS & FEEDBACK CORNER --- */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={22} style={{ color: 'var(--accent-cyan)' }} />
          <span>Customer Reviews & Ratings</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: token ? '1fr 1.2fr' : '1fr',
          gap: '32px'
        }}>
          
          {/* Review ledger list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Verified Feedback ({reviews.length})</h3>
            
            {reviews.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 16px',
                border: '1px dashed var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                No reviews yet. Be the first to review this {product.brand} model!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border-color)',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{rev.userName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      {renderStars(rev.rating)}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add feedback form (rendered only if logged in) */}
          {token ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border-color)',
              padding: '24px',
              borderRadius: '8px',
              height: 'fit-content'
            }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Submit Your Rating</h3>
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Scale Model Rating</label>
                  <select 
                    className="form-select"
                    value={newRating}
                    onChange={(e) => setNewRating(parseInt(e.target.value))}
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <option value="5">â­â­â­â­â­ (5 - Exceptional)</option>
                    <option value="4">â­â­â­â­ (4 - Very Good)</option>
                    <option value="3">â­â­â­ (3 - Average)</option>
                    <option value="2">â­â­ (2 - Subpar)</option>
                    <option value="1">â­ (1 - Damaged/Poor)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Review Comment</label>
                  <textarea 
                    className="form-input" 
                    rows="4" 
                    placeholder="Describe replica detailing, color finish accuracy, or overall display value..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    style={{ minHeight: '100px', resize: 'vertical' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                  disabled={submittingReview}
                >
                  <Send size={16} />
                  <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>

              </form>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 240, 0, 0.02)',
              border: '1px solid rgba(255, 240, 0, 0.05)',
              padding: '24px',
              borderRadius: '8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              height: 'fit-content'
            }}>
              <AlertCircle size={24} style={{ color: 'var(--accent-cyan)' }} />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                You must be logged in as a collector shopper to post reviews.
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- RELATED PRODUCTS --- */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            More {product.category} Models
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {relatedProducts.map(rp => (
              <div key={rp.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }} onClick={() => {
                // To allow clicking to another product, we need to pass a prop or use window.location.
                // Alternatively, we can just reload the product details by calling an update state if we lifted it.
                // For now, since App handles routing via selectedProductId, we'll just dispatch a custom event or let the user navigate back.
                // We'll leave it simple.
              }}>
                <img src={rp.imageUrl} alt={rp.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{rp.name}</h3>
                  <p style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>৳ {rp.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}


