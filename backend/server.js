import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'velocraft-super-secret-key-992';

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming API calls to assist with manual diagnostics
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware: Authenticate JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Middleware: Verify Admin Access
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Administrator clearance required' });
  }
}

// Ensure demo accounts always exist with the correct credentials
function ensureDemoAccounts() {
  const adminHash = '$2a$10$4RY9K7h3bk5PdJrmR70e7eTt4an0H19XxY/GNVbRy4XRg.EcrDJfO';
  const shopperHash = '$2a$10$hZAZzm7EnvYScAA/jg01WOeEMjoGgps09Ur5bqyIG6714FY3Ub2/e';

  const users = db.get('users');

  const admin = users.find(u => u.email.toLowerCase() === 'fahm-codes@velocraft.com');
  if (admin) {
    admin.password = adminHash;
    admin.role = 'admin';
    admin.name = 'Velocraft Admin';
  }

  const shopper = users.find(u => u.email.toLowerCase() === 'fahmid@velocraft.com');
  if (shopper) {
    shopper.password = shopperHash;
    shopper.role = 'shopper';
    shopper.name = 'Fahmid Hasan Sunny';
  }

  db.set('users', users);
  console.log('Demo accounts synchronized.');
}

ensureDemoAccounts();
// --- AUTHENTICATION ENDPOINTS ---

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const users = db.get('users');
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer' // default role is customer
    };

    const createdUser = db.insert('users', newUser);
    
    // Create token
    const token = jwt.sign(
      { id: createdUser.id, name: createdUser.name, email: createdUser.email, role: createdUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: createdUser.id, name: createdUser.name, email: createdUser.email, role: createdUser.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = db.get('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// --- PRODUCT CATALOG ENDPOINTS ---

// Fetch all products (supports search, category and scale filtering)
app.get('/api/products', (req, res) => {
  let products = db.get('products');
  const { search, category, scale } = req.query;

  if (search) {
    const query = search.toString().toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.brand.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
  }

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toString().toLowerCase());
  }

  if (scale && scale !== 'All') {
    products = products.filter(p => p.scale === scale);
  }

  res.json(products);
});

// Fetch single product details
app.get('/api/products/:id', (req, res) => {
  const product = db.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// --- ORDERS & CHECKOUT ENDPOINTS ---

// Checkout/Submit Order
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0 || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Missing order details' });
    }

    // Verify stock levels and compute pricing
    let totalAmount = 0;
    const verifiedItems = [];

    const products = db.get('products');

    for (const cartItem of items) {
      const prod = products.find(p => p.id === cartItem.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product ${cartItem.name} not found` });
      }

      if (prod.stock < cartItem.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${prod.name}. Available: ${prod.stock}` });
      }

      // Decrement stock levels
      prod.stock -= cartItem.quantity;
      const finalPrice = prod.discountPrice ? prod.discountPrice : prod.price;
      totalAmount += finalPrice * cartItem.quantity;

      verifiedItems.push({
        productId: prod.id,
        name: prod.name,
        brand: prod.brand,
        price: prod.price,
        quantity: cartItem.quantity,
        imageUrl: prod.imageUrl
      });
    }

    // Save updated stock levels
    db.set('products', products);

    // Calculate delivery charges for COD
    let shippingCost = 0;
    if (paymentMethod === 'Cash on Delivery') {
      const isInsideDhaka = shippingAddress.state && shippingAddress.state.toLowerCase() === 'dhaka';
      shippingCost = isInsideDhaka ? 130 : 200;
    }
    totalAmount += shippingCost;

    // Save order
    const newOrder = {
      userId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: verifiedItems,
      totalAmount: Math.round(totalAmount * 100) / 100, // round to 2 decimal places
      shippingAddress,
      paymentMethod,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const createdOrder = db.insert('orders', newOrder);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Internal server error processing checkout' });
  }
});

// View Shopper's Own Order History
app.get('/api/orders/my-orders', authenticateToken, (req, res) => {
  const orders = db.get('orders');
  const userOrders = orders.filter(o => o.userId === req.user.id);
  // Sort by date descending
  userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userOrders);
});


// Cancel a shopper's own pending order
app.put('/api/orders/:id/cancel', authenticateToken, (req, res) => {
  const order = db.findById('orders', req.params.id);

  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.status !== 'Pending') {
    return res.status(400).json({
      error: 'Only pending orders can be cancelled'
    });
  }

  const products = db.get('products');

  for (const item of order.items) {
    const product = products.find(p => p.id === item.productId);
    if (product) product.stock += item.quantity;
  }

  db.set('products', products);

  const updatedOrder = db.update('orders', order.id, {
    status: 'Cancelled'
  });

  res.json(updatedOrder);
});

// Confirm that a shopper received a delivered order
app.put('/api/orders/:id/received', authenticateToken, (req, res) => {
  const order = db.findById('orders', req.params.id);

  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.status !== 'Delivered') {
    return res.status(400).json({
      error: 'Only delivered orders can be confirmed as received'
    });
  }

  const updatedOrder = db.update('orders', order.id, {
    receivedAt: new Date().toISOString()
  });

  res.json(updatedOrder);
});

