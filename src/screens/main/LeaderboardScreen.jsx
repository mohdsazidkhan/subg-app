import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import { showMessage } from 'react-native-flash-message';

const LeaderboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('overall');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await API.getLeaderboard({ category: selectedCategory });
      
      if (response.success) {
        setLeaderboardData(response.data || []);
        setUserRank(response.userRank || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      showMessage({
        message: 'Failed to load leaderboard',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return 'military-tech'; // Gold medal
    if (rank === 2) return 'celebration';   // Silver medal
    if (rank === 3) return 'workspace-premium'; // Bronze medal
    return 'person';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.textSecondary;
  };

  const renderPlayerItem = ({ item, index }) => {
    const rank = index + 1;
    const isCurrentUser = user?._id === item.userId;
    
    return (
      <View
        style={[
          styles.playerItem,
          { backgroundColor: colors.surface },
          isCurrentUser && { borderColor: colors.primary, borderWidth: 2 }
        ]}
      >
        <View style={styles.playerRank}>
          <View style={[styles.rankContainer, { backgroundColor: getRankColor(rank) }]}>
            <Icon name={getRankIcon(rank)} size={20} color="white" />
          </View>
          <Text style={[styles.rankNumber, { color: colors.text }]}>
            #{rank}
          </Text>
        </View>

        <View style={styles.playerInfo}>
          <View style={[
            styles.avatarContainer,
            { backgroundColor: isCurrentUser ? colors.primary + '20' : colors.border }
          ]}>
            <Icon name="person" size={20} color={isCurrentUser ? colors.primary : colors.textSecondary} />
          </View>
          
          <View style={styles.playerDetails}>
            <Text style={[
              styles.playerName,
              { color: colors.text },
              isCurrentUser && { fontWeight: 'bold' }
            ]}>
              {isCurrentUser ? 'You' : item.userName}
            </Text>
            <Text style={[styles.playerLevel, { color: colors.textSecondary }]}>
              Level {item.level || 1}
            </Text>
          </View>
        </View>

        <View style={styles.playerStats}>
          <Text style={[styles.playerScore, { color: colors.text }]}>
            {item.totalScore?.toLocaleString() || 0}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
            Points
          </Text>
        </View>
      </View>
    );
  };

  const renderCategoryTab = (category, label) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        { backgroundColor: selectedCategory === category ? colors.primary : colors.surface },
        { borderColor: colors.primary }
      ]}
      onPress={() => handleCategoryChange(category)}
    >
      <Text style={[
        styles.categoryTabText,
        { color: selectedCategory === category ? 'white' : colors.primary }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title={t('navigation.leaderboard')}
          showBackButton={true}
          showLanguageToggle={true}
          onBackPress={() => navigation.goBack()}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="leaderboard" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={t('navigation.leaderboard')}
        showBackButton={true}
        showLanguageToggle={true}
        onBackPress={() => navigation.goBack()}
        onLanguageToggle={handleLanguageToggle}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={colors.backgroundGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="leaderboard" size={40} color="white" />
            <Text style={styles.headerTitle}>Leaderboard</Text>
            <Text style={styles.headerSubtitle}>
              Top performers and achievers
            </Text>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {renderCategoryTab('overall', 'Overall')}
            {renderCategoryTab('weekly', 'Weekly')}
            {renderCategoryTab('monthly', 'Monthly')}
            {renderCategoryTab('level', 'By Level')}
          </ScrollView>
        </View>

        {/* User Rank */}
        {userRank && (
          <Card style={styles.userRankCard}>
            <View style={styles.userRankContent}>
              <Icon name="person" size={32} color={colors.primary} />
              <View style={styles.userRankInfo}>
                <Text style={[styles.userRankLabel, { color: colors.textSecondary }]}>
                  Your Rank
                </Text>
                <Text style={[styles.userRankValue, { color: colors.text }]}>
                  #{userRank.rank || '--'}
                </Text>
                <Text style={[styles.userRankScore, { color: colors.textSecondary }]}>
                  {userRank.totalScore?.toLocaleString() || 0} points
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Leaderboard */}
        <Card style={styles.leaderboardCard}>
          <Text style={[styles.leaderboardTitle, { color: colors.text }]}>
            Top Players
          </Text>
          
          {leaderboardData.length > 0 ? (
            <FlatList
              data={leaderboardData}
              renderItem={renderPlayerItem}
              keyExtractor={(item, index) => `${item.userId}-${index}`}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="leaderboard" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No leaderboard data available
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userRankCard: {
    margin: 20,
    marginTop: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRankContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRankInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userRankLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  userRankValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRankScore: {
    fontSize: 14,
  },
  leaderboardCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  playerRank: {
    alignItems: 'center',
    marginRight: 12,
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    marginBottom: 2,
  },
  playerLevel: {
    fontSize: 12,
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  playerScore: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 12,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LeaderboardScreen;