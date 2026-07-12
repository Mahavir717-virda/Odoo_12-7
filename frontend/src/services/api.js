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

// ─────────────────────────────────────────────────────────────
// Dashboard Service
// ─────────────────────────────────────────────────────────────
export const dashboardService = {
  async getSummary() {
    const res = await apiClient('/dashboard/summary');
    return res.data || {};
  },
  async getCompliance() {
    const res = await apiClient('/dashboard/compliance');
    return res.data || {};
  },
  async getChallenges() {
    const res = await apiClient('/dashboard/challenges');
    return res.data || {};
  },
  async getBadges() {
    const res = await apiClient('/dashboard/badges');
    return res.data || {};
  },
  async getRewards() {
    const res = await apiClient('/dashboard/rewards');
    return res.data || {};
  },
  async getPolicies() {
    const res = await apiClient('/dashboard/policies');
    return res.data || {};
  },
  async getAudits() {
    const res = await apiClient('/dashboard/audits');
    return res.data || {};
  },
  async getEmployees() {
    const res = await apiClient('/dashboard/employees');
    return res.data || {};
  },
  async getCharts() {
    const res = await apiClient('/dashboard/charts');
    return res.data || {};
  },
};

// ─────────────────────────────────────────────────────────────
// Reports Service
// ─────────────────────────────────────────────────────────────
export const reportService = {
  async getEsgSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient(`/reports/esg-summary?${query}`);
    return res.data || {};
  },
  async getEnvironmental(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient(`/reports/environment?${query}`);
    return res.data || {};
  },
};

// ─────────────────────────────────────────────────────────────
// Challenge Service
// ─────────────────────────────────────────────────────────────
export const challengeService = {
  async getAll() {
    const res = await apiClient('/challenges?limit=100');
    return res.data?.results || res.data || [];
  },
  async join(challengeId) {
    const res = await apiClient('/challenges/join', {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
    });
    return res.data;
  },
  async getParticipants() {
    const res = await apiClient('/challenges/participants');
    return res.data || [];
  },
};

// ─────────────────────────────────────────────────────────────
// Department Service
// ─────────────────────────────────────────────────────────────
export const departmentService = {
  async getAll() {
    const res = await apiClient('/departments');
    return res.data || [];
  },
};
