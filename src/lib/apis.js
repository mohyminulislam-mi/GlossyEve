const express = require('express');
const app = express();
const port = 5000;

app.use(express.json());

// -------------------- MOCK DATABASE (IN-MEMORY) --------------------

let products = [
  { id: '1', title: 'AURA Silk Bra', price: 1200, image: 'p1.jpg' },
  { id: '2', title: 'Lace Panty Set', price: 800, image: 'p2.jpg' },
  { id: '3', title: 'Satin Nightwear', price: 2500, image: 'p3.jpg' }
];

let users = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@aura.com', password: 'adminpassword', isGuest: false },
  { id: 'cust-1', name: 'Guest User', email: 'guest@aura.com', password: 'default@123', isGuest: true }
];

let cart = [];
let wishlist = [];
let orders = [];

// -------------------- PRODUCTS SECTION --------------------

// GET all products
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: products });
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// POST create product
app.post('/api/products', (req, res) => {
  const { title, price, image } = req.body;
  if (!title || !price) return res.status(400).json({ success: false, message: 'Title and price are required' });
  
  const newProduct = {
    id: Date.now().toString(),
    title,
    price,
    image: image || 'placeholder.jpg'
  };
  products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  
  products[index] = { ...products[index], ...req.body, id: req.params.id };
  res.json({ success: true, data: products[index] });
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  
  const deleted = products.splice(index, 1);
  res.json({ success: true, message: 'Product deleted', data: deleted[0] });
});

// -------------------- USERS SECTION --------------------

// POST register user
app.post('/api/users/register', (req, res) => {
  const { name, email, password, isGuest } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    name: name || 'New User',
    email,
    password,
    isGuest: isGuest || false
  };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// POST login user
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  res.json({ success: true, data: user });
});

// GET all users
app.get('/api/users', (req, res) => {
  res.json({ success: true, data: users });
});

// GET single user
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// PUT update user
app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });
  
  users[index] = { ...users[index], ...req.body, id: req.params.id };
  res.json({ success: true, data: users[index] });
});

// DELETE user
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });
  
  users.splice(index, 1);
  res.json({ success: true, message: 'User deleted' });
});

// -------------------- CART SECTION --------------------

// GET cart items
app.get('/api/cart', (req, res) => {
  res.json({ success: true, data: cart });
});

// POST add to cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID is required' });

  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += (quantity || 1);
    return res.json({ success: true, message: 'Quantity increased', data: existingItem });
  }

  const newItem = {
    id: Date.now().toString(),
    productId,
    quantity: quantity || 1
  };
  cart.push(newItem);
  res.status(201).json({ success: true, data: newItem });
});

// PUT update cart quantity
app.put('/api/cart/:id', (req, res) => {
  const item = cart.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });
  
  item.quantity = req.body.quantity || item.quantity;
  res.json({ success: true, data: item });
});

// DELETE remove from cart
app.delete('/api/cart/:id', (req, res) => {
  const index = cart.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Item not found in cart' });
  
  cart.splice(index, 1);
  res.json({ success: true, message: 'Item removed from cart' });
});

// DELETE clear cart
app.delete('/api/cart', (req, res) => {
  cart = [];
  res.json({ success: true, message: 'Cart cleared' });
});

// -------------------- WISHLIST SECTION --------------------

// GET wishlist
app.get('/api/wishlist', (req, res) => {
  res.json({ success: true, data: wishlist });
});

// POST add to wishlist
app.post('/api/wishlist', (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

  if (wishlist.find(id => id === productId)) {
    return res.status(400).json({ success: false, message: 'Already in wishlist' });
  }

  wishlist.push(productId);
  res.json({ success: true, message: 'Added to wishlist' });
});

// DELETE remove from wishlist
app.delete('/api/wishlist/:id', (req, res) => {
  const index = wishlist.findIndex(id => id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Not found in wishlist' });
  
  wishlist.splice(index, 1);
  res.json({ success: true, message: 'Removed from wishlist' });
});

// -------------------- ORDERS SECTION --------------------

// GET all orders
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: orders });
});

// GET single order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

// GET user orders
app.get('/api/orders/user/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.user && o.user.id === req.params.userId);
  res.json({ success: true, data: userOrders });
});

// POST create order
app.post('/api/orders', (req, res) => {
  const { user, items, total, paymentMethod } = req.body;
  if (!user || !items || !total) {
    return res.status(400).json({ success: false, message: 'User, items, and total are required' });
  }

  const newOrder = {
    id: 'ORD-' + Date.now(),
    user,
    items,
    total,
    paymentMethod: paymentMethod || 'COD',
    status: 'pending',
    createdAt: new Date()
  };
  orders.push(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

// PUT update order status
app.put('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
  order.status = req.body.status || order.status;
  res.json({ success: true, data: order });
});

// DELETE order
app.delete('/api/orders/:id', (req, res) => {
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });
  
  orders.splice(index, 1);
  res.json({ success: true, message: 'Order deleted' });
});

// -------------------- PAYMENT SECTION (MOCK) --------------------

// POST create payment
app.post('/api/payment/create', (req, res) => {
  const { amount } = req.body;
  res.json({ 
    success: true, 
    message: 'Payment request created',
    paymentUrl: `https://mock-payment.com/pay?amount=${amount}`
  });
});

// POST verify payment
app.post('/api/payment/verify', (req, res) => {
  const { trxId } = req.body;
  if (!trxId) return res.status(400).json({ success: false, message: 'Transaction ID required' });
  
  res.json({ 
    success: true, 
    message: 'Payment verified successfully',
    trxId
  });
});

let reviews = [
  { id: 'rev-1', userId: 'admin-1', productId: '1', rating: 5, comment: 'Amazing quality!', createdAt: new Date() }
];

// -------------------- REVIEWS SECTION --------------------

// GET all reviews or by product/user
app.get('/api/reviews', (req, res) => {
  const { productId, userId } = req.query;
  let filtered = reviews;
  if (productId) filtered = filtered.filter(r => r.productId === productId);
  if (userId) filtered = filtered.filter(r => r.userId === userId);
  res.json({ success: true, data: filtered });
});

// POST create review
app.post('/api/reviews', (req, res) => {
  const { userId, userName, productId, rating, comment } = req.body;
  const newReview = {
    id: 'REV-' + Date.now(),
    userId,
    userName: userName || 'Anonymous',
    productId,
    rating,
    comment,
    createdAt: new Date()
  };
  reviews.push(newReview);
  res.status(201).json({ success: true, data: newReview });
});

// PUT update review
app.put('/api/reviews/:id', (req, res) => {
  const index = reviews.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Review not found' });
  reviews[index] = { ...reviews[index], ...req.body, id: req.params.id };
  res.json({ success: true, data: reviews[index] });
});

// DELETE review
app.delete('/api/reviews/:id', (req, res) => {
  const index = reviews.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Review not found' });
  reviews.splice(index, 1);
  res.json({ success: true, message: 'Review deleted' });
});

// -------------------- SERVER START --------------------

app.listen(port, () => {
  console.log(`AURA Backend running at http://localhost:${port}`);
});
