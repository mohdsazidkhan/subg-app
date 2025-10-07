import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const BlogCard = ({
  blog,
  onPress,
  width = width * 0.8,
}) => {
  const { colors } = useTheme();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width, backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {blog.featuredImage ? (
          <Image source={{ uri: blog.featuredImage }} style={styles.featuredImage} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.primary + '20' }]}> 
            <Icon name="article" size={40} color={colors.primary} />
          </View>
        )}
        {blog.isFeatured && (
          <View style={[styles.featuredBadge, { backgroundColor: colors.warning }]}> 
            <Icon name="star" size={12} color="white" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        {blog.category && (
          <View style={[styles.categoryBadge, { backgroundColor: colors.accent }]}> 
            <Text style={styles.categoryText}>
              {typeof blog.category === 'object' && blog.category !== null
                ? blog.category.name
                : blog.category}
            </Text>
          </View>
        )}
      </View>
      <View style={[styles.content, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {blog.title}
        </Text>
        {blog.excerpt && (
          <Text
            style={[styles.excerpt, { color: colors.textSecondary }]}
            numberOfLines={3}
          >
            {blog.excerpt}
          </Text>
        )}
        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            <Icon name="person" size={14} color={colors.textSecondary} />
            <Text
              style={[styles.author, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {typeof blog.author === 'object' && blog.author !== null
                ? blog.author.name
                : blog.author || 'Anonymous'}
            </Text>
          </View>
          {blog.publishedAt && (
            <Text style={[styles.date, { color: colors.textSecondary }]}> 
              {formatDate(blog.publishedAt)}
            </Text>
          )}
        </View>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Icon name="schedule" size={12} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}> 
              {blog.readTime || 5} min read
            </Text>
          </View>
          {blog.likes !== undefined && (
            <View style={styles.metaItem}>
              <Icon name="favorite" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}> 
                {blog.likes}
              </Text>
            </View>
          )}
          {blog.views !== undefined && (
            <View style={styles.metaItem}>
              <Icon name="visibility" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}> 
                {blog.views}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    marginBottom: 5,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 20,
  },
  excerpt: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  author: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default BlogCard;