import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import { showMessage } from 'react-native-flash-message';

const SubcategoryDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const [subcategory, setSubcategory] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const subcategoryId = route.params?.subcategoryId;

  useEffect(() => {
    console.log('SubcategoryDetailScreen useEffect - subcategoryId:', subcategoryId);
    if (!subcategoryId) {
      console.log('No subcategoryId found, going back');
      navigation.goBack();
      return;
    }
    fetchSubcategory();
    fetchQuizzes(page);
  }, [subcategoryId, page]);

  const fetchSubcategory = async () => {
    try {
      console.log('Fetching subcategory for subcategoryId:', subcategoryId);
      // Try to get subcategory from API
      const response = await API.request('/api/student/subcategories');
      console.log('All subcategories:', response);
      if (response && Array.isArray(response)) {
        const found = response.find(sub => sub._id === subcategoryId);
        console.log('Found subcategory:', found);
        setSubcategory(found || null);
      } else {
        setSubcategory(null);
      }
    } catch (error) {
      console.error('Error fetching subcategory:', error);
      setSubcategory(null);
    }
  };

  const fetchQuizzes = async (currentPage = 1) => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching quizzes for page:', currentPage, 'subcategory:', subcategoryId);
      const res = await API.request(`/api/student/quizzes/level-based?subcategory=${subcategoryId}&page=${currentPage}&limit=9`);
      console.log('Quizzes response:', res);
      if (res.success) {
        setQuizzes(res.data);
        setTotalPages(res.pagination.totalPages);
      } else {
        setError('Failed to load quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchSubcategory();
    await fetchQuizzes(1);
  };

  const handleQuizClick = (quiz) => {
    navigation.navigate('Quiz', { quizId: quiz._id });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return colors.textSecondary;
    }
  };

  const renderQuizCard = (quiz) => (
    <TouchableOpacity
      key={quiz._id}
      onPress={() => handleQuizClick(quiz)}
      style={[styles.quizCard, { backgroundColor: colors.surface }]}
    >
      <View style={styles.quizContent}>
        <View style={styles.quizHeader}>
          <Text style={[styles.quizTitle, { color: colors.text }]} numberOfLines={2}>
            {quiz.title}
            {quiz.isRecommended && <Icon name="star" size={16} color="#F59E0B" style={{ marginLeft: 8 }} />}
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
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quiz.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(quiz.difficulty) }]}>
              {quiz.difficulty}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.startQuizButton} onPress={() => handleQuizClick(quiz)}>
          <Text style={styles.startQuizText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && quizzes.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Icon name="quiz" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading quizzes...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={subcategory?.name || "Subcategory"}
        showMenuButton={false}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        {subcategory && (
          <LinearGradient
            colors={colors.isDark ? ['#1F2937', '#374151', '#4B5563'] : ['#92400E', '#C2410C', '#DC2626']}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{subcategory.name}</Text>
              {subcategory.category && (
                <Text style={styles.heroSubtitle}>
                  Category: {subcategory.category.name}
                </Text>
              )}
              {subcategory.description && (
                <Text style={styles.heroDescription}>{subcategory.description}</Text>
              )}
              <View style={styles.heroTags}>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>Take Quizzes</Text>
                </View>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>Test Knowledge</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Loading quizzes...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorState}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : quizzes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="quiz" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No quizzes found for this subcategory.
              </Text>
            </View>
          ) : (
            <>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Icon name="quiz" size={24} color="#EF4444" />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Quizzes ({quizzes.length})
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Icon name="arrow-back" size={20} color="white" />
                  <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>

              {/* Quizzes Grid */}
              <View style={styles.quizzesGrid}>
                {quizzes.map(renderQuizCard)}
              </View>

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
                    onPress={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <Text style={[styles.paginationText, page === 1 && styles.paginationTextDisabled]}>
                      Prev
                    </Text>
                  </TouchableOpacity>
                  
                  {[...Array(totalPages)].map((_, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.paginationButton,
                        page === idx + 1 && styles.paginationButtonActive
                      ]}
                      onPress={() => setPage(idx + 1)}
                    >
                      <Text style={[
                        styles.paginationText,
                        page === idx + 1 && styles.paginationTextActive
                      ]}>
                        {idx + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  
                  <TouchableOpacity
                    style={[styles.paginationButton, page === totalPages && styles.paginationButtonDisabled]}
                    onPress={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    <Text style={[styles.paginationText, page === totalPages && styles.paginationTextDisabled]}>
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
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
  scrollView: {
    flex: 1,
  },
  
  // Hero Section
  heroSection: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FEF3C7',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 16,
    color: '#FEF3C7',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  heroTags: {
    flexDirection: 'row',
    gap: 16,
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroTagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Content
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading & Error States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },

  // Quizzes Grid
  quizzesGrid: {
    gap: 16,
    marginBottom: 20,
  },
  quizCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  quizContent: {
    padding: 16,
  },
  quizHeader: {
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  quizStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  quizStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quizStatText: {
    fontSize: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  startQuizButton: {
    backgroundColor: '#EF4444',
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
    gap: 8,
    marginTop: 20,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  paginationButtonActive: {
    backgroundColor: '#EF4444',
  },
  paginationButtonDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  paginationTextActive: {
    color: 'white',
  },
  paginationTextDisabled: {
    color: '#9CA3AF',
  },
});

export default SubcategoryDetailScreen;