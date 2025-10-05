/**
 * @fileoverview NetInfo Mock for Development
 * 
 * This is a temporary mock implementation of NetInfo to handle
 * the native module linking issue during development.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

// Mock implementation of NetInfo for development
const mockNetInfo = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
  details: {
    isConnectionExpensive: false,
  },
  isConnectedFast: true,
};

// Mock NetInfo class
class NetInfoMock {
  static async fetch() {
    // Simulate network check
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockNetInfo,
          // Randomly simulate network issues for testing
          isConnected: Math.random() > 0.1, // 90% chance of being connected
          isInternetReachable: Math.random() > 0.05, // 95% chance of internet access
        });
      }, 100);
    });
  }

  static addEventListener(callback) {
    // Mock listener - simulate network changes
    const interval = setInterval(() => {
      const state = {
        ...mockNetInfo,
        isConnected: Math.random() > 0.1,
        isInternetReachable: Math.random() > 0.05,
      };
      callback(state);
    }, 5000); // Simulate network changes every 5 seconds

    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  static configure(config) {
    // Mock configuration
    console.log('NetInfo configured with:', config);
  }
}

// Export the mock
export default NetInfoMock;
