import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';

const StepHeader = ({ step, colors }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Step {step} of 3</Text>
  </View>
);

function LabeledInput({ label, value, onChangeText, colors, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textSecondary}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.cardBackground || colors.surface,
          color: colors.text,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
        {...props}
      />
    </View>
  );
}

const CreateUserQuizScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Steps
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Categories
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Form
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    difficulty: 'beginner',
    requiredLevel: 1,
    timeLimit: 3,
    questions: [
      { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, timeLimit: 30 },
    ],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (quizData.categoryId) {
      fetchSubcategories(quizData.categoryId);
    } else {
      setSubcategories([]);
    }
  }, [quizData.categoryId]);

  const fetchCategories = async () => {
    try {
      let res;
      if (typeof API.getApprovedCategories === 'function') {
        res = await API.getApprovedCategories();
      } else if (typeof API.getPublicCategories === 'function') {
        // Fallback to public categories if pro endpoint not available
        res = await API.getPublicCategories();
        // Normalize to expected shape
        if (res && Array.isArray(res)) {
          res = { success: true, data: { allCategories: res } };
        }
      } else if (typeof API.getCategories === 'function') {
        res = await API.getCategories();
        if (res && Array.isArray(res)) {
          res = { success: true, data: { allCategories: res } };
        }
      }
      if (res?.success && Array.isArray(res.data?.allCategories)) {
        setCategories(res.data.allCategories);
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      let res;
      if (typeof API.getApprovedSubcategories === 'function') {
        res = await API.getApprovedSubcategories(categoryId);
      } else if (typeof API.getSubcategories === 'function') {
        res = await API.getSubcategories(categoryId);
        if (Array.isArray(res)) {
          res = { success: true, data: { allSubcategories: res } };
        }
      } else if (typeof API.getSubCategories === 'function') {
        res = await API.getSubCategories(categoryId);
        if (Array.isArray(res)) {
          res = { success: true, data: { allSubcategories: res } };
        }
      }
      if (res?.success && Array.isArray(res.data?.allSubcategories)) {
        setSubcategories(res.data.allSubcategories);
      }
    } catch (e) {
      console.error('Failed to load subcategories', e);
    }
  };

  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const addQuestion = () => {
    if (quizData.questions.length >= 10) return;
    setQuizData((d) => ({
      ...d,
      questions: [...d.questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, timeLimit: 30 }],
    }));
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length <= 1) return;
    setQuizData((d) => ({ ...d, questions: d.questions.filter((_, i) => i !== index) }));
  };

  const updateQuestion = (index, field, value) => {
    setQuizData((d) => {
      const updated = [...d.questions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...d, questions: updated };
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuizData((d) => {
      const updated = [...d.questions];
      const q = { ...updated[qIndex] };
      const options = [...q.options];
      options[optIndex] = value;
      updated[qIndex] = { ...q, options };
      return { ...d, questions: updated };
    });
  };

  const submit = async () => {
    if (quizData.questions.length < 5 || quizData.questions.length > 10) {
      Alert.alert('Invalid', 'Quiz must have 5-10 questions');
      return;
    }
    if (!quizData.categoryId || !quizData.subcategoryId) {
      Alert.alert('Missing', 'Please select category and subcategory');
      return;
    }
    if (!quizData.title || quizData.title.length < 10) {
      Alert.alert('Title', 'Title must be at least 10 characters');
      return;
    }
    setLoading(true);
    try {
      await API.createUserQuiz(quizData);
      Alert.alert('Success', 'Quiz created! Pending admin approval', [
        { text: 'OK', onPress: () => navigation.navigate('MyQuestions') },
      ]);
    } catch (e) {
      const msg = e?.message || 'Failed to create quiz';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 6 }}>Create Custom Quiz</Text>
      <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>Earn rewards by creating quality quizzes</Text>

      {step === 1 && (
        <View>
          <StepHeader step={1} colors={colors} />

          <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>Category *</Text>
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginBottom: 12 }}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c._id}
                onPress={() => setQuizData({ ...quizData, categoryId: c._id, subcategoryId: '' })}
                style={{ padding: 12, backgroundColor: quizData.categoryId === c._id ? (colors.cardBackground || colors.surface) : 'transparent' }}
              >
                <Text style={{ color: colors.text }}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {!!quizData.categoryId && (
            <>
              <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>Subcategory *</Text>
              <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginBottom: 12 }}>
                {subcategories.map((s) => (
                  <TouchableOpacity
                    key={s._id}
                    onPress={() => setQuizData({ ...quizData, subcategoryId: s._id })}
                    style={{ padding: 12, backgroundColor: quizData.subcategoryId === s._id ? (colors.cardBackground || colors.surface) : 'transparent' }}
                  >
                    <Text style={{ color: colors.text }}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity onPress={nextStep} style={{ backgroundColor: colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Next: Details →</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View>
          <StepHeader step={2} colors={colors} />
          <LabeledInput label="Quiz Title * (min 10)" value={quizData.title} onChangeText={(t) => setQuizData({ ...quizData, title: t })} colors={colors} maxLength={200} />
          <LabeledInput label="Description (max 1000)" value={quizData.description} onChangeText={(t) => setQuizData({ ...quizData, description: t })} colors={colors} multiline numberOfLines={4} maxLength={1000} />

          <LabeledInput label="Difficulty (beginner/intermediate/advanced/expert)" value={quizData.difficulty} onChangeText={(t) => setQuizData({ ...quizData, difficulty: t || 'beginner' })} colors={colors} />
          <LabeledInput label="Required Level (1-10)" value={String(quizData.requiredLevel)} onChangeText={(t) => setQuizData({ ...quizData, requiredLevel: parseInt(t) || 1 })} colors={colors} keyboardType="number-pad" />
          <LabeledInput label="Time Limit in minutes (2-5)" value={String(quizData.timeLimit)} onChangeText={(t) => setQuizData({ ...quizData, timeLimit: parseInt(t) || 3 })} colors={colors} keyboardType="number-pad" />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={prevStep} style={{ flex: 1, backgroundColor: colors.border, padding: 14, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextStep} style={{ flex: 1, backgroundColor: colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Next: Questions →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <StepHeader step={3} colors={colors} />
          <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Minimum 5, maximum 10 questions</Text>

          {quizData.questions.map((q, qIndex) => (
            <View key={qIndex} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>Question {qIndex + 1}</Text>
                {quizData.questions.length > 1 && (
                  <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                    <Text style={{ color: colors.error }}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <LabeledInput label="Question Text" value={q.questionText} onChangeText={(t) => updateQuestion(qIndex, 'questionText', t)} colors={colors} multiline />

              {[0, 1, 2, 3].map((i) => (
                <LabeledInput key={i} label={`Option ${i + 1}${q.correctAnswerIndex === i ? ' (✓ correct)' : ''}`} value={q.options[i]} onChangeText={(t) => updateOption(qIndex, i, t)} colors={colors} />
              ))}

              <LabeledInput label="Correct Answer Index (0-3)" value={String(q.correctAnswerIndex)} onChangeText={(t) => updateQuestion(qIndex, 'correctAnswerIndex', Math.min(3, Math.max(0, parseInt(t) || 0)))} colors={colors} keyboardType="number-pad" />
              <LabeledInput label="Time Limit (15-60 sec)" value={String(q.timeLimit)} onChangeText={(t) => updateQuestion(qIndex, 'timeLimit', parseInt(t) || 30)} colors={colors} keyboardType="number-pad" />
            </View>
          ))}

          <TouchableOpacity onPress={addQuestion} disabled={quizData.questions.length >= 10} style={{ backgroundColor: colors.accent, padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12, opacity: quizData.questions.length >= 10 ? 0.6 : 1 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>+ Add Question ({quizData.questions.length}/10)</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={prevStep} style={{ flex: 1, backgroundColor: colors.border, padding: 14, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submit} disabled={loading || quizData.questions.length < 5} style={{ flex: 1, backgroundColor: colors.success, padding: 14, borderRadius: 10, alignItems: 'center', opacity: loading || quizData.questions.length < 5 ? 0.7 : 1 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>✓ Create Quiz</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default CreateUserQuizScreen;
