import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import TopBar from '../../components/TopBar';

const PrivacyScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Privacy Policy"
        showMenuButton={false}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.contentContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Privacy Policy
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            This Privacy Policy explains how SUBG QUIZ collects, uses, stores, and protects your information when you use our platform. By using SUBG QUIZ, you agree to the practices described below.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            1) Information We Collect
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            • Account Information: email, phone number, password (hashed), referral code.{'\n\n'}
            • Profile/Student Data: progression, badges, leaderboard placement, high‑score quizzes count, quiz best scores, total quizzes played.{'\n\n'}
            • Quiz Activity: attempts, scores, timings, and related analytics used to calculate levels, leaderboard ranks, and rewards eligibility.{'\n\n'}
            • Rewards & Wallet: unlocked/claimed rewards history, claimable balance, and monthly rewards processing status.{'\n\n'}
            • Bank/Withdrawal Details (optional): You provide bank information for rewards withdrawal. We store it securely and use it only for payout verification and processing.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            2) How We Use Your Information
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            • Provide and improve quiz functionality & user experience{'\n\n'}
            • Calculate scores, levels, leaderboard ranks, and eligibility for rewards{'\n\n'}
            • Process monthly rewards and payouts through secure bank mechanisms{'\n\n'}
            • Send verification & transactional communications{'\n\n'}
            • Ensure platform security & prevent fraud
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            3) Information Sharing
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            We do NOT sell your personal data. We may share limited aggregated/advertising performance only. Bank data is ONLY used & transmitted to payment processors as needed for payouts.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            4) Data Storage
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            Your information is stored securely using national cloud & payment security standards. We take all reasonable measures to protect your data.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            5) Your Rights
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            You may request your data or have it deleted from us. Contact us if you wish to do so.
          </Text>

          <Text style={[styles.footer, { color: colors.textSecondary }]}>
            Last Updated 2025
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
  contentContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#3B82F6',
  },
  section: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  footer: {
    fontSize: 14,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PrivacyScreen;