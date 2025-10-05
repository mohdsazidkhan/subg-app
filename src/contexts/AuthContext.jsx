/**
 * @fileoverview Authentication Context for Subg App
 * 
 * This context provides authentication functionality including
 * login, registration, Google auth, and user management.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import API from '../services/api';

/**
 * Authentication context for managing user authentication
 */
const AuthContext = createContext(undefined);

/**
 * Authentication Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Authentication provider component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Logout user and clear stored data
   * @returns {Promise<void>} Promise that resolves when logout is complete
   */
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userInfo');
      setUser(null);
      setIsAuthenticated(false);
      showMessage({
        message: 'Logged out successfully',
        type: 'info',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  /**
   * Check authentication status on app start
   * @returns {Promise<void>} Promise that resolves when auth check is complete
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('userInfo');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Verify token with backend
        try {
          const response = await API.getProfile();
          if (response.success) {
            setUser(response.user);
            await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
          }
        } catch (error) {
          // Token might be expired, logout
          await logout();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * Login user with identifier and password
   * @param {string} identifier - Email or phone number
   * @param {string} password - User password
   * @returns {Promise<boolean>} Promise that resolves to login success status
   */
  const login = async (identifier, password) => {
    try {
      setIsLoading(true);
      
      // Add input validation
      if (!identifier.trim()) {
        showMessage({
          message: 'Email/Phone number is required',
          type: 'danger',
        });
        return false;
      }
      
      if (!password.trim()) {
        showMessage({
          message: 'Password is required',
          type: 'danger',
        });
        return false;
      }
      
      const response = await API.login({ identifier, password });
      
      if (response.success) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        showMessage({
          message: 'Login Successful!',
          type: 'success',
        });
        return true;
      } else {
        showMessage({
          message: response.message || 'Login failed. Please check your credentials.',
          type: 'danger',
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.isNetworkError) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email/phone or password.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found. Please check your credentials.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid request. Please try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showMessage({
        message: errorMessage,
        type: 'danger',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<boolean>} Promise that resolves to registration success status
   */
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await API.register(userData);
      
      if (response.success) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        showMessage({
          message: 'Registration Successful!',
          type: 'success',
        });
        return true;
      }
      return false;
    } catch (error) {
      showMessage({
        message: error.response?.data?.message || 'Registration failed',
        type: 'danger',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with Google
   * @param {Object} googleData - Google authentication data
   * @returns {Promise<boolean>} Promise that resolves to login success status
   */
  const googleLogin = async (googleData) => {
    try {
      setIsLoading(true);
      const response = await API.googleAuth(googleData);
      
      if (response.success) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        showMessage({
          message: 'Google Login Successful!',
          type: 'success',
        });
        return true;
      }
      return false;
    } catch (error) {
      showMessage({
        message: error.response?.data?.message || 'Google login failed',
        type: 'danger',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user data
   * @param {Object} userData - Partial user data to update
   */
  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
    }
  };

  /**
   * Reset user password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Promise that resolves to reset success status
   */
  const resetPassword = async (token, newPassword) => {
    try {
      setIsLoading(true);
      const response = await API.resetPassword({ token, newPassword });
      
      if (response.success) {
        showMessage({
          message: 'Password reset successful!',
          type: 'success',
        });
        return true;
      }
      return false;
    } catch (error) {
      showMessage({
        message: error.response?.data?.message || 'Password reset failed',
        type: 'danger',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data from server
   * @returns {Promise<void>} Promise that resolves when user data is refreshed
   */
  const refreshUser = async () => {
    try {
      const response = await API.getProfile();
      if (response.success) {
        setUser(response.user);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    googleLogin,
    resetPassword,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
