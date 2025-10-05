import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
// Navigation and types removed for JavaScript conversion
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNetwork } from '../../contexts/NetworkContext';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';

import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Logo from '../../components/Logo';
import SearchBar from '../../components/SearchBar';
import Carousel from '../../components/Carousel';
import CategoryCard from '../../components/CategoryCard';
import LevelCard from '../../components/LevelCard';
import TopPerformerCard from '../../components/TopPerformerCard';
import LegendCard from '../../components/LegendCard';
import BlogCard from '../../components/BlogCard';
import AddQuestionSection from '../../components/AddQuestionSection';
import ReferralSection from '../../components/ReferralSection';
import NetworkStatusIndicator from '../../components/NetworkStatusIndicator';
import OfflineFallback from '../../components/OfflineFallback';

const { width } = Dimensions.get('window');

/**
 * Home Screen Component
 * 
 * Main dashboard screen showing categories, levels, top performers,
 * and other relevant information for users.
 */

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { isNetworkAvailable, isNetworkLoading, refreshNetworkStatus } = useNetwork();

  const [homeData, setHomeData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [monthlyLegends, setMonthlyLegends] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showSystemUpdateModal, setShowSystemUpdateModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userLevelData, setUserLevelData] = useState(null);
  const [currentMonthQuestionCount, setCurrentMonthQuestionCount] = useState(0);

  useEffect(() => {
    fetchData();
    fetchProfileCompletion();
    // Show system update modal for first-time visitors
    setTimeout(() => {
      setShowSystemUpdateModal(true);
    }, 1000);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Check network availability before fetching data
      if (!isNetworkAvailable()) {
        console.log('Network not available, skipping data fetch');
        setLoading(false);
        return;
      }
      
      await Promise.all([
        fetchHomeData(),
        fetchCategories(),
        fetchSubcategories(),
        fetchLevels(),
        fetchTopPerformers(),
        fetchMonthlyLegends(),
        fetchBlogs(),
        fetchCurrentMonthQuestionCount(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Don't show error message for offline state
      if (!error.isOffline) {
        showMessage({
          message: 'Failed to load data',
          type: 'danger',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeData = async () => {
    try {
      const response = await API.getHomePageData();
      if (response.success) {
        setHomeData(response.data);
        setUserLevelData(response.userLevel);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.getPublicCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await API.getAllLevels();
      if (response.success) {
        setLevels(response.data.filter((level) => level.level !== 0));
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      // Fetch subcategories for the first category as an example
      if (categories.length > 0) {
        const response = await API.getSubcategories(categories[0]._id);
        if (response.success) {
          setSubcategories(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const response = await API.getPublicTopPerformersMonthly(10, user?._id);
      if (response.success) {
        setTopPerformers(response.data);
      }
    } catch (error) {
      console.error('Error fetching top performers:', error);
    }
  };

  const fetchMonthlyLegends = async () => {
    try {
      const response = await API.getRecentMonthlyWinners(5);
      if (response.success) {
        setMonthlyLegends(response.data);
      }
    } catch (error) {
      console.error('Error fetching monthly legends:', error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await API.getFeaturedArticles(5);
      if (response.success) {
        setBlogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const fetchCurrentMonthQuestionCount = async () => {
    try {
      if (user) {
        const response = await API.getCurrentMonthQuestionCount();
        if (response.success) {
          setCurrentMonthQuestionCount(response.count || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching current month question count:', error);
    }
  };

  const fetchProfileCompletion = async (retryCount = 0) => {
    const maxRetries = 2;
    
    // Prevent multiple simultaneous calls
    if (profileLoading && retryCount === 0) {
      console.log('Profile completion request already in progress, skipping...');
      return;
    }
    
    // Check network availability before making API call
    if (!isNetworkAvailable()) {
      console.log('Network not available, skipping profile completion fetch');
      setProfileCompletion({
        percentage: 0,
        isComplete: false,
        fields: [
          { name: 'Full Name', completed: false },
          { name: 'Email Address', completed: false },
          { name: 'Phone Number', completed: false },
          { name: 'Social Media Link', completed: false },
        ],
        completedFields: 0,
        totalFields: 4,
      });
      return;
    }
    
    try {
      if (retryCount === 0) {
        setProfileLoading(true);
      }
      
      const response = await API.getProfile();
      if (response?.success && response.user?.profileCompletion) {
        setProfileCompletion(response.user.profileCompletion);
      }
    } catch (error) {
      // Handle different types of errors appropriately
      if (error.name === 'AbortError') {
        console.warn(`Profile completion request was aborted (timeout) - Attempt ${retryCount + 1}`);
        
        // Retry for AbortError if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          console.log(`Retrying profile completion request in 2 seconds... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            fetchProfileCompletion(retryCount + 1);
          }, 2000);
          return;
        }
        
        showMessage({
          message: 'Request timeout',
          description: 'Profile data request timed out after multiple attempts. Please check your connection.',
          type: 'warning',
          duration: 3000,
        });
      } else if (error.isNetworkError) {
        console.warn('Network error while fetching profile completion');
        
        // Handle different types of network errors
        if (error.isOffline) {
          console.log('Device is offline, will retry when connection is restored');
          // Don't show error message for offline state as NetworkContext will handle it
          return;
        }
        
        // Retry for network errors if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          console.log(`Retrying profile completion request in 3 seconds... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            fetchProfileCompletion(retryCount + 1);
          }, 3000);
          return;
        }
        
        showMessage({
          message: 'Network Error',
          description: 'Unable to connect to server after multiple attempts. Please check your internet connection.',
          type: 'danger',
          duration: 4000,
        });
      } else {
        console.error('Error fetching profile completion:', error);
      }
      
      // Set default values if API fails
      setProfileCompletion({
        percentage: 0,
        isComplete: false,
        fields: [
          { name: 'Full Name', completed: false },
          { name: 'Email Address', completed: false },
          { name: 'Phone Number', completed: false },
          { name: 'Social Media Link', completed: false },
        ],
        completedFields: 0,
        totalFields: 4,
      });
    } finally {
      if (retryCount === 0) {
        setProfileLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleQuizAttempt = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleConfirmQuizStart = () => {
    setShowQuizModal(false);
    if (selectedQuiz) {
      navigation.navigate('Quiz', { quizId: selectedQuiz._id });
    }
  };

  const handleCancelQuizStart = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'hard':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getLevelIcon = (level) => {
    const icons = [
      'star',
      'rocket-launch',
      'psychology',
      'trending-up',
      'emoji-events',
      'diamond',
      'workspace-premium',
      'auto-awesome',
      'auto-fix-high',
      'celebration',
    ];
    return icons[level - 1] || 'star';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Icon name="quiz" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading your quiz dashboard...
        </Text>
      </View>
    );
  }

  return (
    <OfflineFallback 
      onRetry={() => {
        fetchData();
        fetchProfileCompletion();
      }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar
          title={t('navigation.home')}
          showMenuButton={true}
          showLanguageToggle={true}
          showThemeToggle={true}
          onMenuPress={() => {
            // Navigate to More tab instead of opening drawer
            navigation.navigate('MainTabs', { screen: 'More' });
          }}
          onLanguageToggle={handleLanguageToggle}
          onThemeToggle={toggleTheme}
        />

        <NetworkStatusIndicator 
          onPress={() => {
            refreshNetworkStatus();
            // Retry profile completion if network is available
            if (isNetworkAvailable()) {
              fetchProfileCompletion();
            }
          }}
        />

        <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <SearchBar
          onSearchPress={() => navigation.navigate('Search')}
          placeholder="Search quizzes, categories, questions..."
        />

        {/* Header */}
        <LinearGradient
          colors={colors.backgroundGradient}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerDecorations}>
            <View
              style={[
                styles.headerBubble,
                {
                  top: -50,
                  left: -25,
                  backgroundColor: colors.primary + '1F',
                },
              ]}
            />
            <View
              style={[
                styles.headerBubble,
                {
                  bottom: -20,
                  right: -20,
                  backgroundColor: colors.accent + '1A',
                },
              ]}
            />
          </View>
          <View style={styles.headerContent}>
            <Logo size={60} showText={false} />
            <View style={styles.headerText}>
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                {t('home.welcome')}
              </Text>
              <Text style={[styles.appTitle, { color: colors.text }]}>
                SUBG QUIZ! 🎯
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('home.subtitle')}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Categories Carousel */}
        {categories.length > 0 && (
          <Carousel
            title="📚 Categories"
            onViewAllPress={() => navigation.navigate('Search')}
            cardWidth={width * 0.7}
          >
            {categories.slice(0, 8).map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                onPress={() =>
                  navigation.navigate('CategoryDetail', {
                    categoryId: category._id,
                  })
                }
                width={width * 0.7}
              />
            ))}
          </Carousel>
        )}

        {/* Subcategories Carousel */}
        {subcategories.length > 0 && (
          <Carousel
            title="🔍 Subcategories"
            onViewAllPress={() => navigation.navigate('Search')}
            cardWidth={width * 0.6}
          >
            {subcategories.slice(0, 10).map((subcategory) => (
              <CategoryCard
                key={subcategory._id}
                category={subcategory}
                onPress={() =>
                  navigation.navigate('SubcategoryDetail', {
                    subcategoryId: subcategory._id,
                  })
                }
                width={width * 0.6}
              />
            ))}
          </Carousel>
        )}

        {/* Levels Carousel */}
        {levels.length > 0 && (
          <Carousel
            title="🏆 Learning Levels"
            onViewAllPress={() => navigation.navigate('Levels')}
            cardWidth={width * 0.75}
          >
            {levels.slice(0, 8).map((level) => (
              <LevelCard
                key={level._id}
                level={level}
                onPress={() =>
                  navigation.navigate('LevelDetail', { levelId: level._id })
                }
                width={width * 0.75}
              />
            ))}
          </Carousel>
        )}

        {/* Previous Month Legends */}
        {monthlyLegends.length > 0 && (
          <Carousel
            title="👑 Previous Month Legends"
            onViewAllPress={() => navigation.navigate('Leaderboard')}
            cardWidth={width * 0.7}
          >
            {monthlyLegends.map((legend) => (
              <LegendCard
                key={legend._id}
                legend={legend}
                width={width * 0.7}
              />
            ))}
          </Carousel>
        )}

        {/* Top 10 Performers Current Month */}
        {topPerformers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🏅 Top 10 Performers This Month
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.topPerformersGrid}>
              {topPerformers.slice(0, 10).map((performer, index) => (
                <TopPerformerCard
                  key={performer._id}
                  performer={performer}
                  rank={index + 1}
                  width={(width - 48) / 2}
                />
              ))}
            </View>
          </View>
        )}

        {/* Referral Section */}
        <ReferralSection
          user={user}
          onPress={() => navigation.navigate('Profile')}
        />

        {/* Add Question Section */}
        <AddQuestionSection
          onPress={() => navigation.navigate('PostQuestion')}
          isProUser={user?.subscriptionStatus === 'pro'}
          currentMonthCount={currentMonthQuestionCount}
          monthlyLimit={50}
        />

        {/* Blogs Section */}
        {blogs.length > 0 && (
          <Carousel
            title="📖 Latest Blogs & Articles"
            onViewAllPress={() => navigation.navigate('Articles')}
            cardWidth={width * 0.8}
          >
            {blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onPress={() =>
                  navigation.navigate('ArticleDetail', { articleId: blog._id })
                }
                width={width * 0.8}
              />
            ))}
          </Carousel>
        )}
      </ScrollView>
      </View>
    </OfflineFallback>
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
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerDecorations: {
    position: 'absolute',
    inset: 0,
  },
  headerBubble: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.9,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  topPerformersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
});

export default HomeScreen;
