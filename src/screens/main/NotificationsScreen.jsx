import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import { showMessage } from 'react-native-flash-message';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await API.getNotifications();
      
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showMessage({
        message: 'Failed to load notifications',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleNotificationPress = async (notification) => {
    try {
      // Mark notification as read
      if (!notification.isRead) {
        await API.markNotificationRead(notification._id);
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notification._id ? { ...notif, isRead: true } : notif
          )
        );
      }

      // Navigate based on notification type
      if (notification.type === 'quiz') {
        navigation.navigate('AttemptQuiz', { quiz: notification.data });
      } else if (notification.type === 'level') {
        navigation.navigate('LevelDetail', { level: notification.data });
      } else if (notification.type === 'achievement') {
        navigation.navigate('Achievements');
      } else if (notification.type === 'article') {
        navigation.navigate('ArticleDetail', { articleId: notification.data });
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.markAllNotificationsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      showMessage({
        message: 'All notifications marked as read',
        type: 'success',
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'quiz':
        return 'quiz';
      case 'level':
        return 'school';
      case 'achievement':
        return 'emoji-events';
      case 'article':
        return 'article';
      case 'announcement':
        return 'campaign';
      case 'reward':
        return 'redeem';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'quiz':
        return colors.primary;
      case 'level':
        return colors.info;
      case 'achievement':
        return colors.success;
      case 'article':
        return colors.warning;
      case 'announcement':
        return colors.accent;
      case 'reward':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const renderNotificationItem = (notification) => (
    <TouchableOpacity
      key={notification._id}
      style={[
        styles.notificationItem,
        { backgroundColor: colors.surface },
        !notification.isRead && { borderLeftColor: colors.primary, borderLeftWidth: 4 }
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(notification.type) + '20' }
        ]}>
          <Icon
            name={getNotificationIcon(notification.type)}
            size={24}
            color={getNotificationColor(notification.type)}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[
            styles.notificationTitle,
            { color: colors.text },
            !notification.isRead && { fontWeight: 'bold' }
          ]}>
            {notification.title}
          </Text>
          
          <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
            {notification.message}
          </Text>

          <View style={styles.notificationFooter}>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {formatNotificationTime(notification.createdAt)}
            </Text>
            
            {!notification.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title={t('navigation.notifications')}
          showBackButton={true}
          showLanguageToggle={true}
          onBackPress={() => navigation.goBack()}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="notifications" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={t('navigation.notifications')}
        showBackButton={true}
        showLanguageToggle={true}
        onBackPress={() => navigation.goBack()}
        onLanguageToggle={handleLanguageToggle}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={colors.backgroundGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="notifications" size={40} color="white" />
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              Stay updated with your progress and announcements
            </Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {notifications.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>
                {unreadCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Unread
              </Text>
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={handleMarkAllRead}
              >
                <Icon name="done-all" size={20} color={colors.success} />
                <Text style={[styles.markAllText, { color: colors.success }]}>
                  Mark All Read
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <View style={styles.notificationsContainer}>
            {notifications.map(renderNotificationItem)}
          </View>
        ) : (
          <Card style={styles.emptyState}>
            <View style={styles.emptyContent}>
              <Icon name="notifications-none" size={60} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Notifications
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  statsCard: {
    margin: 20,
    marginTop: 16,
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  notificationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  notificationItem: {
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    margin: 20,
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default NotificationsScreen;