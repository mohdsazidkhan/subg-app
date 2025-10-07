import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
// Ensure there are no named or duplicate imports for Card or TopBar


const PublicQuestionsScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, [page, searchTerm]);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await API.getPublicUserQuestions(params);

      if (response?.success) {
        const newQuestions = response.data || [];

        if (page === 1) {
          setQuestions(newQuestions);
        } else {
          setQuestions(prev => [...prev, ...newQuestions]);
        }

        setTotal(response.pagination?.total || 0);
        setHasMore(newQuestions.length === 20);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      showMessage({
        message: 'Failed to load questions',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadQuestions();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    setPage(1);
  };

  const handleAnswer = async (question, selectedIndex) => {
    if (typeof question.selectedOptionIndex === 'number') return;

    // Immediately show visual feedback
    setQuestions(prev =>
      prev.map(q =>
        q._id === question._id
          ? { ...q, selectedOptionIndex: selectedIndex, isAnswered: true }
          : q
      )
    );

    try {
      await API.answerUserQuestion(question._id, selectedIndex);
      showMessage({
        message: 'Answer submitted successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
      showMessage({
        message: 'Failed to submit answer',
        type: 'danger',
      });

      // Revert the visual feedback on error
      setQuestions(prev =>
        prev.map(q =>
          q._id === question._id
            ? { ...q, selectedOptionIndex: undefined, isAnswered: false }
            : q
        )
      );
    }
  };

  const handleLike = async (question) => {
    try {
      const response = await API.likeUserQuestion(question._id);
      if (response?.data?.firstTime) {
        setQuestions(prev =>
          prev.map(q =>
            q._id === question._id
              ? { ...q, likesCount: (q.likesCount || 0) + 1, isLiked: true }
              : q
          )
        );
      }
    } catch (error) {
      console.error('Failed to like question:', error);
    }
  };

  const handleShare = async (question) => {
    try {
      await API.shareUserQuestion(question._id);
      showMessage({
        message: 'Question shared successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to share question:', error);
    }
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

  const renderQuestion = (question) => (
    <Card key={question._id} style={[styles.questionCard, { backgroundColor: colors.surface }]}>
      <View style={styles.questionHeader}>
        <View style={styles.questionMeta}>
          <Text style={[styles.questionCategory, { color: colors.primary }]}>
            {question.category?.name || ''}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(question.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(question.difficulty) }]}>
              {question.difficulty}
            </Text>
          </View>
        </View>

        <View style={styles.questionStats}>
          <View style={styles.statItem}>
            <Icon name="visibility" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{question.viewsCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="reply" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{question.answersCount || 0}</Text>
          </View>
          <TouchableOpacity style={styles.statItem} onPress={() => handleLike(question)}>
            <Icon
              name={question.isLiked ? "favorite" : "favorite-border"}
              size={14}
              color={question.isLiked ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{question.likesCount}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.questionText, { color: colors.text }]}>
        {question.question}
      </Text>

      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const isSelected = question.selectedOptionIndex === index;
          const isCorrect = index === question.correctAnswer;
          const isWrong = isSelected && !isCorrect;
          const showFeedback = question.isAnswered && isSelected;
          const showCorrectAnswer = question.isAnswered && !isSelected && isCorrect;

          let backgroundColor = colors.background;
          let borderColor = colors.border;
          let borderWidth = 1;

          if (showFeedback) {
            if (isCorrect) {
              backgroundColor = '#4CAF50';
              borderColor = '#4CAF50';
              borderWidth = 2;
            } else if (isWrong) {
              backgroundColor = '#F44336';
              borderColor = '#F44336';
              borderWidth = 2;
            }
          } else if (showCorrectAnswer) {
            backgroundColor = '#4CAF50';
            borderColor = '#4CAF50';
            borderWidth = 2;
          } else if (isSelected) {
            backgroundColor = colors.primary + '20';
            borderColor = colors.primary;
            borderWidth = 2;
          }

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                {
                  backgroundColor,
                  borderColor,
                  borderWidth,
                },
              ]}
              onPress={() => handleAnswer(question, index)}
              disabled={question.isAnswered}
            >
              <View
                style={[
                  styles.optionIndicator,
                  {
                    backgroundColor: (showFeedback || showCorrectAnswer)
                      ? (isCorrect ? '#4CAF50' : '#F44336')
                      : (isSelected ? colors.primary : colors.border)
                  },
                ]}
              >
                {(showFeedback || showCorrectAnswer) && isCorrect && (
                  <Icon name="check" size={16} color="white" />
                )}
                {showFeedback && isWrong && (
                  <Icon name="close" size={16} color="white" />
                )}
                {!showFeedback && !showCorrectAnswer && isSelected && (
                  <Icon name="check" size={16} color="white" />
                )}
              </View>

              <Text style={[
                styles.optionText,
                {
                  color: (showFeedback || showCorrectAnswer)
                    ? 'white'
                    : (isSelected ? colors.primary : colors.text)
                },
              ]}>
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {question.isAnswered && question.explanation && (
        <View style={[styles.explanationContainer, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.explanationTitle, { color: colors.primary }]}>Explanation</Text>
          <Text style={[styles.explanationText, { color: colors.text }]}>
            {question.explanation}
          </Text>
        </View>
      )}

      <View style={styles.questionFooter}>
        <View style={styles.authorInfo}>
          <Icon name="person" size={14} color={colors.textSecondary} />
          <Text style={[styles.authorText, { color: colors.textSecondary }]}>
            {question.author?.name || 'Anonymous'}
          </Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {new Date(question.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={() => handleShare(question)}
        >
          <Icon name="share" size={16} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Community Questions"
        showMenuButton={true}
        showLanguageToggle={true}
        showThemeToggle={true}
        onMenuPress={() => navigation.navigate('MainTabs', { screen: 'More' })}
        onLanguageToggle={handleLanguageToggle}
        onThemeToggle={toggleTheme}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search questions..."
          placeholderTextColor={colors.textSecondary}
          value={searchTerm}
          onChangeText={handleSearch}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="clear" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            🤔 Community Questions
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Answer questions from the community and test your knowledge
          </Text>
        </View>

        {/* Questions List */}
        {questions.length > 0 ? (
          <View style={styles.questionsList}>
            {questions.map(renderQuestion)}
          </View>
        ) : !loading ? (
          <View style={styles.emptyContainer}>
            <Icon name="quiz" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No questions found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to post a question!'}
            </Text>
          </View>
        ) : null}

        {/* Load More Button */}
        {hasMore && questions.length > 0 && (
          <TouchableOpacity
            style={[styles.loadMoreButton, { backgroundColor: colors.primary }]}
            onPress={() => setPage(prev => prev + 1)}
            disabled={loading}
          >
            <Text style={[styles.loadMoreText, { color: 'white' }]}>
              {loading ? 'Loading...' : 'Load More'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  questionsList: {
    paddingHorizontal: 16,
  },
  questionCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
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
  questionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    lineHeight: 20,
    flex: 1,
  },
  explanationContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadMoreButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PublicQuestionsScreen;