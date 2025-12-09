import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:3103/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization token if it exists
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Articles API
export const articlesApi = {
  // Public API - only published articles
  getAll: (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/articles${queryString ? '?' + queryString : ''}`);
    }
    return api.get('/articles');
  },
  
  // Admin API - all articles including drafts
  getAllAdmin: (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/articles/admin${queryString ? '?' + queryString : ''}`);
    }
    return api.get('/articles/admin');
  },
  
  getBySlug: (slug) => api.get(`/articles/slug/${slug}`),
  getById: (id) => api.get(`/articles/${id}`),
  create: (data) => api.post('/articles', data),
  update: (id, data) => api.put(`/articles/${id}`, data),
  delete: (id) => api.delete(`/articles/${id}`)
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`)
};

// Images API
export const imagesApi = {
  upload: (articleId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/images/upload/${articleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  setPrimary: (id) => api.put(`/images/${id}/set-primary`),
  delete: (id) => api.delete(`/images/${id}`)
};

// Users API (Owner only)
export const usersApi = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// Login API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile')
};