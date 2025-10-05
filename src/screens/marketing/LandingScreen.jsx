import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import Logo from '../../components/Logo';

const { width, height } = Dimensions.get('window');

const LandingScreen = () => {
  const navigation = useNavigation();
  const { colors, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  const [levels, setLevels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    activeStudents: "1K+",
    quizCategories: "15+",
    subcategories: "100+",
    totalQuizzes: "4K+",
    totalQuestions: "20K+",
    quizzesTaken: "25K+",
    monthlyPrizePool: "₹10K",
    paidSubscriptions: "99",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Set a maximum loading time of 3 seconds
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(loadingTimeout);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Set fallback data immediately for faster loading
      setStats({
        activeStudents: "1K+",
        quizCategories: "15+",
        subcategories: "100+",
        totalQuizzes: "4K+",
        totalQuestions: "20K+",
        quizzesTaken: "25K+",
        monthlyPrizePool: "₹10K",
        paidSubscriptions: "99",
      });

      // Set fallback levels
      setLevels([
        { _id: '1', level: 1, name: 'Rookie', description: 'Start your journey with 4 quiz attempts', quizzes: 4 },
        { _id: '2', level: 2, name: 'Explorer', description: 'Explore new topics with 12 quiz attempts', quizzes: 12 },
        { _id: '3', level: 3, name: 'Thinker', description: 'Think critically with 24 quiz attempts', quizzes: 24 },
        { _id: '4', level: 4, name: 'Strategist', description: 'Plan your strategy with 40 quiz attempts', quizzes: 40 },
        { _id: '5', level: 5, name: 'Achiever', description: 'Achieve greatness with 60 quiz attempts', quizzes: 60 },
        { _id: '6', level: 6, name: 'Mastermind', description: 'Master the game with 84 quiz attempts', quizzes: 84 },
        { _id: '7', level: 7, name: 'Champion', description: 'Become a champion with 112 quiz attempts', quizzes: 112 },
        { _id: '8', level: 8, name: 'Prodigy', description: 'Show your talent with 144 quiz attempts', quizzes: 144 },
        { _id: '9', level: 9, name: 'Wizard', description: 'Cast your magic with 180 quiz attempts', quizzes: 180 },
        { _id: '10', level: 10, name: 'Legend', description: 'Become a legend with 220 quiz attempts', quizzes: 220 },
      ]);

      // Set fallback categories
      setCategories([
        { _id: '1', name: 'Science', description: 'Explore science topics', color: '#10B981', icon: 'science' },
        { _id: '2', name: 'Mathematics', description: 'Solve math problems', color: '#F59E0B', icon: 'calculate' },
        { _id: '3', name: 'General Knowledge', description: 'Test your GK', color: '#8B5CF6', icon: 'quiz' },
        { _id: '4', name: 'History', description: 'Learn about history', color: '#EF4444', icon: 'history-edu' },
        { _id: '5', name: 'Technology', description: 'Learn about Technology', color: '#005478', icon: 'quiz' },
      ]);

      // Try to fetch real data in background (non-blocking)
      try {
        const [levelsRes, categoriesRes, statsRes] = await Promise.all([
          API.getAllLevels(),
          API.getPublicCategoriesEnhanced(),
          API.getPublicLandingStats(),
        ]);

        // Update with real data if successful
        if (levelsRes.success) {
          const filteredLevels = levelsRes.data.filter(
            (level) => level.level !== 0
          );
          setLevels(filteredLevels);
        }

        if (categoriesRes.success) {
          setCategories(categoriesRes.data);
        }

        if (statsRes.success) {
          const formatNumber = (num) => {
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
            if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
            return `${num}+`;
          };

          setStats({
            activeStudents: formatNumber(statsRes.data.activeStudents),
            quizCategories: formatNumber(statsRes.data.quizCategories),
            subcategories: formatNumber(statsRes.data.subcategories),
            totalQuizzes: formatNumber(statsRes.data.totalQuizzes),
            totalQuestions: formatNumber(statsRes.data.totalQuestions),
            quizzesTaken: formatNumber(statsRes.data.quizzesTaken),
            monthlyPrizePool: `₹${statsRes.data.monthlyPrizePool}`,
            paidSubscriptions: formatNumber(statsRes.data.paidSubscriptions),
          });
        }
      } catch (apiError) {
        // Silently fail - we already have fallback data
        console.log('API data fetch failed, using fallback data');
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    AsyncStorage.setItem('onboarding_seen', 'true').finally(() => {
      navigation.navigate('Auth');
    });
  };

  const handleLevelPress = (level) => {
    // Could navigate to specific level details in future
      showMessage({
        message: `Level ${level.level}: ${level.name} - Coming soon!`,
        type: 'info',
      });
    };

  const handleCategoryPress = (category) => {
    // Could navigate to category details in future
    showMessage({
      message: `${category.name} - Coming soon!`,
      type: 'info',
    });
  };

  const getLevelColors = (levelName) => {
    const levelColorMap = {
      'Rookie': colors.primary,
      'Explorer': colors.secondary,
      'Thinker': colors.accent,
      'Master': colors.success,
      'Expert': colors.warning,
    };
    return levelColorMap[levelName] || colors.primary;
  };

  const getCategoryColors = (categoryName) => {
    const categoryColorMap = {
      'Science': '#10B981',
      'Technology': '#3B82F6',
      'Mathematics': '#F59E0B',
      'General Knowledge': '#8B5CF6',
      'History': '#EF4444',
    };
    return categoryColorMap[categoryName] || colors.primary;
  };

  const renderLevelCard = ({ item: level }) => (
    <TouchableOpacity
      onPress={() => handleLevelPress(level)}
      style={[styles.levelCard, { backgroundColor: colors.surface }]}
    >
      <LinearGradient
        colors={[getLevelColors(level.name) + '20', getLevelColors(level.name) + '10']}
        style={styles.levelCardGradient}
      >
        <View style={[styles.levelIcon, { backgroundColor: getLevelColors(level.name) + '20' }]}>
          <Text style={styles.levelNumber}>{level.level}</Text>
        </View>
        <Text style={[styles.levelName, { color: colors.text }]}>{level.name}</Text>
        <Text style={[styles.levelDescription, { color: colors.textSecondary }]}>
          {level.description}
        </Text>
        <View style={styles.levelStats}>
          <View style={styles.levelStat}>
            <Icon name="quiz" size={14} color={colors.primary} />
            <Text style={[styles.levelStatText, { color: colors.textSecondary }]}>
              {level.quizzes || 'Variable'} Quizzes
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategoryCard = ({ item: category }) => (
    <TouchableOpacity
      onPress={() => handleCategoryPress(category)}
      style={[styles.categoryCard, { backgroundColor: colors.surface }]}
    >
      <LinearGradient
        colors={[getCategoryColors(category.name) + '20', getCategoryColors(category.name) + '10']}
        style={styles.categoryCardGradient}
      >
        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColors(category.name) + '20' }]}>
          <Icon name="school" size={24} color={getCategoryColors(category.name)} />
        </View>
        <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
        <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
          {category.description}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderStat = (number, label, icon) => (
    <View key={label} style={[styles.statItem, { backgroundColor: colors.surface }]}>
      <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
        <Icon name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.statNumber, { color: colors.primary }]}>
        {number}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );

  const renderFeature = (icon, title, description) => (
    <View key={title} style={[styles.featureCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
        <Icon name={icon} size={30} color={colors.primary} />
      </View>
      <Text style={[styles.featureTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Logo size={80} showText={true} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  // Onboarding slides horizontally + prev/next buttons
  const slides = [
    function SlideHero() {
      return (
        <LinearGradient
          colors={colors.backgroundGradient}
          style={[styles.heroSection, { minHeight: height - insets.top - insets.bottom }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroDecorations}>
            <View style={[
              styles.heroBubble,
              styles.heroBubbleTopLeft,
              { backgroundColor: colors.primary + '26' }
            ]} />
            <View style={[
              styles.heroBubble,
              styles.heroBubbleBottomRight,
              { backgroundColor: colors.accent + '1F' }
            ]} />
            <View style={[
              styles.heroRing,
              styles.heroRingTopRight,
              { borderColor: colors.primary + '40' }
            ]} />
          </View>
          <View style={styles.heroContent}>
            <Logo size={80} showText={true} />
            <Text style={[styles.heroDescription, { color: colors.text }]}>
              Ready to prove your knowledge? Compete in level-based quizzes and win rewards every month.
            </Text>
          </View>
        </LinearGradient>
      );
    },
    function SlideStats() {
      return (
        <View style={[styles.slideContainer, { backgroundColor: colors.background, minHeight: height - insets.top - insets.bottom }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Platform Statistics</Text>
          <ScrollView style={styles.statsScrollView}>
            <View style={styles.statsGrid}>
              {renderStat(stats.activeStudents, 'Active Students', 'group')}
              {renderStat(stats.quizCategories, 'Quiz Categories', 'book')}
              {renderStat(stats.subcategories, 'Subcategories', 'category')}
              {renderStat(stats.totalQuizzes, 'Total Quizzes', 'quiz')}
              {renderStat(stats.totalQuestions, 'Questions', 'help-outline')}
              {renderStat(stats.quizzesTaken, 'Quizzes Taken', 'emoji-events')}
            </View>
          </ScrollView>
        </View>
      );
    },
    function SlideLevels() {
      return (
        <View style={[styles.slideContainer, { backgroundColor: colors.background, minHeight: height - insets.top - insets.bottom }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quiz Levels</Text>
          <ScrollView style={styles.statsScrollView}>
            {levels.length > 0 ? (
              <FlatList
                data={levels}
                renderItem={renderLevelCard}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.levelsContainer}
              />
            ) : (
              <View style={styles.emptyState}>
                <Icon name="quiz" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No levels available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      );
    },
    function SlideCategories() {
      return (
        <View style={[styles.slideContainer, { backgroundColor: colors.background, minHeight: height - insets.top - insets.bottom }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quiz Categories</Text>
          <ScrollView style={styles.statsScrollView}>
            {categories.length > 0 ? (
              <FlatList
                data={categories}
                renderItem={renderCategoryCard}
                keyExtractor={(item) => item._id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.categoriesContainer}
                columnWrapperStyle={styles.categoriesRow}
                style={styles.categoriesList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Icon name="school" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No categories available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      );
    },
    function SlideFeatures() {
      return (
        <View style={[styles.slideContainer, { backgroundColor: colors.background, minHeight: height - insets.top - insets.bottom }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Why Choose SUBG?</Text>
          <ScrollView style={styles.statsScrollView}>
            <View style={styles.featuresGrid}>
              {renderFeature('quiz', 'Interactive Quizzes', 'Thousands of questions across subjects')}
              {renderFeature('emoji-events', 'Leaderboards', 'Compete and climb the ranks')}
              {renderFeature('trending-up', 'Progress Tracking', 'Monitor your improvement')}
              {renderFeature('card-membership', 'Premium Features', 'Unlock more with subscription')}
            </View>
          </ScrollView>
        </View>
      );
    },
  ];

  const handlePrev = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    scrollRef.current?.scrollToIndex({ index: newIndex, animated: true });
  };

  const handleNext = () => {
    const newIndex = Math.min(slides.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    scrollRef.current?.scrollToIndex({ index: newIndex, animated: true });
  };

  const handleMomentumEnd = (e) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Get Started"
        showBackButton={false}
        showLanguageToggle={true}
        showThemeToggle={true}
        onLanguageToggle={() => changeLanguage(currentLanguage === 'en' ? 'hi' : 'en')}
        onThemeToggle={toggleTheme}
      />

      <FlatList
        ref={scrollRef}
        data={slides.map((_, idx) => idx)}
        keyExtractor={(i) => `slide-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={({ item }) => {
          const Render = slides[item];
          return (
            <View style={{ width }}>
              <Render />
            </View>
          );
        }}
        style={styles.onboardScroll}
      />

      <View style={[styles.onboardControls, currentIndex === 0 && styles.onboardControlsCenter]}>
      <>
      {currentIndex > 0 && (
        <Button
          title="Prev"
          onPress={handlePrev}
          style={[styles.controlButton, { backgroundColor: colors.surface }]}
          textStyle={{ color: colors.text }}
        />
      )}
      </>
      {currentIndex < slides.length - 1 ? (
          <Button
            title="Next"
            onPress={handleNext}
            style={[styles.controlButton, { backgroundColor: colors.primary }]}
            textStyle={styles.controlPrimaryText}
          />
        ) : (
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            style={[styles.controlButton, { backgroundColor: colors.primary }]}
            textStyle={styles.controlPrimaryText}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  onboardScroll: {
    flex: 1,
  },
  heroSection: {
    padding: 40,
    alignItems: 'center',
    minHeight: 400,
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  slideContainer: {
    padding: 20,
    minHeight: 400,
  },
  heroDecorations: {
    position: 'absolute',
    inset: 0,
  },
  heroBubble: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.8,
  },
  heroBubbleTopLeft: {
    top: 20,
    left: -30,
  },
  heroBubbleBottomRight: {
    bottom: 50,
    right: -25,
  },
  heroRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  heroRingTopRight: {
    bottom: 12,
    right: 16,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: width * 0.9,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    // color set dynamically
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 0.4,
  },
  heroSubtitle: {
    fontSize: 20,
    // color set dynamically
    opacity: 0.85,
    marginBottom: 20,
    fontWeight: '600',
  },
  heroDescription: {
    fontSize: 16,
    // color set dynamically
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 24,
    marginBottom: 32,
    maxWidth: "100%",
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  heroButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
  },
  heroPrimaryButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  heroButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    // borderColor set dynamically via style
    shadowColor: 'transparent',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statsScrollView: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    rowGap: 12,
    columnGap: 12,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 16,
    width: (width - 48) * 0.48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  levelsSection: {
    padding: 20,
  },
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  levelCard: {
    marginBottom: 16,
    width: width * 0.7,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  levelCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  levelStats: {
    alignItems: 'center',
  },
  levelStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelStatText: {
    fontSize: 12,
    marginLeft: 6,
  },
  categoriesSection: {
    padding: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16
  },
  categoriesRow: {
    columnGap: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  categoriesList: {
    paddingHorizontal: 8,
  },
  categoryCard: {
    marginBottom: 16,
    width: (width - 80) / 2 - 5,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  performersSection: {
    padding: 20,
  },
  performersContainer: {
    marginTop: 16,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  performerRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  performerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performerStatText: {
    fontSize: 12,
  },
  featuresSection: {
    padding: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 70) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  ctaSection: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  ctaButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  onboardControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  onboardControlsCenter: {
    justifyContent: 'center',
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  controlPrimaryText: {
    color: 'white',
  },
  controlSpacer: {
    width: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 14,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
  },
  proWalletSection: {
    padding: 20,
  },
  proWalletCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  proWalletContent: {
    flexDirection: 'column',
  },
  proWalletLeft: {
    marginBottom: 16,
  },
  proWalletIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  proWalletEmoji: {
    fontSize: 32,
  },
  proWalletTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  proWalletDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  proWalletSteps: {
    gap: 12,
  },
  proWalletStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  proWalletStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  proWalletStepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  proWalletStepContent: {
    flex: 1,
  },
  proWalletStepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  proWalletStepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  proWalletRight: {
    gap: 16,
  },
  proWalletInfo: {
    padding: 16,
    borderRadius: 12,
  },
  proWalletInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  proWalletInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  proWalletInfoLabel: {
    fontSize: 14,
    flex: 1,
  },
  proWalletInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  proWalletBenefits: {
    padding: 16,
    borderRadius: 12,
  },
  proWalletBenefitItem: {
    marginBottom: 8,
  },
  proWalletBenefitText: {
    fontSize: 14,
    lineHeight: 20,
  },
  proWalletButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  proWalletButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default LandingScreen;