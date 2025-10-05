import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const AddQuestionSection = ({
  onPress,
  isProUser = false,
  currentMonthCount = 0,
  monthlyLimit = 50,
}) => {
  const { colors } = useTheme();

  const getProgressPercentage = () => {
    return Math.min((currentMonthCount / monthlyLimit) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 80) return colors.error;
    if (percentage >= 60) return colors.warning;
    return colors.success;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.primary + '15', colors.secondary + '10']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.leftContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
              <Icon name="add-circle" size={32} color={colors.success} />
            </View>
            <View style={styles.textContent}>
              <Text style={[styles.title, { color: colors.text }]}>
                Add Questions & Earn
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {isProUser
                  ? 'Create quality questions and earn ₹10 each'
                  : 'Become a Pro user to start earning'}
              </Text>
            </View>
          </View>
          <View style={styles.rightContent}>
            {isProUser && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    This Month
                  </Text>
                  <Text style={[styles.progressCount, { color: colors.text }]}>
                    {currentMonthCount}/{monthlyLimit}
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
            <View style={[styles.earnContainer, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.earnAmount, { color: colors.success }]}>
                ₹10
              </Text>
              <Text style={[styles.earnLabel, { color: colors.success }]}>
                per question
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={16} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                Quality questions only
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="security" size={16} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                Admin verified
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="account-balance-wallet" size={16} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                Instant payment
              </Text>
            </View>
          </View>
          <View style={[styles.actionButton, { backgroundColor: colors.success }]}>
            <Icon name="add" size={20} color="white" />
            <Text style={styles.actionButtonText}>
              {isProUser ? 'Add Question' : 'Become Pro'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
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
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  progressContainer: {
    width: 100,
    marginBottom: 8,
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
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  earnContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  earnAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  earnLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  features: {
    flex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default AddQuestionSection;