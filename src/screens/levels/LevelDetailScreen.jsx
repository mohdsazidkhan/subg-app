import React, { useState, useEffect, useCallback } from 'react';
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

const levels = [
  { level: 0, name: 'Starter', desc: 'Just registered - Start your journey!', quizzes: 0, plan: 'Free', amount: 0, prize: 0, color: ['#D1D5DB', '#9CA3AF'], icon: 'school' },
  { level: 1, name: 'Rookie', desc: 'Begin your quiz journey', quizzes: 4, plan: 'Free', amount: 0, prize: 0, color: ['#86EFAC', '#4ADE80'], icon: 'star' },
  { level: 2, name: 'Explorer', desc: 'Discover new challenges', quizzes: 12, plan: 'Free', amount: 0, prize: 0, color: ['#93C5FD', '#60A5FA'], icon: 'rocket-launch' },
  { level: 3, name: 'Thinker', desc: 'Develop critical thinking', quizzes: 24, plan: 'Free', amount: 0, prize: 0, color: ['#C4B5FD', '#A78BFA'], icon: 'psychology' },
  { level: 4, name: 'Strategist', desc: 'Master quiz strategies', quizzes: 40, plan: 'Basic', amount: 9, prize: 0, color: ['#FDE047', '#FACC15'], icon: 'trending-up' },
  { level: 5, name: 'Achiever', desc: 'Reach new heights', quizzes: 60, plan: 'Basic', amount: 9, prize: 0, color: ['#FDBA74', '#FB923C'], icon: 'emoji-events' },
  { level: 6, name: 'Mastermind', desc: 'Become a quiz expert', quizzes: 84, plan: 'Basic', amount: 9, prize: 0, color: ['#FCA5A5', '#F87171'], icon: 'diamond' },
  { level: 7, name: 'Champion', desc: 'Compete with the best', quizzes: 112, plan: 'Premium', amount: 49, prize: 0, color: ['#F9A8D4', '#F472B6'], icon: 'workspace-premium' },
  { level: 8, name: 'Prodigy', desc: 'Show exceptional talent', quizzes: 144, plan: 'Premium', amount: 49, prize: 0, color: ['#A5B4FC', '#818CF8'], icon: 'auto-awesome' },
  { level: 9, name: 'Wizard', desc: 'Complex questions across categories', quizzes: 180, plan: 'Premium', amount: 49, prize: 0, color: ['#F87171', '#EF4444'], icon: 'auto-fix-high' },
  { level: 10, name: 'Legend', desc: 'Ultimate quiz mastery', quizzes: 220, plan: 'Pro', amount: 99, prize: 9999, color: ['#FDE047', '#EF4444'], icon: 'celebration' }
];

const LevelDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const levelNumber = route.params?.levelNumber;
  const level = levels.find(lvl => lvl.level === Number(levelNumber));

  useEffect(() => {
    console.log('LevelDetailScreen useEffect - levelNumber:', levelNumber);
    if (!levelNumber) {
      console.log('No levelNumber found, going back');
      navigation.goBack();
      return;
    }
    if (level) {
      // Reset state when level changes
      setQuizzes([]);
      setPage(1);
      setHasMore(true);
      setError('');
      fetchQuizzes(); // Initial load
    }
  }, [level, levelNumber]);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching quizzes for level:', levelNumber, 'page:', 1);
      const res = await API.getLevelBasedQuizzes({ level: levelNumber, page: 1, limit: 10 });
      console.log('Quizzes response:', res);
      if (res.success) {
        setQuizzes(res.data);
        setHasMore(res.pagination?.hasNextPage || false);
      } else {
        setError('Failed to load quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [levelNumber]);

  const loadMoreQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const nextPage = page + 1;
      console.log('Loading more quizzes - Current page:', page, 'Next page:', nextPage);
      const res = await API.getLevelBasedQuizzes({ level: levelNumber, page: nextPage, limit: 10 });
      if (res.success) {
        console.log('New quizzes received:', res.data.length);
        // Append new quizzes to existing ones
        setQuizzes(prevQuizzes => {
          console.log('Previous quizzes count:', prevQuizzes.length);
          const newQuizzes = [...prevQuizzes, ...res.data];
          console.log('Total quizzes after append:', newQuizzes.length);
          return newQuizzes;
        });
        setPage(nextPage);
        setHasMore(res.pagination?.hasNextPage || false);
      } else {
        setError('Failed to load more quizzes');
      }
    } catch (err) {
      console.error('Error loading more quizzes:', err);
      setError('Failed to load more quizzes');
    } finally {
      setLoading(false);
    }
  }, [levelNumber, page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchQuizzes();
    setRefreshing(false);
  };

  const handleQuizClick = (quiz) => {
    navigation.navigate('Quiz', { quizId: quiz._id });
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

  const getLevelIcon = (levelNumber) => {
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
      'celebration'
    ];
    return icons[levelNumber - 1] || 'star';
  };

  const renderQuizCard = (quiz, index) => (
    <TouchableOpacity
      key={quiz._id}
      style={[styles.quizCard, { backgroundColor: colors.surface }]}
      onPress={() => handleQuizClick(quiz)}
    >
      <View style={styles.quizContent}>
        <View style={styles.quizHeader}>
          <View style={styles.quizTitleContainer}>
            <View style={styles.serialNumber}>
              <Text style={styles.serialNumberText}>{index + 1}</Text>
            </View>
            <Text style={[styles.quizTitle, { color: colors.text }]} numberOfLines={2}>
              {quiz.title}
            </Text>
          </View>
        </View>
        
        {quiz.description && (
          <Text style={[styles.quizDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {quiz.description}
          </Text>
        )}
        
        <View style={styles.quizStats}>
          <View style={styles.quizStat}>
            <Icon name="quiz" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizStatText, { color: colors.textSecondary }]}>
              {quiz.questionCount || 0} Q's
            </Text>
          </View>
          
          <View style={styles.quizStat}>
            <Icon name="layers" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizStatText, { color: colors.textSecondary }]}>
              {quiz.category?.name || 'N/A'}
            </Text>
          </View>

          <View style={styles.quizStat}>
            <Icon name="format-list-numbered" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizStatText, { color: colors.textSecondary }]}>
              {quiz.totalMarks || 'N/A'} Marks
            </Text>
          </View>

          <View style={styles.quizStat}>
            <Icon name="schedule" size={14} color={colors.textSecondary} />
            <Text style={[styles.quizStatText, { color: colors.textSecondary }]}>
              {quiz.timeLimit} Mins.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startQuizButton} onPress={() => handleQuizClick(quiz)}>
          <Text style={styles.startQuizText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title="Level Details"
          showBackButton={true}
          
          onBackPress={() => navigation.goBack()}
          
        />
        <Icon name="star" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  if (!level) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar
          title="Level Not Found"
          showMenuButton={false}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.centerContent}>
          <Icon name="error" size={60} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Level not found
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={`Level ${levelNumber}`}
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
        {/* Level Header */}
        <View style={[styles.levelHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.levelHeaderContent}>
            <LinearGradient
              colors={level.color}
              style={styles.levelIconContainer}
            >
              <Icon name={level.icon} size={32} color="white" />
            </LinearGradient>
            <Text style={[styles.levelTitle, { color: colors.text }]}>
              Level {levelNumber} - {level.name}
            </Text>
            <Text style={[styles.levelDescription, { color: colors.textSecondary }]}>
              {level.desc}
            </Text>
            
            <View style={styles.levelStats}>
              <View style={[styles.levelStatItem, { backgroundColor: colors.background }]}>
                <Text style={[styles.levelStatValue, { color: '#F59E0B' }]}>{level.quizzes}</Text>
                <Text style={[styles.levelStatLabel, { color: colors.textSecondary }]}>Quizzes</Text>
              </View>
              <View style={[styles.levelStatItem, { backgroundColor: colors.background }]}>
                <Text style={[styles.levelStatValue, { color: '#10B981' }]}>{level.plan}</Text>
                <Text style={[styles.levelStatLabel, { color: colors.textSecondary }]}>Plan</Text>
              </View>
              <View style={[styles.levelStatItem, { backgroundColor: colors.background }]}>
                <Text style={[styles.levelStatValue, { color: '#EF4444' }]}>₹{level.amount}</Text>
                <Text style={[styles.levelStatLabel, { color: colors.textSecondary }]}>Amount</Text>
              </View>
              <View style={[styles.levelStatItem, { backgroundColor: colors.background }]}>
                <Text style={[styles.levelStatValue, { color: '#F59E0B' }]}>₹{level.prize}</Text>
                <Text style={[styles.levelStatLabel, { color: colors.textSecondary }]}>Prize</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quizzes Section */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Level {levelNumber} Quizzes
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={20} color="white" />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F59E0B" />
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
                No quizzes available for this level yet.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.quizzesGrid}>
                {quizzes.map((quiz, index) => renderQuizCard(quiz, index))}
              </View>
              
              {/* Load More Button */}
              {hasMore && (
                <View style={styles.loadMoreContainer}>
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={loadMoreQuizzes}
                    disabled={loading}
                  >
                    <Text style={styles.loadMoreText}>
                      {loading ? 'Loading...' : 'Load More (10 quizzes)'}
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  
  // Level Header
  levelHeader: {
    padding: 20,
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeaderContent: {
    alignItems: 'center',
  },
  levelIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  levelStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  levelStatItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  levelStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelStatLabel: {
    fontSize: 12,
    textAlign: 'center',
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
  quizTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serialNumber: {
    backgroundColor: '#F59E0B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serialNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
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

  // Load More
  loadMoreContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadMoreButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LevelDetailScreen;