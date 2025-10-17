import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import TranslatableText from './TranslatableText';
import { useNavigation } from '@react-navigation/native';

const TopPerformerCard = ({
  performer,
  rank,
  width,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return colors.warning; // Gold
      case 2:
        return colors.textSecondary; // Silver
      case 3:
        return colors.error; // Bronze
      default:
        return colors.primary;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return 'emoji-events';
      case 2:
        return 'military-tech';
      case 3:
        return 'workspace-premium';
      default:
        return 'star';
    }
  };

  const getGradientColors = (rank) => {
    const rankColor = getRankColor(rank);
    return [rankColor + '20', rankColor + '10'];
  };

  // Helper function to get level names (same as frontend)
  const getLevelName = (level) => {
    const levelNames = {
      0: 'Starter', 1: 'Rookie', 2: 'Explorer', 3: 'Thinker', 4: 'Strategist', 5: 'Achiever',
      6: 'Mastermind', 7: 'Champion', 8: 'Prodigy', 9: 'Wizard', 10: 'Legend'
    };
    return levelNames[level] || 'Unknown';
  };

  // Get subscription badge colors
  const getSubscriptionColors = (subscription) => {
    switch (subscription) {
      case 'PRO':
        return { bg: '#F59E0B', text: 'white' };
      case 'PREMIUM':
        return { bg: '#EC4899', text: 'white' };
      case 'BASIC':
        return { bg: '#3B82F6', text: 'white' };
      default:
        return { bg: '#10B981', text: 'white' };
    }
  };

  const username = performer?.username || performer?.userName || performer?.user?.username;
  const displayName = username ? `@${username}` : (performer?.name || 'User');
  
  // Get subscription status with proper fallback
  const subscriptionName = performer?.subscriptionName || performer?.subscription?.name || 'FREE';
  
  const currentLevel = performer.monthly?.currentLevel || 0;
  const levelName = getLevelName(currentLevel);
  
  // Get performance stats with proper fallback
  const highScoreQuizzes = performer?.highScoreQuizzes || performer?.monthly?.highScoreWins || 0;
  const totalQuizzes = performer?.quizzesPlayed || performer?.monthly?.totalQuizAttempts || 0;
  const accuracy = performer?.accuracy || performer?.monthly?.accuracy || 0;
  const totalScore = performer?.totalScore || performer?.totalCorrectAnswers || 0;

  const goToProfile = () => {
    if (username) {
      navigation.navigate('PublicProfile', { username });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, width: width || '100%' }]}> 
      <LinearGradient
        colors={getGradientColors(rank)}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={[styles.rankNumber, { color: getRankColor(rank) }]}> 
            #{rank}
          </Text>
          <View style={[styles.rankContainer, { backgroundColor: getRankColor(rank) }]}> 
            <Icon name={getRankIcon(rank)} size={20} color="white" />
          </View>
        </View>

        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}> 
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(performer?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          {rank <= 3 && (
            <View style={[styles.crown, { backgroundColor: getRankColor(rank) }]}> 
              <Icon name="star" size={12} color="white" />
            </View>
          )}
        </View>

        <TouchableOpacity onPress={goToProfile} activeOpacity={username ? 0.8 : 1}>
          <TranslatableText style={[styles.name, { color: colors.text }]} numberOfLines={1}> 
            {performer?.name || 'Unknown'}
          </TranslatableText>
          <View style={[styles.subscriptionBadge, { backgroundColor: getSubscriptionColors(subscriptionName).bg }]}>
            <Text style={[styles.subscriptionText, { color: getSubscriptionColors(subscriptionName).text }]}>
              {subscriptionName}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.stats}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon name="star" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}> 
                {highScoreQuizzes}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="quiz" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}> 
                {totalQuizzes}
              </Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Icon name="trending-up" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}> 
                {accuracy}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="check-circle" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}> 
                {totalScore}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.levelContainer}>
          <Text style={[styles.levelText, { color: getRankColor(rank) }]}> 
            Level {currentLevel} - {levelName}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    padding: 1,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  rankContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  crown: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subscriptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 8,
  },
  subscriptionText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  stats: {
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  levelContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TopPerformerCard;