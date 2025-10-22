import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';

const StartQuizModal = ({ visible, quiz, onCancel, onStart }) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}> 
          <View style={styles.headerRow}> 
            <View style={[styles.iconWrap, { backgroundColor: colors.primary + '20' }]}> 
              <Icon name="quiz" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Start Quiz</Text>
          </View>

          <Text style={[styles.quizTitle, { color: colors.text }]} numberOfLines={2}>
            {quiz?.title || 'Quiz'}
          </Text>
          {!!quiz?.category?.name && (
            <Text style={[styles.subText, { color: colors.textSecondary }]}>Category: {quiz.category.name}</Text>
          )}
          {!!quiz?.subcategory?.name && (
            <Text style={[styles.subText, { color: colors.textSecondary }]}>Subcategory: {quiz.subcategory.name}</Text>
          )}
          {!!quiz?.requiredLevel && (
            <Text style={[styles.subText, { color: colors.textSecondary }]}>Required Level: {quiz.requiredLevel}</Text>
          )}

          <View style={styles.actionsRow}> 
            <TouchableOpacity style={[styles.btn, styles.cancelBtn, { borderColor: colors.border }]} onPress={onCancel}>
              <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.startBtn]} onPress={onStart}>
              <Icon name="play-arrow" size={18} color="#fff" />
              <Text style={styles.startText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  title: { fontSize: 18, fontWeight: '700' },
  quizTitle: { fontSize: 16, fontWeight: '600', marginTop: 6, marginBottom: 8 },
  subText: { fontSize: 13, marginBottom: 4 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, flex: 1 },
  cancelBtn: { borderWidth: 1, marginRight: 10 },
  startBtn: { backgroundColor: '#3B82F6' },
  cancelText: { fontSize: 14, fontWeight: '700' },
  startText: { color: 'white', fontSize: 14, fontWeight: '700', marginLeft: 4 },
});

export default StartQuizModal;
