import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import Card from '../../components/Card';


const PostQuestionScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionCount, setQuestionCount] = useState({
    currentCount: 0,
    limit: 100,
    remaining: 100,
    canAddMore: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchCurrentMonthQuestionCount();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.getPublicCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCurrentMonthQuestionCount = async () => {
    try {
      const response = await API.getCurrentMonthQuestionCount();
      if (response.success) {
        setQuestionCount(response.data);
      }
    } catch (error) {
      console.error('Error fetching current month question count:', error);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerSelect = (index) => {
    setCorrectAnswer(index);
  };

  const validateForm = () => {
    if (!questionCount.canAddMore) {
      Alert.alert(
        'Monthly Limit Reached',
        `You have reached the monthly limit of ${questionCount.limit} questions. You can add more questions next month.`
      );
      return false;
    }

    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return false;
    }

    if (options.some(option => !option.trim())) {
      Alert.alert('Error', 'Please fill in all options');
      return false;
    }

    if (correctAnswer === null) {
      Alert.alert('Error', 'Please select the correct answer');
      return false;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }

    if (!explanation.trim()) {
      Alert.alert('Error', 'Please provide an explanation');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        question: question.trim(),
        options: options.map(opt => opt.trim()),
        correctAnswer,
        explanation: explanation.trim(),
        category,
        difficulty,
      };

      const response = await API.createUserQuestion(payload);

      if (response.success) {
        showMessage({
          message: 'Question submitted successfully! It will be reviewed before publishing.',
          type: 'success',
        });

        // Reset form
        setQuestion('');
        setOptions(['', '', '', '']);
        setCorrectAnswer(null);
        setExplanation('');
        setCategory('');
        setDifficulty('medium');

        // Refresh question count
        fetchCurrentMonthQuestionCount();

        // Navigate back or to questions list
        navigation.goBack();
      } else {
        showMessage({
          message: response.message || 'Failed to submit question',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      showMessage({
        message: error.message || 'Failed to submit question',
        type: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderOption = (index) => (
    <View key={index} style={styles.optionContainer}>
      <TouchableOpacity
        style={[
          styles.optionButton,
          {
            backgroundColor: correctAnswer === index ? colors.primary + '20' : colors.background,
            borderColor: correctAnswer === index ? colors.primary : colors.border,
          },
        ]}
        onPress={() => handleCorrectAnswerSelect(index)}
      >
        <Icon
          name={correctAnswer === index ? 'radio-button-checked' : 'radio-button-unchecked'}
          size={20}
          color={correctAnswer === index ? colors.primary : colors.textSecondary}
        />
        <Text style={[styles.optionLabel, { color: colors.text }]}>
          Option {String.fromCharCode(65 + index)}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={[
          styles.optionInput,
          { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
        ]}
        placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
        placeholderTextColor={colors.textSecondary}
        value={options[index]}
        onChangeText={(value) => handleOptionChange(index, value)}
        multiline
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar
        title="Post Question"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            📝 Create New Question
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Earn ₹10 for each approved question
          </Text>

          {/* Monthly Question Count */}
          <View style={[styles.questionCountContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.questionCountText, { color: colors.text }]}>
              Monthly Progress: {questionCount.currentCount}/{questionCount.limit}
            </Text>
            <Text style={[styles.questionCountSubtext, { color: colors.textSecondary }]}>
              {questionCount.remaining} questions remaining this month
            </Text>
            {!questionCount.canAddMore && (
              <Text style={[styles.limitReachedText, { color: colors.error || '#FF6B6B' }]}>
                ⚠️ Monthly limit reached
              </Text>
            )}
          </View>
        </View>

        {/* Question Input */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Question *</Text>
          <TextInput
            style={[
              styles.questionInput,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
            ]}
            placeholder="Enter your question here..."
            placeholderTextColor={colors.textSecondary}
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={4}
          />
        </Card>

        {/* Options */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Answer Options *</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Tap on the option letter to mark it as correct
          </Text>
          {options.map((_, index) => renderOption(index))}
        </Card>

        {/* Category Selection */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: category === cat._id ? colors.primary : colors.background,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setCategory(cat._id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: category === cat._id ? 'white' : colors.primary },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* Difficulty Selection */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {['easy', 'medium', 'hard'].map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyChip,
                  {
                    backgroundColor: difficulty === level ? colors.primary : colors.background,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text
                  style={[
                    styles.difficultyChipText,
                    { color: difficulty === level ? 'white' : colors.primary },
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Explanation */}
        <Card style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Explanation *</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Provide a clear explanation for the correct answer
          </Text>
          <TextInput
            style={[
              styles.explanationInput,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
            ]}
            placeholder="Explain why this is the correct answer..."
            placeholderTextColor={colors.textSecondary}
            value={explanation}
            onChangeText={setExplanation}
            multiline
            numberOfLines={4}
          />
        </Card>

        {/* Guidelines */}
        <Card style={[styles.guidelinesCard, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.guidelinesTitle, { color: colors.primary }]}>📋 Guidelines</Text>
          <Text style={[styles.guidelinesText, { color: colors.text }]}>
            • Questions should be clear and unambiguous{'\n'}
            • All options should be plausible{'\n'}
            • Provide detailed explanations{'\n'}
            • Avoid controversial or offensive content{'\n'}
            • Questions will be reviewed before approval
          </Text>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            title={
              !questionCount.canAddMore
                ? 'Monthly Limit Reached'
                : submitting
                ? 'Submitting...'
                : 'Submit Question'
            }
            onPress={handleSubmit}
            disabled={submitting || !questionCount.canAddMore}
            style={[
              styles.submitButton,
              {
                backgroundColor: !questionCount.canAddMore || submitting
                  ? colors.textSecondary
                  : colors.primary,
              },
            ]}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  questionCountContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  questionCountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  questionCountSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  limitReachedText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  questionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  optionContainer: {
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  optionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  difficultyContainer: {
    flexDirection: 'row',
  },
  difficultyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  difficultyChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  explanationInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  guidelinesCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  guidelinesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  submitContainer: {
    padding: 20,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default PostQuestionScreen;