import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import ShareService from '../services/ShareService';
import { FRONTEND_URL } from '../config/env';

const ShareButton = ({ 
  content, 
  type = 'article', 
  onSuccess, 
  onError,
  style,
  iconSize = 20,
  showText = true,
  text = 'Share'
}) => {
  const { colors } = useTheme();

  const handleShare = async () => {
    try {
      let result;
      
      switch (type) {
        case 'article':
          result = await ShareService.shareArticle(content, FRONTEND_URL);
          break;
        case 'quiz':
          result = await ShareService.shareQuiz(content, FRONTEND_URL);
          break;
        case 'question':
          result = await ShareService.shareUserQuestion(content, FRONTEND_URL);
          break;
        case 'generic':
          result = await ShareService.shareGeneric(
            content.title, 
            content.message, 
            content.url
          );
          break;
        default:
          result = await ShareService.shareArticle(content, FRONTEND_URL);
      }

      if (result.success && onSuccess) {
        onSuccess(result);
      } else if (!result.success && onError) {
        onError(result);
      }
    } catch (error) {
      console.error('ShareButton Error:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.shareButton, { backgroundColor: colors.surface }, style]}
      onPress={handleShare}
      activeOpacity={0.7}
    >
      <Icon name="share" size={iconSize} color={colors.primary} />
      {showText && (
        <Text style={[styles.shareText, { color: colors.text }]}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  shareText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ShareButton;
