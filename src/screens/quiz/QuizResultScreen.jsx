import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Animated,
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
import { showMessage } from 'react-native-flash-message';

const LeaderboardTable = ({ leaderboard, currentUser, colors, isDark }) => {
  if (!leaderboard || leaderboard?.length === 0) {
    return (
      <View style={styles.leaderboardEmptyContainer}>
        <View style={[styles.leaderboardEmptyCard, { 
          backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2',
          borderColor: isDark ? '#991B1B' : '#FECACA'
        }]}>
          <Icon name="emoji-events" size={40} color="#EF4444" />
          <Text style={[styles.leaderboardEmptyTitle, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>
            No Leaderboard Yet
          </Text>
          <Text style={[styles.leaderboardEmptyText, { color: isDark ? '#F87171' : '#B91C1C' }]}>
            Be the first to complete this quiz and claim the top spot!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.leaderboardContainer}>
      <View style={styles.leaderboardHeader}>
        <View style={[styles.leaderboardIcon, { backgroundColor: '#F59E0B' }]}>
          <Icon name="emoji-events" size={24} color="white" />
        </View>
        <Text style={[styles.leaderboardTitle, { color: colors.text }]}>Leaderboard</Text>
      </View>

      {/* Mobile List View */}
      <View style={styles.mobileLeaderboard}>
        {leaderboard?.map(({ rank, studentName, studentId, score, attemptedAt }) => {

          const isCurrentUser = studentId === currentUser?._id;

          return (
            <View
              key={rank}
              style={[
                styles.leaderboardMobileCard,
                { 
                  backgroundColor: isCurrentUser 
                    ? (isDark ? '#333333' : '#FEF3C7')
                    : (isDark ? '#1F2937' : '#FFFFFF'),
                  borderColor: isCurrentUser 
                    ? '#F59E0B'
                    : (isDark ? '#374151' : '#E5E7EB')
                }
              ]}
            >
              <View style={styles.leaderboardMobileHeader}>
                  
                  <View style={[styles.leaderboardRankBadge, { backgroundColor: '#ccc' }]}>
                    <Text style={styles.leaderboardRankText}>{rank}</Text>
                  </View>
                  
                  <View style={styles.leaderboardStudentInfo}>
                    <View style={[styles.leaderboardStudentAvatar, { backgroundColor: '#F59E0B' }]}>
                      <Text style={styles.leaderboardStudentInitial}>
                        {studentName?.charAt(0)?.toUpperCase() || 'A'}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.leaderboardStudentName, { color: colors.text }]}>
                        {studentName || 'Anonymous'}
                      </Text>
                      {isCurrentUser && (
                        <Text style={[styles.leaderboardCurrentUserLabel, { color: '#F59E0B' }]}>
                          You
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.leaderboardScoreSection}>
                  <Text style={[styles.leaderboardScoreText, { color: colors.text }]}>
                    {score || 0}%
                  </Text>
                  <Text style={[styles.leaderboardScoreLabel, { color: colors.textSecondary }]}>
                    Score
                  </Text>
                </View>

                <View style={styles.leaderboardScoreSection}>
                  <Text style={[styles.leaderboardScoreText, { color: colors.text }]}>
                  {(() => {
                    try {
                      const date = new Date(attemptedAt);
                      if (isNaN(date.getTime())) return 'N/A';
                      return date.toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });
                    } catch (error) {
                      return 'N/A';
                    }
                  })()}
                  </Text>
                  <Text style={[styles.leaderboardScoreLabel, { color: colors.textSecondary }]}>
                  {(() => {
                    try {
                      const date = new Date(attemptedAt);
                      if (isNaN(date.getTime())) return 'N/A';
                      return date.toLocaleString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch (error) {
                      return 'N/A';
                    }
                  })()}
                  </Text>
                </View>
                </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const QuizResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [quizResult, setQuizResult] = useState(route.params?.result || null);
  const [quiz, setQuiz] = useState(route.params?.quiz || null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    console.log('QuizResult useEffect - quizResult:', quizResult);
    console.log('QuizResult useEffect - quiz:', quiz);
    console.log('QuizResult useEffect - route.params:', route.params);
    
    if (!quizResult) {
      // Navigate back if no result data
      navigation.goBack();
      return;
    }

    // Fetch leaderboard data
    fetchLeaderboard();
    
    // If quiz questions are not available, try to fetch them
    // Match Next.js approach: get quiz ID from quiz._id or quizResult.quiz._id
    const actualQuizId = quiz?._id || quizResult?.quiz?._id || quizResult?._id;
    
    if (quiz && (!quiz.questions || quiz.questions.length === 0) && actualQuizId) {
      console.log('Quiz questions not available, fetching details for quiz ID:', actualQuizId);
      // Update quiz with the correct ID if needed
      if (quiz._id !== actualQuizId) {
        setQuiz(prevQuiz => ({ ...prevQuiz, _id: actualQuizId }));
      }
      // Try to fetch quiz details with a small delay to ensure the component is fully mounted
      setTimeout(() => {
        fetchQuizDetails();
      }, 100);
    } else if (!actualQuizId) {
      console.log('No quiz ID available, skipping quiz details fetch');
    } else if (quiz.questions && quiz.questions.length > 0) {
      console.log('Quiz questions already available:', quiz.questions.length);
    }
    
    // Show confetti for high scores
    if (quizResult.scorePercentage >= 80) {
      setShowConfetti(true);
      Animated.timing(confettiAnimation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start();
    }
  }, [quizResult, quiz]);

  const fetchQuizDetails = async (retryCount = 0) => {
    try {
      // Get the actual quiz ID - match Next.js approach
      const actualQuizId = quiz?._id || quizResult?.quiz?._id || quizResult?._id || route.params?.quiz?._id;
      
      if (actualQuizId) {
        console.log(`Fetching quiz details for ID: ${actualQuizId} (attempt ${retryCount + 1})`);
        const quizDetails = await API.getQuizById(actualQuizId);
        console.log('Quiz details response:', quizDetails);
        
        if (quizDetails && quizDetails.questions) {
          console.log('Successfully fetched quiz details, questions count:', quizDetails.questions?.length);
          setQuiz(prevQuiz => ({
            ...prevQuiz,
            _id: actualQuizId, // Ensure we have the correct ID
            questions: quizDetails.questions || []
          }));
        } else {
          console.log('Quiz details fetch failed - no questions found');
          // Retry once if this is the first attempt
          if (retryCount === 0) {
            console.log('Retrying quiz details fetch...');
            setTimeout(() => fetchQuizDetails(1), 1000);
          }
        }
      } else {
        console.log('No quiz ID available for fetching details');
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      // Retry once if this is the first attempt
      if (retryCount === 0) {
        console.log('Retrying quiz details fetch after error...');
        setTimeout(() => fetchQuizDetails(1), 1000);
      }
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Get the actual quiz ID - match Next.js approach
      const actualQuizId = quiz?._id || quizResult?.quiz?._id || quizResult?._id || route.params?.quiz?._id;
      
      if (actualQuizId) {
        console.log('Fetching leaderboard for quiz ID:', actualQuizId);
        const response = await API.getQuizLeaderboard(actualQuizId);
        setLeaderboard(response.leaderboard || []);
      }
    } catch (error) {
      console.log('Leaderboard not available:', error);
      setLeaderboard([]);
    }
  };

  const getScoreEmoji = (percentage) => {
    if (percentage >= 75) return "🥇";
    if (percentage >= 50) return "🥈";
    return "🥉";
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 75) return "Excellent! Great job!";
    if (percentage >= 50) return "Good effort! Keep practicing!";
    return "Keep learning and try again!";
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 75) return '#F59E0B';
    if (percentage >= 50) return '#EF4444';
    return '#EF4444';
  };

  const calculatePerformance = () => {
    if (!quizResult) return { grade: 'F', message: 'Failed' };

    const percentage = (quizResult.score / quizResult.totalQuestions) * 100;

    if (percentage >= 90) return { grade: 'A', message: 'Excellent!' };
    if (percentage >= 80) return { grade: 'B', message: 'Good Job!' };
    if (percentage >= 70) return { grade: 'C', message: 'Not Bad!' };
    if (percentage >= 60) return { grade: 'D', message: 'Passed!' };
    return { grade: 'F', message: 'Keep Practicing!' };
  };

  const getPerformanceColor = () => {
    const percentage = (quizResult.score / quizResult.totalQuestions) * 100;
    if (percentage >= 80) return colors.success;
    if (percentage >= 60) return colors.warning;
    return colors.error;
  };

  if (!quizResult) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title="Quiz Result"
          showBackButton={true}
          
          onBackPress={navigation.goBack}
          
        />
        <Icon name="error" size={60} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          No quiz result found
        </Text>
      </View>
    );
  }

  const performance = calculatePerformance();
  const performanceColor = getPerformanceColor();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Quiz Result"
        showBackButton={true}
        
        onBackPress={navigation.goBack}
        
      />

      {/* Confetti Effect */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {[...Array(50)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confettiPiece,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF6B35', '#3B82F6', '#10B981', '#8B5CF6'][Math.floor(Math.random() * 5)],
                  transform: [
                    {
                      translateY: confettiAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 1000],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.scoreEmoji}>
            {getScoreEmoji(quizResult.scorePercentage)}
          </Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Quiz Result
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {getScoreMessage(quizResult.scorePercentage)}
          </Text>
        </View>

        {/* Main Result Card */}
        <View style={[styles.mainResultCard, { backgroundColor: colors.surface }]}>
          {/* Quiz Title */}
          <View style={styles.quizTitleSection}>
            <Text style={[styles.quizTitle, { color: colors.text }]}>
              {quiz?.name || quizResult?.quizTitle || "Quiz Result"}
            </Text>
            {quiz?.category?.name && (
              <Text style={[styles.quizCategory, { color: colors.textSecondary }]}>
                Category: {quiz.category.name}
                {quiz?.subcategory?.name && ` • ${quiz.subcategory.name}`}
              </Text>
            )}
          </View>

          {/* Score Display */}
          <View style={styles.scoreDisplaySection}>
            <Text style={[styles.scorePercentage, { color: getScoreColor(quizResult.scorePercentage) }]}>
              {quizResult.scorePercentage}%
            </Text>
            <Text style={[styles.totalQuestions, { color: colors.text }]}>
              Total Questions: {quizResult.total || quizResult.totalQuestions || quizResult.answers?.length}
            </Text>
            <Text style={[styles.correctAnswers, { color: colors.text }]}>
              Correct Answers: {quizResult.score}
            </Text>
            <Text style={[styles.attemptedDate, { color: colors.textSecondary }]}>
              Attempted on {quizResult.attemptedAt ? new Date(quizResult.attemptedAt).toLocaleDateString() : new Date().toLocaleDateString()}
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#FEF3C7', borderColor: isDark ? '#374151' : '#F59E0B' }]}>
              <View style={[styles.statIcon, { backgroundColor: '#F59E0B' }]}>
                <Icon name="check-circle" size={24} color="white" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {quizResult.score}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#ECFDF5', borderColor: isDark ? '#374151' : '#10B981' }]}>
              <View style={[styles.statIcon, { backgroundColor: '#10B981' }]}>
                <Icon name="psychology" size={24} color="white" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {quizResult.scorePercentage}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Accuracy
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? '#1F2937' : '#FFF7ED', borderColor: isDark ? '#374151' : '#F97316' }]}>
              <View style={[styles.statIcon, { backgroundColor: '#F97316' }]}>
                <Icon name="emoji-events" size={24} color="white" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {quizResult.isHighScore ? "High Score" : "Standard"}
              </Text>
            </View>
          </View>

          {/* High Score Status */}
          <View style={[styles.highScoreStatus, { 
            backgroundColor: quizResult.scorePercentage >= 75 
              ? (isDark ? '#064E3B' : '#ECFDF5') 
              : (isDark ? '#451A03' : '#FEF3C7'),
            borderColor: quizResult.scorePercentage >= 75 
              ? (isDark ? '#065F46' : '#10B981') 
              : (isDark ? '#92400E' : '#F59E0B')
          }]}>
            <Text style={[styles.highScoreTitle, { 
              color: quizResult.scorePercentage >= 75 
                ? (isDark ? '#6EE7B7' : '#047857') 
                : (isDark ? '#FCD34D' : '#92400E')
            }]}>
              {quizResult.scorePercentage >= 75 ? "🎉 High Score Achievement!" : "💪 Good Effort!"}
            </Text>
            <Text style={[styles.highScoreSubtitle, { 
              color: quizResult.scorePercentage >= 75 
                ? (isDark ? '#A7F3D0' : '#065F46') 
                : (isDark ? '#FDE68A' : '#B45309')
            }]}>
              {quizResult.scorePercentage >= 75
                ? "This score counts towards your level progression!"
                : "Need 75% or higher to count towards level progression. Keep practicing!"}
            </Text>
          </View>
        </View>

        {/* Quiz Review Section */}
        {quiz?.questions && quiz.questions.length > 0 ? (
          <View style={[styles.quizReviewSection, { backgroundColor: colors.surface }]}>
            <View style={styles.quizReviewHeader}>
              <View style={[styles.quizReviewIcon, { backgroundColor: '#F59E0B' }]}>
                <Icon name="psychology" size={24} color="white" />
              </View>
              <Text style={[styles.quizReviewTitle, { color: colors.text }]}>
                Quiz Review
              </Text>
            </View>

            <View style={styles.questionsContainer}>
              {quiz.questions.map((question, index) => {
                // Handle the answers data structure from backend
                // Backend returns answers as [{ questionId: String, answer: String }]
                let userAnswer = 'SKIP';
                if (quizResult?.answers && Array.isArray(quizResult.answers)) {
                  // Find the answer for this question by questionId
                  const answerRecord = quizResult.answers.find(a => a.questionId === question._id);
                  if (answerRecord) {
                    userAnswer = answerRecord.answer;
                  }
                }
                
                const correctAnswer = question.options[question.correctAnswerIndex];
                const isCorrect = userAnswer === correctAnswer;
                const isSkipped = userAnswer === 'SKIP';

                return (
                  <View key={index} style={[styles.questionReviewItem, { 
                    backgroundColor: isDark ? '#374151' : '#F9FAFB',
                    borderColor: isDark ? '#4B5563' : '#E5E7EB'
                  }]}>
                    <View style={styles.questionReviewHeader}>
                      <View style={[
                        styles.questionStatusIcon,
                        { 
                          backgroundColor: isSkipped ? '#6B7280' :
                                          isCorrect ? '#10B981' : '#EF4444'
                        }
                      ]}>
                        <Icon 
                          name={isSkipped ? 'help-outline' : isCorrect ? 'check' : 'close'} 
                          size={20} 
                          color="white" 
                        />
                      </View>
                      <Text style={[styles.questionReviewTitle, { color: colors.text }]}>
                        {index + 1}: {question.questionText || question.question}
                      </Text>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsReviewContainer}>
                      {question.options.map((option, optIndex) => {
                        const isUserChoice = option === userAnswer;
                        const isCorrectOption = option === correctAnswer;
                        const optionLetter = String.fromCharCode(65 + optIndex);

                        return (
                          <View
                            key={optIndex}
                            style={[
                              styles.optionReviewItem,
                              { 
                                backgroundColor: isCorrectOption 
                                  ? (isDark ? '#064E3B' : '#ECFDF5')
                                  : isUserChoice && !isCorrectOption 
                                    ? (isDark ? '#7F1D1D' : '#FEF2F2')
                                    : (isDark ? '#1F2937' : '#FFFFFF'),
                                borderColor: isCorrectOption 
                                  ? (isDark ? '#065F46' : '#10B981')
                                  : isUserChoice && !isCorrectOption 
                                    ? (isDark ? '#991B1B' : '#EF4444')
                                    : (isDark ? '#374151' : '#E5E7EB')
                              }
                            ]}
                          >
                            <View style={styles.optionReviewContent}>
                              <View style={[
                                styles.optionReviewLabel,
                                { 
                                  backgroundColor: isCorrectOption ? '#10B981' : 
                                                 isUserChoice && !isCorrectOption ? '#EF4444' : '#6B7280'
                                }
                              ]}>
                                <Text style={styles.optionReviewLabelText}>
                                  {optionLetter}
                                </Text>
                              </View>
                              <Text style={[
                                styles.optionReviewText,
                                { 
                                  color: isCorrectOption ? (isDark ? '#6EE7B7' : '#047857') : 
                                        isUserChoice && !isCorrectOption ? (isDark ? '#FCA5A5' : '#DC2626') : colors.text
                                }
                              ]}>
                                {option}
                              </Text>
                              {isCorrectOption && <Icon name="check-circle" size={20} color="#10B981" />}
                              {isUserChoice && !isCorrectOption && <Icon name="cancel" size={20} color="#EF4444" />}
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    {/* Answer Summary */}
                    <View style={[styles.answerSummary, { 
                      backgroundColor: isDark ? '#451A03' : '#FEF3C7', 
                      borderColor: isDark ? '#92400E' : '#F59E0B' 
                    }]}>
                      <View style={styles.answerSummaryRow}>
                        <Text style={[styles.answerSummaryLabel, { color: colors.textSecondary }]}>
                          Your Answer:
                        </Text>
                        <Text style={[
                          styles.answerSummaryValue,
                          { 
                            color: isSkipped ? colors.textSecondary :
                                   isCorrect ? '#10B981' : '#EF4444'
                          }
                        ]}>
                          {isSkipped ? 'Skipped' : userAnswer || 'Not answered'}
                        </Text>
                      </View>
                      <View style={styles.answerSummaryRow}>
                        <Text style={[styles.answerSummaryLabel, { color: colors.textSecondary }]}>
                          Correct Answer:
                        </Text>
                        <Text style={[styles.answerSummaryValue, { color: '#10B981' }]}>
                          {correctAnswer}
                        </Text>
                      </View>
                      <View style={styles.answerSummaryRow}>
                        <Text style={[styles.answerSummaryLabel, { color: colors.textSecondary }]}>
                          Status:
                        </Text>
                        <Text style={[
                          styles.answerSummaryValue,
                          { 
                            color: isSkipped ? colors.textSecondary :
                                   isCorrect ? '#10B981' : '#EF4444'
                          }
                        ]}>
                          {isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={[styles.quizReviewSection, { backgroundColor: colors.surface }]}>
            <View style={styles.quizReviewHeader}>
              <View style={[styles.quizReviewIcon, { backgroundColor: '#F59E0B' }]}>
                <Icon name="psychology" size={24} color="white" />
              </View>
              <Text style={[styles.quizReviewTitle, { color: colors.text }]}>
                Quiz Review
              </Text>
            </View>
            <View style={styles.noQuestionsContainer}>
              <Icon name="info-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.noQuestionsText, { color: colors.textSecondary }]}>
                Quiz questions are not available for review.
              </Text>
              <Text style={[styles.noQuestionsSubtext, { color: colors.textSecondary }]}>
                This may be due to quiz updates, data limitations, or the quiz no longer being available.
              </Text>
              <Text style={[styles.noQuestionsSubtext, { color: colors.textSecondary }]}>
                You can still view your score and performance above.
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.takeAnotherQuizButton]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.actionButtonText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.viewProfileButton]}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.actionButtonText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.goBackButton]}
              onPress={navigation.goBack}
            >
              <Text style={styles.actionButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard */}
        <LeaderboardTable leaderboard={leaderboard} currentUser={user} colors={colors} isDark={isDark} />

        {/* Motivational Message */}
        <Card style={styles.motivationCard}>
          <Text style={[styles.motivationTitle, { color: colors.text }]}>
            {performance.grade === 'A' ? '🌟 Outstanding!' : 
             performance.grade === 'B' ? '👏 Great Work!' :
             performance.grade === 'C' ? '👍 Good Effort!' :
             performance.grade === 'D' ? '📚 Keep Learning!' : '💪 Keep Practicing!'}
          </Text>
          <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
            {performance.grade === 'A' ? 'You have mastered this topic! Time to challenge yourself with harder quizzes.' :
             performance.grade === 'B' ? 'Excellent work! You clearly understand the concepts.' :
             performance.grade === 'C' ? 'Good effort! Practice more to improve your score.' :
             performance.grade === 'D' ? 'You passed! Keep studying to improve your knowledge.' :
             'Don\'t worry, learning is a process. Review the material and try again!'}
          </Text>
        </Card>
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
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  scoreEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  // Main Result Card
  mainResultCard: {
    margin: 8,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quizTitleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  quizCategory: {
    fontSize: 14,
    textAlign: 'center',
  },
  scoreDisplaySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalQuestions: {
    fontSize: 18,
    marginBottom: 4,
  },
  correctAnswers: {
    fontSize: 18,
    marginBottom: 4,
  },
  attemptedDate: {
    fontSize: 14,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  // High Score Status
  highScoreStatus: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  highScoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  highScoreSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Quiz Review Section
  quizReviewSection: {
    margin: 8,
    borderRadius: 24,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quizReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quizReviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizReviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  questionsContainer: {
    gap: 16,
  },
  questionReviewItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionReviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  questionStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionReviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 22,
  },
  optionsReviewContainer: {
    gap: 8,
    marginBottom: 16,
  },
  optionReviewItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionReviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionReviewLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionReviewLabelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionReviewText: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
  },
  answerSummary: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  answerSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  answerSummaryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  answerSummaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  noQuestionsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noQuestionsText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  noQuestionsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Action Buttons
  actionButtonsContainer: {
    padding: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'between',
    gap: 20,
    width: '100%',
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 48,
  },
  takeAnotherQuizButton: {
    backgroundColor: '#F59E0B', // Yellow to Red gradient equivalent
  },
  viewProfileButton: {
    backgroundColor: '#10B981', // Green to Teal gradient equivalent
  },
  goBackButton: {
    backgroundColor: '#6B7280', // Gray gradient equivalent
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Leaderboard styles
  leaderboardEmptyContainer: {
    padding: 16,
    marginBottom: 16,
  },
  leaderboardEmptyCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  leaderboardEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  leaderboardEmptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  leaderboardContainer: {
    margin: 8,
    marginBottom: 24,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  mobileLeaderboard: {
    gap: 1,
  },
  leaderboardMobileCard: {
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardMobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  leaderboardRankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardRankText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  leaderboardStudentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaderboardStudentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardStudentInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardStudentName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  leaderboardCurrentUserLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  leaderboardScoreSection: {
    alignItems: 'center',
  },
  leaderboardScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  leaderboardScoreLabel: {
    fontSize: 12,
  },
  // Confetti styles
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Results section styles
  resultsSection: {
    marginBottom: 24,
  },
  resultHeader: {
    padding: 24,
    alignItems: 'center',
    margin: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultContent: {
    alignItems: 'center',
  },
  trophyContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Quiz review styles
  quizReviewCard: {
    margin: 8,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quizReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quizReviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizReviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  questionsContainer: {
    gap: 16,
  },
  questionReviewItem: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionReviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  questionStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionReviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 22,
  },
  optionsReviewContainer: {
    gap: 8,
    marginBottom: 16,
  },
  optionReviewItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionReviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionReviewLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionReviewLabelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionReviewText: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
  },
  answerSummary: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  answerSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  answerSummaryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  answerSummaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Action buttons styles
  actionButtonsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  // Leaderboard styles
  leaderboardEmptyContainer: {
    padding: 16,
    marginBottom: 16,
  },
  leaderboardEmptyCard: {
    backgroundColor: '#FEF3C7',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  leaderboardEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#92400E',
  },
  leaderboardEmptyText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  leaderboardContainer: {
    margin: 8,
    marginBottom: 24,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  leaderboardTable: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  leaderboardTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
  },
  leaderboardHeaderText: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leaderboardCurrentUserRow: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  leaderboardRankCell: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardRankText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  leaderboardStudentCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardStudentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardStudentInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardStudentInfo: {
    flex: 1,
  },
  leaderboardStudentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  leaderboardCurrentUserLabel: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  leaderboardScoreCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  leaderboardDateCell: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardDateText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  motivationCard: {
    margin: 8,
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default QuizResultScreen;