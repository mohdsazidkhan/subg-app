import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const AddQuestionEarnSection = ({ onPress, onMyQuestionsPress, isProUser = false, currentMonthCount }) => {
  const { colors } = useTheme();

  const progress = (() => {
    const current = currentMonthCount?.currentCount || 0;
    const limit = currentMonthCount?.limit || 100;
    const remaining = Math.max(0, limit - current);
    const pct = Math.min(100, (current / limit) * 100);
    return { current, limit, remaining, pct };
  })();

  const steps = [
    { step: '1', title: 'Add Questions', description: 'Post questions with 4 options', icon: 'add-circle' },
    { step: '2', title: 'Admin Review', description: 'Team verifies and approves', icon: 'verified' },
    { step: '3', title: 'Earn Money', description: '₹10 for every approved question', icon: 'account-balance-wallet' },
    { step: '4', title: 'Withdraw', description: 'Request payout after 100 approvals', icon: 'payments' },
    { step: '5', title: 'Payout', description: 'If You Are a Monthly Winner', icon: 'wallet' },
  ];

  const requirements = [
    '4 answer options per question',
    'Clear and unambiguous questions',
    'Admin verification required',
    '₹10 per approved question',
    'Monthly limit: 100 questions'
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
        {/* Earn Money Section */}
        <View style={styles.earnSection}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[(colors?.success || '#10B981'), (colors?.accent || '#06B6D4')]}
              style={styles.iconGradient}
            >
              <Text style={styles.iconEmoji}>💰</Text>
            </LinearGradient>
          </View>
          <Text style={[styles.earnTitle, { color: colors.text }]}>
            Add Questions & Earn Money
          </Text>
          <Text style={[styles.earnDescription, { color: colors.textSecondary }]}>
            Create quality questions and earn ₹10 for each approved question.
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

        {/* Progress Card */}
        {isProUser && (
          <LinearGradient
            colors={[(colors?.primary || '#EF4444') + '20', (colors?.accent || '#06B6D4') + '20']}
            style={[styles.progressCard, { borderColor: colors?.border || '#E2E8F0' }]}
          >
            <Text style={[styles.progressTitle, { color: colors.text }]}>
              📊 This Month Progress
            </Text>
            <View style={styles.progressHeaderRow}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Questions Added</Text>
              <Text style={[styles.progressCount, { color: colors.text }]}>{progress.current || 0}/{progress.limit || 100}</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.textSecondary + '20' }]}>
              <View style={[styles.progressFill, { width: `${progress.pct}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressHint, { color: colors.textSecondary }]}>
              {progress.remaining || 0} questions remaining this month
            </Text>
          </LinearGradient>
        )}

        {/* Requirements Card */}
        <LinearGradient
          colors={[(colors?.accent || '#06B6D4') + '20', (colors?.primary || '#EF4444') + '15']}
          style={[styles.requirementsCard, { borderColor: colors?.border || '#E2E8F0' }]}
        >
          <Text style={[styles.requirementsTitle, { color: colors.text }]}>
            📝 Question Requirements
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
          {isProUser ? (
            <>
              <TouchableOpacity onPress={onMyQuestionsPress} activeOpacity={0.8}>
                <LinearGradient
                  colors={[(colors?.accent || '#06B6D4'), (colors?.accent || '#06B6D4') + 'DD']}
                  style={[styles.button, { shadowColor: colors?.text || '#000000' }]}
                >
                  <Text style={styles.buttonEmoji}>📚</Text>
                  <Text style={styles.buttonText}>My Questions</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <LinearGradient
                  colors={[(colors?.primary || '#EF4444'), (colors?.primary || '#EF4444') + 'DD']}
                  style={[styles.button, { shadowColor: colors?.text || '#000000' }]}
                >
                  <Text style={styles.buttonEmoji}>📝</Text>
                  <Text style={styles.buttonText}>Add Question</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
              <LinearGradient
                colors={[(colors?.primary || '#EF4444'), (colors?.accent || '#06B6D4')]}
                style={[styles.button, styles.buttonFull, { shadowColor: colors?.text || '#000000' }]}
              >
                <Text style={styles.buttonEmoji}>📝</Text>
                <Text style={styles.buttonText}>Become Pro User</Text>
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
  progressCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    flex: 1,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressHint: {
    fontSize: 12,
    textAlign: 'right',
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
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddQuestionEarnSection;


