import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
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
import Button from '../../components/Button';
import { showMessage } from 'react-native-flash-message';

const RewardsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    try {
      setLoading(true);
      const [rewardsResponse, userResponse] = await Promise.all([
        API.getRewards(),
        API.getUserPoints(),
      ]);

      if (rewardsResponse.success) {
        setRewards(rewardsResponse.data || []);
      }

      if (userResponse.success) {
        setUserPoints(userResponse.points || 0);
      }
    } catch (error) {
      console.error('Error fetching rewards data:', error);
      showMessage({
        message: 'Failed to load rewards data',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRewardsData();
    setRefreshing(false);
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleRedeemReward = async (reward) => {
    if (userPoints < reward.pointsRequired) {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.pointsRequired - userPoints} more points to redeem this reward.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Are you sure you want to redeem ${reward.name} for ${reward.pointsRequired} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Redeem', onPress: () => processRedemption(reward) },
      ]
    );
  };

  const processRedemption = async (reward) => {
    try {
      setRedeeming(true);
      const response = await API.redeemReward(reward.id);

      if (response.success) {
        setUserPoints(userPoints - reward.pointsRequired);
        showMessage({
          message: `Successfully redeemed ${reward.name}!`,
          type: 'success',
        });
        
        // Refresh data to show updated rewards
        await fetchRewardsData();
      } else {
        showMessage({
          message: response.message || 'Failed to redeem reward',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      showMessage({
        message: 'Failed to redeem reward. Please try again.',
        type: 'danger',
      });
    } finally {
      setRedeeming(false);
    }
  };

  const getRewardIcon = (category) => {
    switch (category) {
      case 'coupon':
        return 'local-offer';
      case 'gift':
        return 'card-giftcard';
      case 'voucher':
        return 'receipt';
      case 'discount':
        return 'percent';
      case 'subscription':
        return 'card-membership';
      default:
        return 'star';
    }
  };

  const getRewardColor = (category) => {
    switch (category) {
      case 'coupon':
        return colors.primary;
      case 'gift':
        return colors.success;
      case 'voucher':
        return colors.info;
      case 'discount':
        return colors.warning;
      case 'subscription':
        return colors.accent;
      default:
        return colors.textSecondary;
    }
  };

  const renderRewardItem = (reward) => {
    const canRedeem = userPoints >= reward.pointsRequired;
    const categoryColor = getRewardColor(reward.category);

    return (
      <Card key={reward.id} style={styles.rewardCard}>
        <View style={styles.rewardContent}>
          <View style={[styles.rewardIcon, { backgroundColor: categoryColor + '20' }]}>
            <Icon
              name={getRewardIcon(reward.category)}
              size={24}
              color={categoryColor}
            />
          </View>

          <View style={styles.rewardInfo}>
            <Text style={[styles.rewardName, { color: colors.text }]}>
              {reward.name}
            </Text>
            <Text style={[styles.rewardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {reward.description}
            </Text>
            
            {reward.itemsRemaining !== undefined && (
              <Text style={[styles.rewardLimit, { color: colors.warning }]}>
                Only {reward.itemsRemaining} left!
              </Text>
            )}
          </View>

          <View style={styles.rewardActions}>
            <View style={styles.pointsContainer}>
              <Icon name="star" size={16} color={colors.warning} />
              <Text style={[styles.pointsText, { color: colors.text }]}>
                {reward.pointsRequired}
              </Text>
            </View>

            <Button
              title={canRedeem ? 'Redeem' : 'Not Enough Points'}
              onPress={() => handleRedeemReward(reward)}
              variant={canRedeem ? 'primary' : 'secondary'}
              disabled={!canRedeem || redeeming}
              size="small"
              style={styles.redeemButton}
            />
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title={t('navigation.rewards')}
          showBackButton={true}
          showLanguageToggle={true}
          onBackPress={() => navigation.goBack()}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="redeem" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  const availableRewards = rewards.filter(reward => reward.isActive);
  const redeemedRewards = rewards.filter(reward => reward.isRedeemed);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={t('navigation.rewards')}
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
            <Icon name="redeem" size={40} color="white" />
            <Text style={styles.headerTitle}>Rewards Center</Text>
            <Text style={styles.headerSubtitle}>
              Earn points and redeem exciting rewards
            </Text>
          </View>
        </LinearGradient>

        {/* Points Summary */}
        <Card style={styles.pointsCard}>
          <View style={styles.pointsContent}>
            <View style={styles.pointsInfo}>
              <Icon name="star" size={32} color={colors.warning} />
              <Text style={[styles.userPointsLabel, { color: colors.textSecondary }]}>
                Your Points
              </Text>
              <Text style={[styles.userPointsValue, { color: colors.text }]}>
                {userPoints.toLocaleString()}
              </Text>
            </View>

            <View style={styles.pointsStats}>
              <View style={styles.pointsStat}>
                <Text style={[styles.pointsStatLabel, { color: colors.textSecondary }]}>
                  Earned This Month
                </Text>
                <Text style={[styles.pointsStatValue, { color: colors.success }]}>
                  1,250
                </Text>
              </View>
              
              <View style={styles.pointsStat}>
                <Text style={[styles.pointsStatLabel, { color: colors.textSecondary }]}>
                  Redeemed This Month
                </Text>
                <Text style={[styles.pointsStatValue, { color: colors.warning }]}>
                  500
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Available Rewards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Rewards ({availableRewards.length})
          </Text>

          {availableRewards.length > 0 ? (
            availableRewards.map(renderRewardItem)
          ) : (
            <Card style={styles.emptyState}>
              <View style={styles.emptyContent}>
                <Icon name="card-giftcard" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Rewards Available
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Check back later for new rewards!
                </Text>
              </View>
            </Card>
          )}
        </View>

        {/* Redeemed Rewards */}
        {redeemedRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Redeemed Rewards ({redeemedRewards.length})
            </Text>
            
            {redeemedRewards.map(reward => (
              <Card key={reward.id} style={styles.redeemedCard}>
                <View style={styles.rewardContent}>
                  <View style={[styles.rewardIcon, { opacity: 0.6 }]}>
                    <Icon
                      name={getRewardIcon(reward.category)}
                      size={24}
                      color={getRewardColor(reward.category)}
                    />
                  </View>

                  <View style={styles.rewardInfo}>
                    <Text style={[styles.rewardName, { color: colors.textSecondary }]}>
                      {reward.name}
                    </Text>
                    <Text style={[styles.redeemedDate, { color: colors.textSecondary }]}>
                      Redeemed on {new Date(reward.redeemedAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <Icon name="check-circle" size={24} color={colors.success} />
                </View>
              </Card>
            ))}
          </View>
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
  pointsCard: {
    margin: 20,
    marginTop: 16,
    padding: 20,
  },
  pointsContent: {
    alignItems: 'center',
  },
  pointsInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userPointsLabel: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  userPointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  pointsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  pointsStat: {
    alignItems: 'center',
  },
  pointsStatLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  pointsStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rewardCard: {
    marginBottom: 12,
    padding: 16,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
    marginRight: 12,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  rewardLimit: {
    fontSize: 12,
    fontWeight: '600',
  },
  rewardActions: {
    alignItems: 'flex-end',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  redeemButton: {
    minWidth: 100,
  },
  redeemedCard: {
    marginBottom: 12,
    padding: 16,
    opacity: 0.7,
  },
  redeemedDate: {
    fontSize: 12,
  },
  emptyState: {
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RewardsScreen;