// api.js
import axios from 'axios';

const api = axios.create({
  //baseURL: 'https://localhost:3103/api',
  baseURL: 'https://teretnjaci.runasp.net/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export const articlesApi = {
  getAll: (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return api.get(`/articles${queryString ? '?' + queryString : ''}`);
    }
    return api.get('/articles');
  },
  
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

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`)
};

export const imagesApi = {
  upload: (articleId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(`/images/upload/${articleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
  },
  
  uploadInline: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/images/upload-inline', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
  },
  
  setPrimary: (imageId) => {
    return api.put(`/images/${imageId}/set-primary`);
  },
  
  delete: (imageId) => {
    return api.delete(`/images/${imageId}`);
  }
};

export const usersApi = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile')
};