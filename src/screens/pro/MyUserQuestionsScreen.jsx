import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';


const MyUserQuestionsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    load();
    loadStats();
  }, [status, page]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.getMyUserQuestions({ status, page, limit });
      if (res?.success) {
        setItems(res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error loading questions:', err);
      showMessage({
        message: 'Failed to load questions',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        API.getMyUserQuestions({ page: 1, limit: 1 }),
        API.getMyUserQuestions({ status: 'pending', page: 1, limit: 1 }),
        API.getMyUserQuestions({ status: 'approved', page: 1, limit: 1 }),
        API.getMyUserQuestions({ status: 'rejected', page: 1, limit: 1 }),
      ]);
      setStats({
        total: allRes.pagination?.total || 0,
        pending: pendingRes.pagination?.total || 0,
        approved: approvedRes.pagination?.total || 0,
        rejected: rejectedRes.pagination?.total || 0,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), loadStats()]);
    setRefreshing(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return colors.warning || '#F59E0B';
      case 'approved':
        return colors.success || '#10B981';
      case 'rejected':
        return colors.error || '#EF4444';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'approved':
        return 'check-circle';
      case 'rejected':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const handleCreateQuestion = () => {
    navigation.navigate('PostQuestion');
  };

  const renderQuestionItem = (q, index) => (
    <Card key={q._id} style={[styles.questionCard, { backgroundColor: colors.surface }]}>
      <View style={styles.questionHeader}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(q.status) + '20' },
            ]}
          >
            <Icon name={getStatusIcon(q.status)} size={16} color={getStatusColor(q.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(q.status) }]}>
              {getStatusText(q.status)}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {new Date(q.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text style={[styles.questionText, { color: colors.text }]}>{q.questionText}</Text>

      {/* Options Preview */}
      <View style={styles.optionsContainer}>
        {q.options.map((option, idx) => (
          <View
            key={idx}
            style={[
              styles.optionItem,
              {
                backgroundColor:
                  idx === q.correctOptionIndex ? colors.success + '20' : colors.background,
                borderColor: idx === q.correctOptionIndex ? colors.success : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.optionIndicator,
                {
                  backgroundColor:
                    idx === q.correctOptionIndex ? colors.success : colors.textSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionLetter,
                  { color: idx === q.correctOptionIndex ? 'white' : colors.text },
                ]}
              >
                {String.fromCharCode(65 + idx)}
              </Text>
            </View>
            <Text
              style={[
                styles.optionText,
                { color: idx === q.correctOptionIndex ? colors.success : colors.text },
              ]}
            >
              {option}
            </Text>
            {idx === q.correctOptionIndex && (
              <Icon name="check" size={16} color={colors.success} />
            )}
          </View>
        ))}
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="visibility" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {q.viewsCount || 0}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="favorite" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {q.likesCount || 0}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="share" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {q.sharesCount || 0}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="comment" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {(q.answers || []).length}
            </Text>
          </View>
        </View>
        <Text style={[styles.submittedText, { color: colors.textSecondary }]}>
          Submitted {new Date(q.createdAt).toLocaleString()}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="My Questions"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleCreateQuestion}>
            <Icon name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Monthly Limit Info */}
        <Card style={[styles.limitCard, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.limitText, { color: colors.primary }]}>
            📅 You Can Add Max 100 Questions Per Month
          </Text>
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
            <Icon name="description" size={20} color={colors.primary} />
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
            <Text style={[styles.statValue, { color: colors.warning || '#F59E0B' }]}>
              {stats.pending}
            </Text>
            <Icon name="schedule" size={20} color={colors.warning || '#F59E0B'} />
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Approved</Text>
            <Text style={[styles.statValue, { color: colors.success || '#10B981' }]}>
              {stats.approved}
            </Text>
            <Icon name="check-circle" size={20} color={colors.success || '#10B981'} />
          </Card>

          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rejected</Text>
            <Text style={[styles.statValue, { color: colors.error || '#EF4444' }]}>
              {stats.rejected}
            </Text>
            <Icon name="cancel" size={20} color={colors.error || '#EF4444'} />
          </Card>
        </View>

        {/* Filter Section */}
        <Card style={[styles.filterCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Filter by Status:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor: status === '' ? colors.primary : colors.background,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                setPage(1);
                setStatus('');
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { color: status === '' ? 'white' : colors.primary },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    status === 'pending' ? colors.warning || '#F59E0B' : colors.background,
                  borderColor: colors.warning || '#F59E0B',
                },
              ]}
              onPress={() => {
                setPage(1);
                setStatus('pending');
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { color: status === 'pending' ? 'white' : colors.warning || '#F59E0B' },
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    status === 'approved' ? colors.success || '#10B981' : colors.background,
                  borderColor: colors.success || '#10B981',
                },
              ]}
              onPress={() => {
                setPage(1);
                setStatus('approved');
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { color: status === 'approved' ? 'white' : colors.success || '#10B981' },
                ]}
              >
                Approved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    status === 'rejected' ? colors.error || '#EF4444' : colors.background,
                  borderColor: colors.error || '#EF4444',
                },
              ]}
              onPress={() => {
                setPage(1);
                setStatus('rejected');
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { color: status === 'rejected' ? 'white' : colors.error || '#EF4444' },
                ]}
              >
                Rejected
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
            Showing {items.length} of {total} questions
          </Text>
        </Card>

        {/* Questions List */}
        {loading ? (
          <Card style={[styles.loadingCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading your questions...
            </Text>
          </Card>
        ) : items.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>🤔</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No questions found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {status === ''
                ? "You haven't created any questions yet."
                : `No ${status} questions found.`}
            </Text>
            <Button
              title="Create Your First Question"
              onPress={handleCreateQuestion}
              style={[styles.createButton, { backgroundColor: colors.primary }]}
            />
          </Card>
        ) : (
          <View style={styles.questionsList}>
            {items.map((q, index) => renderQuestionItem(q, index))}
          </View>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={[styles.paginationContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.paginationInfo, { color: colors.textSecondary }]}>
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} questions
            </Text>
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                disabled={page <= 1}
                style={[
                  styles.paginationButton,
                  {
                    backgroundColor: page <= 1 ? colors.textSecondary : colors.primary,
                    opacity: page <= 1 ? 0.5 : 1,
                  },
                ]}
                onPress={() => setPage(p => p - 1)}
              >
                <Text style={styles.paginationButtonText}>Previous</Text>
              </TouchableOpacity>

              <Text style={[styles.pageInfo, { color: colors.text }]}>
                Page {page} of {totalPages}
              </Text>

              <TouchableOpacity
                disabled={page >= totalPages}
                style={[
                  styles.paginationButton,
                  {
                    backgroundColor: page >= totalPages ? colors.textSecondary : colors.primary,
                    opacity: page >= totalPages ? 0.5 : 1,
                  },
                ]}
                onPress={() => setPage(p => p + 1)}
              >
                <Text style={styles.paginationButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
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
  limitCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  limitText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 100,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  questionsList: {
    paddingHorizontal: 16,
  },
  questionCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  questionHeader: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  submittedText: {
    fontSize: 12,
    textAlign: 'center',
  },
  loadingCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  paginationContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  paginationInfo: {
    fontSize: 14,
    marginBottom: 12,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paginationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyUserQuestionsScreen;