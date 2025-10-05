import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
import Card from '../../components/Card';


const MyQuestionsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadQuestions();
    loadStats();
  }, [selectedStatus, page]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const response = await API.getMyUserQuestions(params);

      if (response?.success) {
        const newQuestions = response.data || [];

        if (page === 1) {
          setQuestions(newQuestions);
        } else {
          setQuestions(prev => [...prev, ...newQuestions]);
        }

        setHasMore(newQuestions.length === 20);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
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
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([loadQuestions(), loadStats()]);
    setRefreshing(false);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'pending':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return 'check-circle';
      case 'rejected':
        return 'cancel';
      case 'pending':
        return 'schedule';
      default:
        return 'help';
    }
  };

  const renderQuestion = (question) => (
    <Card key={question._id} style={[styles.questionCard, { backgroundColor: colors.surface }]}>
      <View style={styles.questionHeader}>
        <View style={styles.questionMeta}>
          <Text style={[styles.questionCategory, { color: colors.primary }]}>
            {question.category.name}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: colors.accent + '20' }]}>
            <Text style={[styles.difficultyText, { color: colors.accent }]}>
              {question.difficulty}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(question.status) + '10' }]}>
          <Icon name={getStatusIcon(question.status)} size={14} color={getStatusColor(question.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(question.status) }]}>
            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={[styles.questionText, { color: colors.text }]} numberOfLines={2}>
        {question.question}
      </Text>

      <View style={styles.questionStats}>
        <View style={styles.statItem}>
          <Icon name="visibility" size={14} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {question.viewsCount} views
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="favorite" size={14} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {question.likesCount} likes
          </Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {new Date(question.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {question.status === 'rejected' && question.rejectionReason && (
        <View style={[styles.rejectionContainer, { backgroundColor: colors.error + '10' }]}>
          <Text style={[styles.rejectionTitle, { color: colors.error }]}>Rejection Reason:</Text>
          <Text style={[styles.rejectionText, { color: colors.text }]}>
            {question.rejectionReason}
          </Text>
        </View>
      )}

      {question.status === 'approved' && (
        <View style={[styles.earningsContainer, { backgroundColor: colors.success + '10' }]}>
          <Icon name="monetization-on" size={16} color={colors.success} />
          <Text style={[styles.earningsText, { color: colors.success }]}>₹10 earned</Text>
        </View>
      )}
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="My Questions"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.pending}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{stats.approved}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Approved</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statNumber, { color: colors.error }]}>{stats.rejected}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rejected</Text>
          </View>
        </View>

        {/* Status Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedStatus === '' ? colors.primary : colors.background,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => handleStatusFilter('')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedStatus === '' ? 'white' : colors.primary },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {['pending', 'approved', 'rejected'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedStatus === status ? colors.primary : colors.background,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: selectedStatus === status ? 'white' : colors.primary },
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Questions List */}
        {questions.length > 0 ? (
          <View style={styles.questionsList}>
            {questions.map(renderQuestion)}
          </View>
        ) : !loading ? (
          <View style={styles.emptyContainer}>
            <Icon name="quiz" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No questions found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {selectedStatus
                ? `No ${selectedStatus} questions`
                : 'You haven\'t posted any questions yet'}
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('PostQuestion')}
            >
              <Text style={[styles.createButtonText, { color: 'white' }]}>Create Question</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Load More Button */}
        {hasMore && questions.length > 0 && (
          <TouchableOpacity
            style={[styles.loadMoreButton, { backgroundColor: colors.primary }]}
            onPress={() => setPage(prev => prev + 1)}
            disabled={loading}
          >
            <Text style={[styles.loadMoreText, { color: 'white' }]}>
              {loading ? 'Loading...' : 'Load More'}
            </Text>
          </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionsList: {
    paddingHorizontal: 16,
  },
  questionCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  questionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
  },
  rejectionContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  earningsText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadMoreButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyQuestionsScreen;