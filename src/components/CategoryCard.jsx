import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const CategoryCard = ({
  category,
  onPress,
  width = undefined,
}) => {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = width ?? Math.floor(screenWidth * 0.7);
  const scale = Math.min(screenWidth / 375, 1.15);

  const getCategoryIcon = (name) => {
    const iconMap = {
      'General Knowledge': 'public',
      Science: 'science',
      History: 'history-edu',
      Mathematics: 'calculate',
      English: 'translate',
      Computer: 'computer',
      Sports: 'sports',
      Geography: 'place',
      Literature: 'menu-book',
      'Current Affairs': 'trending-up',
      Technology: 'devices',
      Arts: 'palette',
    };
    return iconMap[name] || 'category';
  };

  const getGradientColors = (name) => {
    // Ensure colors object exists
    if (!colors || typeof colors !== 'object') {
      return ['#EF444420', '#F59E0B20']; // Fallback colors
    }

    const gradients = {
      'General Knowledge': [colors.primary + '20', colors.secondary + '20'],
      Science: [colors.success + '20', colors.accent + '20'],
      History: [colors.warning + '20', colors.primary + '20'],
      Mathematics: [colors.error + '20', colors.warning + '20'],
      English: [colors.accent + '20', colors.primary + '20'],
      Computer: [colors.secondary + '20', colors.success + '20'],
      Sports: [colors.success + '20', colors.primary + '20'],
      Geography: [colors.warning + '20', colors.accent + '20'],
      Literature: [colors.error + '20', colors.primary + '20'],
      'Current Affairs': [colors.accent + '20', colors.success + '20'],
      Technology: [colors.primary + '20', colors.secondary + '20'],
      Arts: [colors.warning + '20', colors.error + '20'],
    };
    return gradients[name] || [colors.primary + '20', colors.secondary + '20'];
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth, backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradientColors(category?.name) || ['#EF444420', '#F59E0B20']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <Icon
            name={category.icon || getCategoryIcon(category.name)}
            size={Math.round(28 * scale)}
            color={colors.primary}
          />
        </View>
        <Text
          style={[styles.title, { color: colors.text, margin:5,fontSize: 16 * scale, lineHeight: 20 * scale }]}
          numberOfLines={2}
        >
          {category.name}
        </Text>
        {category.description && (
          <Text
            style={[styles.description, { color: colors.textSecondary,margin:5, fontSize: 12 * scale, lineHeight: 16 * scale }]}
            numberOfLines={3}
          >
            {category.description}
          </Text>
        )}
        {category.quizCount !== undefined && (
          <View style={styles.quizCount}>
            <Icon name="quiz" size={Math.round(12 * scale)} color={colors.textSecondary} />
            <Text style={[styles.quizCountText, { color: colors.textSecondary, fontSize: 12 * scale }]}>
              {category.quizCount} Quizzes
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    marginBottom: 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 3,

  },
  gradient: {
    padding: 2,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignSelf: 'flex-start',
    margin: 4,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 1,
  },
  description: {
    flex: 1,
  },
  quizCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quizCountText: {
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default CategoryCard;