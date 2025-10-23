import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import QuizStartModal from '../../components/QuizStartModal';
import { showMessage } from 'react-native-flash-message';

const CategoryDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const categoryId = route.params?.categoryId;

  useEffect(() => {
    console.log('CategoryDetailScreen useEffect - categoryId:', categoryId);
    console.log('Route params:', route.params);
    if (!categoryId) {
      console.log('No categoryId found, going back');
      navigation.goBack();
      return;
    }
    fetchCategory();
    fetchSubcategories();
    fetchQuizzes(page);
  }, [categoryId, page]);

  const fetchCategory = async () => {
    try {
      console.log('Fetching categories for categoryId:', categoryId);
      const categories = await API.getCategories();
      console.log('All categories:', categories);
      const found = categories.find(cat => cat._id === categoryId);
      console.log('Found category:', found);
      setCategory(found || null);
    } catch (error) {
      console.error('Error fetching category:', error);
      setCategory(null);
    }
  };

  const fetchSubcategories = async () => {
    try {
      setSubcategoriesLoading(true);
      const res = await API.getSubCategories(categoryId);
      console.log('Subcategories response:', res);
      if (res.success) {
        setSubcategories(res.data || []);
      } else {
        // Try alternative API call
        const altRes = await API.request(`/api/student/subcategories?category=${categoryId}`);
        console.log('Alternative subcategories response:', altRes);
        if (altRes && Array.isArray(altRes)) {
          setSubcategories(altRes);
        } else {
          setSubcategories([]);
        }
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      // Try fallback method
      try {
        const fallbackRes = await API.request('/api/student/subcategories');
        if (fallbackRes && Array.isArray(fallbackRes)) {
          const filteredSubcategories = fallbackRes.filter(sub => sub.category === categoryId);
          setSubcategories(filteredSubcategories);
        } else {
          setSubcategories([]);
        }
      } catch (fallbackErr) {
        console.error('Fallback subcategories fetch failed:', fallbackErr);
        setSubcategories([]);
      }
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  const fetchQuizzes = async (pageNum) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.request(`/api/student/quizzes/level-based?category=${categoryId}&page=${pageNum}&limit=9`);
      if (res.success) {
        setQuizzes(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setError('Failed to load quizzes');
      }
    } catch (err) {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCategory(),
      fetchSubcategories(),
      fetchQuizzes(1)
    ]);
    setPage(1);
    setRefreshing(false);
  };

  const handleSubcategoryClick = (subcategoryId) => {
    navigation.navigate('SubcategoryDetail', { subcategoryId });
  };

  const handleQuizClick = (quizId) => {
    const quiz = quizzes.find(q => q._id === quizId);
    if (user?.subscriptionStatus === 'free' && quiz?.isPremium) {
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
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleConfirmQuizStart = () => {
    setShowQuizModal(false);
    if (selectedQuiz) {
      // Store navigation data like Next.js pattern
      navigation.navigate('AttemptQuiz', { 
        quiz: selectedQuiz,
        fromPage: 'category',
        categoryId: categoryId
      });
    }
  };

  const handleCancelQuizStart = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
  };

  const renderSubcategoryItem = (subcategory) => (
    <TouchableOpacity
      key={subcategory._id}
      style={[styles.subcategoryItem, { backgroundColor: colors.surface }]}
      onPress={() => handleSubcategoryClick(subcategory._id)}
    >
      <View style={styles.subcategoryContent}>
        <View style={styles.subcategoryIconContainer}>
          <Icon name="folder" size={24} color="white" />
        </View>
        <View style={styles.subcategoryInfo}>
          <Text style={[styles.subcategoryName, { color: colors.text }]}>
            {subcategory.name}
          </Text>
          <Text style={[styles.subcategoryDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {subcategory.description || 'Explore quizzes'}
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
      onPress={() => handleQuizClick(quiz._id)}
    >
      <View style={styles.quizContent}>
        <View style={styles.quizHeader}>
          <Text style={[styles.quizTitle, { color: colors.text }]} numberOfLines={2}>
            {quiz.title}
            {quiz.isRecommended && <Icon name="star" size={16} color={colors.warning} />}
          </Text>
        </View>

        {quiz.description && (
          <Text style={[styles.quizDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {quiz.description}
          </Text>
        )}

        <View style={styles.quizStats}>
          <View style={styles.quizStat}>
            <Icon name="schedule" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizStatText, { color: colors.textSecondary }]}>
              {quiz.timeLimit || 30} min
            </Text>
          </View>
          
          <View style={styles.quizStat}>
            <Icon name="quiz" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizStatText, { color: colors.textSecondary }]}>
              {quiz.totalMarks || 'Variable'} Qs
            </Text>
          </View>

          <View style={styles.quizStat}>
            <Icon name="layers" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizStatText, { color: colors.textSecondary }]}>
              Level {quiz.requiredLevel}
            </Text>
          </View>
        </View>

        {quiz.difficulty && (
          <View style={[styles.difficultyBadge, { backgroundColor: colors.warning + '20' }]}>
            <Text style={[styles.difficultyText, { color: colors.warning }]}>
              {quiz.difficulty}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.startQuizButton, { backgroundColor: colors.primary }]}
          onPress={() => handleQuizClick(quiz._id)}
        >
          <Text style={styles.startQuizText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (!categoryId) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title="Category"
          showBackButton={true}
          
          onBackPress={() => navigation.goBack()}
          
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
          title={category?.name || "Category"}
          showBackButton={true}
          
          onBackPress={() => navigation.goBack()}
          
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
        title={category?.name || "Category"}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Category Name and Description */}
        {category && (
          <LinearGradient
            colors={['#F59E0B', '#EF4444', '#DC2626']}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{category.name}</Text>
              {category.description && (
                <Text style={styles.heroSubtitle} numberOfLines={3}>
                  {category.description}
                </Text>
              )}
              <View style={styles.heroTags}>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>Explore Quizzes</Text>
                </View>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>Learn & Grow</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Subcategories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              <Icon name="folder" size={20} color={colors.error} /> Subcategories ({subcategories?.length})
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={[styles.backButton, { backgroundColor: colors.primary }]}
            >
              <Icon name="arrow-back" size={16} color="white" />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>

          {subcategoriesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.error} />
            </View>
          ) : subcategories.length === 0 ? (
            <Card style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No subcategories found for this category.
              </Text>
            </Card>
          ) : (
            <View style={styles.subcategoriesGrid}>
              {subcategories.map(renderSubcategoryItem)}
            </View>
          )}
        </View>

        {/* Quizzes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            <Icon name="star" size={20} color={colors.warning} /> Quizzes ({quizzes.length})
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.error} />
            </View>
          ) : error ? (
            <Card style={[styles.errorState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </Card>
          ) : quizzes.length === 0 ? (
            <Card style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No quizzes found for this category.
              </Text>
            </Card>
          ) : (
            <>
              <View style={styles.quizzesGrid}>
                {quizzes.map(renderQuizItem)}
              </View>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    onPress={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={[styles.paginationButton, { backgroundColor: colors.surface }]}
                  >
                    <Text style={[styles.paginationText, { color: colors.text }]}>Prev</Text>
                  </TouchableOpacity>
                  
                  {[...Array(totalPages)].map((_, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setPage(idx + 1)}
                      style={[
                        styles.paginationButton,
                        { 
                          backgroundColor: page === idx + 1 ? colors.warning : colors.surface 
                        }
                      ]}
                    >
                      <Text style={[
                        styles.paginationText,
                        { color: page === idx + 1 ? 'white' : colors.text }
                      ]}>
                        {idx + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  
                  <TouchableOpacity
                    onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={[styles.paginationButton, { backgroundColor: colors.surface }]}
                  >
                    <Text style={[styles.paginationText, { color: colors.text }]}>Next</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <QuizStartModal
        visible={showQuizModal}
        quiz={selectedQuiz}
        onClose={handleCancelQuizStart}
        onConfirm={handleConfirmQuizStart}
      />
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
  
  // Hero Section
  heroSection: {
    padding: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroTags: {
    flexDirection: 'row',
    gap: 16,
  },
  heroTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroTagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Section Styles
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Loading and Empty States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorState: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 16,
  },

  // Subcategories Grid
  subcategoriesGrid: {
    gap: 12,
  },
  subcategoryItem: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  subcategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  subcategoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subcategoryInfo: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subcategoryDescription: {
    fontSize: 14,
    marginBottom: 8,
  },

  // Quizzes Grid
  quizzesGrid: {
    gap: 12,
  },
  quizItem: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  quizContent: {
    padding: 16,
  },
  quizHeader: {
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  quizStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  quizStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  startQuizButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  startQuizText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CategoryDetailScreen;