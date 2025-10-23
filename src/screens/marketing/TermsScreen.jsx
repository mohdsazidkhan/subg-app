import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { REWARDS } from '../../config/env';
import TopBar from '../../components/TopBar';

const TermsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Terms & Conditions"
        showMenuButton={false}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.contentContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Terms & Conditions
          </Text>

          <Text style={[styles.subtitle, { color: colors.text }]}>
            By using SUBG QUIZ, you agree to participate fairly and follow all platform rules.
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            You must be at least 14 years old to register and play.
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            SUBG QUIZ is a skill-based quiz platform. Success depends on your knowledge, accuracy, and speed. All participation is voluntary.
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            We offer 4 subscription plans: Free, Basic, Premium, and Pro — each with access to different quiz levels. Once subscribed, all fees are non-refundable, regardless of performance or disqualification.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            Monthly Rewards System
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            Rewards are processed monthly based on Top leaderboard performance:
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            • Monthly 10 eligible users at Level 10 with {REWARDS.MONTHLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes win prizes from ₹{REWARDS.MONTHLY_REWARD_PRIZE_POOL} total pool{'\n\n'}
            • Eligibility: reach Level 10 and have {REWARDS.MONTHLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes (≥75% accuracy) in the current month{'\n\n'}
            • Reset: Rankings and rewards reset every month on the 1st
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            Participating Guidelines
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            • Be factual; no excessive spelling mistakes or vague questions. Keep it concise.{'\n\n'}
            • Disagree respectfully; explain based on knowledge, not opinions.{'\n\n'}
            • Respect others; no rude language or targeted harassment.{'\n\n'}
            • Stay on topic; post education-related content only.{'\n\n'}
            • Follow guidelines or face possible removal/banning.{'\n\n'}
            • Age requirement: be 14+ years old to participate.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            Terms and Disclaimers
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            These Terms apply to your Quiz Platform access and participation. SUBG QUIZ administrator reserves the right to grant/deny access, disqualify users, or adjust prizes.
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            After successful payment, we'll issue an order receipt and begin order processing.
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            For Rewards/Subscriptions payments, we may verify info before processing.
          </Text>

          <Text style={[styles.footer, { color: colors.textSecondary }]}>
            Updated 2025
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
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    lineHeight: 24,
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

export default TermsScreen;