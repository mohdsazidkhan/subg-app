import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import ShareService from '../../services/ShareService';
import { FRONTEND_URL } from '../../config/env';


const PublicUserQuestionsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [items, setItems] = useState<PublicQuestion[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const res = await API.getPublicUserQuestions({
        page: isLoadMore ? page : 1,
        limit,
        search: searchTerm,
      });

      if (res?.success) {
        const newItems = res.data || [];
        
        if (isLoadMore) {
          // Append new items to existing list
          setItems(prev => [...prev, ...newItems]);
        } else {
          // Replace items for fresh load
          setItems(newItems);
        }
        
        setTotal(res.pagination?.total || 0);
        setHasMore(newItems.length === limit);
        
        if (isLoadMore) {
          setPage(prev => prev + 1);
        } else {
          setPage(2); // Next page will be 2
        }
      }
    } catch (e) {
      console.error('Failed to load public questions', e);
      showMessage({
        message: 'Failed to load questions',
        type: 'danger',
      });
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await load(false);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    await load(true);
  };

  const answer = async (q, idx) => {
    try {
      if (typeof q.selectedOptionIndex === 'number') return;

      // Immediately show visual feedback
      setItems(prev =>
        prev.map(it =>
          it._id === q._id
            ? { ...it, selectedOptionIndex: idx, isAnswered: true }
            : it
        )
      );

      await API.answerUserQuestion(q._id, idx);
      
      showMessage({
        message: 'Answer submitted successfully!',
        type: 'success',
      });
    } catch (e) {
      showMessage({
        message: e.message || 'Failed to submit Answer!',
        type: 'danger',
      });
      
      // Revert the visual feedback on error
      setItems(prev =>
        prev.map(it =>
          it._id === q._id
            ? { ...it, selectedOptionIndex: undefined, isAnswered: false }
            : it
        )
      );
    }
  };

  const like = async (q) => {
    try {
      const res = await API.likeUserQuestion(q._id);
      if (res?.data?.firstTime) {
        setItems(prev =>
          prev.map(it =>
            it._id === q._id
              ? { ...it, likesCount: (it.likesCount || 0) + 1 }
              : it
          )
        );
      }
    } catch (e) {
      console.error('Error liking question:', e);
    }
  };

  const share = async (q) => {
    try {
      await ShareService.shareUserQuestion(q, FRONTEND_URL);
      setItems(prev =>
        prev.map(it =>
          it._id === q._id
            ? { ...it, sharesCount: (it.sharesCount || 0) + 1 }
            : it
        )
      );
    } catch (e) {
      console.error('Error sharing question:', e);
    }
  };

  const view = async (q) => {
    try {
      const res = await API.incrementUserQuestionView(q._id);
      if (res?.data?.firstTime) {
        setItems(prev =>
          prev.map(it =>
            it._id === q._id
              ? { ...it, viewsCount: (it.viewsCount || 0) + 1 }
              : it
          )
        );
      }
    } catch (e) {
      console.error('Error viewing question:', e);
    }
  };

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getInitials = (name = '') => {
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || 'U';
  };

  const renderQuestionItem = (row) => {
    const user = row.userId || {};

    return (
      <Card key={row._id} style={[styles.questionCard, { backgroundColor: colors.surface }]}>
        <View style={styles.questionHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {user.profilePicture ? (
                <Text style={[styles.avatarText, { color: 'white' }]}>IMG</Text>
              ) : (
                <Text style={[styles.avatarText, { color: 'white' }]}>
                  {getInitials(user.name)}
                </Text>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user.name || 'Unknown User'}
              </Text>
              <Text style={[styles.userLevel, { color: colors.textSecondary }]}>
                {user.level?.levelName || 'Starter'}
              </Text>
            </View>
          </View>
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
            Posted {timeAgo(row.createdAt)}
          </Text>
        </View>

        <Text style={[styles.questionText, { color: colors.text }]}>
          {row.questionText}
        </Text>

        <View style={styles.optionsContainer}>
          {row.options.map((opt, idx) => {
            const isSelected =
              typeof row.selectedOptionIndex === 'number' && row.selectedOptionIndex === idx;
            const isCorrect = idx === row.correctAnswer;
            const isWrong = isSelected && !isCorrect;
            const answered = typeof row.selectedOptionIndex === 'number';
            const showFeedback = answered && isSelected;
            const showCorrectAnswer = answered && !isSelected && isCorrect;

            let backgroundColor = colors.background;
            let borderColor = colors.border;
            let textColor = colors.text;
            let iconColor = colors.primary;

            if (showFeedback) {
              if (isCorrect) {
                backgroundColor = colors.success || '#10B981';
                borderColor = colors.success || '#10B981';
                textColor = 'white';
                iconColor = 'white';
              } else if (isWrong) {
                backgroundColor = colors.error || '#EF4444';
                borderColor = colors.error || '#EF4444';
                textColor = 'white';
                iconColor = 'white';
              }
            } else if (showCorrectAnswer) {
              backgroundColor = colors.success || '#10B981';
              borderColor = colors.success || '#10B981';
              textColor = 'white';
              iconColor = 'white';
            } else if (isSelected) {
              backgroundColor = colors.primary + '20';
              borderColor = colors.primary;
              textColor = colors.primary;
            }

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => answer(row, idx)}
                disabled={answered}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor,
                    borderColor,
                    opacity: answered && !isSelected && !isCorrect ? 0.6 : 1,
                  },
                ]}
              >
                <View style={styles.optionConfig}>
                  <Text style={[styles.optionLetter, { color: textColor }]}>
                    {String.fromCharCode(65 + idx)}.
                  </Text>
                  <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                </View>
                {(showFeedback || showCorrectAnswer) && (
                  <Icon name={isCorrect ? 'check' : 'close'} size={16} color={iconColor} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={() => like(row)} style={styles.actionButton}>
            <Icon name="favorite" size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {row.likesCount || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => share(row)} style={styles.actionButton}>
            <Icon name="share" size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {row.sharesCount || 0}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButton}>
            <Icon name="comment" size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {row.answersCount || 0}
            </Text>
          </View>

          <TouchableOpacity onPress={() => view(row)} style={styles.actionButton}>
            <Icon name="visibility" size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {row.viewsCount || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={`Questions (${total})`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search */}
        <Card style={[styles.searchCard, { backgroundColor: colors.surface }]}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search questions..."
              placeholderTextColor={colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <TouchableOpacity
              onPress={() => {
                setPage(1);
                setHasMore(true);
                load(false);
              }}
              style={[styles.searchButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading questions...
            </Text>
          </View>
        )}

        {/* Questions List */}
        {!items || items.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No questions found
            </Text>
          </Card>
        ) : (
          <View style={styles.questionsList}>
            {items.map((row) => renderQuestionItem(row))}
          </View>
        )}

        {/* Load More Button */}
        {hasMore && items.length > 0 && (
          <Card style={[styles.loadMoreCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              onPress={loadMore}
              disabled={loadingMore}
              style={[
                styles.loadMoreButton,
                {
                  backgroundColor: loadingMore ? colors.textSecondary : colors.primary,
                  opacity: loadingMore ? 0.7 : 1,
                },
              ]}
            >
              {loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <Icon name="refresh" size={16} color="white" />
                  <Text style={styles.loadMoreButtonText}>Loading...</Text>
                </View>
              ) : (
                <View style={styles.loadMoreContainer}>
                  <Icon name="expand-more" size={20} color="white" />
                  <Text style={styles.loadMoreButtonText}>Load More Questions</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <Text style={[styles.loadMoreInfo, { color: colors.textSecondary }]}>
              Showing {items.length} of {total} questions
            </Text>
          </Card>
        )}

        {/* End of List Message */}
        {!hasMore && items.length > 0 && (
          <Card style={[styles.endCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.endText, { color: colors.textSecondary }]}>
              🎉 You've reached the end! All {total} questions loaded.
            </Text>
          </Card>
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
  searchCard: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  questionsList: {
    paddingHorizontal: 20,
  },
  questionCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userLevel: {
    fontSize: 14,
  },
  timeAgo: {
    fontSize: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
  },
  emptyCard: {
    margin: 20,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  loadMoreCard: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 200,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadMoreInfo: {
    fontSize: 14,
    textAlign: 'center',
  },
  endCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  endText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PublicUserQuestionsScreen;