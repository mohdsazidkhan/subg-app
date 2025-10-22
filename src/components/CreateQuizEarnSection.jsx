import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

/**
 * CreateQuizEarnSection Component
 * 
 * Displays information about creating custom quizzes and earning subscription rewards.
 * Shows the process, milestone rewards, and requirements for all users.
 */

const CreateQuizEarnSection = ({ onCreatePress, onMyQuizzesPress }) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const steps = [
    {
      step: "1",
      title: "Create Custom Quiz",
      description: "Design quizzes with 5-10 questions on any topic",
      icon: "edit"
    },
    {
      step: "2", 
      title: "Admin Review",
      description: "Our team reviews and approves your quiz",
      icon: "verified"
    },
    {
      step: "3",
      title: "Reach Milestones",
      description: "Get rewards at 9, 49, and 99 approved quizzes",
      icon: "flag"
    },
    {
      step: "4",
      title: "Earn Subscription",
      description: "Unlock Basic, Premium, or Pro subscription extensions",
      icon: "card-giftcard"
    },
    {
      step: "5",
      title: "Share & Contribute",
      description: "Your quizzes help the entire community learn",
      icon: "people"
    }
  ];

  const milestones = [
    { quizzes: 9, reward: "Basic +1 Month" },
    { quizzes: 49, reward: "Premium +1 Month" },
    { quizzes: 99, reward: "Pro +1 Month" },
    { quizzes: 100, reward: "Monthly Creation Limit", isLimit: true }
  ];

  const requirements = [
    "5-10 questions per quiz",
    "Choose difficulty level",
    "Set custom time limits",
    "Create categories & subcategories",
    "Track your milestone progress"
  ];

  return (
    <View style={styles.container}>
      {/* Main Content Card */}
      <LinearGradient
        colors={[colors?.surface || '#FFFFFF', (colors?.surface || '#FFFFFF') + 'CC']}
        style={[styles.mainCard, { 
          borderColor: colors?.border || '#E2E8F0',
          shadowColor: colors?.text || '#000000'
        }]}
      >
        {/* Earn FREE Subscriptions Section */}
        <View style={styles.earnSection}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[(colors?.primary || '#EF4444'), (colors?.accent || '#06B6D4')]}
              style={styles.iconGradient}
            >
              <Text style={styles.iconEmoji}>🎓</Text>
            </LinearGradient>
          </View>
          <Text style={[styles.earnTitle, { color: colors.text }]}>
            Create Custom Quizzes & Earn Subscription Rewards
          </Text>
          <Text style={[styles.earnDescription, { color: colors.textSecondary }]}>
            Create quality quizzes with 5-10 questions each and unlock subscription rewards at major milestones.
          </Text>
        </View>

        {/* Steps Section */}
        <View style={styles.stepsSection}>
          {steps.map((item, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{item.step}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Icon name={item.icon} size={18} color={colors.primary} />
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                </View>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Milestone Rewards Card */}
        <LinearGradient
          colors={[(colors?.primary || '#EF4444') + '20', (colors?.accent || '#06B6D4') + '20']}
          style={[styles.rewardsCard, { borderColor: colors?.border || '#E2E8F0' }]}
        >
          <Text style={[styles.rewardsTitle, { color: colors.text }]}>
            🏆 Milestone Rewards
          </Text>
          <View style={styles.rewardsList}>
            {milestones.map((milestone, index) => (
              <View key={index} style={styles.rewardItem}>
                <Text style={[styles.rewardQuizzes, { color: colors.textSecondary }]}>
                  {milestone.isLimit ? 'Monthly Creation Limit' : `${milestone.quizzes} Approved Quizzes`}
                </Text>
                <Text style={[styles.rewardBadge, { color: colors.primary }]}>
                  {milestone.isLimit ? 'Up to 100 Quizzes' : milestone.reward}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Quiz Requirements Card */}
        <LinearGradient
          colors={[(colors?.accent || '#06B6D4') + '20', (colors?.primary || '#EF4444') + '15']}
          style={[styles.requirementsCard, { borderColor: colors?.border || '#E2E8F0' }]}
        >
          <Text style={[styles.requirementsTitle, { color: colors.text }]}>
            📝 Quiz Requirements
          </Text>
          <View style={styles.requirementsList}>
            {requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
                  {requirement}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {user ? (
            <>
              <TouchableOpacity onPress={onMyQuizzesPress} activeOpacity={0.8}>
                <LinearGradient
                  colors={[(colors?.accent || '#06B6D4'), (colors?.accent || '#06B6D4') + 'DD']}
                  style={[styles.button, { shadowColor: colors?.text || '#000000' }]}
                >
                  <Text style={styles.buttonEmoji}>📚</Text>
                  <Text style={styles.buttonText}>My Quizzes</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={onCreatePress} activeOpacity={0.8}>
                <LinearGradient
                  colors={[(colors?.primary || '#EF4444'), (colors?.primary || '#EF4444') + 'DD']}
                  style={[styles.button, { shadowColor: colors?.text || '#000000' }]}
                >
                  <Text style={styles.buttonEmoji}>🚀</Text>
                  <Text style={styles.buttonText}>Start Creating Quizzes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={onCreatePress} activeOpacity={0.8}>
              <LinearGradient
                colors={[(colors?.primary || '#EF4444'), (colors?.accent || '#06B6D4')]}
                style={[styles.button, styles.buttonFull, { shadowColor: colors?.text || '#000000' }]}
              >
                <Text style={styles.buttonEmoji}>🚀</Text>
                <Text style={styles.buttonText}>Become a Pro User</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  headerSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  mainCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  earnSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 70,
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 35,
  },
  earnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  earnDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsSection: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 26,
  },
  rewardsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardsList: {
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardQuizzes: {
    fontSize: 14,
    flex: 1,
  },
  rewardBadge: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  requirementsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  requirementsList: {
    gap: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  requirementText: {
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonFull: {
    width: '100%',
  },
  buttonEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateQuizEarnSection;
