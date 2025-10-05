import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { showMessage } from 'react-native-flash-message';

const CategoryDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [category, setCategory] = useState(route.params?.category || null);
  const [subCategories, setSubCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!category) {
      navigation.goBack();
      return;
    }
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const [subCategoriesResponse, quizzesResponse] = await Promise.all([
        API.getSubCategories(category._id),
        API.getCategoryQuizzes(category._id),
      ]);

      if (subCategoriesResponse.success) {
        setSubCategories(subCategoriesResponse.data || []);
      }

      if (quizzesResponse.success) {
        setQuizzes(quizzesResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
      showMessage({
        message: 'Failed to load category data',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategoryData();
    setRefreshing(false);
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleSubCategoryPress = (subCategory) => {
    navigation.navigate('SubcategoryDetail', { subCategory });
  };

  const handleQuizPress = (quiz) => {
    if (user?.subscriptionStatus === 'free' && quiz.isPremium) {
      Alert.alert(
        'Premium Quiz',
        'This quiz is only available for premium users. Would you like to upgrade?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }

    navigation.navigate('AttemptQuiz', { quiz });
  };

  const renderSubCategoryItem = (subCategory) => (
    <TouchableOpacity
      key={subCategory._id}
      style={[styles.subCategoryItem, { backgroundColor: colors.surface }]}
      onPress={() => handleSubCategoryPress(subCategory)}
    >
      <View style={styles.subCategoryContent}>
        <Icon name="folder" size={24} color={colors.primary} />
        <View style={styles.subCategoryInfo}>
          <Text style={[styles.subCategoryName, { color: colors.text }]}>
            {subCategory.name}
          </Text>
          <Text style={[styles.subCategoryDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {subCategory.description}
          </Text>
          <Text style={[styles.subCategoryCount, { color: colors.textSecondary }]}>
            {subCategory.quizCount || 0} quizzes
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderQuizItem = (quiz) => (
    <TouchableOpacity
      key={quiz._id}
      style={[styles.quizItem, { backgroundColor: colors.surface }]}
      onPress={() => handleQuizPress(quiz)}
    >
      <View style={styles.quizContent}>
        <View style={styles.quizHeader}>
          <Text style={[styles.quizName, { color: colors.text }]} numberOfLines={2}>
            {quiz.name}
          </Text>
          <View style={styles.quizBadges}>
            {quiz.isPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: colors.warning }]}>
                <Icon name="star" size={12} color="white" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
            {quiz.isCompleted && (
              <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
                <Icon name="check" size={12} color="white" />
                <Text style={styles.completedText}>Done</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.quizDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {quiz.description}
        </Text>

        <View style={styles.quizStats}>
          <View style={styles.quizStat}>
            <Icon name="quiz" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizStatText, { color: colors.textSecondary }]}>
              {quiz.questionsCount || 0} questions
            </Text>
          </View>
          
          <View style={styles.quizStat}>
            <Icon name="timer" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizStatText, { color: colors.textSecondary }]}>
              {Math.round((quiz.timeLimit || 0) / 60)} min
            </Text>
          </View>

          <View style={styles.quizStat}>
            <Icon name="emoji-events" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizStatText, { color: colors.textSecondary }]}>
              {quiz.points || 0} pts
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!category) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title="Category"
          showBackButton={false}
          showLanguageToggle={true}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="error" size={60} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Category not found
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title={category.name}
          showBackButton={true}
          showLanguageToggle={true}
          onBackPress={() => navigation.goBack()}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="folder" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading category...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={category.name}
        showBackButton={true}
        showLanguageToggle={true}
        onBackPress={() => navigation.goBack()}
        onLanguageToggle={handleLanguageToggle}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Category Header */}
        <LinearGradient colors={colors.backgroundGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="folder" size={40} color="white" />
            <Text style={styles.headerTitle}>{category.name}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={3}>
              {category.description}
            </Text>
          </View>
        </LinearGradient>

        {/* Statistics */}
        <Card style={styles.statsCard}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="folder" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {subCategories.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Subcategories
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="quiz" size={24} color={colors.info} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {quizzes.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Quizzes
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="school" size={24} color={colors.success} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {quizzes.filter(quiz => quiz.isCompleted).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Completed
              </Text>
            </View>
          </View>
        </Card>

        {/* Subcategories */}
        {subCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Subcategories ({subCategories.length})
            </Text>
            
            <View style={styles.subCategoriesContainer}>
              {subCategories.map(renderSubCategoryItem)}
            </View>
          </View>
        )}

        {/* Quizzes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quizzes ({quizzes.length})
          </Text>
          
          {quizzes.length > 0 ? (
            <View style={styles.quizzesContainer}>
              {quizzes.map(renderQuizItem)}
            </View>
          ) : (
            <Card style={styles.emptyState}>
              <View style={styles.emptyContent}>
                <Icon name="quiz" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Quizzes Available
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Check back later for new quizzes in this category!
                </Text>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
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
    fontSize: 18,
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  statsCard: {
    margin: 20,
    marginTop: 16,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subCategoriesContainer: {
    gap: 12,
  },
  subCategoryItem: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  subCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  subCategoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subCategoryDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  subCategoryCount: {
    fontSize: 12,
  },
  quizzesContainer: {
    gap: 12,
  },
  quizItem: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  quizContent: {
    padding: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  quizName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  quizBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  quizDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  quizStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quizStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quizStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
});

export default CategoryDetailScreen;