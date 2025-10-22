import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import QuizStartModal from '../../components/QuizStartModal';

const SearchScreen = () => {
  const { colors } = useTheme();
  
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ quizzes: [], categories: [], subcategories: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const response = await API.searchAll({ query: searchQuery.trim(), page, limit: 12 });
      if (response?.success) {
        const quizzes = response.quizzes || response.data?.quizzes || [];
        const categories = response.categories || response.data?.categories || [];
        const subcategories = response.subcategories || response.data?.subcategories || [];
        setResults({ quizzes, categories, subcategories });
        const totalPages = response.totalPages || response.data?.totalPages;
        const currentPage = response.page || response.data?.page || page;
        setHasMore(totalPages ? currentPage < totalPages : quizzes.length === 12);
      } else {
        setResults({ quizzes: [], categories: [], subcategories: [] });
        setHasMore(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults({ quizzes: [], categories: [], subcategories: [] });
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSearchResult = ({ item }) => (
    <View style={[styles.quizCard, { backgroundColor: colors.surface }]}> 
      <View style={styles.quizCardHeader}> 
        <View style={[styles.quizIconWrap, { backgroundColor: colors.primary + '20' }]}> 
          <Icon name="quiz" size={18} color={colors.primary} />
        </View>
        {!!item.category?.name && (
          <View style={[styles.quizCategoryChip, { backgroundColor: colors.accent + '20' }]}> 
            <Icon name="category" size={12} color={colors.accent} />
            <Text style={[styles.quizCategoryText, { color: colors.accent }]}>{item.category.name}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.resultTitle, { color: colors.text }]}> 
        {item.title || 'Quiz'}
      </Text>
      {!!item.subcategory?.name && (
        <Text style={[styles.resultSub, { color: colors.textSecondary }]}> 
          {item.subcategory.name}
        </Text>
      )}

      <View style={styles.quizFooterRow}> 
        <View style={styles.metaRow}> 
          <Icon name="bar-chart" size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>Lvl {item.requiredLevel || 1}</Text>
        </View>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => { setSelectedQuiz(item); setStartModalVisible(true); }}
        >
          <Icon name="play-arrow" size={18} color="#fff" />
          <Text style={styles.startBtnText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Debounce typing
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchQuery.trim()) {
        setPage(1);
        handleSearch();
      } else {
        setResults({ quizzes: [], categories: [], subcategories: [] });
        setHasMore(false);
      }
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoading) return;
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const response = await API.searchAll({ query: searchQuery.trim(), page: nextPage, limit: 12 });
      const quizzes = response?.quizzes || response?.data?.quizzes || [];
      setResults(prev => ({ ...prev, quizzes: [...prev.quizzes, ...quizzes] }));
      const totalPages = response.totalPages || response.data?.totalPages;
      setHasMore(totalPages ? nextPage < totalPages : quizzes.length === 12);
      setPage(nextPage);
    } catch (e) {
      console.error('Load more error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.surface }]}>
        <View style={[
          styles.searchContainer,
          { borderColor: colors.border, backgroundColor: colors.background }
        ]}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={"Search"}
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Icon name="search" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories & Subcategories */}
      <ScrollView contentContainerStyle={styles.resultsContainer}>
        {results.categories?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="label" size={16} color={colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {results.categories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.chip, { borderColor: colors.primary, backgroundColor: colors.background }]}
                  onPress={() => navigation.navigate('Home', { screen: 'CategoryDetail', params: { categoryId: cat._id } })}
                >
                  <Icon name="category" size={14} color={colors.primary} />
                  <Text style={[styles.chipText, { color: colors.primary }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {results.subcategories?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="bookmark" size={16} color={colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {results.subcategories.map((sub) => (
                <TouchableOpacity
                  key={sub._id}
                  style={[styles.chip, { borderColor: colors.accent, backgroundColor: colors.background }]}
                  onPress={() => navigation.navigate('Home', { screen: 'SubcategoryDetail', params: { subcategoryId: sub._id } })}
                >
                  <Icon name="bookmark-border" size={14} color={colors.accent} />
                  <Text style={[styles.chipText, { color: colors.accent }]}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quizzes list */}
        {results.quizzes?.length > 0 ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Icon name="quiz" size={16} color={colors.textSecondary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{"Quizzes"}</Text>
            </View>
            <FlatList
              data={results.quizzes}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
            {hasMore && (
              <TouchableOpacity style={[styles.loadMoreBtn, { backgroundColor: colors.primary }]} onPress={handleLoadMore} disabled={isLoading}>
                <Text style={styles.loadMoreText}>{isLoading ? "Loading..." : "Next"}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}> 
              {searchQuery ? "No data available" : "Search"}
            </Text>
          </View>
        )}
      </ScrollView>

      <QuizStartModal
        visible={startModalVisible}
        quiz={selectedQuiz}
        onClose={() => setStartModalVisible(false)}
        onConfirm={() => {
          setStartModalVisible(false);
          if (selectedQuiz?._id) {
            navigation.navigate('Quiz', { quizId: selectedQuiz._id });
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    padding: 16,
    paddingTop: 56,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 12,
  },
  resultsContainer: {
    padding: 16,
  },
  quizCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  quizCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quizCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultSub: {
    fontSize: 13,
    marginBottom: 10,
  },
  quizFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  startBtnText: {
    color: 'white',
    fontWeight: '700',
    marginLeft: 4,
    fontSize: 13,
  },
  resultDescription: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadMoreBtn: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: '700',
  },
});

export default SearchScreen;