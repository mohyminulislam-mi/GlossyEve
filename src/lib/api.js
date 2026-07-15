const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://aonelube-server.vercel.app";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data.data ?? data;
}

async function requestFormData(endpoint, method, formData) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data.data ?? data;
}

export async function apiGet(endpoint) {
  return request(endpoint, { method: "GET" });
}

export async function apiPost(endpoint, data) {
  return request(endpoint, { method: "POST", body: data });
}

export async function getCategories() {
  return apiGet("/api/categories");
}

export async function getBrands() {
  return apiGet("/api/products/brands");
}

export async function createCategory(formData) {
  return requestFormData("/api/categories", "POST", formData);
}

export async function updateCategory(id, formData) {
  return requestFormData(`/api/categories/${id}`, "PUT", formData);
}

export async function deleteCategory(id) {
  return request(`/api/categories/${id}`, { method: "DELETE" });
}

export async function createProduct(formData) {
  return requestFormData("/api/products", "POST", formData);
}

export async function updateProduct(id, formData) {
  return requestFormData(`/api/products/${id}`, "PUT", formData);
}

export async function deleteProduct(id) {
  return request(`/api/products/${id}`, { method: "DELETE" });
}

export async function getProductsByCategory(slug, options = {}) {
  const query = new URLSearchParams(options).toString();
  return apiGet(`/api/products/category/${slug}${query ? `?${query}` : ""}`);
}

export async function getProducts(options = {}) {
  const query = new URLSearchParams(options).toString();
  return apiGet(`/api/products${query ? `?${query}` : ""}`);
}

export async function getProductDetail(id) {
  return apiGet(`/api/products/${id}`);
}

export async function searchProducts(query) {
  const params = new URLSearchParams({ search: query, limit: 10 }).toString();
  return request(`/api/products?${params}`, { method: "GET" });
}

// ==================== ORDERS ====================
export async function getAllOrders(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return request(`/api/orders${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function getOrderDetail(id) {
  return request(`/api/orders/${id}`, { method: "GET" });
}

export async function updateOrderStatus(id, status) {
  return request(`/api/orders/${id}/status`, {
    method: "PUT",
    body: { orderStatus: status },
  });
}

export async function getMyOrders() {
  return request("/api/orders/my-orders", { method: "GET" });
}

export async function createOrder(data) {
  return apiPost("/api/orders", data);
}

export async function createManagerOrder(orderData) {
  const { customerName, customerPhone, customerAddress, items } = orderData;
  return request("/api/orders/manager-create", {
    method: "POST",
    body: { customerName, customerPhone, customerAddress, items },
  });
}

// ==================== USERS ====================
export async function getAllUsers(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const query = params.toString();
  return request(`/api/admin/users${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export async function getUserDetail(id) {
  return request(`/api/admin/users/${id}`, { method: "GET" });
}

export async function updateUserRole(id, role) {
  return request(`/api/admin/users/${id}/role`, {
    method: "PUT",
    body: { role },
  });
}

export async function approveManager(id) {
  return request(`/api/admin/users/${id}/approve`, { method: "PUT" });
}

export async function unapproveManager(id) {
  return request(`/api/admin/users/${id}/unapprove`, { method: "PUT" });
}

// ==================== DASHBOARD ====================
export async function getDashboardStats() {
  return request("/api/admin/stats", { method: "GET" });
}

export async function getDashboardCharts() {
  return request("/api/admin/charts", { method: "GET" });
}

// ==================== AUTH PROFILE ====================
export async function updateProfile(data) {
  return request("/api/auth/profile", {
    method: "PUT",
    body: data,
  });
}
