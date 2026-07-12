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
// Dashboard & Department Service
// ─────────────────────────────────────────────────────────────
export const dashboardService = {
  async getCarbonDashboard() {
    const res = await apiClient('/carbon-transactions/dashboard');
    return res.data || {};
  },

  async getGoalStatistics() {
    const res = await apiClient('/sustainability-goals/statistics');
    return res.data || {};
  },
};

export const departmentService = {
  async getAll() {
    const res = await apiClient('/departments?limit=100');
    return res.data || [];
  },
};

export const challengeService = {
  async getAll() {
    const res = await apiClient('/challenges?limit=100');
    return res.data || [];
  },
  async join(challengeId) {
    const res = await apiClient('/challenges/join', {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
    });
    return res.data;
  },
};

export const complianceService = {
  async getAll() {
    const res = await apiClient('/compliances?limit=100');
    return res.data || [];
  },
};

export const auditService = {
  async getAll() {
    const res = await apiClient('/audits?limit=100');
    return res.data || [];
  },
};

export const policyService = {
  async getAll() {
    const res = await apiClient('/policies?limit=100');
    return res.data || [];
  },
};

export const reportService = {
  async getEnvironmental(params) {
    const res = await apiClient(`/reports/environment?${new URLSearchParams(params).toString()}`);
    return res.data;
  },
  async getSocial(params) {
    const res = await apiClient(`/reports/social?${new URLSearchParams(params).toString()}`);
    return res.data;
  },
  async getGovernance(params) {
    const res = await apiClient(`/reports/governance?${new URLSearchParams(params).toString()}`);
    return res.data;
  },
  async getEsgSummary(params) {
    const res = await apiClient(`/reports/esg-summary?${new URLSearchParams(params).toString()}`);
    return res.data;
  },
  async getCustomReport(payload) {
    const res = await apiClient('/reports/custom', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  async exportReport(format, reportType, filters) {
    const response = await fetch(`http://localhost:5000/api/v1/reports/export/${format.toLowerCase()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ reportType, filters }),
    });
    if (!response.ok) throw new Error('Export failed');
    return await response.blob();
  }
};
