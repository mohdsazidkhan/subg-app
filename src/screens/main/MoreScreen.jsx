import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';

const MoreScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { colors, toggleTheme, isDarkMode } = useTheme();
  

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Auth');
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          title: 'Edit Profile',
          icon: 'edit',
          onPress: () => {
            // Navigate to edit profile
          },
        },
        {
          title: 'Subscription',
          icon: 'card-membership',
          onPress: () => navigation.navigate('Subscription'),
        },
        {
          title: 'Notifications',
          icon: 'notifications',
          onPress: () => navigation.navigate('Notifications'),
        },
      ],
    },
    {
      title: 'Learning',
      items: [
        {
          title: 'Quiz History',
          icon: 'history',
          onPress: () => navigation.navigate('QuizHistory'),
        },
        {
          title: 'Achievements',
          icon: 'emoji-events',
          onPress: () => navigation.navigate('Achievements'),
        },
        {
          title: 'Rewards',
          icon: 'redeem',
          onPress: () => navigation.navigate('Rewards'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help',
          icon: 'help',
          onPress: () => {
            // Open help
          },
        },
        {
          title: 'Contact Us',
          icon: 'contact-support',
          onPress: () => navigation.navigate('ContactUs'),
        },
        {
          title: 'Feedback',
          icon: 'feedback',
          onPress: () => {
            // Open feedback
          },
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          title: 'Terms of Service',
          icon: 'description',
          onPress: () => navigation.navigate('Terms'),
        },
        {
          title: 'Privacy Policy',
          icon: 'privacy-tip',
          onPress: () => navigation.navigate('Privacy'),
        },
        {
          title: 'Refund Policy',
          icon: 'money-off',
          onPress: () => navigation.navigate('Refund'),
        },
      ],
    },
  ];

  const handleShare = async () => {
    try {
      await Linking.openURL(
        `https://play.google.com/store/apps/details?id=${user?.packageName || 'com.subg.app'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Could not open app store');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={'More'}
        showThemeToggle={true}
        onThemeToggle={toggleTheme}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Summary */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>

          <View style={styles.subscriptionStatus}>
            <Text style={[styles.subscriptionLabel, { color: colors.textSecondary }]}>
              Status:
            </Text>
            <Text style={[styles.subscriptionValue, { color: colors.primary }]}>
              {user?.subscriptionStatus?.toUpperCase() || 'FREE'}
            </Text>
          </View>
        </Card>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
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
            </Card>
          </View>
        ))}

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
            Settings
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Icon name="palette" size={24} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>
                Theme
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.themeToggle, { backgroundColor: colors.primary }]}
              onPress={toggleTheme}
            >
              <Text style={styles.themeToggleText}>
                {isDarkMode ? '🌙' : '☀️'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Share App */}
        <Card style={styles.shareCard}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Icon name="share" size={24} color="white" />
            <Text style={styles.shareButtonText}>
              Share App
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Card style={styles.logoutCard}>
          <Button
            title={'Logout'}
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
            Version 1.0.0
          </Text>
          <Text style={[styles.appName, { color: colors.textSecondary }]}>
            SUBG Quiz App
          </Text>
          <Text style={[styles.appCopyright, { color: colors.textSecondary }]}>
            © 2024 SUBG. All rights reserved.
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
  profileCard: {
    margin: 20,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
  },
  subscriptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  subscriptionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionCard: {
    paddingVertical: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 16,
  },
  settingsCard: {
    margin: 20,
    marginBottom: 16,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 16,
  },
  themeToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 16,
  },
  languageToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  languageToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
  },
  logoutButton: {
    borderColor: '#DC3545',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default MoreScreen;