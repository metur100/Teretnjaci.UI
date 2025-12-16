import axios from 'axios';

const api = axios.create({
  //baseURL: 'https://api.teretnjaci.ba/api',
  //baseURL: 'https://teretnjaci.runasp.net/api',
  //baseURL: 'https://localhost:3103/api',
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to normalize all responses
const normalizeResponse = (response) => {
  try {
    const { data } = response;
    
    // If response already has success/error structure, keep it
    if (data !== null && typeof data === 'object') {
      // Ensure Data property exists (with capital D or lowercase d)
      if (data.Data !== undefined || data.data !== undefined) {
        // Normalize to always have 'data' (lowercase)
        const normalizedData = {
          ...data,
          // Use Data if it exists, otherwise use data, otherwise empty array
          data: data.Data !== undefined ? data.Data : 
                data.data !== undefined ? data.data : []
        };
        
        // Ensure data is an array if it should be
        if (Array.isArray(normalizedData.data)) {
          return {
            ...response,
            data: normalizedData
          };
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error normalizing response:', error);
    return response;
  }
};

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  response => normalizeResponse(response),
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    
    // Normalize error response too
    if (error.response) {
      error.response = normalizeResponse(error.response);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Safely extract data from API response
 * Always returns an array for list endpoints, object for single item
 */
const extractData = (response, isList = true) => {
  try {
    const { data } = response;
    
    if (!data) {
      return isList ? [] : null;
    }
    
    // Handle backend response structure (capital D or lowercase d)
    const responseData = data.Data !== undefined ? data.Data : 
                        data.data !== undefined ? data.data : data;
    
    // For list endpoints, ensure we return an array
    if (isList) {
      return Array.isArray(responseData) ? responseData : [];
    }
    
    // For single item endpoints, return the object
    return responseData || null;
    
  } catch (error) {
    console.error('Error extracting data:', error);
    return isList ? [] : null;
  }
};

/**
 * Wrapper for API calls with standardized error handling
 */
const apiCall = async (method, url, data = null, config = {}) => {
  try {
    const response = await (() => {
      switch (method.toLowerCase()) {
        case 'get':
          return api.get(url, config);
        case 'post':
          return api.post(url, data, config);
        case 'put':
          return api.put(url, data, config);
        case 'delete':
          return api.delete(url, config);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    })();
    
    return response;
  } catch (error) {
    console.error(`API ${method} ${url} error:`, error);
    
    // Create a standardized error response
    const errorResponse = {
      success: false,
      message: error.response?.data?.Message || 
               error.response?.data?.message || 
               'Došlo je do greške pri komunikaciji sa serverom',
      data: null,
      error: error.message
    };
    
    // Throw a formatted error that components can handle
    throw {
      ...error,
      response: {
        ...error.response,
        data: errorResponse
      }
    };
  }
};

export default api;

export const articlesApi = {
  getAll: async (params) => {
    try {
      const queryString = params ? new URLSearchParams(params).toString() : '';
      const response = await apiCall('get', `/articles${queryString ? '?' + queryString : ''}`);
      
      return {
        ...response,
        // Extract data and ensure it's an array
        data: extractData(response, true),
        // Preserve pagination if exists
        pagination: response.data?.pagination || response.data?.Pagination || null
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Greška pri dohvaćanju članaka'
      };
    }
  },
  
  getAllAdmin: async (params) => {
    try {
      const queryString = params ? new URLSearchParams(params).toString() : '';
      const response = await apiCall('get', `/articles/admin${queryString ? '?' + queryString : ''}`);
      
      return {
        ...response,
        data: extractData(response, true),
        pagination: response.data?.pagination || response.data?.Pagination || null
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Greška pri dohvaćanju članaka'
      };
    }
  },
  
  getBySlug: async (slug) => {
    try {
      const response = await apiCall('get', `/articles/slug/${slug}`);
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri dohvaćanju članka'
      };
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiCall('get', `/articles/${id}`);
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri dohvaćanju članka'
      };
    }
  },
  
  create: async (data) => {
    try {
      const response = await apiCall('post', '/articles', data);
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri kreiranju članka'
      };
    }
  },
  
  update: async (id, data) => {
    try {
      const response = await apiCall('put', `/articles/${id}`, data);
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri ažuriranju članka'
      };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiCall('delete', `/articles/${id}`);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Greška pri brisanju članka'
      };
    }
  }
};

export const categoriesApi = {
  getAll: async () => {
    try {
      const response = await apiCall('get', '/categories');
      return {
        ...response,
        // Force categories to always be an array
        data: extractData(response, true)
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Greška pri dohvaćanju kategorija'
      };
    }
  },
  
  getBySlug: async (slug) => {
    try {
      const response = await apiCall('get', `/categories/${slug}`);
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri dohvaćanju kategorije'
      };
    }
  }
};

export const imagesApi = {
  upload: async (articleId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiCall('post', `/images/upload/${articleId}`, formData, {
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
      
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri učitavanju slike'
      };
    }
  },
  
  uploadInline: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiCall('post', '/images/upload-inline', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri učitavanju slike'
      };
    }
  },
  
  setPrimary: async (imageId) => {
    try {
      const response = await apiCall('put', `/images/${imageId}/set-primary`);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Greška pri postavljanju glavne slike'
      };
    }
  },
  
  delete: async (imageId) => {
    try {
      const response = await apiCall('delete', `/images/${imageId}`);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Greška pri brisanju slike'
      };
    }
  }
};

export const usersApi = {
  getAll: async () => {
    try {
      const response = await apiCall('get', '/users');
      return {
        ...response,
        data: extractData(response, true)
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Greška pri dohvaćanju korisnika'
      };
    }
  },
  
  create: async (data) => {
    try {
      const response = await apiCall('post', '/users', data);
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri kreiranju korisnika'
      };
    }
  },
  
  update: async (id, data) => {
    try {
      const response = await apiCall('put', `/users/${id}`, data);
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri ažuriranju korisnika'
      };
    }
  },
  
  delete: async (id) => {
    try {
      const response = await apiCall('delete', `/users/${id}`);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Greška pri brisanju korisnika'
      };
    }
  }
};

export const authApi = {
  login: async (credentials) => {
    try {
      const response = await apiCall('post', '/auth/login', credentials);
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri prijavi'
      };
    }
  },
  
  getProfile: async () => {
    try {
      const response = await apiCall('get', '/auth/profile');
      return {
        ...response,
        data: extractData(response, false)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Greška pri dohvaćanju profila'
      };
    }
  }
};