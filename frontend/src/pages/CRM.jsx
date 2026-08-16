import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import CarGraphic from '../components/CarGraphic';
import { 
  BarChart3, ShoppingBag, Plus, Edit, Trash2, 
  Users, MessageSquare, AlertTriangle, CheckSquare, 
  ShieldAlert, DollarSign, Package, X, RefreshCw,
  User, History, Ticket, Gift
} from 'lucide-react';
import Profile from './Profile';
import OrderHistory from './OrderHistory';
import SupportTickets from './SupportTickets';

export default function CRM({ token, user, setCurrentPage, showToast }) {
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'analytics' : 'profile'); // analytics, orders, inventory, customers, tickets / profile, orders-shopper, tickets-shopper
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Orders Filter State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Edit / Add Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding new product
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('Supercar');
  const [prodScale, setProdScale] = useState('1:18');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('/images/porsche_gt3.jpg');
  const [prodDescription, setProdDescription] = useState('');

  // Ticket detail view state
  const [activeTicket, setActiveTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Campaign Manager State
  const [flashSaleDiscount, setFlashSaleDiscount] = useState('50');
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoLimit, setPromoLimit] = useState('');

  // Fetch data depending on tab
  const fetchData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Load analytics
      const anaRes = await apiFetch('/api/crm/analytics', { headers });
      if (!anaRes.ok) throw new Error('Failed to load analytics dashboard');
      const anaData = await anaRes.json();
      setAnalytics(anaData);

      // Load orders
      const ordRes = await apiFetch('/api/crm/orders', { headers });
      if (!ordRes.ok) throw new Error('Failed to load orders');
      const ordData = await ordRes.json();
      setOrders(ordData);

      // Load products catalog
      const prodRes = await apiFetch('/api/products');
      if (!prodRes.ok) throw new Error('Failed to load products');
      const prodData = await prodRes.json();
      setProducts(prodData);

      // Load customer profiles
      const custRes = await apiFetch('/api/crm/customers', { headers });
      if (!custRes.ok) throw new Error('Failed to load customer profiles');
      const custData = await custRes.json();
      setCustomers(custData);

      // Load tickets
      const tickRes = await apiFetch('/api/crm/tickets', { headers });
      if (!tickRes.ok) throw new Error('Failed to load support tickets');
      const tickData = await tickRes.json();
      setTickets(tickData);

      // Load coupons
      const coupRes = await apiFetch('/api/crm/coupons', { headers });
      if (coupRes.ok) {
        const coupData = await coupRes.json();
        setCoupons(coupData);
      }

      // Keep active ticket data updated if open
      if (activeTicket) {
        const updatedTick = tickData.find(t => t.id === activeTicket.id);
        if (updatedTick) setActiveTicket(updatedTick);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, activeTab]);

  // Update Order Status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await apiFetch(`/api/crm/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Fulfillment status modification failed');
      showToast(`Order status updated to ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleGrantAdmin = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to promote ${userName} to an Admin? This gives them full access to the CRM Portal.`)) {
      return;
    }
    
    try {
      const res = await apiFetch(`/api/crm/customers/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'admin' })
      });
      if (!res.ok) throw new Error('Failed to grant admin access');
      
      showToast(`${userName} is now an Admin!`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Open modal for Product Add
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdBrand('');
    setProdCategory('Supercar');
    setProdScale('1:18');
    setProdPrice('');
    setProdStock('');
    setProdImageUrl('/images/porsche_gt3.jpg');
    setProdDescription('');
    setShowProductModal(true);
  };

  // Open modal for Product Edit
  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdBrand(prod.brand);
    setProdCategory(prod.category);
    setProdScale(prod.scale);
    setProdPrice(prod.price.toString());
    setProdStock(prod.stock.toString());
    setProdImageUrl(prod.imageUrl);
    setProdDescription(prod.description);
    setShowProductModal(true);
  };

  // Handle Local Product Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      showToast('Uploading image...', 'info');
      const res = await apiFetch('/api/products/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      setProdImageUrl(data.imageUrl);
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    // Validations
    if (!prodName || !prodBrand || !prodCategory || !prodScale || prodPrice === '' || prodStock === '' || !prodDescription) {
      showToast('Please fill in all product fields', 'error');
      return;
    }

    const priceNum = parseFloat(prodPrice);
    const stockNum = parseInt(prodStock);

    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Price must be a positive number', 'error');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      showToast('Stock must be a non-negative integer', 'error');
      return;
    }

    try {
      const payload = {
        name: prodName,
        brand: prodBrand,
        category: prodCategory,
        scale: prodScale,
        price: priceNum,
        stock: stockNum,
        imageUrl: prodImageUrl || '/images/porsche_gt3.jpg',
        description: prodDescription
      };

      const url = editingProduct ? `/api/crm/products/${editingProduct.id}` : '/api/crm/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product replica specs');

      showToast(editingProduct ? 'Product details updated' : 'New model replica cataloged', 'success');
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this replica product from the public catalog?')) return;

    try {
      const res = await apiFetch(`/api/crm/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Product catalog deletion failed');
      showToast('Replica product removed', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Admin Ticket Reply
  const handleAdminTicketReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim()) return;

    try {
      const res = await apiFetch(`/api/tickets/${activeTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: adminReplyText })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send admin response');

      setAdminReplyText('');
      showToast('Response submitted', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Resolve Ticket
  const handleResolveTicket = async () => {
    try {
      const res = await apiFetch(`/api/crm/tickets/${activeTicket.id}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to resolve support ticket');
      showToast('Ticket marked Resolved', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleApplyFlashSale = async (e) => {
    e.preventDefault();
    if (flashSaleProducts.length === 0) {
      showToast('Select at least one product for the Flash Sale', 'error');
      return;
    }
    try {
      const res = await apiFetch('/api/crm/campaigns/flash-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productIds: flashSaleProducts, discountPercentage: parseInt(flashSaleDiscount) })
      });
      if (!res.ok) throw new Error('Failed to update flash sale');
      showToast('Flash Sale Campaign Updated!', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/crm/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: promoCode, discountPercentage: promoDiscount, maxUses: promoLimit })
      });
      if (!res.ok) throw new Error('Failed to create coupon');
      setPromoCode('');
      setPromoDiscount('');
      setPromoLimit('');
      showToast('Promo Code Generated!', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="animate-fade-in" style={{ marginTop: '20px' }}>
      {/* Header and Toggle Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAdmin ? (
            <ShieldAlert size={32} style={{ color: 'var(--accent-cyan)' }} />
          ) : (
            <User size={32} style={{ color: 'var(--accent-cyan)' }} />
          )}
          <span>{isAdmin ? 'Velocraft Admin CRM Portal' : 'Collector Dashboard Portal'}</span>
        </h1>
        {isAdmin && (
          <button className="btn btn-secondary" onClick={fetchData} title="Refresh Live Data" style={{ padding: '8px 12px' }}>
            <RefreshCw size={15} />
          </button>
        )}
      </div>

      <div className="crm-layout">
        {/* Sidebar Controls */}
        <aside className="crm-sidebar">
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px' }}>
            {isAdmin ? (
              <>
                <button 
                  className={`crm-sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 size={18} />
                  <span>Metrics & Charts</span>
                </button>
                <button 
                  className={`crm-sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <ShoppingBag size={18} />
                  <span>Order Fulfillment</span>
                </button>
                <button 
                  className={`crm-sidebar-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inventory')}
                >
                  <Package size={18} />
                  <span>Inventory Control</span>
                </button>
                <button 
                  className={`crm-sidebar-btn ${activeTab === 'customers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('customers')}
                >
                  <Users size={18} />
                  <span>Customer Logs</span>
                </button>
                <button 
                  className={`crm-sidebar-btn ${activeTab === 'tickets' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('tickets'); setActiveTicket(null); }}
                >
                  <MessageSquare size={18} />
                  <span>Ticket Resolver</span>
                </button>
                <button 
                  className={`crm-sidebar-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
                  onClick={() => setActiveTab('campaigns')}
                >
                  <Gift size={18} />
                  <span>Campaigns & Promos</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  className={`crm-sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={18} style={{ color: 'var(--accent-cyan)' }} />
                  <span>My Profile</span>
                </button>
                <button 
                  className={`crm-sidebar-btn ${activeTab === 'orders-shopper' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders-shopper')}
                >
                  <History size={18} style={{ color: 'var(--accent-blue)' }} />
                  <span>Order History</span>
                </button>
                <button 
                  className={`crm-sidebar-btn ${activeTab === 'tickets-shopper' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tickets-shopper')}
                >
                  <Ticket size={18} style={{ color: 'var(--accent-rose)' }} />
                  <span>Support Tickets</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main>
          {loading && isAdmin && !analytics ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
              Querying database server...
            </div>
          ) : (
            <div className="animate-fade-in">
              
              {/* --- SHOPPER DASHBOARD VIEWS --- */}
              {!isAdmin && activeTab === 'profile' && (
                <Profile user={user} showToast={showToast} />
              )}
              {!isAdmin && activeTab === 'orders-shopper' && (
                <OrderHistory token={token} setCurrentPage={setCurrentPage} showToast={showToast} />
              )}
              {!isAdmin && activeTab === 'tickets-shopper' && (
                <SupportTickets token={token} showToast={showToast} />
              )}

              {/* --- METRICS / ANALYTICS TAB --- */}
              {isAdmin && activeTab === 'analytics' && analytics && (
                <div>
                  <div className="analytics-grid">
                    <div className="glass-card metric-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                      <span className="metric-title">Gross Revenue</span>
                      <span className="metric-val" style={{ color: 'var(--accent-cyan)' }}>
                        ৳ {analytics.metrics.totalSales.toLocaleString()}
                      </span>
                    </div>
                    <div className="glass-card metric-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                      <span className="metric-title">Purchase Volume</span>
                      <span className="metric-val">{analytics.metrics.totalOrders} Orders</span>
                    </div>
                    <div className="glass-card metric-card" style={{ borderLeft: '4px solid var(--accent-green)' }}>
                      <span className="metric-title">Registered Shoppers</span>
                      <span className="metric-val">{analytics.metrics.activeCustomers} Users</span>
                    </div>
                    <div className="glass-card metric-card" style={{ borderLeft: analytics.metrics.lowStockAlertCount > 0 ? '4px solid var(--accent-rose)' : '4px solid var(--border-color)' }}>
                      <span className="metric-title">Low Stock Alert</span>
                      <span className="metric-val" style={{ color: analytics.metrics.lowStockAlertCount > 0 ? 'var(--accent-rose)' : 'inherit' }}>
                        {analytics.metrics.lowStockAlertCount} Models
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                    {/* Category Sales Custom HTML Chart */}
                    <div className="glass-card">
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={18} style={{ color: 'var(--accent-cyan)' }} />
                        <span>Sales Category Distribution</span>
                      </h3>
                      
                      <div className="chart-container">
                        {analytics.categoryBreakdown.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Zero sales data recorded.
                          </div>
                        ) : (
                          analytics.categoryBreakdown.map((row, idx) => {
                            const maxVal = Math.max(...analytics.categoryBreakdown.map(r => r.value), 1);
                            const percent = (row.value / maxVal) * 100;
                            return (
                              <div key={idx} className="chart-bar-row">
                                <div className="chart-label">{row.name}</div>
                                <div className="chart-bar-wrapper">
                                  <div className="chart-bar-fill" style={{ width: `${percent}%` }}></div>
                                </div>
                                <div className="chart-value">৳ {row.value.toLocaleString()}</div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Low Stock Warning Alert Panel */}
                    <div className="glass-card" style={{ border: analytics.lowStockProducts.length > 0 ? '1px solid rgba(244,63,94,0.3)' : '1px solid var(--border-color)' }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: analytics.lowStockProducts.length > 0 ? 'var(--accent-rose)' : 'inherit' }}>
                        <AlertTriangle size={18} />
                        <span>Low Inventory Monitoring</span>
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                        {analytics.lowStockProducts.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            All models fully stocked.
                          </div>
                        ) : (
                          analytics.lowStockProducts.map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '30px', background: '#0a0b0d', borderRadius: '4px', overflow: 'hidden' }}>
                                  <CarGraphic category="Muscle" productId={p.id} />
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{p.name}</span>
                              </div>
                              <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                                {p.stock} Left
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- ORDERS Tab --- */}
              {activeTab === 'orders' && (
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Client Orders Tracker</h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Search by ID or Name..." 
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="form-input"
                        style={{ padding: '8px 12px', width: '250px' }}
                      />
                      <select 
                        className="form-select"
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        style={{ padding: '8px 30px 8px 12px', width: '150px' }}
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Client Name</th>
                          <th>Purchased Items</th>
                          <th>Grand Total</th>
                          <th>Order Date</th>
                          <th>Fulfillment Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(order => {
                          const matchesSearch = order.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                                                order.customerName.toLowerCase().includes(orderSearch.toLowerCase());
                          const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
                          return matchesSearch && matchesStatus;
                        }).map(order => (
                          <tr key={order.id}>
                            <td style={{ fontWeight: 'bold' }}>#{order.id}</td>
                            <td>
                              <div>{order.customerName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>
                                {order.items.map((item, idx) => (
                                  <div key={idx}>
                                    <strong style={{ color: 'var(--accent-cyan)' }}>{item.quantity}x</strong> {item.name}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>৳ {order.totalAmount.toLocaleString()}</td>
                            <td style={{ fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                              <select 
                                className="form-select"
                                value={order.status}
                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                style={{ padding: '6px 30px 6px 12px', fontSize: '0.85rem', backgroundPosition: 'right 10px center' }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- INVENTORY / CATALOG CRUD TAB --- */}
              {activeTab === 'inventory' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.15rem' }}>Active Replica Catalog</h3>
                    <button className="btn btn-primary" onClick={handleOpenAddProduct} style={{ padding: '8px 16px' }}>
                      <Plus size={16} />
                      <span>Catalog New Replica</span>
                    </button>
                  </div>

                  <div className="product-grid">
                    {products.map(prod => (
                      <div key={prod.id} className="glass-card product-card">
                        <div className="product-img-wrapper">
                          <img 
                            src={prod.imageUrl} 
                            alt={prod.name}
                            className="product-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div className="product-tag" style={{ display: 'flex', gap: '4px' }}>
                            <span className="badge badge-info">{prod.scale}</span>
                            <span className="badge badge-success">{prod.stock} Units</span>
                          </div>
                        </div>

                        <div className="product-card-body">
                          <div className="product-meta">
                            <span>{prod.brand}</span>
                            <span>{prod.category}</span>
                          </div>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{prod.name}</h3>
                          <p className="product-desc" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>{prod.description}</p>
                          
                          <div className="product-footer">
                            <div className="product-price">৳ {prod.price.toLocaleString()}</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 10px' }}
                                onClick={() => handleOpenEditProduct(prod)}
                                title="Edit specs"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                className="btn btn-danger" 
                                style={{ padding: '6px 10px' }}
                                onClick={() => handleDeleteProduct(prod.id)}
                                title="Delete replica"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- CUSTOMERS TAB --- */}
              {activeTab === 'customers' && (
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Shopper Purchase Records</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Client ID</th>
                          <th>Full Name</th>
                          <th>Email Address</th>
                          <th>Purchased Orders</th>
                          <th>Lifetime Sales</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map(cust => (
                          <tr key={cust.id}>
                            <td style={{ fontWeight: 'bold' }}>#{cust.id}</td>
                            <td style={{ fontWeight: '600' }}>{cust.name}</td>
                            <td>{cust.email}</td>
                            <td>{cust.orderCount} Orders</td>
                            <td style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>৳ {cust.totalSpent.toLocaleString()}</td>
                            <td>
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--accent-cyan)', color: '#000' }}
                                onClick={() => handleGrantAdmin(cust.id, cust.name)}
                              >
                                Grant Admin Access
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- TICKETS TAB --- */}
              {activeTab === 'tickets' && (
                <div className="catalog-layout" style={{ marginTop: 0 }}>
                  {/* Active Ticket List Sidebar */}
                  <div className="glass-card" style={{ height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      Inquiries In-box
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tickets.length === 0 ? (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                          No tickets submitted.
                        </div>
                      ) : (
                        tickets.map(t => (
                          <button
                            key={t.id}
                            className={`crm-sidebar-btn ${activeTicket?.id === t.id ? 'active' : ''}`}
                            onClick={() => setActiveTicket(t)}
                            style={{ fontSize: '0.85rem', padding: '10px' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                                #{t.id} {t.subject}
                              </span>
                              <span className={`badge ${t.status === 'Resolved' ? 'badge-success' : t.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                                {t.status}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Reply timeline window */}
                  <div>
                    {activeTicket ? (
                      <div className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Submitted by <strong>{activeTicket.customerName}</strong> ({activeTicket.customerEmail})
                            </span>
                            <h2 style={{ fontSize: '1.25rem', marginTop: '4px' }}>{activeTicket.subject}</h2>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className={`badge ${activeTicket.status === 'Resolved' ? 'badge-success' : activeTicket.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                              {activeTicket.status}
                            </span>
                            {activeTicket.status !== 'Resolved' && (
                              <button className="btn btn-success" onClick={handleResolveTicket} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                <CheckSquare size={13} />
                                <span>Mark Resolved</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Customer message */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            <span>CUSTOMER MESSAGE</span>
                            <span>{new Date(activeTicket.createdAt).toLocaleString()}</span>
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeTicket.message}</p>
                        </div>

                        {/* Stream */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '24px 0' }}>
                          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Discussion Stream</h4>
                          <div className="ticket-replies" style={{ borderTop: 'none', paddingTop: 0 }}>
                            {activeTicket.replies.map((reply, idx) => (
                              <div key={idx} className={`reply-bubble ${reply.sender === 'admin' ? 'reply-customer' : 'reply-admin'}`} style={{ alignSelf: reply.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', gap: '20px' }}>
                                  <strong>{reply.sender === 'admin' ? 'You' : activeTicket.customerName}</strong>
                                  <span>{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p>{reply.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Send admin reply */}
                        {activeTicket.status !== 'Resolved' ? (
                          <form onSubmit={handleAdminTicketReply} style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Type customer reply..." 
                              value={adminReplyText}
                              onChange={(e) => setAdminReplyText(e.target.value)}
                              required
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>
                              <span>Send</span>
                            </button>
                          </form>
                        ) : (
                          <div style={{ textAlign: 'center', color: 'var(--accent-green)', padding: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Replies are locked for resolved tickets.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
                        <MessageSquare size={40} style={{ marginBottom: '12px', color: 'var(--border-color)' }} />
                        <span>Select a support ticket from the sidebar to reply.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* --- CAMPAIGNS TAB --- */}
              {activeTab === 'campaigns' && isAdmin && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  
                  {/* Flash Sale Config */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gift size={20} style={{ color: 'var(--accent-red)' }} />
                      <span>Flash Sale Configuration</span>
                    </h3>
                    <form onSubmit={handleApplyFlashSale} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Discount Percentage</label>
                        <input type="number" className="form-input" value={flashSaleDiscount} onChange={(e) => setFlashSaleDiscount(e.target.value)} min="1" max="99" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Select Products</label>
                        <select 
                          multiple 
                          className="form-input" 
                          style={{ height: '150px' }} 
                          value={flashSaleProducts} 
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setFlashSaleProducts(selected);
                          }}
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - ৳{p.price}</option>
                          ))}
                        </select>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>Hold CTRL/CMD to select multiple</span>
                      </div>
                      <button type="submit" className="btn btn-primary">Apply Flash Sale</button>
                    </form>
                  </div>

                  {/* Promo Code Config */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={20} style={{ color: 'var(--accent-green)' }} />
                      <span>Promo Code Engine</span>
                    </h3>
                    <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Coupon Code (e.g. VIP20)</label>
                        <input type="text" className="form-input" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Discount Percentage</label>
                        <input type="number" className="form-input" value={promoDiscount} onChange={(e) => setPromoDiscount(e.target.value)} min="1" max="100" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Usage Limit (0 for unlimited)</label>
                        <input type="number" className="form-input" value={promoLimit} onChange={(e) => setPromoLimit(e.target.value)} min="0" required />
                      </div>
                      <button type="submit" className="btn btn-secondary">Generate Promo Code</button>
                    </form>

                    {coupons.length > 0 && (
                      <div style={{ marginTop: '24px' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Active Promo Codes</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {coupons.map(c => (
                            <li key={c.id || c.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                              <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{c.code}</span>
                              <span>{c.discountPercentage}% OFF (Used: {c.uses}/{c.maxUses || '∞'})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content glass-card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ borderTop: '4px solid var(--accent-cyan)', maxWidth: '540px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={22} style={{ color: 'var(--accent-cyan)' }} />
                <span>{editingProduct ? 'Edit Model Specifications' : 'Catalog New Replica'}</span>
              </h2>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Replica Model Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Skyline R34 Z-Tune" 
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Nissan" 
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                  >
                    <option value="Supercar">Supercar</option>
                    <option value="JDM">JDM</option>
                    <option value="Classic">Classic</option>
                    <option value="Muscle">Muscle</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Scale Ratio</label>
                  <select 
                    className="form-select"
                    value={prodScale}
                    onChange={(e) => setProdScale(e.target.value)}
                  >
                    <option value="1:18">1:18 Scale</option>
                    <option value="1:24">1:24 Scale</option>
                    <option value="1:43">1:43 Scale</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Retail Price (৳)</label>
                  <input 
                    type="number" 
                    step="1" 
                    className="form-input" 
                    placeholder="e.g. 10800" 
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Warehouse Stock</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 15" 
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Image (Upload Local File OR Paste URL)</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    required
                    style={{ flexGrow: 1 }}
                    placeholder="/images/porsche_gt3.jpg or upload below..."
                  />
                  <label className="btn btn-secondary" style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', flexShrink: 0, marginBottom: 0 }}>
                    <Plus size={14} />
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description Copy</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Detail high-precision properties (e.g. openable parts, details, interior color)..."
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  style={{ resize: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  Save Specifications
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}


