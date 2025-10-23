import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const ReferralSection = ({
  user,
  onPress,
}) => {
  const { colors } = useTheme();

  const handleShare = async () => {
    if (!user?.referralCode) {
      Alert.alert('No Referral Code', 'Please complete your profile to get a referral code.');
      return;
    }

    const shareMessage = `Join me on SUBG QUIZ APP! Use my referral code: ${user.referralCode} to get exclusive benefits. Download now!`;

    try {
      await Share.share({
        message: shareMessage,
        title: 'Join SUBG QUIZ APP',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getReferralProgress = () => {
    const count = user?.referralCount || 0;

    if (count >= 10)
      return { progress: 100, level: 'Pro', color: colors.accent };
    if (count >= 5)
      return { progress: 50, level: 'Premium', color: colors.error };
    if (count >= 2)
      return { progress: 20, level: 'Basic', color: colors.warning };

    return { progress: 0, level: 'Free', color: colors.textSecondary };
  };

  const referralProgress = getReferralProgress();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={[colors.accent + '15', colors.primary + '10']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
            <Icon name="share" size={28} color={colors.accent} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>
              Refer & Earn Premium
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Invite friends and unlock premium subscriptions
            </Text>
          </View>
        </View>

        {user?.referralCode && (
          <View style={styles.referralCodeContainer}>
            <Text style={[styles.referralLabel, { color: colors.textSecondary }]}>
              Your Referral Code
            </Text>
            <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.referralCode, { color: colors.text }]}>
                {user.referralCode}
              </Text>
              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: colors.primary + '20' }]}
                onPress={() => {
                  // In a real app, you'd copy to clipboard
                  Alert.alert('Copied!', `Referral code ${user.referralCode} copied to clipboard`);
                }}
              >
                <Icon name="content-copy" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>
              Your Progress
            </Text>
            <Text style={[styles.progressCount, { color: colors.text }]}>
              {user?.referralCount || 0} referrals
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.textSecondary + '20' }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${referralProgress.progress}%`,
                  backgroundColor: referralProgress.color,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLevel, { color: referralProgress.color }]}>
            Current Level: {referralProgress.level}
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={[styles.benefitsTitle, { color: colors.text }]}>
            Referral Rewards
          </Text>
          <View style={styles.benefitsGrid}>
            <View style={[styles.benefitCard, { backgroundColor: colors.warning + '20' }]}>
              <Text style={styles.benefitEmoji}>🎯</Text>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>2 Referrals</Text>
          <Text style={[styles.benefitValue, { color: colors.warning }]}>₹9 BASIC</Text>
          <Text style={[styles.benefitSubtext, { color: colors.textSecondary }]}>1 Month Free</Text>
            </View>
            <View style={[styles.benefitCard, { backgroundColor: colors.error + '20' }]}>
              <Text style={styles.benefitEmoji}>🚀</Text>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>5 Referrals</Text>
              <Text style={[styles.benefitValue, { color: colors.error }]}>₹49 PREMIUM</Text>
              <Text style={[styles.benefitSubtext, { color: colors.textSecondary }]}>1 Month Free</Text>
            </View>
            <View style={[styles.benefitCard, { backgroundColor: colors.accent + '20' }]}>
              <Text style={styles.benefitEmoji}>👑</Text>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>10 Referrals</Text>
              <Text style={[styles.benefitValue, { color: colors.accent }]}>₹99 PRO</Text>
              <Text style={[styles.benefitSubtext, { color: colors.textSecondary }]}>1 Month Free</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: colors.accent }]}
            onPress={handleShare}
          >
            <Icon name="share" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share Referral Code</Text>
          </TouchableOpacity>
          {onPress && (
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.primary + '20' }]}
              onPress={onPress}
            >
              <Icon name="person" size={20} color={colors.primary} />
              <Text style={[styles.profileButtonText, { color: colors.primary }]}>
                View Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  referralCodeContainer: {
    marginBottom: 20,
  },
  referralLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  referralCode: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  benefitCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  benefitEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  benefitValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  benefitSubtext: {
    fontSize: 10,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default ReferralSection;