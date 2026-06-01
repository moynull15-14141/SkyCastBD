const API_BASE_URL = window.SKYCASTBD_API_BASE_URL || 'https://skycastbd.onrender.com/api/v1';
const CMS_TOKEN_KEY = 'skycastbd-admin-token';

const getAdminToken = () => localStorage.getItem(CMS_TOKEN_KEY);
const setAdminToken = (token) => localStorage.setItem(CMS_TOKEN_KEY, token);
const clearAdminToken = () => localStorage.removeItem(CMS_TOKEN_KEY);

const buildHeaders = (auth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAdminToken();

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(options.auth),
      ...(options.headers || {})
    }
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message || 'Request failed. Please try again.';
    throw new Error(message);
  }

  return payload.data;
};

window.SkyCastBDCms = {
  API_BASE_URL,
  CMS_TOKEN_KEY,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  login: (credentials) => requestJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  listBlogs: ({ includeDrafts = false, status = '', limit = 30, auth = false } = {}) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (includeDrafts) params.set('includeDrafts', 'true');
    if (status) params.set('status', status);
    return requestJson(`/blogs?${params}`, { auth });
  },
  getBlog: (slug, auth = false) => requestJson(`/blogs/${encodeURIComponent(slug)}`, { auth }),
  createBlog: (blog) => requestJson('/blogs', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(blog)
  }),
  updateBlog: (slug, blog) => requestJson(`/blogs/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(blog)
  }),
  deleteBlog: (slug) => requestJson(`/blogs/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    auth: true
  }),
  submitContactMessage: (message) => requestJson('/contact', {
    method: 'POST',
    body: JSON.stringify(message)
  }),
  listContactMessages: () => requestJson('/admin/messages', {
    auth: true
  }),
  listProducts: ({ limit = 100 } = {}) => requestJson(`/products?${new URLSearchParams({ limit: String(limit) })}`),
  createOrder: (order) => requestJson('/orders', {
    method: 'POST',
    body: JSON.stringify(order)
  }),
  createProduct: (product) => requestJson('/admin/products', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(product)
  }),
  updateProduct: (id, product) => requestJson(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(product)
  }),
  deleteProduct: (id) => requestJson(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true
  }),
  listOrders: ({ status = 'all', limit = 200 } = {}) => {
    const params = new URLSearchParams({ status, limit: String(limit) });
    return requestJson(`/admin/orders?${params}`, { auth: true });
  }
};
