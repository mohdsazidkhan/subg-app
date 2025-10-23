import React, { useRef, useEffect, useState } from 'react';
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
  const [acceptedFullscreen, setAcceptedFullscreen] = useState(false);
  
  const slide = useRef(new Animated.Value(300)).current;
  
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
  const timeText = quiz?.timeLimit ? `${quiz.timeLimit} minutes time limit` : 'No time limit';
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
        <Row style={{ justifyContent: 'center', marginBottom: 16 }}>
          <View style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            backgroundColor: colors.primary, 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginRight: 8 
          }}>
            <Icon name="play-arrow" size={24} color="#fff" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Start Quiz?</Text>
        </Row>

        {/* Quiz Info Card */}
        {quiz?.title && (
          <View style={{ 
            backgroundColor: colors.background, 
            borderRadius: 12, 
            padding: 12, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border
          }}>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }} numberOfLines={2}>
              {quiz.title}
          </Text>
          <Row style={{ marginBottom: 6 }}>
              <Icon name="help-outline" size={16} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, color: colors.textSecondary, fontSize: 14 }}>
                {typeof questions === 'number' ? `${questions} Questions` : 'Questions not specified'}
            </Text>
          </Row>
          <Row style={{ marginBottom: 6 }}>
              <Icon name="timer" size={16} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, color: colors.textSecondary, fontSize: 14 }}>{timeText}</Text>
            </Row>
            <Row style={{ marginBottom: 6 }}>
              <Icon name="category" size={16} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, color: colors.textSecondary, fontSize: 14 }}>{categoryText}</Text>
          </Row>
          <Row>
              <Icon name="emoji-events" size={16} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, color: colors.textSecondary, fontSize: 14 }}>{levelText}</Text>
          </Row>
        </View>
        )}

        {/* Important Information */}
        <View style={{ 
          backgroundColor: colors.background, 
          borderRadius: 12, 
          padding: 12, 
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>Important Information</Text>
          <Bullet dotColor={colors.textSecondary} textColor={colors.text}>Quiz will open in fullscreen mode</Bullet>
          <Bullet dotColor={colors.textSecondary} textColor={colors.text}>You must complete the quiz in one session</Bullet>
          <Bullet dotColor={colors.textSecondary} textColor={colors.text}>Exiting will submit your quiz</Bullet>
          <Bullet dotColor={colors.textSecondary} textColor={colors.text}>Make sure you have a stable internet connection</Bullet>
        </View>

        {/* Fullscreen Permission */}
        <View style={{ 
          backgroundColor: colors.background, 
          borderRadius: 12, 
          padding: 12, 
          marginBottom: 16,
          borderWidth: 2,
          borderColor: colors.primary
        }}>
          <Row style={{ marginBottom: 8 }}>
            <Icon name="fullscreen" size={20} color={colors.primary} />
            <Text style={{ marginLeft: 8, color: colors.text, fontWeight: '600' }}>Fullscreen Required</Text>
          </Row>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 12 }}>
            This quiz requires fullscreen mode for a distraction-free experience.
          </Text>
          
          {/* Checkbox */}
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => setAcceptedFullscreen(!acceptedFullscreen)}
          >
            <View style={{
              width: 20,
              height: 20,
              borderWidth: 2,
              borderColor: colors.primary,
              borderRadius: 4,
              marginRight: 12,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: acceptedFullscreen ? colors.primary : 'transparent'
            }}>
              {acceptedFullscreen && (
                <Icon name="check" size={14} color="#fff" />
              )}
            </View>
            <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>
              I agree to start the quiz in fullscreen mode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <Row style={{ marginTop: 8 }}>
          <TouchableOpacity 
            onPress={onClose} 
            style={{ 
              flex: 1, 
              padding: 12, 
              borderRadius: 12, 
              borderWidth: 1, 
              borderColor: colors.border, 
              alignItems: 'center', 
              marginRight: 8,
              backgroundColor: colors.background
            }}
          >
            <Row>
              <Icon name="close" size={18} color={colors.text} />
              <Text style={{ color: colors.text, marginLeft: 6, fontWeight: '600' }}>Cancel</Text>
            </Row>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onConfirm} 
            disabled={!acceptedFullscreen}
            style={{ 
              flex: 1, 
              padding: 12, 
              borderRadius: 12, 
              alignItems: 'center', 
              marginLeft: 8,
              backgroundColor: acceptedFullscreen ? colors.primary : colors.border,
              opacity: acceptedFullscreen ? 1 : 0.5
            }}
          >
            <Row>
              <Icon name="play-arrow" size={18} color={acceptedFullscreen ? "#fff" : colors.textSecondary} />
              <Text style={{ 
                color: acceptedFullscreen ? "#fff" : colors.textSecondary, 
                marginLeft: 6, 
                fontWeight: '700' 
              }}>Start Quiz</Text>
            </Row>
          </TouchableOpacity>
        </Row>
        
        {/* Helper Text */}
        {!acceptedFullscreen && (
          <Text style={{ 
            textAlign: 'center', 
            color: colors.textSecondary, 
            fontSize: 12, 
            marginTop: 8 
          }}>
            Please accept fullscreen permission to start the quiz
          </Text>
        )}
      </Animated.View>
    </Modal>
  );
};

export default QuizStartModal;
