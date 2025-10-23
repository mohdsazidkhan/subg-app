import { Share, Alert, Platform } from 'react-native';

class ShareService {
  static async shareContent({ title, message, url, subject }) {
    try {
      // Check if Share is available
      if (!Share || typeof Share.share !== 'function') {
        throw new Error('Share functionality not available');
      }

      // Different share options for different platforms
      let shareOptions;
      
      if (Platform.OS === 'android') {
        // Android prefers just message
        shareOptions = {
          message: message,
          title: title || 'Share',
        };
      } else {
        // iOS can handle more options
        shareOptions = {
          title: title || 'Share',
          message: message,
          ...(url && { url: url }),
          ...(subject && { subject: subject }),
        };
      }

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        return { success: true, action: result.action };
      } else if (result.action === Share.dismissedAction) {
        return { success: false, action: 'dismissed' };
      }
      
      return { success: true, action: 'shared' };
    } catch (error) {
      console.error('ShareService Error:', error);
      
      // Show a more user-friendly error message
      const errorMessage = error.message || 'Failed to share content';
      Alert.alert(
        'Share Error', 
        `Unable to share content: ${errorMessage}`,
        [
          { text: 'OK', style: 'default' }
        ]
      );
      
      return { success: false, error: errorMessage };
    }
  }

  static async shareArticle(article, frontendUrl) {
    if (!article) {
      Alert.alert('Error', 'No article to share');
      return;
    }

    const blogTitle = article.title || 'Check this article';
    const blogExcerpt = article.excerpt || '';
    const blogUrl = `${frontendUrl.replace(/\/$/, '')}/articles/${article._id}`;
    
    const shareMessage = `${blogTitle}\n\n${blogExcerpt}\n\n${blogUrl}`;

    return await this.shareContent({
      title: blogTitle,
      message: shareMessage,
      url: blogUrl,
    });
  }

  static async shareQuiz(quiz, frontendUrl) {
    if (!quiz) {
      Alert.alert('Error', 'No quiz to share');
      return;
    }

    const quizTitle = quiz.title || 'Check this quiz';
    const quizDescription = quiz.description || '';
    const quizUrl = `${frontendUrl.replace(/\/$/, '')}/quiz/${quiz._id}`;
    
    const shareMessage = `${quizTitle}\n\n${quizDescription}\n\n${quizUrl}`;

    return await this.shareContent({
      title: quizTitle,
      message: shareMessage,
      url: quizUrl,
    });
  }

  static async shareUserQuestion(question, frontendUrl) {
    if (!question) {
      Alert.alert('Error', 'No question to share');
      return;
    }

    const questionTitle = question.question || 'Check this question';
    const questionUrl = `${frontendUrl.replace(/\/$/, '')}/questions/${question._id}`;
    
    const shareMessage = `${questionTitle}\n\n${questionUrl}`;

    return await this.shareContent({
      title: 'User Question',
      message: shareMessage,
      url: questionUrl,
    });
  }

  static async shareGeneric(title, content, url) {
    const shareMessage = url ? `${content}\n\n${url}` : content;

    return await this.shareContent({
      title: title,
      message: shareMessage,
      url: url,
    });
  }

  // Test method to verify share functionality
  static async testShare() {
    return await this.shareContent({
      title: 'Test Share',
      message: 'This is a test share message',
    });
  }
}

export default ShareService;
