import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
  const [query, setQuery] = useState(''); // committed search like web
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Load questions function
  const loadQuestions = async() => {
    if (loading) return; // Prevent multiple simultaneous loads
    
    setLoading(true);
    try {
      // If no search query, fetch all default questions. If search query exists, fetch filtered questions
      const params = { 
        page, 
        limit: 20, 
        search: query.trim() || "" 
      };
      const response = await API.getPublicUserQuestions(params);
      
      if (response?.success) {
        let newQuestions = response.data || [];

        // Reset questions list on page 1, append on subsequent pages
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
  }

  // Load default questions on mount and when page or search query changes
  useEffect(() => {
    loadQuestions();
  }, [page, query]);

  // Reload questions when screen comes into focus (useful for tab navigation)
  useEffect(() => {
    loadQuestions();
  }, [])
  

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
  };

  const submitSearch = () => {
    // Reset to page 1 and set the search query
    setPage(1);
    setQuery(searchTerm.trim());
  };

  const clearSearch = () => {
    // Clear search and reset to default questions
    setSearchTerm('');
    setQuery('');
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
      setQuestions(prev => prev.map(q => q._id === question._id ? { ...q, sharesCount: (q.sharesCount || 0) + 1 } : q));
    } catch (error) {
      console.error('Failed to share question:', error);
    }
  };

  console.log(questions, 'questions')
  const renderQuestion = (question, index) => (
    <Card key={question._id} style={[styles.questionCard, { backgroundColor: colors.surface }]}> 

      {/* Username / author handle */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <TouchableOpacity
          onPress={() => {
            const username = question.userId?.username || question.author?.username || question.user?.username;
            if (username) {
              navigation.navigate('PublicProfile', { username });
            }
          }}
          style={{ flexDirection: 'row', justifyContent: 'space-start', alignItems: 'center'}}
          activeOpacity={0.8}
        >
          <View style={[styles.userAvator]}>
            <Text style={{ color: "white", fontWeight: '600' }}>
              {question.userId?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              @{question.userId?.username || question.author?.username || question.user?.username || 'user'}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {question.userId?.level?.levelName ? `Level ${question.userId.level.levelName}` : ''}
            </Text>
          </View>
        </TouchableOpacity>
        
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {new Date(question.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Text style={[styles.questionText, { color: colors.text }]}> 
        <Text style={{ color: colors.warning, fontWeight: 'bold' }}>#{(index + 1)}</Text> {question.questionText || question.question}
      </Text>

      <View style={styles.optionsContainer}>
        {question.options.map((option, optIndex) => {
          const isSelected = question.selectedOptionIndex === optIndex;
          const isCorrect = optIndex === question.correctAnswer;
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
              key={optIndex}
              style={[
                styles.optionButton,
                {
                  backgroundColor,
                  borderColor,
                  borderWidth,
                },
              ]}
              onPress={() => handleAnswer(question, optIndex)}
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
                {String.fromCharCode(65 + optIndex)}. {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.questionFooter}>
      
          <View style={[styles.actionButton,{backgroundColor: colors.background}]}>
            <Icon name="visibility" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{question.viewsCount}</Text>
          </View>
          <View style={[styles.actionButton,{backgroundColor: colors.background}]}>
            <Icon name="reply" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{question.answersCount || 0}</Text>
          </View>
          <TouchableOpacity style={[styles.actionButton,{backgroundColor: colors.background,}]} onPress={() => handleLike(question)}>
            <Icon
              name={question.isLiked ? "favorite" : "favorite-border"}
              size={14}
              color={question.isLiked ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>{question.likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={() => handleShare(question)}
        >
          <Icon name="share" size={16} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>Share {question.sharesCount || 0}</Text>
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
          returnKeyType="search"
          onSubmitEditing={submitSearch}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Icon name="clear" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={submitSearch} style={[styles.searchBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* Loading Indicator */}
        {loading && questions.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 10 }]}>
              {query ? 'Searching questions...' : 'Loading questions...'}
            </Text>
          </View>
        )}

        {/* Questions List */}
        {!loading && questions.length > 0 && (
          <View style={styles.questionsList}>
            {questions.map((q, i) => renderQuestion(q, i))}
          </View>
        )}

        {/* Empty State */}
        {!loading && questions.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="quiz" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No questions found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {query ? 'Try adjusting your search terms' : 'Be the first to post a question!'}
            </Text>
          </View>
        )}

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
    marginHorizontal: 10,
    marginVertical: 10,
    marginBottom: 0,
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
    paddingVertical: 10,
  },
  userAvator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    color: "white",
    fontWeight: "600",
    backgroundColor: "#F59E0B",
  },
  searchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  questionCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 5,
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
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 12,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
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