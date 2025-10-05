import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const LegendCard = ({
  legend,
  width = width * 0.7,
}) => {
  const { colors } = useTheme();

  const getRankColors = (rank) => {
    switch (rank) {
      case 1:
        return {
          primary: '#FFD700', // Gold
          secondary: '#FFA500', // Orange
          text: '#B8860B'
        };
      case 2:
        return {
          primary: '#C0C0C0', // Silver
          secondary: '#A9A9A9', // Dark Gray
          text: '#696969'
        };
      case 3:
        return {
          primary: '#CD7F32', // Bronze
          secondary: '#B8860B', // Dark Goldenrod
          text: '#8B4513'
        };
      default:
        return {
          primary: colors.primary,
          secondary: colors.secondary,
          text: colors.text
        };
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

  const rankColors = getRankColors(legend.rank);

  return (
    <View style={[styles.container, { width }]}>
      <LinearGradient
        colors={[rankColors.primary + '20', rankColors.secondary + '10']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={[styles.rankContainer, { backgroundColor: rankColors.primary }]}>
            <Icon name={getRankIcon(legend.rank)} size={24} color={colors.primary} />
          </View>
          <View style={styles.rankInfo}>
            <Text style={[styles.rankText, { color: colors.text }]}>
              #{legend.rank} Legend
            </Text>
            <Text style={[styles.period, { color: colors.textSecondary }]}>
              {legend.month} {legend.year}
            </Text>
          </View>
        </View>

        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: rankColors.primary + '20' }]}>
            <Icon name="person" size={40} color={rankColors.primary} />
          </View>
          <View style={[styles.crown, { backgroundColor: rankColors.primary }]}>
            <Icon name="star" size={16} color="white" />
          </View>
        </View>

        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {legend.name}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="quiz" size={16} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{legend.score}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-up" size={16} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{legend.quizCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Quizzes</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="workspace-premium" size={16} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{legend.level}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Level</Text>
          </View>
        </View>

        <View style={[styles.legendBadge, { backgroundColor: rankColors.primary }]}>
          <Icon name="verified" size={14} color="white" />
          <Text style={styles.legendText}>Monthly Legend</Text>
        </View>
        </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankInfo: {
    flex: 1,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  period: {
    fontSize: 12,
    fontWeight: '500',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crown: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  legendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  legendText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default LegendCard;