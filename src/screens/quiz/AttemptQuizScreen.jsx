import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import { showMessage } from 'react-native-flash-message';

const AttemptQuizScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [quiz, setQuiz] = useState(route.params?.quiz || null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (!quiz) {
      navigation.goBack();
      return;
    }
    fetchQuizQuestions();
  }, []);

  useEffect(() => {
    // Handle back button press
    const backAction = () => {
      handleExitQuiz();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    // Timer effect
    if (timeRemaining > 0 && !quizCompleted) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !quizCompleted) {
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, quizCompleted]);

  const fetchQuizQuestions = async () => {
    try {
      setLoading(true);
      const response = await API.getQuizQuestions(quiz._id);
      
      if (response.success) {
        setQuestions(response.results || []);
        // Set timer if quiz has time limit
        if (quiz.timeLimit && quiz.timeLimit > 0) {
          setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
        }
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      showMessage({
        message: 'Failed to load quiz questions',
        type: 'danger',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleTimeUp = () => {
    Alert.alert(
      'Time\'s Up!',
      'Your time for this quiz has ended. Your current answers will be submitted.',
      [
        {
          text: 'Submit Now',
          onPress: () => handleSubmitQuiz(),
        }
      ]
    );
  };

  const handleExitQuiz = () => {
    Alert.alert(
      'Exit Quiz',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      
      const result = await API.submitQuiz({
        quizId: quiz._id,
        answers: answers,
        timeTaken: quiz.timeLimit ? (quiz.timeLimit * 60 - timeRemaining) : 300, // 5 minutes default
      });

      if (result.success) {
        setQuizCompleted(true);
        navigation.replace('QuizResult', {
          result: result.result,
          quiz: quiz,
        });
      } else {
        showMessage({
          message: result.message || 'Failed to submit quiz',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showMessage({
        message: 'Failed to submit quiz. Please try again.',
        type: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isQuizComplete = () => {
    return questions.every(question => answers[question._id] !== undefined);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title="Quiz"
          showBackButton={false}
          showLanguageToggle={true}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="quiz" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading quiz questions...
        </Text>
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title="Quiz"
          showBackButton={false}
          showLanguageToggle={true}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="error" size={60} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          No questions found for this quiz
        </Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestion._id] !== undefined;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={quiz.name}
        showBackButton={false}
        showLanguageToggle={true}
        onLanguageToggle={handleLanguageToggle}
        rightComponent={
          quiz.timeLimit ? (
            <View style={styles.timer}>
              <Icon name="timer" size={20} color="white" />
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            </View>
          ) : null
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionContainer}>
          <Text style={[styles.questionNumber, { color: colors.textSecondary }]}>
            Question {currentQuestionIndex + 1}
          </Text>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestion.question}
          </Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  answers[currentQuestion._id] === index && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => handleAnswerSelect(currentQuestion._id, index)}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionLabel,
                    { backgroundColor: answers[currentQuestion._id] === index ? colors.primary : colors.border }
                  ]}>
                    <Text style={[
                      styles.optionLabelText,
                      { color: answers[currentQuestion._id] === index ? 'white' : colors.textSecondary }
                    ]}>
                      {getOptionLabel(index)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {option}
                  </Text>
                </View>
                {answers[currentQuestion._id] === index && (
                  <Icon name="check-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.navigationRow}>
          {currentQuestionIndex > 0 && (
            <Button
              title="Previous"
              onPress={handlePrevious}
              variant="outline"
              icon={<Icon name="arrow-back" size={20} color={colors.primary} />}
              style={styles.navButton}
            />
          )}

          <View style={styles.spacer} />

          {isLastQuestion ? (
            <Button
              title={submitting ? 'Submitting...' : 'Submit Quiz'}
              onPress={handleSubmitQuiz}
              variant="primary"
              icon={<Icon name="send" size={20} color="white" />}
              disabled={!isQuizComplete() || submitting}
              style={styles.submitButton}
            />
          ) : (
            <Button
              title="Next"
              onPress={handleNext}
              variant="primary"
              icon={<Icon name="arrow-forward" size={20} color="white" />}
              disabled={!isAnswered}
              style={styles.navButton}
            />
          )}
        </View>

        {/* Quiz Info */}
        <View style={styles.quizInfo}>
          <Text style={[styles.quizInfoText, { color: colors.textSecondary }]}>
            Answered: {Object.keys(answers).length} / {questions.length}
          </Text>
          {quiz.timeLimit && (
            <Text style={[styles.quizInfoText, { color: colors.textSecondary }]}>
              Time: {formatTime(timeRemaining)}
            </Text>
          )}
        </View>
      </View>
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
    marginBottom: 20,
  },
  backButton: {
    marginTop: 20,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  questionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  navigationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spacer: {
    flex: 1,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  submitButton: {
    marginHorizontal: 8,
    minWidth: 150,
  },
  quizInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quizInfoText: {
    fontSize: 14,
  },
});

export default AttemptQuizScreen;