/**
 * @fileoverview Network Context for Subg App
 * 
 * This context provides network connectivity management functionality including
 * real-time network status monitoring and offline/online state handling.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { showMessage } from 'react-native-flash-message';

// Try to import NetInfo, fallback to mock if not available
let NetInfo;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (error) {
  console.warn('NetInfo not available, using mock implementation:', error.message);
  NetInfo = require('../services/NetInfoMock').default;
}

/**
 * Network context for managing network connectivity
 */
const NetworkContext = createContext(undefined);

/**
 * Network Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Network provider component
 */
export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [isNetworkLoading, setIsNetworkLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!isMounted) return;

      const wasConnected = isConnected;
      const wasInternetReachable = isInternetReachable;

      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
      setIsNetworkLoading(false);

      // Show connection status messages
      if (wasConnected !== state.isConnected || wasInternetReachable !== state.isInternetReachable) {
        if (state.isConnected && state.isInternetReachable) {
          showMessage({
            message: 'Connected',
            description: 'You are back online!',
            type: 'success',
            duration: 3000,
            icon: 'success',
          });
        } else if (!state.isConnected) {
          showMessage({
            message: 'No Connection',
            description: 'Please check your internet connection.',
            type: 'danger',
            duration: 4000,
            icon: 'danger',
          });
        } else if (state.isConnected && !state.isInternetReachable) {
          showMessage({
            message: 'Limited Connection',
            description: 'Connected but internet is not accessible.',
            type: 'warning',
            duration: 4000,
            icon: 'warning',
          });
        }
      }
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      if (!isMounted) return;
      
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
      setIsNetworkLoading(false);

      // Show initial connection status if offline
      if (!state.isConnected) {
        showMessage({
          message: 'No Internet Connection',
          description: 'Please check your internet connection and try again.',
          type: 'danger',
          duration: 5000,
          icon: 'danger',
        });
      } else if (state.isConnected && !state.isInternetReachable) {
        showMessage({
          message: 'Limited Internet Access',
          description: 'Connected but internet is not accessible.',
          type: 'warning',
          duration: 5000,
          icon: 'warning',
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  /**
   * Check if network is available for API calls
   * @returns {boolean} True if network is available
   */
  const isNetworkAvailable = () => {
    return isConnected && isInternetReachable;
  };

  /**
   * Get network status info
   * @returns {Object} Network status information
   */
  const getNetworkInfo = () => {
    return {
      isConnected,
      isInternetReachable,
      connectionType,
      isNetworkAvailable: isNetworkAvailable(),
    };
  };

  /**
   * Refresh network status
   * @returns {Promise<Object>} Current network state
   */
  const refreshNetworkStatus = async () => {
    setIsNetworkLoading(true);
    try {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
      return state;
    } finally {
      setIsNetworkLoading(false);
    }
  };

  const value = {
    isConnected,
    isInternetReachable,
    connectionType,
    isNetworkLoading,
    isNetworkAvailable,
    getNetworkInfo,
    refreshNetworkStatus,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

/**
 * Hook to use network context
 * @returns {Object} Network context value
 * @throws {Error} If used outside of NetworkProvider
 */
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
