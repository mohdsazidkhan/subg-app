/**
 * @fileoverview Offline Fallback Component
 * 
 * This component displays when the app is offline and provides
 * options to retry connection or use cached data.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useNetwork } from '../contexts/NetworkContext';

const OfflineFallback = ({ onRetry, children }) => {
  const { colors } = useTheme();
  const { isConnected, refreshNetworkStatus } = useNetwork();

  const handleRetry = async () => {
    await refreshNetworkStatus();
    if (onRetry) {
      onRetry();
    }
  };

  // Show children if connected, otherwise show offline fallback
  if (isConnected) {
    return children;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Icon
          name="wifi-off"
          size={80}
          color={colors.error}
          style={styles.icon}
        />
        
        <Text style={[styles.title, { color: colors.text }]}>
          No Internet Connection
        </Text>
        
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Please check your internet connection and try again.
        </Text>
        
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <Icon name="refresh" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.retryText}>Retry Connection</Text>
        </TouchableOpacity>
        
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Some features may be limited while offline
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default OfflineFallback;
