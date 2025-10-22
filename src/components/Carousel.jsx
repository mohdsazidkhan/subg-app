import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const Carousel = ({
  title,
  children,
  showViewAll = true,
  onViewAllPress,
  cardWidth = width * 0.8,
  spacing = 16,
  showIndicators = false,
}) => {
  const { colors } = useTheme();
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (cardWidth + spacing));
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * (cardWidth + spacing),
      animated: true,
    });
  };

  const renderIndicators = () => {
    if (!showIndicators) return null;

    const totalItems = Math.ceil(contentWidth / (cardWidth + spacing));

    return (
      <View style={styles.indicators}>
        {Array.from({ length: totalItems }).map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentIndex
                    ? colors.primary
                    : colors.textSecondary + '40',
              },
            ]}
            onPress={() => scrollToIndex(index)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {showViewAll && onViewAllPress && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAllPress}
          >
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              View All
            </Text>
            <Icon name="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingLeft: 20, paddingRight: 20 }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(width) => setContentWidth(width)}
      >
        {React.Children.toArray(children).map((child, index, arr) => (
          <View key={index} style={{ marginRight: index === arr.length - 1 ? 0 : spacing }}>
            {child}
          </View>
        ))}
      </ScrollView>

      {renderIndicators()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  scrollContent: {
    alignItems: 'center',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default Carousel;