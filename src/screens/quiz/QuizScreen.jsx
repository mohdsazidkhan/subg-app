/**
 * @fileoverview Quiz Screen for Subg App
 * 
 * This screen displays quiz questions and handles quiz completion.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { showMessage } from 'react-native-flash-message';

/**
 * Quiz Screen Component
 * @returns {React.ReactElement} Quiz screen component
 */
const QuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const quizId = route.params?.quizId;

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  useEffect(() => {
    if (quiz && quiz.timeLimit > 0) {
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz]);

  /**
   * Fetch quiz data from API
   */
  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await API.getQuizById(quizId);
      if (response.success) {
        setQuiz(response.data);
        setAnswers(new Array(response.data.questions.length).fill(-1));
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      showMessage({ message: 'Failed to load quiz', type: 'danger' });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle answer selection
   * @param {number} answerIndex - Selected answer index
   */
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowAnswerFeedback(true);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  /**
   * Handle next question navigation
   */
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(
        answers[currentQuestionIndex + 1] !== -1 ? answers[currentQuestionIndex + 1] : null
      );
      setShowAnswerFeedback(false);
    } else {
      handleSubmitQuiz();
    }
  };

  /**
   * Handle previous question navigation
   */
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(
        answers[currentQuestionIndex - 1] !== -1 ? answers[currentQuestionIndex - 1] : null
      );
      setShowAnswerFeedback(false);
    }
  };

  /**
   * Handle quiz submission
   */
  const handleSubmitQuiz = async () => {
    if (submitting) return;

    const unansweredQuestions = answers.filter(answer => answer === -1).length;
    if (unansweredQuestions > 0) {
      Alert.alert(
        'Submit Quiz',
        `You have ${unansweredQuestions} unanswered questions. Do you want to submit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: submitQuiz },
        ]
      );
    } else {
      submitQuiz();
    }
  };

  /**
   * Submit quiz answers to API
   */
  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      
      // Convert answers from array of indices to array of option strings
      const answersArray = answers.map((answerIndex, questionIndex) => {
        if (answerIndex === -1 || answerIndex === undefined || answerIndex === null) {
          return 'SKIP'; // Handle unanswered questions
        }
        return quiz.questions[questionIndex].options[answerIndex]; // Return the actual option text
      });
      
      const response = await API.submitQuiz({
        quizId: quizId,
        answers: answersArray,
        timeTaken: quiz.timeLimit ? (quiz.timeLimit * 60 - timeRemaining) : 300, // 5 minutes default
      });
      
      // Backend returns the result data directly, not wrapped in success/data
      if (response && response.scorePercentage !== undefined) {
        navigation.navigate('QuizResult', { 
          quizId, 
          result: response,
          quiz: quiz 
        });
      } else {
        showMessage({
          message: 'Failed to submit quiz - Invalid response',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showMessage({
        message: 'Failed to submit quiz',
        type: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Format time in MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar title="Quiz" showBackButton={true} showThemeToggle={true} onBackPress={() => navigation.goBack()} onThemeToggle={toggleTheme} />
        <Icon name="quiz" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar title="Quiz" showBackButton={true} showThemeToggle={true} onBackPress={() => navigation.goBack()} onThemeToggle={toggleTheme} />
        <Icon name="error" size={60} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Quiz not found
        </Text>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={`Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`}
        showBackButton={true}
        showThemeToggle={true}
        onBackPress={() => navigation.goBack()}
        onThemeToggle={toggleTheme}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${progress}%` }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {Math.round(progress)}% Complete
          </Text>
        </View>

        {/* Timer */}
        {timeRemaining > 0 && (
          <Card style={styles.timerCard}>
            <View style={styles.timerContent}>
              <Icon name="schedule" size={24} color={colors.warning} />
              <Text style={[styles.timerText, { color: colors.text }]}>
                Time Remaining: {formatTime(timeRemaining)}
              </Text>
            </View>
          </Card>
        )}

        {/* Question */}
        <Card style={styles.questionCard}>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestion.question}
          </Text>
        </Card>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const isWrong = isSelected && !isCorrect;
            const showFeedback = showAnswerFeedback && isSelected;

            let backgroundColor = colors.surface;
            let borderColor = colors.border;
            let borderWidth = 1;

            if (showFeedback) {
              if (isCorrect) {
                backgroundColor = '#4CAF50'; // Green for correct
                borderColor = '#4CAF50';
                borderWidth = 2;
              } else if (isWrong) {
                backgroundColor = '#F44336'; // Red for incorrect
                borderColor = '#F44336';
                borderWidth = 2;
              }
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
                  { backgroundColor, borderColor, borderWidth }
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={showAnswerFeedback}
              >
                <View
                  style={[
                    styles.optionIndicator,
                    {
                      backgroundColor: showFeedback
                        ? (isCorrect ? '#4CAF50' : '#F44336')
                        : (isSelected ? colors.primary : colors.border)
                    }
                  ]}
                >
                  {showFeedback && isCorrect && (
                    <Icon name="check" size={16} color="white" />
                  )}
                  {showFeedback && isWrong && (
                    <Icon name="close" size={16} color="white" />
                  )}
                  {!showFeedback && isSelected && (
                    <Icon name="check" size={16} color="white" />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: showFeedback
                        ? 'white'
                        : (isSelected ? colors.primary : colors.text)
                    }
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <Button
            title={currentQuestionIndex === quiz.questions.length - 1 ? 'Finish' : 'Next'}
            onPress={handleNextQuestion}
            loading={submitting}
            disabled={selectedAnswer === null || !showAnswerFeedback}
            style={styles.navButton}
          />
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
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  timerCard: {
    margin: 16,
    marginTop: 0,
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  questionCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
});

export default QuizScreen;