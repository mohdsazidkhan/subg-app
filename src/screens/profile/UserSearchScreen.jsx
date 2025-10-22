import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../../config/env';

const UserSearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchUsers();
      } else {
        setUsers([]);
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/users/search?query=${query}`
      );

      if (response.data.success) {
        setUsers(response.data.users);
        setSearched(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (username) => {
    navigation.navigate('PublicProfile', { username });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item.username)}
    >
      <Image
        source={{ uri: item.profilePicture || 'https://via.placeholder.com/150' }}
        style={styles.avatar}
      />
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
        {item.bio && (
          <Text style={styles.userBio} numberOfLines={1}>
            {item.bio}
          </Text>
        )}
      </View>
      
      <View style={styles.userStats}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>L{item.level?.currentLevel || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.followersCount || 0}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search users by name or username..."
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color="#007bff"
            style={styles.searchIndicator}
          />
        )}
      </View>

      {searched && users.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No users found for "{query}"</Text>
        </View>
      )}

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    color: '#333',
  },
  searchIndicator: {
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  userBio: {
    fontSize: 13,
    color: '#888',
  },
  userStats: {
    alignItems: 'center',
    gap: 10,
  },
  levelBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  levelText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});

export default UserSearchScreen;
