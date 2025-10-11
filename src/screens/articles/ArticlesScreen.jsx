import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  TextInput,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';

const { width } = Dimensions.get('window');

const ArticlesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ search: '', featured: false, tag: '' });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    // apply incoming filters from navigation (e.g., tag/category)
    if (route?.params?.filter === 'tag' && route?.params?.value) {
      setFilters(prev => ({ ...prev, tag: String(route.params.value) }));
    }
    if (route?.params?.filter === 'category' && route?.params?.value) {
      setSelectedCategory(String(route.params.value));
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchArticles(),
        fetchCategories(),
        fetchFeaturedArticles(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage({
        message: 'Failed to load articles',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const params = { page: page, limit: 20 };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (filters.search) params.search = filters.search;
      if (filters.featured) params.featured = true;
      if (filters.tag) params.tag = filters.tag;

      const response = await API.getPublishedArticles(params);
      if (response?.success) {
        // Backend returns { success, data: { articles, pagination } }
        const list = response.data?.articles || response.articles || [];
        setArticles(Array.isArray(list) ? list : []);
        const pagination = response.data?.pagination;
        if (pagination) {
          setHasMore(Boolean(pagination.hasNext));
        } else {
          setHasMore(list.length === 20);
        }
      } else {
        setArticles([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
      setHasMore(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => {
      setPage(1);
      fetchArticles();
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  // Re-fetch when basic filters/page change
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCategory, filters.featured, filters.tag]);

  const fetchCategories = async () => {
    try {
      // Backend doesn't have /api/public/articles/categories. Use public categories like web.
      const response = await API.getPublicCategories();
      if (response?.success) {
        setCategories(response.data || response.categories || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchFeaturedArticles = async () => {
    try {
      const response = await API.getFeaturedArticles(5);
      if (response.success) {
        setFeaturedArticles(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured articles:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    fetchArticles();
  };


  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const params = { page: nextPage, limit: 20 };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (filters.search) params.search = filters.search;
      if (filters.featured) params.featured = true;
      if (filters.tag) params.tag = filters.tag;

      const response = await API.getPublishedArticles(params);
      const list = response?.data?.articles || response?.articles || [];
      if (Array.isArray(list) && list.length > 0) {
        setArticles(prev => [...prev, ...list]);
        const pagination = response?.data?.pagination;
        if (pagination) {
          setHasMore(Boolean(pagination.hasNext));
        } else {
          setHasMore(list.length === 20);
        }
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Error loading more articles:', e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLike = async (articleId) => {
    try {
      await API.likeArticle(articleId);
      setArticles(prev =>
        prev.map(article =>
          article._id === articleId
            ? {
                ...article,
                isLiked: !article.isLiked,
                likesCount: article.isLiked ? article.likesCount - 1 : article.likesCount + 1,
              }
            : article
        )
      );
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleShare = async (articleId) => {
    try {
      await API.shareArticle(articleId);
      showMessage({
        message: 'Article shared successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const renderArticleCard = (article) => (
    <TouchableOpacity
      key={article._id}
      style={[styles.articleCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('ArticleDetail', { articleId: article.slug || article._id })}
    >
      {article.featuredImage && (
        <Image
          source={{ uri: article.featuredImage }}
          style={styles.articleImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.articleContent}>
        <View style={styles.articleHeader}>
          <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>
            {article.title}
          </Text>
          {article.isPinned && (
            <Icon name="push-pin" size={16} color={colors.accent} />
          )}
        </View>

        <Text style={[styles.articleExcerpt, { color: colors.textSecondary }]} numberOfLines={3}>
          {article.excerpt}
        </Text>

        <View style={styles.articleMeta}>
          <View style={styles.articleAuthor}>
            <Icon name="person" size={14} color={colors.textSecondary} />
            <Text style={[styles.articleAuthorText, { color: colors.textSecondary }]}>
              {article.author?.name}
            </Text>
          </View>
          <Text style={[styles.articleDate, { color: colors.textSecondary }]}>
            {new Date(article.publishedAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.articleStats}>
          <View style={styles.articleStatItem}>
            <Icon name="visibility" size={14} color={colors.textSecondary} />
            <Text style={[styles.articleStatText, { color: colors.textSecondary }]}>
              {article.viewsCount}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.articleStatItem}
            onPress={() => handleLike(article._id)}
          >
            <Icon
              name={article.isLiked ? "favorite" : "favorite-border"}
              size={14}
              color={article.isLiked ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.articleStatText, { color: colors.textSecondary }]}>
              {article.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.articleStatItem}
            onPress={() => handleShare(article._id)}
          >
            <Icon name="share" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {article.tags && article.tags.length > 0 && (
          <View style={styles.articleTags}>
            {article.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedArticle = (article) => (
    <TouchableOpacity
      key={article._id}
      style={[styles.featuredCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('ArticleDetail', { articleId: article.slug || article._id })}
    >
      <LinearGradient
        colors={[colors.primary + '20', colors.secondary + '20']}
        style={styles.featuredGradient}
      >
        {article.featuredImage && (
          <Image
            source={{ uri: article.featuredImage }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.featuredContent}>
          <Text style={[styles.featuredTitle, { color: colors.text }]} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={[styles.featuredExcerpt, { color: colors.textSecondary }]} numberOfLines={2}>
            {article.excerpt}
          </Text>

          <View style={styles.featuredMeta}>
            <Text style={[styles.featuredAuthor, { color: colors.textSecondary }]}>
              By {article.author?.name}
            </Text>
            <Text style={[styles.featuredDate, { color: colors.textSecondary }]}>
              {new Date(article.publishedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Icon name="article" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading articles...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Articles"
        showMenuButton={true}
        onMenuPress={() => navigation.navigate('MainTabs', { screen: 'More' })}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search & Filters */}
        <View style={styles.section}>
          <View style={[styles.filterBar, { backgroundColor: colors.surface }]}> 
            <View style={[styles.searchBox, { backgroundColor: colors.background }]}> 
              <Icon name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search articles"
                placeholderTextColor={colors.textSecondary}
                value={filters.search}
                onChangeText={(text) => setFilters(prev => ({ ...prev, search: text }))}
                returnKeyType="search"
              />
            </View>
          </View>
        </View>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🌟 Featured Articles
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredArticles.map(renderFeaturedArticle)}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: selectedCategory === 'all' ? colors.primary : colors.surface },
                { borderColor: colors.primary, marginLeft: 20 }
              ]}
              onPress={() => handleCategoryChange('all')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === 'all' ? 'white' : colors.primary }
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
                
            {categories.map(category => (
              <TouchableOpacity
                key={category._id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: selectedCategory === category._id ? colors.primary : colors.surface },
                  { borderColor: colors.primary }
                ]}
                onPress={() => handleCategoryChange(category._id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: selectedCategory === category._id ? 'white' : colors.primary }
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Articles List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📖 All Articles
          </Text>
          {Array.isArray(articles) && articles.map(renderArticleCard)}
          {Array.isArray(articles) && articles.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="article" size={36} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No articles found</Text>
            </View>
          )}
          {hasMore && (
            <TouchableOpacity
              onPress={handleLoadMore}
              disabled={isLoadingMore}
              style={[styles.loadMoreBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.loadMoreText}>{isLoadingMore ? 'Loading...' : 'Load More'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  filterBar: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  featuredCard: {
    width: width * 0.8,
    marginLeft: 20,
    borderRadius: 16,
    marginRight: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredGradient: {
    padding: 16,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredExcerpt: {
    fontSize: 14,
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredAuthor: {
    fontSize: 12,
  },
  featuredDate: {
    fontSize: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  articleCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  articleImage: {
    width: '100%',
    height: 160,
  },
  articleContent: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  articleAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleAuthorText: {
    fontSize: 12,
    marginLeft: 4,
  },
  articleDate: {
    fontSize: 12,
  },
  articleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  articleStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  articleStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  articleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  loadMoreBtn: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ArticlesScreen;