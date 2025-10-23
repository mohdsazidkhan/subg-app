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
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(30); // 30 seconds per question
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [error, setError] = useState('');
  
  const timerRef = useRef(null);

  useEffect(() => {
    console.log('AttemptQuizScreen - Route params:', route.params);
    console.log('AttemptQuizScreen - Quiz object:', route.params?.quiz);
    console.log('AttemptQuizScreen - Quiz name:', route.params?.quiz?.name);
    console.log('AttemptQuizScreen - Quiz title:', route.params?.quiz?.title);
    
    if (!route.params?.quiz) {
      console.log('No quiz object found, going back');
      navigation.goBack();
      return;
    }
    
    // If quiz object already has questions, use them directly
    if (route.params.quiz.questions && route.params.quiz.questions.length > 0) {
      console.log('Using questions from quiz object:', route.params.quiz.questions.length);
      setQuestions(route.params.quiz.questions);
      setLoading(false);
    } else {
      // Fetch quiz questions from API
      fetchQuizQuestions();
    }
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
    // Timer effect for per-question timer only
    if (!quizCompleted) {
      timerRef.current = setTimeout(() => {
        // Handle per-question timer
        if (questionTimeRemaining > 0) {
          setQuestionTimeRemaining(questionTimeRemaining - 1);
        } else if (questionTimeRemaining === 0) {
          handleQuestionTimeUp();
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [questionTimeRemaining, quizCompleted]);

  const fetchQuizQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching quiz questions for quiz ID:', quiz._id);
      
      const response = await API.getQuizById(quiz._id);
      console.log('Quiz API response:', response);
      
      // Check if response is successful OR if it contains quiz data directly
      if (response.success || (response.questions && response.questions.length > 0) || response._id) {
        // Handle different response structures
        let questionsData = [];
        let quizData = response;
        
        if (response.questions && response.questions.length > 0) {
          questionsData = response.questions;
        } else if (response.data && response.data.questions) {
          questionsData = response.data.questions;
          quizData = response.data;
        }
        
        console.log('Questions data:', questionsData);
        setQuestions(questionsData);
        
        // Update quiz object with full data
        if (quizData) {
          setQuiz(prevQuiz => ({ ...prevQuiz, ...quizData }));
        }
      } else {
        console.error('API response not successful:', response);
        setError('Failed to load quiz questions');
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      setError('Failed to load quiz questions: ' + error.message);
      showMessage({
        message: 'Failed to load quiz questions',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
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
      setQuestionTimeRemaining(30); // Reset timer for next question
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setQuestionTimeRemaining(30); // Reset timer for previous question
    }
  };

  const handleQuestionTimeUp = () => {
    // Auto move to next question when per-question timer ends
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionTimeRemaining(30); // Reset timer for next question
    } else {
      // If it's the last question, submit the quiz
      handleSubmitQuiz();
    }
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
      
      // Convert answers from object format to array format expected by backend
      const answersArray = questions.map(question => {
        const answerIndex = answers[question._id];
        if (answerIndex === undefined || answerIndex === null) {
          return 'SKIP'; // Handle unanswered questions
        }
        return question.options[answerIndex]; // Return the actual option text
      });
      
      const result = await API.submitQuiz({
        quizId: quiz._id,
        answers: answersArray,
        timeTaken: questions.length * 30, // Total time based on per-question timer (30 seconds per question)
      });

      // Backend returns the result data directly, not wrapped in success/data
      if (result && result.scorePercentage !== undefined) {
        setQuizCompleted(true);
        navigation.replace('QuizResult', {
          result: result,
          quiz: quiz,
        });
      } else {
        showMessage({
          message: result?.message || 'Failed to submit quiz - Invalid response',
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

  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  if (loading) {
    return (
      <View style={[styles.fullscreenContainer, styles.centerContent, { backgroundColor: colors.background }]}>
        <Icon name="quiz" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading quiz questions...
        </Text>
      </View>
    );
  }

  if (error || !questions.length) {
    return (
      <View style={[styles.fullscreenContainer, styles.centerContent, { backgroundColor: colors.background }]}>
        <Icon name="error" size={60} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error || 'No questions found for this quiz'}
        </Text>
        <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
          Please try again or contact support if the problem persists.
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
    <View style={[styles.fullscreenContainer, { backgroundColor: colors.background }]}>
      {/* Fullscreen Active Banner */}
      <View style={[styles.fullscreenBanner, { backgroundColor: colors.primary }]}>
        <View style={styles.fullscreenBannerContent}>
          <View style={styles.fullscreenIndicator} />
          <Text style={styles.fullscreenBannerText}>
            ✅ Fullscreen Mode - Stay focused! Complete quiz to exit
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quiz Header */}
        <View style={[styles.quizHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.quizHeaderContent}>
            <View style={styles.quizHeaderLeft}>
              <View style={[styles.quizIcon, { backgroundColor: colors.primary }]}>
                <Icon name="quiz" size={24} color="white" />
              </View>
              <View style={styles.quizHeaderText}>
                <Text style={[styles.quizTitle, { color: colors.text }]}>
                  {quiz.name || quiz.title || 'Quiz'}
                </Text>
                <Text style={[styles.quizSubtitle, { color: colors.textSecondary }]}>
                  {questions.length} Questions • {quiz.category?.name || 'General Knowledge'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <View style={styles.progressHeaderLeft}>
              <View style={[styles.progressIcon, { backgroundColor: colors.primary }]}>
                <Icon name="trending-up" size={20} color="white" />
              </View>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Progress</Text>
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {currentQuestionIndex + 1} / {questions.length}
            </Text>
          </View>
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
        </View>

        {/* Question Info */}
        <View style={[styles.questionInfoContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.questionInfoRow}>
            <View style={styles.questionInfoLeft}>
              <View style={[styles.questionInfoIcon, { backgroundColor: colors.primary }]}>
                <Icon name="help-outline" size={20} color="white" />
              </View>
              <Text style={[styles.questionInfoText, { color: colors.text }]}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
            </View>
            
            {/* Per-Question Timer */}
            <View style={[
              styles.questionTimer,
              { 
                backgroundColor: questionTimeRemaining <= 10 ? '#EF4444' : 
                                questionTimeRemaining <= 20 ? '#F59E0B' : colors.primary 
              }
            ]}>
              <Icon name="timer" size={16} color="white" />
              <Text style={styles.questionTimerText}>{questionTimeRemaining}s</Text>
            </View>
          </View>
        </View>

        {/* Question Card */}
        <View style={[styles.questionContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.questionHeader}>
            <View style={[styles.questionNumberBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.questionNumberBadgeText}>{currentQuestionIndex + 1}</Text>
            </View>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {currentQuestion.questionText || currentQuestion.question}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  answers[currentQuestion._id] === index && { 
                    borderColor: colors.primary, 
                    borderWidth: 2,
                    backgroundColor: colors.primary + '10'
                  },
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
                  <Text style={[
                    styles.optionText, 
                    { 
                      color: answers[currentQuestion._id] === index ? colors.primary : colors.text 
                    }
                  ]}>
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
      <View style={[styles.navigationContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.navigationRow}>
          {isLastQuestion ? (
            <Button
              title={submitting ? 'Submitting...' : 'Submit Quiz'}
              onPress={handleSubmitQuiz}
              variant="primary"
              icon={<Icon name="send" size={20} color="white" />}
              disabled={!isQuizComplete() || submitting}
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
            />
          ) : (
            <Button
              title="Next"
              onPress={handleNext}
              variant="primary"
              icon={<Icon name="arrow-forward" size={20} color="white" />}
              disabled={!isAnswered}
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
            />
          )}
        </View>

        {/* Quiz Stats */}
        <View style={styles.quizStats}>
          <View style={styles.quizStatItem}>
            <Text style={[styles.quizStatLabel, { color: colors.textSecondary }]}>
              Answered
            </Text>
            <Text style={[styles.quizStatValue, { color: colors.text }]}>
              {Object.keys(answers).length} / {questions.length}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullscreenContainer: {
    flex: 1,
    paddingTop: 0, // Remove top padding for true fullscreen
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  fullscreenBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 8,
  },
  fullscreenBannerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
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
  quizHeader: {
    margin: 8,
    marginTop: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quizHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  quizHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quizIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizHeaderText: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quizSubtitle: {
    fontSize: 14,
  },
  progressContainer: {
    margin: 8,
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  questionInfoContainer: {
    margin: 8,
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  questionInfoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  questionInfoText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  questionTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  questionTimerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
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
    margin: 8,
    marginTop: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  questionNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumberBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 0,
    flex: 1,
    flexWrap: 'wrap',
    textAlign: 'left',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    padding: 12,
    borderRadius: 10,
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
    margin: 8,
    marginTop: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  spacer: {
    flex: 1,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  nextButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quizStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  quizStatItem: {
    alignItems: 'center',
  },
  quizStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  quizStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
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