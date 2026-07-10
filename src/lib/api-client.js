const BASE_URL = 'http://localhost:5000/api';

const fetcher = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Auth
  login: (credentials) => fetcher('/users/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => fetcher('/users/register', { method: 'POST', body: JSON.stringify(userData) }),
  getUser: (id) => fetcher(`/users/${id}`),

  // Products
  getProducts: () => fetcher('/products'),
  getProduct: (id) => fetcher(`/products/${id}`),

  // Cart
  getCart: () => fetcher('/cart'),
  addToCart: (item) => fetcher('/cart', { method: 'POST', body: JSON.stringify(item) }),
  updateCartItem: (id, quantity) => fetcher(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (id) => fetcher(`/cart/${id}`, { method: 'DELETE' }),
  clearCart: () => fetcher('/cart', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => fetcher('/wishlist'),
  addToWishlist: (productId) => fetcher('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId) => fetcher(`/wishlist/${productId}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => fetcher('/orders'),
  getUserOrders: (userId) => fetcher(`/orders/user/${userId}`),
  createOrder: (orderData) => fetcher('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  
  // Reviews
  getReviews: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetcher(`/reviews?${query}`);
  },
  createReview: (reviewData) => fetcher('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  updateReview: (id, reviewData) => fetcher(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(reviewData) }),
  deleteReview: (id) => fetcher(`/reviews/${id}`, { method: 'DELETE' }),

  // Payment
  createPayment: (amount) => fetcher('/payment/create', { method: 'POST', body: JSON.stringify({ amount }) }),
  verifyPayment: (trxId) => fetcher('/payment/verify', { method: 'POST', body: JSON.stringify({ trxId }) }),
};
