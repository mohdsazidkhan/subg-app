import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config/env';
import { useTheme } from '../../contexts/ThemeContext';

const PublicProfileScreen = ({ route, navigation }) => {
  const { username } = route.params;
  const { user: currentUser } = useAuth();
  const { colors, isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username, fetchProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = currentUser?.token;
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await axios.get(
        `${API_URL}/api/users/profile/${username}`,
        config
      );

      if (response.data.success) {
        setProfile(response.data.user);
        setIsFollowing(response.data.isFollowing);
        setIsOwnProfile(response.data.isOwnProfile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigation.navigate('Login');
      return;
    }

    try {
      setFollowLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      };

      if (isFollowing) {
        await axios.delete(
          `${API_URL}/api/users/unfollow/${profile.id}`,
          config
        );
        setIsFollowing(false);
        setProfile({
          ...profile,
          followersCount: profile.followersCount - 1
        });
      } else {
        await axios.post(
          `${API_URL}/api/users/follow/${profile.id}`,
          {},
          config
        );
        setIsFollowing(true);
        setProfile({
          ...profile,
          followersCount: profile.followersCount + 1
        });
      }
    } catch (error) {
      console.error('Follow action failed:', error);
      alert(error.response?.data?.message || 'Failed to perform action');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Profile Not Found</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error || 'User not found'}</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.coverImage, { backgroundColor: colors.primary }]} />
      
      <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
        <Image
          source={{ uri: profile.profilePicture || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        
        <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
        {profile.username && (
          <Text style={[styles.username, { color: colors.textSecondary }]}>@{profile.username}</Text>
        )}
        
        {profile.bio && (
          <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>
        )}

        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => navigation.navigate('FollowersList', { username: profile.username })}
          >
            <Text style={[styles.statValue, { color: colors.text }]}>{profile.followersCount || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => navigation.navigate('FollowingList', { username: profile.username })}
          >
            <Text style={[styles.statValue, { color: colors.text }]}>{profile.followingCount || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{profile.profileViews || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Views</Text>
          </View>
        </View>

        {!isOwnProfile && (
          <TouchableOpacity
            style={[styles.followButton, { backgroundColor: isFollowing ? colors.background : colors.primary, borderColor: colors.border, borderWidth: isFollowing ? 1 : 0 }]}
            onPress={handleFollowToggle}
            disabled={followLoading}
          >
            <Text style={[styles.followButtonText, { color: isFollowing ? colors.text : '#fff' }]}>
              {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
            </Text>
          </TouchableOpacity>
        )}

        {isOwnProfile && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Level & Badges</Text>
        <View style={styles.levelCard}>
          <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.levelNumber}>
              {profile.level?.currentLevel?.number || 0}
            </Text>
            <Text style={styles.levelName}>
              {profile.level?.currentLevel?.name || 'Starter'}
            </Text>
          </View>
          
          {profile.badges && profile.badges.length > 0 && (
            <View style={styles.badgesContainer}>
              {profile.badges.map((badge, index) => (
                <View key={index} style={[styles.badge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.badgeText, { color: colors.text }]}>{badge}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {(profile.isPublicProfile || isOwnProfile) && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quiz Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.statCardValue, { color: colors.primary }]}>
                {profile.level?.progress?.quizzesPlayed || 0}
              </Text>
              <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Total Quizzes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.statCardValue, { color: colors.primary }]}>
                {profile.level?.stats?.highScoreRate || 0}%
              </Text>
              <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>High Score Rate</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.statCardValue, { color: colors.primary }]}>
                {profile.level?.stats?.averageScore || 0}%
              </Text>
              <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Average Score</Text>
            </View>
          </View>
        </View>
      )}

      {!profile.isPublicProfile && !isOwnProfile && (
        <View style={[styles.privateMessage, { backgroundColor: colors.surface }]}>
          <Text style={[styles.privateMessageText, { color: colors.textSecondary }]}>🔒 This profile is private</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  coverImage: {
    height: 150,
    backgroundColor: '#667eea',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: -50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  followButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#333',
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  editButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 15,
  },
  levelBadge: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelName: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    flex: 1,
  },
  badge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  privateMessage: {
    padding: 40,
    alignItems: 'center',
    marginTop: 10,
  },
  privateMessageText: {
    fontSize: 16,
    color: '#666',
  },
});

export default PublicProfileScreen;