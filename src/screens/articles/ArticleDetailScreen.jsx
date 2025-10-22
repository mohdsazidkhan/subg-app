import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import { showMessage } from 'react-native-flash-message';
import TopBar from '../../components/TopBar';
import { API_URL } from '../../config/env';


const ArticleDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const { articleId } = route.params;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await API.getArticleById(articleId);

      if (response.success) {
        setArticle(response.data);
        // Increment view count
        await API.incrementArticleView(articleId);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      showMessage({
        message: 'Failed to load article',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!article || liking) return;

    try {
      setLiking(true);
      await API.likeArticle(article._id);

      setArticle(prev =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
            }
          : null
      );
    } catch (error) {
      console.error('Error liking article:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    if (!article) return;

    try {
      await API.shareArticle(article._id);

      const shareOptions = {
        message: `Check out this article: ${article.title}`,
        url: `${API_URL.replace(/\/$/, '')}/articles/${article._id}`,
        title: article.title,
      };

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleTagPress = (tag) => {
    // Navigate to articles filtered by tag
    navigation.navigate('Articles', {
      filter: 'tag',
      value: tag,
    });
  };

  const handleCategoryPress = ( categoryId) => {
    // Navigate to articles filtered by category
    navigation.navigate('Articles', {
      filter: 'category',
      value: categoryId,
    });
  };

  const formatContent = (content) => {
    // Simple content formatting - in a real app, you might use a markdown renderer
    return content.split('\n').map((paragraph, index) => (
      <Text key={index} style={[styles.contentText, { color: colors.text }]}>
        {paragraph}
      </Text>
    ));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Icon name="article" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading article...</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Icon name="error" size={60} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>Article not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Article"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Image */}
        {article.featuredImage && (
          <Image
            source={{ uri: article.featuredImage }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        )}

        {/* Article Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
            <Text style={[styles.excerpt, { color: colors.textSecondary }]}>{article.excerpt}</Text>

            {/* Author Info */}
            <View style={styles.authorSection}>
              <View style={styles.authorInfo}>
                <View style={[styles.authorAvatar, { backgroundColor: colors.primary }]}>
                  <Icon name="person" size={20} color="white" />
                </View>
                <View style={styles.authorDetails}>
                  <Text style={[styles.authorName, { color: colors.text }]}>{article.author.name}</Text>
                  <Text style={[styles.publishDate, { color: colors.textSecondary }]}>
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.articleMeta}>
                <View style={styles.metaItem}>
                  <Icon name="visibility" size={16} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {article.viewsCount} views
                  </Text>
                </View>
                {article.readingTime && (
                  <View style={styles.metaItem}>
                    <Icon name="schedule" size={16} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {article.readingTime} min read
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Category and Tags */}
            <View style={styles.categorySection}>
              <TouchableOpacity
                style={[styles.categoryChip, { backgroundColor: colors.primary + '20' }]}
                onPress={() => handleCategoryPress(article.category._id)}
              >
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {article.category.name}
                </Text>
              </TouchableOpacity>
            </View>

            {article.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={[styles.tagsLabel, { color: colors.textSecondary }]}>Tags:</Text>
                <View style={styles.tagsContainer}>
                  {article.tags.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.tag, { backgroundColor: colors.accent + '20' }]}
                      onPress={() => handleTagPress(tag)}
                    >
                      <Text style={[styles.tagText, { color: colors.accent }]}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Article Content */}
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={styles.contentContainer}>{formatContent(article.content)}</View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actions, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: article.isLiked ? colors.error : colors.background,
              },
            ]}
            onPress={handleLike}
            disabled={liking}
          >
            <Icon
              name={article.isLiked ? 'favorite' : 'favorite-border'}
              size={20}
              color={article.isLiked ? 'white' : colors.textSecondary}
            />
            <Text
              style={[
                styles.actionText,
                { color: article.isLiked ? 'white' : colors.textSecondary },
              ]}
            >
              {article.likesCount} {article.likesCount === 1 ? 'Like' : 'Likes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleShare}
          >
            <Icon name="share" size={20} color="white" />
            <Text style={[styles.actionText, { color: 'white' }]}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Related Articles or Author Bio */}
        {article.author.bio && (
          <View style={[styles.authorBio, { backgroundColor: colors.background }]}>
            <Text style={[styles.bioTitle, { color: colors.text }]}>About the Author</Text>
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>{article.author.bio}</Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  header: {
    padding: 20,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 32,
  },
  excerpt: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  authorSection: {
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  publishDate: {
    fontSize: 14,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 4,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsSection: {
    marginBottom: 16,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagsContainer: {
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
    fontWeight: '500',
  },
  content: {
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  authorBio: {
    padding: 20,
    marginTop: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ArticleDetailScreen;