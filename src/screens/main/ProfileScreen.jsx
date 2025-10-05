import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { colors, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [profileStats] = useState({
    quizzesCompleted: 25,
    totalScore: 1850,
    rank: 47,
    achievements: 8,
  });

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      'Are you sure you want to logout?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Auth');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: t('profile.editProfile'),
      icon: 'edit',
      onPress: () => {
        // Navigate to edit profile
      },
    },
    {
      title: t('profile.quizHistory'),
      icon: 'history',
      onPress: () => {
        // Navigate to quiz history
      },
    },
    {
      title: t('profile.achievements'),
      icon: 'emoji-events',
      onPress: () => {
        // Navigate to achievements
      },
    },
    {
      title: t('navigation.settings'),
      icon: 'settings',
      onPress: () => {
        // Navigate to settings
      },
    },
    {
      title: t('profile.about'),
      icon: 'info',
      onPress: () => {
        // Navigate to about
      },
    },
    {
      title: t('profile.contact'),
      icon: 'contact-support',
      onPress: () => {
        // Navigate to contact
      },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={t('navigation.profile')}
        showMenuButton={true}
        showLanguageToggle={true}
        showThemeToggle={true}
        onMenuPress={() => navigation.navigate('MainTabs', { screen: 'More' })}
        onLanguageToggle={handleLanguageToggle}
        onThemeToggle={toggleTheme}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="person" size={40} color={colors.primary} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera-alt" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email || 'user@example.com'}
          </Text>

          <View style={[styles.subscriptionBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.subscriptionText}>
              {user?.subscriptionStatus?.toUpperCase() || 'FREE'}
            </Text>
          </View>

          {/* Subscription Expiry Date */}
          {user?.subscriptionExpiry && user?.subscriptionStatus !== 'free' && (
            <Text style={[styles.subscriptionExpiry, { color: colors.textSecondary }]}>
              Expires: {new Date(user.subscriptionExpiry).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          )}

          {/* Upgrade/Manage Subscription Button */}
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Icon
              name={user?.subscriptionStatus === 'free' ? 'rocket-launch' : 'settings'}
              size={16}
              color="white"
            />
            <Text style={styles.upgradeButtonText}>
              {user?.subscriptionStatus === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Stats */}
        <Card style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Stats
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="quiz" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profileStats.quizzesCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Quizzes
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profileStats.totalScore}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Score
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="leaderboard" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                #{profileStats.rank || '--'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Rank
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="emoji-events" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profileStats.achievements}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Awards
              </Text>
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <Icon name={item.icon} size={24} color={colors.primary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Icon name="chevron-right" size={24} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <Card style={styles.logoutContainer}>
          <Button
            title={t('profile.logout')}
            onPress={handleLogout}
            variant="outline"
            icon={<Icon name="logout" size={20} color={colors.error} />}
            style={styles.logoutButton}
            textStyle={{ color: colors.error }}
          />
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            {t('profile.version')} 1.0.0
          </Text>
          <Text style={[styles.appName, { color: colors.textSecondary }]}>
            SUBG Quiz App
          </Text>
        </View>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF6B35',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 12,
  },
  subscriptionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  subscriptionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subscriptionExpiry: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  menuContainer: {
    marginHorizontal: 20,
  },
  menuItem: {
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 16,
  },
  logoutContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButton: {
    borderColor: '#DC3545',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;