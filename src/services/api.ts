const API_BASE = 'http://localhost:5000/api';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function setToken(token: string) {
  localStorage.setItem('auth_token', token);
}

function clearToken() {
  localStorage.removeItem('auth_token');
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// ============================================
// AUTH
// ============================================

export const authApi = {
  login: async (loginId: string, password: string) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ loginId, password }),
    });
    setToken(data.token);
    return data.user;
  },

  signup: async (loginId: string, email: string, password: string, role: string) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ loginId, email, password, role }),
    });
    setToken(data.token);
    return data.user;
  },

  forgotPassword: async (email: string) => {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  getProfile: async () => {
    return request('/auth/me');
  },

  logout: () => {
    clearToken();
    window.location.href = '/login';
  },

  isAuthenticated: (): boolean => {
    return !!getToken();
  },

  getStoredToken: getToken,
};

// ============================================
// PRODUCTS
// ============================================

export const productsApi = {
  list: async () => {
    return request('/products');
  },

  create: async (product: { name: string; sku: string; category: string; uom: string; description?: string; active?: boolean }) => {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },
};

// ============================================
// OPERATIONS
// ============================================

export const operationsApi = {
  list: async (type?: string | null) => {
    const query = type ? `?type=${type}` : '';
    return request(`/operations${query}`);
  },

  create: async (operation: {
    reference: string;
    type: string;
    contact?: string;
    scheduledDate?: string;
    sourceLocationId?: string;
    destLocationId?: string;
    items: { productId: string; quantity: number }[];
  }) => {
    return request('/operations', {
      method: 'POST',
      body: JSON.stringify(operation),
    });
  },

  validate: async (id: string) => {
    return request(`/operations/${id}/validate`, {
      method: 'POST',
    });
  },
};

// ============================================
// STOCK
// ============================================

export const stockApi = {
  list: async () => {
    return request('/stock');
  },
};

// ============================================
// MOVE HISTORY
// ============================================

export const moveHistoryApi = {
  list: async () => {
    return request('/move-history');
  },
};

// ============================================
// WAREHOUSES
// ============================================

export const warehousesApi = {
  list: async () => {
    return request('/warehouses');
  },
};

// ============================================
// LOCATIONS
// ============================================

export const locationsApi = {
  list: async () => {
    return request('/locations');
  },
};

// ============================================
// SEED
// ============================================

export const seedApi = {
  seed: async () => {
    return request('/seed', { method: 'POST' });
  },
};
