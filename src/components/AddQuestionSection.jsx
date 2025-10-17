import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const AddQuestionSection = ({
  onPress,
  isProUser = false,
  currentMonthCount = 0
}) => {
  const { colors } = useTheme();

  const getProgressPercentage = () => {
    return Math.min((currentMonthCount?.currentCount / currentMonthCount?.limit) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 80) return colors.error;
    if (percentage >= 60) return colors.warning;
    return colors.success;
  };

  const steps = [
    {
      step: "1",
      title: "Create Questions",
      description: "Submit quiz questions through your dashboard"
    },
    {
      step: "2", 
      title: "Admin Review",
      description: "Our team reviews and approves quality questions"
    },
    {
      step: "3",
      title: "Earn Money",
      description: "Get ₹10 credited to your wallet for each approved question"
    },
    {
      step: "4",
      title: "Request Withdrawal",
      description: "After 100 approved questions, request withdrawal to admin"
    },
    {
      step: "5",
      title: "Payout Prize",
      description: "Only available if you qualify as a Monthly Winner"
    }
  ];

  const limits = [
    { label: "Daily Question Limit", value: "Up to 5 Questions" },
    { label: "Monthly Question Limit", value: "Up to 100 Questions" },
    { label: "Earnings Per Approved Question", value: "₹10 Each" },
    { label: "Minimum Questions to Withdraw", value: "100 Questions" },
    { label: "Minimum Payout Amount", value: "₹1,000*" },
    { label: "Prize Transfer", value: "With Monthly Prize" },
  ];

  const benefits = [
    "Earn money for quality content",
    "Help build the quiz community",
    "Monthly withdrawal processing",
    "Admin-reviewed quality standards"
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={[colors.success + '15', colors.success + '10']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
            <Text style={styles.iconEmoji}>💰</Text>
          </View>
          <View style={styles.headerTextContent}>
            <Text style={[styles.mainTitle, { color: colors.text }]}>
              Earn Prize by Adding Questions
            </Text>
            <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
              All users can earn money by creating quality questions. Get ₹10 for every approved question!
            </Text>
          </View>
        </View>

        {/* Progress Bar for Pro Users */}
        {isProUser && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                This Month
              </Text>
              <Text style={[styles.progressCount, { color: colors.text }]}>
                {currentMonthCount?.currentCount}/{currentMonthCount?.limit}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.textSecondary + '20' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: getProgressColor(),
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Details */}
        <View style={styles.detailsContainer}>
          {/* Earning Process Steps */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📋 How It Works
            </Text>
            {steps.map((item, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: colors.success }]}>
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Limits & Info */}
          <View style={[styles.infoBox, { backgroundColor: colors.success + '10', borderColor: colors.success + '40' }]}>
            <Text style={[styles.infoBoxTitle, { color: colors.text }]}>
              💡 Limits & Earnings
            </Text>
            {limits.map((item, index) => (
              <View key={index} style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.infoValue, { color: colors.success }]}>
                  {item.value}
                </Text>
              </View>
            ))}
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              *Payout is only available if you qualify as a Monthly Winner.
            </Text>
          </View>

          {/* Pro User Benefits */}
          <View style={[styles.benefitsBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '40' }]}>
            <Text style={[styles.benefitsTitle, { color: colors.text }]}>
              🎯 Pro User Benefits
            </Text>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check-circle" size={18} color={colors.success} />
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Icon name="add-circle" size={20} color="white" />
          <Text style={styles.actionButtonText}>
            {isProUser ? 'Add Question Now' : 'Become Pro User'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 0,
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
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  headerTextContent: {
    flex: 1,
    marginRight: 8,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  progressSection: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressCount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  detailsContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  infoBoxTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noteText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
  },
  benefitsBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AddQuestionSection;