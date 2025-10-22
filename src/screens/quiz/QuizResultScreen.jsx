import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
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

const QuizResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [quizResult, setQuizResult] = useState(route.params?.result || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!quizResult) {
      // Navigate back if no result data
      navigation.goBack();
      return;
    }
  }, [quizResult]);

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

  const handleShare = async () => {
    try {
      const performance = calculatePerformance();
      const message = `I just completed a quiz and scored ${quizResult.score}/${quizResult.totalQuestions}! Grade: ${performance.grade}. Download SUBG App to take quizzes and improve your knowledge!`;
      
      await Share.share({
        message: message,
        title: 'Quiz Result',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRetakeQuiz = () => {
    Alert.alert(
      'Retake Quiz',
      'Are you sure you want to retake this quiz?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retake', onPress: () => {
          navigation.navigate('AttemptQuiz', { quiz: route.params?.quiz });
        }}
      ]
    );
  };

  const handleContinue = () => {
    // Navigate to appropriate screen based on quiz source
    if (route.params?.fromLevel) {
      navigation.navigate('Levels');
    } else if (route.params?.fromCategory) {
      navigation.navigate('Categories');
    } else {
      navigation.navigate('Home');
    }
  };

  const renderStatItem = (icon, label, value, color = colors.text) => (
    <View style={styles.statItem}>
      <Icon name={icon} size={24} color={color} />
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.statValue, { color }]}>
        {value}
      </Text>
    </View>
  );

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Result Header */}
        <LinearGradient
          colors={[performanceColor + '20', performanceColor + '10']}
          style={styles.resultHeader}
        >
          <View style={styles.resultContent}>
            {/* Performance Grade */}
            <View style={[styles.gradeContainer, { borderColor: performanceColor }]}>
              <Text style={[styles.gradeText, { color: performanceColor }]}>
                {performance.grade}
              </Text>
            </View>

            {/* Performance Message */}
            <Text style={[styles.performanceMessage, { color: colors.text }]}>
              {performance.message}
            </Text>

            {/* Score */}
            <Text style={[styles.scoreText, { color: colors.text }]}>
              {quizResult.score} / {quizResult.totalQuestions}
            </Text>
            <Text style={[styles.scorePercentage, { color: colors.textSecondary }]}>
              {Math.round((quizResult.score / quizResult.totalQuestions) * 100)}%
            </Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quiz Statistics
          </Text>

          <View style={styles.statsGrid}>
            {renderStatItem(
              'schedule',
              'Time Taken',
              `${quizResult.timeTaken}s`,
              colors.primary
            )}
            {renderStatItem(
              'speed',
              'Avg. Time/Question',
              `${Math.round(quizResult.timeTaken / quizResult.totalQuestions)}s`,
              colors.info
            )}
            {renderStatItem(
              'star-rate',
              'Questions Correct',
              quizResult.score,
              colors.success
            )}
            {renderStatItem(
              'clear',
              'Questions Wrong',
              quizResult.totalQuestions - quizResult.score,
              colors.error
            )}
          </View>
        </Card>

        {/* Detailed Results */}
        {quizResult.questions && quizResult.questions.length > 0 && (
          <Card style={styles.detailedCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Question Details
            </Text>

            {quizResult.questions.map((question, index) => (
              <View key={index} style={styles.questionItem}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Q{index + 1}</Text>
                  <Icon
                    name={question.isCorrect ? 'check-circle' : 'cancel'}
                    size={20}
                    color={question.isCorrect ? colors.success : colors.error}
                  />
                </View>
                <Text style={[styles.questionText, { color: colors.text }]} numberOfLines={2}>
                  {question.questionText}
                </Text>
                {!question.isCorrect && (
                  <View style={styles.answerContainer}>
                    <Text style={[styles.answerLabel, { color: colors.textSecondary }]}>
                      Correct Answer:
                    </Text>
                    <Text style={[styles.correctAnswer, { color: colors.success }]}>
                      {question.correctAnswer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actionContainer}>
          <View style={styles.actionRow}>
            <Button
              title="Retake Quiz"
              onPress={handleRetakeQuiz}
              variant="outline"
              icon={<Icon name="refresh" size={20} color={colors.primary} />}
              style={styles.actionButton}
              textStyle={{ color: colors.primary }}
            />

            <Button
              title="Share Result"
              onPress={handleShare}
              variant="secondary"
              icon={<Icon name="share" size={20} color={colors.text} />}
              style={styles.actionButton}
            />
          </View>

          <Button
            title="Continue Learning"
            onPress={handleContinue}
            variant="primary"
            icon={<Icon name="arrow-forward" size={20} color="white" />}
            style={styles.continueButton}
          />
        </View>

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
  resultHeader: {
    padding: 30,
    alignItems: 'center',
    margin: 20,
    borderRadius: 20,
  },
  resultContent: {
    alignItems: 'center',
  },
  gradeContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gradeText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  performanceMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scorePercentage: {
    fontSize: 18,
  },
  statsCard: {
    margin: 20,
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailedCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
  },
  questionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  questionText: {
    fontSize: 16,
    marginBottom: 8,
  },
  answerContainer: {
    marginTop: 8,
  },
  answerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  correctAnswer: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionContainer: {
    padding: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  continueButton: {
    width: '100%',
  },
  motivationCard: {
    margin: 20,
    marginTop: 16,
    padding: 20,
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