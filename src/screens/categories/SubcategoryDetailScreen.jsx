import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import { showMessage } from 'react-native-flash-message';
import QuizStartModal from '../../components/QuizStartModal';

const SubcategoryDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [headerNames, setHeaderNames] = useState({ subcategoryName: '', categoryName: '' });
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [startModalQuiz, setStartModalQuiz] = useState(null);

  const subcategoryId = route.params?.subcategoryId || '';
  const subcategory = route.params?.subCategory || '';
  console.log(subcategory, 'subcategory')

  useEffect(() => {
    fetchQuizzes();
  }, [subcategoryId]);

  const fetchQuizzes = async (currentPage = 1) => {
    try {
      setLoading(true);
      if (currentPage === 1) {
        const response = await API.getLevelBasedQuizzes({
          subcategory: subcategoryId,
          page: currentPage,
          limit: 20,
        });
        if (response.success) {
          const list = response.data || [];
          setQuizzes(list);
          setHasMore(response.pagination?.hasNextPage || false);
          if (list.length > 0) {
            const first = list[0];
            setHeaderNames({
              subcategoryName: first?.subcategory?.name || headerNames.subcategoryName || subcategory?.name || '',
              categoryName: first?.category?.name || headerNames.categoryName || '',
            });
          }
        } else {
          showMessage({
            message: 'Failed to load quizzes',
            type: 'danger',
          });
        }
      }
    } catch (error) {
      showMessage({
        message: 'Error fetching quizzes',
        type: 'danger',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchQuizzes(1);
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleQuizPress = (quiz) => {
    navigation.navigate('AttemptQuiz', { quiz: { _id: quiz._id, name: quiz.title || quiz.name, timeLimit: quiz.timeLimit } });
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

  const getQuestionsCount = (quiz) => {
    if (typeof quiz.questionCount === 'number') return quiz.questionCount;
    if (typeof quiz.questionsCount === 'number') return quiz.questionsCount;
    if (typeof quiz.totalMarks === 'number') return quiz.totalMarks;
    if (Array.isArray(quiz.questions)) return quiz.questions.length;
    return 0;
  };

  const renderQuizCard = (quiz) => (
    <TouchableOpacity
      key={quiz._id}
      onPress={() => handleQuizPress(quiz)}
    >
      <Card style={[styles.quizCard, { backgroundColor: colors.surface }]}>
        <View style={styles.quizHeader}>
          <Text
            style={[styles.quizTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {quiz.title}
          </Text>
          <View style={styles.quizScore}>
            {quiz.bestScore && (
              <Text style={[styles.bestScoreText, { color: colors.primary }]}>
                Best: {quiz.bestScore}%
              </Text>
            )}
            {quiz.isCompleted && (
              <Icon name="check-circle" size={20} color={colors.success} />
            )}
          </View>
        </View>

        {quiz.description && (
          <Text
            style={[styles.quizDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {quiz.description}
          </Text>
        )}

        <View style={styles.quizInfo}>
          <View style={styles.quizInfoItem}>
            <Icon name="schedule" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizInfoText, { color: colors.textSecondary }]}>
              {quiz.timeLimit || 30}m
            </Text>
          </View>

          <View style={styles.quizInfoItem}>
            <Icon name="quiz" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizInfoText, { color: colors.textSecondary }]}>
              {getQuestionsCount(quiz)} Q
            </Text>
          </View>

          {quiz.difficulty && (
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(quiz.difficulty) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(quiz.difficulty) },
                ]}
              >
                {quiz.difficulty}
              </Text>
            </View>
          )}
        </View>
        <View
  style={{
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 8,
    paddingHorizontal: 10,
    gap: 8,
  }}
>
  <View
    style={{
      backgroundColor: '#FFE083', // soft yellow for category
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 4,
    }}
  >
    <Text style={{ fontSize: 12, color: '#4A3F00', fontWeight: '600' }}>
      {quiz.category?.name || 'N/A'}
    </Text>
  </View>

  <View
    style={{
      backgroundColor: '#C5F3C1', // light green for subcategory
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 4,
    }}
  >
    <Text style={{ fontSize: 12, color: '#1B4D1B', fontWeight: '600' }}>
      {quiz.subcategory?.name || subcategory?.name || 'N/A'}
    </Text>
  </View>
</View>


        <View style={{ marginTop: 10 }}>
          <TouchableOpacity onPress={() => setStartModalQuiz(quiz)} style={{ backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </Card>
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
        title={subcategory?.name}
        showBackButton={true}
        showMenuButton={false}
        showLanguageToggle={true}
        onLanguageToggle={handleLanguageToggle}
        onBackPress={() => navigation.goBack()}
      />
 
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {subcategory && (
          <View style={[styles.headerSection, { backgroundColor: colors.surface }]}> 
            {subcategory.description && (
              <Text style={[styles.subcategoryDescription, { color: colors.textSecondary }]}> 
                {subcategory.description}
              </Text>
            )}
          </View>
        )}
 
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}> 
            {t('navigation.quizzes')} ({quizzes.length})
          </Text>
 
          {quizzes.length > 0 ? (
            quizzes.map(renderQuizCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="quiz" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}> 
                {t('home.noQuizzes')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <QuizStartModal
        visible={!!startModalQuiz}
        quiz={startModalQuiz}
        onClose={() => setStartModalQuiz(null)}
        onConfirm={() => {
          const q = startModalQuiz;
          setStartModalQuiz(null);
          handleQuizPress(q);
        }}
      />
    </View>
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
  scrollView: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
    marginBottom: 16,
  },
  subcategoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subcategoryDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  quizCard: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  quizScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestScoreText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  quizDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  quizInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizInfoText: {
    fontSize: 12,
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
});

export default SubcategoryDetailScreen;