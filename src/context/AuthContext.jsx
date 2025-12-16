import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/api'; // Import authApi instead of api directly

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(token);
        
        // Set default authorization header for all future requests
        import('../services/api').then(({ default: api }) => {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Use authApi.login which handles the API call
      const response = await authApi.login({ username, password });
      console.log('Login API response:', response);
      
      // Handle different response structures from your backend
      const responseData = response.data || {};
      
      // Check if the request was successful
      if (responseData.success === false || responseData.Success === false) {
        return { 
          success: false, 
          message: responseData.message || responseData.Message || 'Neuspješna prijava' 
        };
      }
      
      // Extract token and user data from different possible locations
      let token, userData;
      
      // Try different possible response structures
      if (responseData.data) {
        // Structure 1: { data: { Token, User } }
        token = responseData.data.Token || responseData.data.token;
        userData = responseData.data.User || responseData.data.user;
      } else if (responseData.Data) {
        // Structure 2: { Data: { Token, User } }
        token = responseData.Data.Token || responseData.Data.token;
        userData = responseData.Data.User || responseData.Data.user;
      } else if (responseData.Token) {
        // Structure 3: { Token, User }
        token = responseData.Token || responseData.token;
        userData = responseData.User || responseData.user;
      } else {
        // Try to find token and user in the response
        token = responseData.token || responseData.Token;
        userData = responseData.user || responseData.User || responseData;
      }
      
      console.log('Extracted token:', token);
      console.log('Extracted user:', userData);
      
      if (!token || !userData) {
        console.error('Missing token or user data in response:', responseData);
        return { 
          success: false, 
          message: 'Nedostaju podaci u odgovoru servera' 
        };
      }
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setToken(token);
      
      // Set default authorization header
      import('../services/api').then(({ default: api }) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Login error details:', error);
      console.error('Error response:', error.response);
      
      // Extract error message from different possible locations
      let errorMessage = 'Greška pri prijavi';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage = errorData.message || 
                      errorData.Message || 
                      errorData.data?.message ||
                      errorData.data?.Message ||
                      errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear authorization header
    import('../services/api').then(({ default: api }) => {
      delete api.defaults.headers.common['Authorization'];
    });
    
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const isAuthenticated = () => !!user && !!token;
  const isOwner = () => user?.role === 'Owner' || user?.Role === 'Owner';
  const isAdmin = () => {
    const userRole = user?.role || user?.Role;
    return userRole === 'Admin' || userRole === 'Owner';
  };

  const getUserProperty = (prop) => {
    if (!user) return null;
    // Handle both camelCase and PascalCase property names
    return user[prop] || user[prop.charAt(0).toUpperCase() + prop.slice(1)];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading, 
      login, 
      logout, 
      updateUser,
      isAuthenticated, 
      isOwner, 
      isAdmin,
      getUserProperty
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};