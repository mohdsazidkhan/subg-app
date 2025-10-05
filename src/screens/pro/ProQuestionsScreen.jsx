import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { showMessage } from 'react-native-flash-message';

const ProQuestionsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: null,
    explanation: '',
    category: '',
    difficulty: 'medium',
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await API.getPublicUserQuestions({ limit: 50 });
      if (response.success) {
        setQuestions(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      showMessage({
        message: 'Failed to load questions',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuestions();
    setRefreshing(false);
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleCreateQuestion = () => {
    if (!user || user.subscriptionStatus === 'free') {
      Alert.alert(
        'Premium Feature',
        'Creating questions is available for premium users only. Please upgrade your subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }
    setShowCreateForm(true);
  };

  const handleSubmitQuestion = async () => {
    if (!formData.question.trim()) {
      showMessage({ message: 'Please enter a question', type: 'danger' });
      return;
    }

    if (formData.options.filter(opt => opt.trim()).length < 2) {
      showMessage({ message: 'Please provide at least 2 options', type: 'danger' });
      return;
    }

    if (!formData.explanation.trim()) {
      showMessage({ message: 'Please provide an explanation', type: 'danger' });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        question: formData.question,
        options: formData.options.filter(opt => opt.trim()),
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        category: formData.category || 'General',
        difficulty: formData.difficulty,
      };

      const response = await API.createUserQuestion(payload);

      if (response.success) {
        showMessage({ message: 'Question created successfully!', type: 'success' });
        setShowCreateForm(false);
        resetForm();
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error creating question:', error);
      showMessage({
        message: error.response?.data?.message || 'Failed to create question',
        type: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: null,
      explanation: '',
      category: '',
      difficulty: 'medium',
    });
  };

  const handleLikeQuestion = async (questionId) => {
    try {
      await API.likeUserQuestion(questionId);
      fetchQuestions(); // Refresh to update likes
    } catch (error) {
      console.error('Error liking question:', error);
    }
  };

  const handleViewQuestion = async (questionId) => {
    try {
      await API.incrementUserQuestionView(questionId);
      // Navigate to question detail or show modal
    } catch (error) {
      console.error('Error viewing question:', error);
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

  const renderQuestionCard = (question) => (
    <Card key={question._id} style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.questionTitleContainer}>
          <Text style={[styles.questionTitle, { color: colors.text }]} numberOfLines={2}>
            {question.question}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(question.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(question.difficulty) }]}>
              {question.difficulty}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.questionInfo}>
        <View style={styles.questionInfoItem}>
          <Icon name="category" size={16} color={colors.textSecondary} />
          <Text style={[styles.questionInfoText, { color: colors.textSecondary }]}>
            {question.category}
          </Text>
        </View>
        <View style={styles.questionInfoItem}>
          <Icon name="person" size={16} color={colors.textSecondary} />
          <Text style={[styles.questionInfoText, { color: colors.textSecondary }]}>
            {question.user?.name || 'Anonymous'}
          </Text>
        </View>
      </View>

      <View style={styles.questionStats}>
        <TouchableOpacity style={styles.statItem} onPress={() => handleLikeQuestion(question._id)}>
          <Icon name="thumb-up" size={16} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {question.likesCount || 0}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem} onPress={() => handleViewQuestion(question._id)}>
          <Icon name="visibility" size={16} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {question.viewsCount || 0}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.statItem}>
          <Icon name="schedule" size={16} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {new Date(question.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Button
        title="Answer Question"
        onPress={() => handleViewQuestion(question._id)}
        variant="outline"
        style={styles.answerButton}
      />
    </Card>
  );

  const renderCreateForm = () => (
    <Card style={styles.createFormCard}>
      <Text style={[styles.formTitle, { color: colors.text }]}>Create New Question</Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Enter your question..."
        placeholderTextColor={colors.textSecondary}
        value={formData.question}
        onChangeText={(text) => setFormData({ ...formData, question: text })}
        multiline
        numberOfLines={3}
      />

      <Text style={[styles.inputLabel, { color: colors.text }]}>Options:</Text>
      {formData.options.map((option, index) => (
        <View key={index} style={styles.optionContainer}>
          <TextInput
            style={[styles.optionInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder={`Option ${index + 1}`}
            placeholderTextColor={colors.textSecondary}
            value={option}
            onChangeText={(text) => {
              const newOptions = [...formData.options];
              newOptions[index] = text;
              setFormData({ ...formData, options: newOptions });
            }}
          />
          <TouchableOpacity
            style={[
              styles.radioButton,
              { borderColor: formData.correctAnswer === index ? colors.primary : colors.border }
            ]}
            onPress={() => setFormData({ ...formData, correctAnswer: index })}
          >
            {formData.correctAnswer === index && (
              <View style={[styles.radioButtonFill, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </View>
      ))}

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Enter explanation..."
        placeholderTextColor={colors.textSecondary}
        value={formData.explanation}
        onChangeText={(text) => setFormData({ ...formData, explanation: text })}
        multiline
        numberOfLines={3}
      />

      <View style={styles.formActions}>
        <Button
          title="Cancel"
          onPress={() => {
            setShowCreateForm(false);
            resetForm();
          }}
          variant="outline"
          style={styles.formButton}
        />
        <Button
          title="Create Question"
          onPress={handleSubmitQuestion}
          loading={submitting}
          style={styles.formButton}
        />
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title={t('navigation.postQuestions')}
          showBackButton={true}
          showLanguageToggle={true}
          onBackPress={() => navigation.goBack()}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="quiz" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={t('navigation.postQuestions')}
        showBackButton={true}
        showLanguageToggle={true}
        onBackPress={() => navigation.goBack()}
        onLanguageToggle={handleLanguageToggle}
      />
      
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
            Community Questions
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Answer questions posted by other users
          </Text>
        </View>

        {/* Create Question Button */}
        <Card style={styles.createButtonCard}>
          <Button
            title="Create New Question"
            onPress={handleCreateQuestion}
            icon={<Icon name="add" size={20} color="white" />}
            style={styles.createButton}
          />
        </Card>

        {/* Create Form */}
        {showCreateForm && renderCreateForm()}

        {/* Questions List */}
        <View style={styles.questionsContainer}>
          {questions.length > 0 ? (
            questions.map(renderQuestionCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Icon name="quiz" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No questions available
              </Text>
            </Card>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
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
  },
  createButtonCard: {
    margin: 16,
    marginTop: 0,
  },
  createButton: {
    marginTop: 0,
  },
  createFormCard: {
    margin: 16,
    marginTop: 16,
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  formButton: {
    flex: 1,
  },
  questionsContainer: {
    paddingHorizontal: 16,
  },
  questionCard: {
    marginBottom: 12,
    padding: 16,
  },
  questionHeader: {
    marginBottom: 12,
  },
  questionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionInfo: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 12,
  },
  questionInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionInfoText: {
    fontSize: 14,
    marginLeft: 4,
  },
  questionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    marginLeft: 4,
  },
  answerButton: {
    marginTop: 8,
  },
  emptyCard: {
    margin: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ProQuestionsScreen;