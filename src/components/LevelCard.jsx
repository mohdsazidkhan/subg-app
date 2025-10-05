import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const LevelCard = ({
  level,
  onPress,
  width = width * 0.75,
}) => {
  const { colors } = useTheme();

  const getLevelIcon = (levelNumber) => {
    const icons = [
      'star',
      'rocket-launch',
      'psychology',
      'trending-up',
      'emoji-events',
      'dummy',
      'workspace-premium',
      'auto-awesome',
      'auto-fix-high',
      'celebrating',
    ];
    return icons[levelNumber - 1] || 'star';
  };

  const getLevelColors = (levelNumber) => {
    const colorSets = [
      [colors.primary, colors.secondary],
      [colors.success, colors.accent],
      [colors.warning, colors.error],
      [colors.accent, colors.primary],
      [colors.error, colors.warning],
      [colors.secondary, colors.success],
      [colors.primary, colors.warning],
      [colors.success, colors.primary],
      [colors.accent, colors.error],
      [colors.warning, colors.secondary],
    ];
    return colorSets[levelNumber - 1] || [colors.primary, colors.secondary];
  };

  const levelColors = getLevelColors(level.level);

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[levelColors[0] + '20', levelColors[1] + '20']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: levelColors[0] + '20' }]}>
            <Icon name={getLevelIcon(level.level)} size={28} color={levelColors[0]} />
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelNumber, { color: levelColors[0] }]}>
              Level {level.level}
            </Text>
            <Text style={[styles.levelName, { color: colors.text }]} numberOfLines={1}>
              {level.name}
            </Text>
          </View>
          {level.isUnlocked === false && (
            <Icon name="lock" size={20} color={colors.textSecondary} />
          )}
        </View>

        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {level.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.quizInfo}>
            <Icon name="quiz" size={16} color={colors.textSecondary} />
            <Text style={[styles.quizCount, { color: colors.textSecondary }]}>
              {level.quizCount} Quizzes
            </Text>
          </View>
          {level.progress !== undefined && level.isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.textSecondary + '20' }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${level.progress}%`,
                      backgroundColor: levelColors[0],
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: levelColors[0] }]}>
                {level.progress}%
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    padding: 16,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizCount: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius:  Platform.OS === 'ios' ? 2 : 0,
  },
  progressText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default LevelCard;