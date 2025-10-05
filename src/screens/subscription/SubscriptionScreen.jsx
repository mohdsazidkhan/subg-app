import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

const SubscriptionScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);

      // Mock subscription plans - replace with actual API call
      const mockPlans = [
        {
          _id: 'free',
          name: 'Free',
          description: 'Basic access to quizzes',
          price: 0,
          duration: 'Forever',
          features: [
            'Access to basic quizzes',
            'Limited quiz attempts',
            'Basic leaderboard access',
            'Community support',
          ],
        },
        {
          _id: 'basic',
          name: 'Basic',
          description: 'Enhanced quiz experience',
          price: 99,
          duration: 'Monthly',
          features: [
            'All free features',
            'Unlimited quiz attempts',
            'Advanced analytics',
            'Priority support',
            'Ad-free experience',
          ],
        },
        {
          _id: 'premium',
          name: 'Premium',
          description: 'Full access to all features',
          price: 199,
          duration: 'Monthly',
          features: [
            'All basic features',
            'Exclusive premium quizzes',
            'Detailed performance reports',
            '24/7 priority support',
            'Early access to new features',
            'Custom study plans',
          ],
          isPopular: true,
        },
        {
          _id: 'pro',
          name: 'Pro',
          description: 'For serious learners',
          price: 399,
          duration: 'Monthly',
          features: [
            'All premium features',
            'Personal tutor sessions',
            'Advanced analytics dashboard',
            'Custom quiz creation',
            'API access',
            'White-label options',
          ],
        },
      ];

      setPlans(mockPlans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      showMessage({
        message: 'Failed to load subscription plans',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      showMessage({
        message: 'You are already on the free plan',
        type: 'info',
      });
      return;
    }

    if (user?.subscriptionStatus === planId) {
      showMessage({
        message: 'You are already subscribed to this plan',
        type: 'info',
      });
      return;
    }

    Alert.alert(
      'Subscribe to Plan',
      `Are you sure you want to subscribe to the ${planId} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe', onPress: () => processSubscription(planId) },
      ]
    );
  };

  const processSubscription = async (planId) => {
    try {
      setSubscribing(true);

      if (!user?._id) {
        showMessage({
          message: 'Please login first',
          type: 'warning'
        });
        return;
      }

      const orderRes = await API.createPayuSubscriptionOrder({
        planId,
        userId: user._id
      });

      if (!orderRes?.success) {
        showMessage({
          message: orderRes.message || 'Failed to create order',
          type: 'danger'
        });
        return;
      }

      // Open PayU payment URL in a WebView or external browser
      // Opening external browser is out-of-scope in RN here; show next steps
      showMessage({
        message: 'Order created. Complete payment via web and return.',
        type: 'info'
      });

    } catch (error) {
      console.error('Error subscribing:', error);
      showMessage({
        message: 'Failed to subscribe. Please try again.',
        type: 'danger',
      });
    } finally {
      setSubscribing(false);
    }
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free':
        return 'free-breakfast';
      case 'basic':
        return 'star';
      case 'premium':
        return 'diamond';
      case 'pro':
        return 'workspace-premium';
      default:
        return 'card-membership';
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'free':
        return colors.textSecondary;
      case 'basic':
        return colors.info;
      case 'premium':
        return colors.primary;
      case 'pro':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const renderPlanCard = (plan) => {
    const planColor = getPlanColor(plan._id);
    const isCurrentPlan = user?.subscriptionStatus === plan._id;

    return (
      <Card
        key={plan._id}
        style={[
          styles.planCard,
          plan.isPopular && { borderColor: colors.primary, borderWidth: 2 },
          isCurrentPlan && { backgroundColor: colors.primary + '10' }
        ]}
      >
        {plan.isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        {isCurrentPlan && (
          <View style={[styles.currentBadge, { backgroundColor: colors.success }]}>
            <Icon name="check-circle" size={16} color="white" />
            <Text style={styles.currentText}>Current Plan</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Icon name={getPlanIcon(plan._id)} size={40} color={planColor} />
          <Text style={[styles.planName, { color: colors.text }]}>
            {plan.name}
          </Text>
          <Text style={[styles.planDescription, { color: colors.textSecondary }]}>
            {plan.description}
          </Text>
        </View>

        <View style={styles.planPricing}>
          <Text style={[styles.planPrice, { color: colors.text }]}>
            ₹{plan.price}
          </Text>
          <Text style={[styles.planDuration, { color: colors.textSecondary }]}>
            / {plan.duration}
          </Text>
        </View>

        <View style={styles.planFeatures}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.feureItem}>
              <Icon name="check" size={16} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <Button
          title={isCurrentPlan ? 'Current Plan' : `Subscribe to ${plan.name}`}
          onPress={() => handleSubscribe(plan._id)}
          variant={isCurrentPlan ? 'outline' : plan.isPopular ? 'primary' : 'secondary'}
          disabled={isCurrentPlan || subscribing}
          loading={subscribing}
          style={styles.subscribeButton}
        />
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title={t('navigation.subscription')}
          showBackButton={true}
          showLanguageToggle={true}
          onBackPress={() => navigation.goBack()}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="card-membership" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={t('navigation.subscription')}
        showBackButton={true}
        showLanguageToggle={true}
        onBackPress={() => navigation.goBack()}
        onLanguageToggle={handleLanguageToggle}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={colors.backgroundGradient} style={styles.header}>
          <View style={styles.headerContent}>
            <Icon name="card-membership" size={40} color="white" />
            <Text style={styles.headerTitle}>Choose Your Plan</Text>
            <Text style={styles.headerSubtitle}>
              Unlock premium features and enhance your learning experience
            </Text>
          </View>
        </LinearGradient>

        {/* Current Plan Status */}
        {user && (
          <Card style={styles.currentPlanCard}>
            <View style={styles.currentPlanContent}>
              <Icon name="person" size={24} color={colors.primary} />
              <View style={styles.currentPlanInfo}>
                <Text style={[styles.currentPlanLabel, { color: colors.textSecondary }]}>
                  Current Plan
                </Text>
                <Text style={[styles.currentPlanValue, { color: colors.text }]}>
                  {user.subscriptionStatus?.toUpperCase() || 'FREE'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Subscription Plans */}
        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
        </View>

        {/* Benefits Section */}
        <Card style={styles.benefitsCard}>
          <Text style={[styles.benefitsTitle, { color: colors.text }]}>
            Why Subscribe?
          </Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Icon name="quiz" size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Access to exclusive premium quizzes
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="analytics" size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Detailed performance analytics
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="support" size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Priority customer support
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="block" size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Ad-free experience
              </Text>
            </View>
          </View>
        </Card>
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
  currentPlanCard: {
    margin: 20,
    marginTop: 16,
  },
  currentPlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPlanInfo: {
    marginLeft: 12,
  },
  currentPlanLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  currentPlanValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  planCard: {
    marginBottom: 20,
    padding: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  popularText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  planPricing: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  planDuration: {
    fontSize: 16,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  subscribeButton: {
    marginTop: 8,
  },
  benefitsCard: {
    margin: 20,
    marginTop: 16,
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});

export default SubscriptionScreen;