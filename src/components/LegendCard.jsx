import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const LegendCard = ({
  legend,
  width = undefined,
}) => {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = width ?? Math.floor(screenWidth * 0.7);
  const scale = Math.min(screenWidth / 375, 1.15);

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

  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = previousMonth.getFullYear();
  const month = String(previousMonth.getMonth() + 1).padStart(2, '0');
  const monthYear = `${month}-${year}`;

  const rankColors = getRankColors(legend.rank);

  return (
    <View style={[styles.container, { width: cardWidth, backgroundColor: colors.surface }]}> 
      <LinearGradient
        colors={[rankColors.primary + '20', rankColors.secondary + '10']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={[styles.rankContainer, { backgroundColor: rankColors.primary }]}> 
            <Icon name={getRankIcon(legend.rank)} size={Math.round(20 * scale)} color={colors.primary} />
          </View>
          <View style={styles.rankInfo}>
            <Text style={[styles.rankText, { color: colors.text, fontSize: 16 * scale }]}> 
              #{legend.rank}
            </Text>
            <Text style={[styles.period, { color: colors.textSecondary, fontSize: 12 * scale }]}> 
              {monthYear}
            </Text>
          </View>
        </View>

        <Text style={[styles.name, { color: colors.text, fontSize: 16 * scale }]} numberOfLines={1}> 
          {legend.userName}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="quiz" size={Math.round(14 * scale)} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text, fontSize: 14 * scale }]}>{legend.highScoreWins || legend.highScoreQuizzes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 10 * scale }]}>High Score Wins</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="percent" size={Math.round(14 * scale)} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text, fontSize: 14 * scale }]}>{legend.accuracy}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 10 * scale }]}>Accuracy</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="currency-rupee" size={Math.round(14 * scale)} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text, fontSize: 14 * scale }]}>{legend.rewardAmount?.toLocaleString?.() || legend.rewardAmount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: 10 * scale }]}>Prize</Text>
          </View>
        </View>

        <View style={[styles.legendBadge, { backgroundColor: rankColors.primary }]}> 
          <Icon name="verified" size={Math.round(12 * scale)} color="white" />
          <Text style={[styles.legendText, { fontSize: 12 * scale }]}>Monthly Legend</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    borderRadius: 16,
     marginBottom: 2,
    overflow: 'hidden',
    // Match CategoryCard subtle shadow + elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 3,
  },
  gradient: {
    padding: 2,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 5,
    paddingVertical: 5,
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
    marginBottom: 8,
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
    marginBottom: 12,
  },
  legendText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default LegendCard;