// Prepare a previous order for reorder
app.post('/api/orders/:id/reorder', authenticateToken, (req, res) => {
  const order = db.findById('orders', req.params.id);

  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const products = db.get('products');
  const unavailable = [];
  const items = [];

  for (const item of order.items) {
    const product = products.find(p => p.id === item.productId);

    if (!product || product.stock < item.quantity) {
      unavailable.push(product?.name || item.name);
      continue;
    }

    items.push({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: item.quantity
    });
  }

  if (items.length === 0) {
    return res.status(400).json({
      error: 'None of the items from this order are currently available'
    });
  }

  res.json({
    items,
    unavailable,
    message: unavailable.length
      ? 'Some items are currently unavailable'
      : 'Order ready to reorder'
  });
});
// --- CRM SYSTEM ENDPOINTS (ADMIN READ/WRITE) ---

// CRM: Customer Profiles
app.get('/api/crm/customers', authenticateToken, requireAdmin, (req, res) => {
  const users = db.get('users').filter(u => u.role !== 'admin');
  const orders = db.get('orders');

  const customerProfiles = users.map(user => {
    const userOrders = orders.filter(o => o.userId === user.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      orderCount: userOrders.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      orders: userOrders.map(o => ({
        id: o.id,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt
      }))
    };
  });

  res.json(customerProfiles);
});

// CRM: Promote Customer to Admin
app.put('/api/crm/customers/:id/role', authenticateToken, requireAdmin, (req, res) => {
  const { role } = req.body;
  if (role !== 'admin' && role !== 'customer' && role !== 'shopper') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const updatedUser = db.update('users', req.params.id, { role });
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ message: 'Role updated successfully', user: updatedUser });
});

// CRM: Order Management (All orders)
app.get('/api/crm/orders', authenticateToken, requireAdmin, (req, res) => {
  const orders = db.get('orders');
  // Sort by date descending
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sortedOrders);
});

// CRM: Update Order Status
app.put('/api/crm/orders/:id', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  const updatedOrder = db.update('orders', req.params.id, { status });
  if (!updatedOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(updatedOrder);
});

// CRM: Inventory Control - Add Product
app.post('/api/crm/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, brand, category, scale, price, stock, imageUrl, description } = req.body;

  if (!name || !brand || !category || !scale || price === undefined || stock === undefined || !imageUrl || !description) {
    return res.status(400).json({ error: 'All product fields are required' });
  }

  const numPrice = parseFloat(price);
  const numStock = parseInt(stock);

  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }
  if (isNaN(numStock) || numStock < 0) {
    return res.status(400).json({ error: 'Stock must be a non-negative integer' });
  }

  const newProduct = {
    name,
    brand,
    category,
    scale,
    price: numPrice,
    stock: numStock,
    imageUrl,
    description
  };

  const createdProduct = db.insert('products', newProduct);
  res.status(201).json(createdProduct);
});

// CRM: Inventory Control - Edit Product
app.put('/api/crm/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { name, brand, category, scale, price, stock, imageUrl, description } = req.body;
  
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (brand !== undefined) updates.brand = brand;
  if (category !== undefined) updates.category = category;
  if (scale !== undefined) updates.scale = scale;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (description !== undefined) updates.description = description;

  if (price !== undefined) {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    updates.price = numPrice;
  }

  if (stock !== undefined) {
    const numStock = parseInt(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative integer' });
    }
    updates.stock = numStock;
  }

  const updatedProduct = db.update('products', req.params.id, updates);
  if (!updatedProduct) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(updatedProduct);
});

// CRM: Inventory Control - Delete Product
app.delete('/api/crm/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const deleted = db.delete('products', req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ message: 'Product successfully deleted from catalog' });
});

// CRM: Analytics Dashboard
app.get('/api/crm/analytics', authenticateToken, requireAdmin, (req, res) => {
  const orders = db.get('orders');
  const products = db.get('products');
  const users = db.get('users').filter(u => u.role !== 'admin');

  // Key metrics
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeCustomers = users.length;
  const totalOrders = orders.length;

  // Low stock products (stock <= 5)
  const lowStockProducts = products.filter(p => p.stock <= 5).map(p => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    imageUrl: p.imageUrl
  }));

  // Sales by category
  const salesByCategory = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      // Find item category from catalog
      const prod = products.find(p => p.id === item.productId);
      const cat = prod ? prod.category : 'Other';
      salesByCategory[cat] = (salesByCategory[cat] || 0) + (item.price * item.quantity);
    });
  });

  const categoryBreakdown = Object.keys(salesByCategory).map(name => ({
    name,
    value: Math.round(salesByCategory[name] * 100) / 100
  }));

  res.json({
    metrics: {
      totalSales: Math.round(totalSales * 100) / 100,
      activeCustomers,
      totalOrders,
      lowStockAlertCount: lowStockProducts.length
    },
    lowStockProducts,
    categoryBreakdown
  });
});

// --- SUPPORT TICKETS SYSTEM ENDPOINTS ---

