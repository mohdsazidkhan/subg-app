import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import ShareService from '../../services/ShareService';
import { FRONTEND_URL } from '../../config/env';


const PublicQuestionsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const isInitialMount = useRef(true);

  // Initial load - replaces all items
  const load = useCallback(async (resetPage = false) => {
    const currentPage = resetPage ? 1 : page;
    setLoading(true);
    try {
      // Pass empty string if searchTerm is blank to get default questions
      const searchParam = searchTerm.trim() || '';
      const res = await API.getPublicUserQuestions({ page: currentPage, limit, search: searchParam });
      if (res?.success) {
        const list = res.data || [];
        setItems(list);
        setTotal(res.pagination?.total || 0);
        setPage(currentPage);
        setHasMore(list.length === limit && list.length < (res.pagination?.total || 0));
      }
    } catch (e) {
      console.error('Failed to load public questions', e);
      showMessage({
        message: 'Failed to load questions',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  // Load more - appends to existing items
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const searchParam = searchTerm.trim() || '';
      const res = await API.getPublicUserQuestions({ page: nextPage, limit, search: searchParam });
      if (res?.success) {
        const newItems = res.data || [];
        setItems(prev => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(newItems.length === limit && (items.length + newItems.length) < (res.pagination?.total || 0));
      }
    } catch (e) {
      console.error('Failed to load more questions', e);
      showMessage({
        message: 'Failed to load more questions',
        type: 'danger',
      });
    } finally {
      setLoadingMore(false);
    }
  }, [page, limit, searchTerm, loadingMore, hasMore, items.length]);

  // Handle search
  const handleSearch = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setIsSearchActive(true);
    load(true);
  }, [load]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setPage(1);
    setHasMore(true);
    setIsSearchActive(false);
  }, []);

  // Initial load
  useEffect(() => { 
    load();
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when searchTerm is cleared (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current && searchTerm === '' && !isSearchActive) {
      setPage(1);
      setHasMore(true);
      load(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, isSearchActive]);

  const onRefresh = async () => {
    setPage(1);
    setHasMore(true);
    setIsSearchActive(false);
    await load(true);
  };

  const answer = async (q, idx) => {
    try {
      if (typeof q.selectedOptionIndex === 'number') return;

    // Immediately show visual feedback
      setItems(prev => prev.map(it => it._id === q._id ? { ...it, selectedOptionIndex: idx, isAnswered: true } : it));
      
      await API.answerUserQuestion(q._id, idx);
      showMessage({
        message: 'Answer submitted successfully!',
        type: 'success',
      });
    } catch (e) {
      showMessage({
        message: e?.message || 'Failed to submit Answer!',
        type: 'danger',
      });
      // Revert the visual feedback on error
      setItems(prev => prev.map(it => it._id === q._id ? { ...it, selectedOptionIndex: undefined, isAnswered: false } : it));
    }
  };

  const like = async (q) => {
    try {
      const res = await API.likeUserQuestion(q._id);
      if (res?.data?.firstTime) {
        setItems(prev => prev.map(it => it._id === q._id ? { ...it, likesCount: (it.likesCount||0) + 1 } : it));
      }
    } catch (e) {
      console.error('Failed to like question:', e);
    }
  };

  const share = async (q) => {
    try {
      await ShareService.shareUserQuestion(q, FRONTEND_URL);
      setItems(prev => prev.map(it => it._id === q._id ? { ...it, sharesCount: (it.sharesCount||0) + 1 } : it));
    } catch (e) {
      console.error('Failed to share question:', e);
    }
  };

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours>1?'s':''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days>1?'s':''} ago`;
  };

  const getInitials = (name = '') => {
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || 'U';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'hard':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderQuestion = (row, idx) => {
    const user = row.userId || {};
    const serialNumber = idx + 1;

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
              {user.username && (
                <Text style={[styles.username, { color: colors.primary }]}>
                  @{user.username}
          </Text>
              )}
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
          <Text style={[styles.serialNumber, { color: colors.primary }]}>#{serialNumber}. </Text>
          {row.questionText}
      </Text>

      <View style={styles.optionsContainer}>
          {row.options.map((opt, optIdx) => {
            const isSelected = typeof row.selectedOptionIndex === 'number' && row.selectedOptionIndex === optIdx;
            const isCorrect = optIdx === row.correctAnswer;
          const isWrong = isSelected && !isCorrect;
            const answered = typeof row.selectedOptionIndex === 'number';
            const showFeedback = answered && isSelected;
            const showCorrectAnswer = answered && !isSelected && isCorrect;

          let backgroundColor = colors.background;
          let borderColor = colors.border;
            let textColor = colors.text;

          if (showFeedback) {
            if (isCorrect) {
              backgroundColor = '#4CAF50';
              borderColor = '#4CAF50';
                textColor = 'white';
            } else if (isWrong) {
              backgroundColor = '#F44336';
              borderColor = '#F44336';
                textColor = 'white';
            }
          } else if (showCorrectAnswer) {
            backgroundColor = '#4CAF50';
            borderColor = '#4CAF50';
              textColor = 'white';
          } else if (isSelected) {
            backgroundColor = colors.primary + '20';
            borderColor = colors.primary;
              textColor = colors.primary;
          }

          return (
            <TouchableOpacity
                key={optIdx}
              style={[
                styles.optionButton,
                {
                  backgroundColor,
                  borderColor,
                    opacity: answered && !isSelected && !isCorrect ? 0.6 : 1,
                  },
                ]}
                onPress={() => answer(row, optIdx)}
                disabled={answered}
              >
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLetter, { color: textColor }]}>
                    {String.fromCharCode(65 + optIdx)}.
                  </Text>
                  <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                </View>
                {(showFeedback || showCorrectAnswer) && (
                  <Icon 
                    name={isCorrect ? 'check' : 'close'} 
                    size={16} 
                    color="white" 
                  />
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
            <Icon name="reply" size={16} color={colors.textSecondary} />
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

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by question, name, username, email..."
          placeholderTextColor={colors.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={() => {
            if (isSearchActive) {
              handleClearSearch();
            } else {
              handleSearch();
            }
          }}
        />
        <TouchableOpacity
          onPress={() => {
            if (isSearchActive) {
              handleClearSearch();
            } else {
              handleSearch();
            }
          }}
          style={[
            styles.searchButton,
            { backgroundColor: isSearchActive ? colors.textSecondary : colors.primary }
          ]}
        >
          <Text style={styles.searchButtonText}>
            {isSearchActive ? 'Clear' : 'Search'}
          </Text>
          </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Answer, like, share user questions
          </Text>
        </View>

        {/* Questions List */}
        {items.length > 0 && (
          <View style={styles.questionsList}>
            {items.map((row, idx) => renderQuestion(row, idx))}
          </View>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingMoreText, { color: colors.textSecondary }]}>
              Loading more questions...
            </Text>
          </View>
        )}

        {/* Load More Button */}
        {hasMore && items.length > 0 && !loadingMore && (
          <TouchableOpacity
            style={[styles.loadMoreButton, { backgroundColor: colors.primary }]}
            onPress={loadMore}
            disabled={loadingMore}
          >
            <Text style={[styles.loadMoreText, { color: 'white' }]}>
              Load More Questions
            </Text>
          </TouchableOpacity>
        )}

        {/* End of Results Message */}
        {!hasMore && items.length > 0 && (
          <View style={styles.endContainer}>
            <Text style={[styles.endText, { color: colors.textSecondary }]}>
              🎉 You've reached the end!
            </Text>
            <Text style={[styles.endSubtext, { color: colors.textSecondary }]}>
              No more questions to load
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              📝 No questions found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Try a different search term
            </Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  questionsList: {
    paddingHorizontal: 8,
    gap: 4,
  },
  questionCard: {
    marginBottom: 16,
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
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  userLevel: {
    fontSize: 12,
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
  serialNumber: {
    fontWeight: 'bold',
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
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 16,
  },
  loadMoreButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  endContainer: {
    alignItems: 'center',
    padding: 20,
  },
  endText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  endSubtext: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PublicQuestionsScreen;