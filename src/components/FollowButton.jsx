import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/env';

const FollowButton = ({ userId, initialFollowing = false, onFollowChange, style }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to follow users');
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      if (isFollowing) {
        // Unfollow
        await axios.delete(
          `${API_URL}/api/users/unfollow/${userId}`,
          config
        );
        setIsFollowing(false);
        onFollowChange && onFollowChange(false);
      } else {
        // Follow
        await axios.post(
          `${API_URL}/api/users/follow/${userId}`,
          {},
          config
        );
        setIsFollowing(true);
        onFollowChange && onFollowChange(true);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFollowing ? styles.followingButton : styles.followButton,
        style,
      ]}
      onPress={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isFollowing ? '#333' : '#fff'} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            isFollowing ? styles.followingButtonText : styles.followButtonText,
          ]}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  followButton: {
    backgroundColor: '#007bff',
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  followButtonText: {
    color: '#fff',
  },
  followingButtonText: {
    color: '#333',
  },
});

export default FollowButton;
