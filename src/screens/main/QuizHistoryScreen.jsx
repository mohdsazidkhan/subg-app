import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';


const QuizHistoryScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const res = await API.getQuizHistory();
      const payload = res?.data || res;
      
      setAttempts(payload.attempts || payload.items || []);
    } catch (e) {
      console.error('Error loading quiz history:', e);
      setAttempts([]);
      showMessage({
        message: 'Failed to load quiz history',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttempts();
    setRefreshing(false);
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const renderAttemptItem = (attempt, index) => (
    <Card key={attempt._id || index} style={{ marginBottom: 16, padding: 20 }}>
      <Text style={[styles.quizTitle, { color: colors.text }]}>
        {attempt.quiz?.title || 'Quiz'}
      </Text>
      
      <View style={styles.metaRow}>
        <Icon name="category" size={18} color={colors.textSecondary} />
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          {attempt.quiz?.category?.name || '—'}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Icon name="emoji-events" size={18} color={colors.textSecondary} />
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          {attempt.score}/{attempt.totalQuestions} ({(attempt.percentage || 0).toFixed(1)}%)
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Icon name="timer" size={18} color={colors.textSecondary} />
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          {formatTime(attempt.timeSpent)}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Icon name="event" size={18} color={colors.textSecondary} />
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          {attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString() : '—'}
        </Text>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: colors.surface }]}>
        <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>
          {(attempt.status || 'completed').toUpperCase()}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={t('navigation.history') || 'Quiz History'}
        showBackButton={true}
        onBackPress={() => {}}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={[styles.centerContent, { padding: 40 }]}>
            <Icon name="hourglass-top" size={40} color={colors.primary} />
            <Text style={{ color: colors.text, marginTop: 16 }}>
              {t('common.loading') || 'Loading...'}
            </Text>
          </View>
        ) : attempts.length === 0 ? (
          <View style={[styles.centerContent, { padding: 40 }]}>
            <Icon name="history" size={40} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
              No attempts yet
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
              Start taking quizzes to see your history here!
            </Text>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            {attempts.map((attempt, index) => renderAttemptItem(attempt, index))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});

export default QuizHistoryScreen;