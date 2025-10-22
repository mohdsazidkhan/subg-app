import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/env';

const FollowersListScreen = ({ route, navigation }) => {
  const { username } = route.params;
  const { user: currentUser } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFollowers();
  }, [username, page, fetchFollowers]);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const token = currentUser?.token;
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      // First get user ID from username
      const profileRes = await axios.get(
        `${API_URL}/api/users/profile/${username}`,
        config
      );
      
      if (profileRes.data.success) {
        const userId = profileRes.data.user.id;
        
        // Then fetch followers
        const response = await axios.get(
          `${API_URL}/api/users/${userId}/followers?page=${page}&limit=20`,
          config
        );

        if (response.data.success) {
          setFollowers(response.data.followers);
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to load followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userUsername) => {
    if (userUsername) {
      navigation.push('PublicProfile', { username: userUsername });
    }
  };

  const renderFollower = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserClick(item.username)}
    >
      {item.profilePicture ? (
        <Image
          source={{ uri: item.profilePicture }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
      )}
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        {item.username && (
          <Text style={styles.username}>@{item.username}</Text>
        )}
        {item.level && (
          <Text style={styles.levelText}>{item.level.levelName}</Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.followersCount}>
          {item.followersCount || 0} followers
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Followers</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {loading && page === 1 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : followers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No followers yet</Text>
        </View>
      ) : (
        <FlatList
          data={followers}
          renderItem={renderFollower}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          onEndReached={() => {
            if (page < pagination.totalPages && !loading) {
              setPage(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            if (loading && page > 1) {
              return (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#007bff" />
                </View>
              );
            }
            return null;
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#f59e0b',
    marginBottom: 2,
  },
  levelText: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  followersCount: {
    fontSize: 12,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default FollowersListScreen;
