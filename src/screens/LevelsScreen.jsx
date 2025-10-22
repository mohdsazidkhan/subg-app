import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import API from '../services/api';

const LevelsScreen = () => {
  const navigation = useNavigation();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.getPublicLevels();
      if (response.success) {
        setLevels(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load levels');
      console.error('Error loading levels:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLevels();
  };

  const getSubscriptionColor = (subscription) => {
    const colors = {
      'free': '#6B7280',
      'basic': '#3B82F6',
      'premium': '#8B5CF6',
      'pro': '#F59E0B'
    };
    return colors[subscription] || colors.free;
  };

  const renderLevelCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { borderTopColor: item.color }]}
      onPress={() => navigation.navigate('LevelDetail', { levelNumber: item.levelNumber })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.levelInfo}>
          <Text style={styles.levelName}>{item.name}</Text>
          <Text style={styles.levelNumber}>Level {item.levelNumber}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Quizzes Required</Text>
          <Text style={styles.statValue}>{item.quizzesRequired || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Users</Text>
          <Text style={styles.statValue}>{item.userCount?.toLocaleString() || 0}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View
          style={[
            styles.subscriptionBadge,
            { backgroundColor: getSubscriptionColor(item.requiredSubscription) + '20' }
          ]}
        >
          <Text
            style={[
              styles.subscriptionText,
              { color: getSubscriptionColor(item.requiredSubscription) }
            ]}
          >
            {item.requiredSubscription.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>🎯 All Levels</Text>
      <Text style={styles.subtitle}>
        Progress through {levels.length} levels and become a legend!
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading levels...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchLevels}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <FlatList
        data={levels}
        renderItem={renderLevelCard}
        keyExtractor={(item) => item.levelNumber.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderTopWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 48,
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  levelNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  subscriptionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  subscriptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewDetails: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default LevelsScreen;