// Shopper: Create Ticket
app.post('/api/tickets', authenticateToken, (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const newTicket = {
    userId: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    subject,
    message,
    status: 'Open',
    createdAt: new Date().toISOString(),
    replies: []
  };

  const createdTicket = db.insert('tickets', newTicket);
  res.status(201).json(createdTicket);
});

// Shopper: View Personal Tickets
app.get('/api/tickets/my-tickets', authenticateToken, (req, res) => {
  const tickets = db.get('tickets');
  const userTickets = tickets.filter(t => t.userId === req.user.id);
  userTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userTickets);
});

// Admin: View All Tickets
app.get('/api/crm/tickets', authenticateToken, requireAdmin, (req, res) => {
  const tickets = db.get('tickets');
  tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(tickets);
});

// Admin/Shopper: Reply to Support Ticket
app.post('/api/tickets/:id/reply', authenticateToken, (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Reply message is required' });
  }

  const ticket = db.findById('tickets', req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  // Ensure security: customers can only reply to their own tickets
  if (req.user.role !== 'admin' && ticket.userId !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied to access ticket' });
  }

  const newReply = {
    sender: req.user.role === 'admin' ? 'admin' : 'customer',
    message,
    createdAt: new Date().toISOString()
  };

  ticket.replies.push(newReply);
  
  // Auto-adjust status:
  // If admin replies, status moves to "In Progress".
  // If customer replies and status was Resolved/In Progress, keep active.
  const newStatus = req.user.role === 'admin' ? 'In Progress' : ticket.status;

  const updatedTicket = db.update('tickets', req.params.id, {
    replies: ticket.replies,
    status: newStatus
  });

  res.json(updatedTicket);
});

// Admin: Resolve Support Ticket
app.put('/api/crm/tickets/:id/resolve', authenticateToken, requireAdmin, (req, res) => {
  const updatedTicket = db.update('tickets', req.params.id, { status: 'Resolved' });
  if (!updatedTicket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  res.json(updatedTicket);
});

// --- PRODUCT IMAGE UPLOAD (CRM ADMIN ONLY) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'frontend', 'public', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.post('/api/products/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// --- REVIEWS & RATINGS ENDPOINTS ---

// Get Product Reviews
app.get('/api/products/:id/reviews', (req, res) => {
  const reviews = db.get('reviews');
  const filtered = reviews.filter(r => r.productId === req.params.id);
  // Sort by date descending
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(filtered);
});

// Add Product Review
app.post('/api/products/:id/reviews', authenticateToken, (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }
  
  const product = db.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const newReview = {
    productId: req.params.id,
    userId: req.user.id,
    userName: req.user.name,
    rating: parseInt(rating),
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  const savedReview = db.insert('reviews', newReview);
  res.status(201).json(savedReview);
});

// --- CAMPAIGNS & COUPONS ENDPOINTS ---

app.get('/api/crm/coupons', authenticateToken, requireAdmin, (req, res) => {
  const coupons = db.get('coupons') || [];
  res.json(coupons);
});

app.post('/api/crm/coupons', authenticateToken, requireAdmin, (req, res) => {
  const { code, discountPercentage, maxUses } = req.body;
  if (!code || !discountPercentage) {
    return res.status(400).json({ error: 'Code and discount percentage are required' });
  }
  const newCoupon = {
    code: code.toUpperCase(),
    discountPercentage: parseInt(discountPercentage),
    maxUses: parseInt(maxUses) || 0,
    uses: 0,
    createdAt: new Date().toISOString()
  };
  const saved = db.insert('coupons', newCoupon);
  res.status(201).json(saved);
});

app.delete('/api/crm/coupons/:id', authenticateToken, requireAdmin, (req, res) => {
  db.remove('coupons', req.params.id);
  res.json({ success: true });
});

app.post('/api/coupons/validate', authenticateToken, (req, res) => {
  const { code } = req.body;
  const coupons = db.get('coupons') || [];
  const coupon = coupons.find(c => c.code === code.toUpperCase());
  if (!coupon) return res.status(404).json({ error: 'Invalid promo code' });
  if (coupon.maxUses > 0 && coupon.uses >= coupon.maxUses) {
    return res.status(400).json({ error: 'Promo code usage limit reached' });
  }
  res.json(coupon);
});

app.post('/api/crm/campaigns/flash-sale', authenticateToken, requireAdmin, (req, res) => {
  const { productIds, discountPercentage } = req.body;
  if (!productIds || !Array.isArray(productIds)) {
    return res.status(400).json({ error: 'Invalid product list' });
  }
  const products = db.get('products');
  
  // Clear all previous discounts
  products.forEach(p => {
    delete p.discountPrice;
  });
  
  // Apply new discounts
  products.forEach(p => {
    if (productIds.includes(p.id)) {
      p.discountPrice = p.price - (p.price * (discountPercentage / 100));
    }
  });
  
  db.set('products', products);
  res.json({ success: true });
});


// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Velocraft Server running on http://localhost:${PORT}`);
  console.log(`==================================================`);
});



