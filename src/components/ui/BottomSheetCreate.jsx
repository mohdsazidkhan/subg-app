import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * BottomSheetCreate
 * A small, dependency-free bottom sheet that slides up from the bottom
 * providing quick-create actions similar to the web FloatingActionButton sheet.
 */
const BottomSheetCreate = ({ visible, onClose, onCreateQuiz, onPostQuestion }) => {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.4,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
            opacity: backdropOpacity,
          }}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 1,
          borderColor: colors.border,
          paddingBottom: 20,
          transform: [{ translateY }],
        }}
      >
        <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>
            What would you like to create?
          </Text>

          <TouchableOpacity
            onPress={onCreateQuiz}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.cardBackground || colors.surface,
              marginBottom: 10,
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Icon name="library-books" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Post Quiz</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Design custom quizzes and earn rewards
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPostQuestion}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.cardBackground || colors.surface,
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Icon name="help" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Post Question</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Share interesting questions with the community
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default BottomSheetCreate;
