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

const CategoryCard = ({
  category,
  onPress,
  width = width * 0.7,
}) => {
  const { colors } = useTheme();

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
      style={[styles.container, { width, backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradientColors(category.name)}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <Icon
            name={category.icon || getCategoryIcon(category.name)}
            size={32}
            color={colors.primary}
          />
        </View>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {category.name}
        </Text>
        {category.description && (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {category.description}
          </Text>
        )}
        {category.quizCount !== undefined && (
          <View style={styles.quizCount}>
            <Icon name="quiz" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizCountText, { color: colors.textSecondary }]}>
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
    minHeight: 140,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  quizCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quizCountText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default CategoryCard;