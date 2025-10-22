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
import { useNavigation } from '@react-navigation/native';

const TopPerformerCard = ({
  performer,
  rank,
  width
}) => {
  const { colors } = useTheme();
  const getRankColor = (rank) => {
    // Ensure colors object exists
    if (!colors || typeof colors !== 'object') {
      return '#EF4444'; // Fallback color
    }
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
  console.log(performer, 'performerperformerperformerperformerperformerperformerperformer')
  const monthly = performer?.monthly || {};
  const totalQuizzes = monthly?.totalQuizAttempts;
  const highScoreWins = monthly?.highScoreWins;
  const accuracy = monthly?.accuracy;
  const totalCorrectAnswers = performer?.totalCorrectAnswers;
  const totalScore = performer?.totalScore;

  return (
    <View style={[styles.container, { width, backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={getGradientColors(rank) || ['#EF444420', '#EF444410']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={[styles.rankContainer, { backgroundColor: getRankColor(rank) }]}>
            <Icon name={getRankIcon(rank)} size={20} color="white" />
          </View>
          <Text style={[styles.rankNumber, { color: getRankColor(rank) }]}>
            #{rank}
          </Text>
        </View>

        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Icon name="person" size={32} color={colors.primary} />
          </View>
          {rank <= 3 && (
            <View style={[styles.crown, { backgroundColor: getRankColor(rank) }]}>
              <Icon name="star" size={12} color="white" />
            </View>
          )}
        </View>

        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {performer.name}
        </Text>

        <View style={styles.stats}>
          {totalQuizzes !== undefined && (
            <View style={styles.statItem}>
              <Icon name="playlist-add-check" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{totalQuizzes}</Text>
            </View>
          )}
          {highScoreWins !== undefined && (
            <View style={styles.statItem}>
              <Icon name="military-tech" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{highScoreWins}</Text>
            </View>
          )}
          {accuracy !== undefined && (
            <View style={styles.statItem}>
              <Icon name="speed" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{Math.round(accuracy)}%</Text>
            </View>
          )}
          {totalCorrectAnswers !== undefined && totalScore !== undefined && (
            <View style={styles.statItem}>
              <Icon name="check-circle" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{totalCorrectAnswers} / {totalScore}</Text>
            </View>
          )}
        </View>

        {performer.level && (
          <View style={styles.levelContainer}>
            <Text style={[styles.levelText, { color: getRankColor(rank) }]}>
              Level {performer.level}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
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
    padding: 12,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  gapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 8,
  },
  gapText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  rankContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
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
    marginBottom: 8,
  },
  stats: {
    alignItems: 'center',
    marginBottom: 4,
    flexDirection: 'row',
    gap: 10
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TopPerformerCard;