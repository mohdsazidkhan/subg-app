/**
 * @fileoverview Network Status Indicator Component
 * 
 * This component displays the current network connectivity status
 * and provides visual feedback to users about their connection state.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNetwork } from '../contexts/NetworkContext';
import { useTheme } from '../contexts/ThemeContext';

const NetworkStatusIndicator = ({ onPress }) => {
  const { colors } = useTheme();
  const { isConnected, isInternetReachable, connectionType, isNetworkLoading } = useNetwork();

  // Don't show indicator if network is working fine
  if (isConnected && isInternetReachable && !isNetworkLoading) {
    return null;
  }

  const getStatusInfo = () => {
    if (isNetworkLoading) {
      return {
        icon: 'sync',
        text: 'Checking connection...',
        color: colors.warning,
        backgroundColor: colors.warning + '20',
      };
    }

    if (!isConnected) {
      return {
        icon: 'wifi-off',
        text: 'No Internet Connection',
        color: colors.error,
        backgroundColor: colors.error + '20',
      };
    }

    if (isConnected && !isInternetReachable) {
      return {
        icon: 'wifi-off',
        text: 'Limited Connection',
        color: colors.warning,
        backgroundColor: colors.warning + '20',
      };
    }

    return {
      icon: 'wifi',
      text: `Connected via ${connectionType}`,
      color: colors.success,
      backgroundColor: colors.success + '20',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: statusInfo.backgroundColor },
        onPress && styles.pressable
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <Icon
          name={statusInfo.icon}
          size={16}
          color={statusInfo.color}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
        {onPress && (
          <Icon
            name="refresh"
            size={14}
            color={statusInfo.color}
            style={styles.refreshIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  pressable: {
    borderBottomWidth: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  refreshIcon: {
    marginLeft: 8,
  },
});

export default NetworkStatusIndicator;
