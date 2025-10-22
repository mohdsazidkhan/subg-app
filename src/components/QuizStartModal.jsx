import React, { useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Row = ({ children, style }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>
);

const Bullet = ({ children, dotColor, textColor }) => (
  <Row style={{ marginBottom: 6 }}>
    <Text style={{ color: dotColor, marginRight: 8 }}>•</Text>
    <Text style={{ flex: 1, color: textColor }}>{children}</Text>
  </Row>
);

const QuizStartModal = ({ visible, onClose, onConfirm, quiz }) => {
  const { colors } = useTheme();
  
  const slide = useRef(new Animated.Value(300)).current;
  console.log(quiz, 'QuizStartModal')
  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 0 : 300,
      duration: 220,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  const questions = quiz?.questionCount || quiz?.questionsCount || quiz?.totalMarks || (Array.isArray(quiz?.questions) ? quiz.questions.length : undefined);
  const timeText = quiz?.timeLimit ? `${quiz.timeLimit} Time Remaining` : 'No data available';
  const categoryText = quiz?.subcategory?.name
    ? (quiz?.category?.name ? `${quiz.subcategory.name} (${quiz.category.name})` : quiz.subcategory.name)
    : (quiz?.category?.name || quiz?.levelName || 'General');
  const levelValue = quiz?.requiredLevel || quiz?.level || quiz?.levelNumber;
  const levelText = levelValue ? `Level ${levelValue}` : 'Level not specified';

  return (
    <Modal transparent visible onRequestClose={onClose} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <Animated.View
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          transform: [{ translateY: slide }],
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        }}
      >
        {/* Header */}
        <Row style={{ justifyContent: 'center', marginBottom: 8 }}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
            <Icon name="play-arrow" size={28} color="#fff" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Start Quiz</Text>
        </Row>

        {/* Quiz summary card */}
        <View style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }} numberOfLines={2}>
            {quiz?.title || quiz?.name || 'Quiz'}
          </Text>
          <Row style={{ marginBottom: 6 }}>
            <Icon name="timer" size={18} color={colors.textSecondary} />
            <Text style={{ marginLeft: 8, color: colors.textSecondary }}>{timeText}</Text>
          </Row>
          <Row style={{ marginBottom: 6 }}>
            <Icon name="help-outline" size={18} color={colors.textSecondary} />
            <Text style={{ marginLeft: 8, color: colors.textSecondary }}>
          {typeof questions === 'number' ? `${questions} Question` : 'No data available'}
            </Text>
          </Row>
          <Row style={{ marginBottom: 6 }}>
            <Icon name="category" size={18} color={colors.textSecondary} />
            <Text style={{ marginLeft: 8, color: colors.textSecondary }}>{categoryText}</Text>
          </Row>
          <Row>
            <Icon name="emoji-events" size={18} color={colors.textSecondary} />
            <Text style={{ marginLeft: 8, color: colors.textSecondary }}>{levelText}</Text>
          </Row>
        </View>

        {/* Important Information */}
        <View style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '800', marginBottom: 8 }}>Quiz Result</Text>
          <Bullet dotColor={colors.textSecondary} textColor={colors.text}>Network error. Please check your internet connection.</Bullet>
          <Bullet dotColor={colors.textSecondary} textColor={colors.text}>Finish Quiz</Bullet>
          <Bullet dotColor={colors.textSecondary} textColor={colors.text}>Back</Bullet>
        </View>

        {/* Actions */}
        <Row style={{ marginTop: 12 }}>
          <TouchableOpacity onPress={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginRight: 8 }}>
            <Row>
              <Icon name="close" size={18} color={colors.text} />
              <Text style={{ color: colors.text, marginLeft: 6, fontWeight: '600' }}>Cancel</Text>
            </Row>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', marginLeft: 8 }}>
            <Row>
              <Icon name="play-arrow" size={18} color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 6, fontWeight: '700' }}>Start Quiz</Text>
            </Row>
          </TouchableOpacity>
        </Row>
      </Animated.View>
    </Modal>
  );
};

export default QuizStartModal;
