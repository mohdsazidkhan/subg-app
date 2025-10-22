import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';

const { width } = Dimensions.get('window');

const ArticlesScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchData();
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

      const response = await API.getPublishedArticles(params);
      if (response.success) {
        setArticles(response.data || []);
        setHasMore(response.data?.length === 20);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.getArticleCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
      onPress={() => navigation.navigate('ArticleDetail', { articleId: article._id })}
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
      onPress={() => navigation.navigate('ArticleDetail', { articleId: article._id })}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📚 Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: selectedCategory === 'all' ? colors.primary : colors.surface },
                { borderColor: colors.primary }
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
                  {category.name} ({category.articleCount})
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
          {articles.map(renderArticleCard)}
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
});

export default ArticlesScreen;