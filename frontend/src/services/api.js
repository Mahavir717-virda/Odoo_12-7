/**
 * Centralized API Service Layer
 * Connects the frontend Environmental module to the ESG Management Backend REST APIs.
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Generic fetch wrapper with auth header injection, JSON parsing, and error handling.
 * @param {string} endpoint - Relative API path (e.g. '/sustainability-goals')
 * @param {object} options - fetch options
 * @returns {Promise<object>} Parsed JSON response body
 */
async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    const errorMsg = json?.message || `API Error ${response.status}`;
    throw new Error(errorMsg);
  }

  return json;
}

// ─────────────────────────────────────────────────────────────
// Sustainability Goals Service
// ─────────────────────────────────────────────────────────────
export const goalService = {
  async getAll(params = {}) {
    const query = new URLSearchParams({ limit: '100', ...params }).toString();
    const res = await apiClient(`/sustainability-goals?${query}`);
    return res.data || [];
  },

  async create(data) {
    const res = await apiClient('/sustainability-goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async update(id, data) {
    const res = await apiClient(`/sustainability-goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async delete(id) {
    await apiClient(`/sustainability-goals/${id}`, { method: 'DELETE' });
  },
};

// ─────────────────────────────────────────────────────────────
// Emission Factors Service
// ─────────────────────────────────────────────────────────────
export const emissionFactorService = {
  async getAll(params = {}) {
    const query = new URLSearchParams({ limit: '100', ...params }).toString();
    const res = await apiClient(`/emission-factors?${query}`);
    return res.data || [];
  },

  async create(data) {
    const res = await apiClient('/emission-factors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

// ─────────────────────────────────────────────────────────────
// Product ESG Profiles Service
// ─────────────────────────────────────────────────────────────
export const productProfileService = {
  async getAll(params = {}) {
    const query = new URLSearchParams({ limit: '100', ...params }).toString();
    const res = await apiClient(`/product-esg-profiles?${query}`);
    return res.data || [];
  },

  async create(data) {
    const res = await apiClient('/product-esg-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

// ─────────────────────────────────────────────────────────────
// Carbon Transactions Service
// ─────────────────────────────────────────────────────────────
export const carbonTransactionService = {
  async getAll(params = {}) {
    const query = new URLSearchParams({ limit: '100', ...params }).toString();
    const res = await apiClient(`/carbon-transactions?${query}`);
    return res.data || [];
  },

  async create(data) {
    const res = await apiClient('/carbon-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

// ─────────────────────────────────────────────────────────────
// Dropdown Service (lightweight lists for select inputs)
// ─────────────────────────────────────────────────────────────
export const dropdownService = {
  async getDepartments() {
    const res = await apiClient('/dropdowns/departments');
    return res.data || [];
  },

  async getCategories() {
    const res = await apiClient('/dropdowns/categories');
    return res.data || [];
  },

  async getEmissionFactors() {
    const res = await apiClient('/dropdowns/emission-factors');
    return res.data || [];
  },

  async getProducts() {
    const res = await apiClient('/dropdowns/products');
    return res.data || [];
  },
};
