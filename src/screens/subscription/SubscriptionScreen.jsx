import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { showMessage } from 'react-native-flash-message';

const SubscriptionScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      if (!user?._id) {
        showMessage({
          message: 'Please login to view subscription details',
          type: 'warning',
        });
        return;
      }

      // Fetch subscription status
      const subscriptionRes = await API.getSubscriptionStatus(user._id);
      if (subscriptionRes.success && subscriptionRes.data) {
        setSubscription(subscriptionRes.data);
      }

      // Fetch subscription plans
      await fetchSubscriptionPlans();
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      showMessage({
        message: 'Failed to load subscription data',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      // Subscription plans matching Next.js exactly
      const subscriptionPlans = [
        {
          key: 'free',
          name: 'Free',
          price: 0,
          duration: '1 month',
          features: [
            { text: 'Unlimited Quiz Access (Levels 0-3)', included: true },
            { text: 'Community Access', included: true },
            { text: 'Basic Analytics', included: true },
            { text: 'Email Support', included: true },
            { text: 'Live Quizzes', included: false },
            { text: 'Exclusive Badges', included: false },
            { text: 'Bonus Content', included: false },
            { text: 'Priority Support', included: false },
          ],
        },
        {
          key: 'basic',
          name: 'Basic',
          price: 9,
          duration: '1 month',
          features: [
            { text: 'Unlimited Quiz Access (Levels 0-6)', included: true },
            { text: 'Community Access', included: true },
            { text: 'Detailed Analytics', included: true },
            { text: 'Email Support', included: true },
            { text: 'Live Quizzes', included: false },
            { text: 'Exclusive Badges', included: false },
            { text: 'Bonus Content', included: false },
            { text: 'Priority Support', included: false },
          ],
        },
        {
          key: 'premium',
          name: 'Premium',
          price: 49,
          duration: '1 month',
          features: [
            { text: 'Unlimited Quiz Access (Levels 0-9)', included: true },
            { text: 'Community Access', included: true },
            { text: 'Advanced Analytics', included: true },
            { text: 'Priority Support', included: true },
            { text: 'Live Quizzes', included: true },
            { text: 'Exclusive Badges', included: true },
            { text: 'Bonus Content', included: true },
            { text: 'Advanced Reports', included: true },
          ],
        },
        {
          key: 'pro',
          name: 'Pro',
          price: 99,
          duration: '1 month',
          features: [
            { text: 'Unlimited Quiz Access (All Levels 0-10)', included: true },
            { text: 'Community Access', included: true },
            { text: 'Advanced Analytics', included: true },
            { text: 'Priority Support', included: true },
            { text: 'Live Quizzes', included: true },
            { text: 'Exclusive Badges', included: true },
            { text: 'Bonus Content', included: true },
            { text: 'Advanced Reports', included: true },
            { text: 'Data Export', included: true },
            { text: 'API Access', included: true },
            { text: 'Custom Categories', included: true },
            { text: 'All Premium Features', included: true },
          ],
        },
      ];

      setPlans(subscriptionPlans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      showMessage({
        message: 'Failed to load subscription plans',
        type: 'danger',
      });
    }
  };

  const handleSubscribe = (planKey) => {
    setSelectedPlan(planKey);
  };

  const handlePaymentSuccess = () => {
    fetchSubscriptionData();
    setSelectedPlan(null);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setSelectedPlan(null);
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
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

  const getPlanGradient = (planName) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return ['#F59E0B', '#EF4444'];
      case 'basic':
        return ['#F59E0B', '#DC2626', '#EF4444'];
      case 'premium':
        return ['#EF4444', '#DC2626', '#EC4899'];
      case 'pro':
        return ['#F97316', '#EF4444', '#EC4899'];
      default:
        return ['#10B981', '#059669', '#0D9488'];
    }
  };

  const renderPlanCard = (plan) => {
    const gradient = getPlanGradient(plan.name);
    const isCurrentPlan = subscription && 
      subscription.planName && 
      subscription.planName.toLowerCase() === plan.name.toLowerCase() && 
      subscription.status === 'active';
    
    const isExpiredPlan = subscription && 
      subscription.planName && 
      subscription.planName.toLowerCase() === plan.name.toLowerCase() && 
      subscription.status !== 'active';

    return (
      <Card
        key={plan.key}
        style={[
          styles.planCard,
          { backgroundColor: colors.surface },
          isCurrentPlan && [styles.currentPlanCard, { backgroundColor: colors.success + '10' }],
          isExpiredPlan && [styles.expiredPlanCard, { backgroundColor: colors.error + '10' }],
        ]}
      >
        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <View style={styles.currentPlanBadge}>
            <Icon name="check-circle" size={12} color="white" />
            <Text style={styles.badgeText}>CURRENT PLAN</Text>
          </View>
        )}

        {/* Expired Plan Badge */}
        {isExpiredPlan && !isCurrentPlan && (
          <View style={styles.expiredPlanBadge}>
            <Icon name="bolt" size={12} color="white" />
            <Text style={styles.badgeText}>EXPIRED</Text>
          </View>
        )}

        {/* Popular Badge */}
        {plan.name.toLowerCase() === 'premium' && !isCurrentPlan && (
          <View style={styles.popularBadge}>
            <Icon name="local-fire-department" size={12} color="white" />
            <Text style={styles.badgeText}>Popular</Text>
          </View>
        )}

        {/* Pro Badge */}
        {plan.name.toLowerCase() === 'pro' && !isCurrentPlan && (
          <View style={styles.proBadge}>
            <Icon name="diamond" size={12} color="white" />
            <Text style={styles.badgeText}>PREMIUM</Text>
          </View>
        )}

        {/* Plan Icon */}
        <View style={styles.planIconContainer}>
          <LinearGradient
            colors={gradient}
            style={styles.planIcon}
          >
            <Icon name={getPlanIcon(plan.name)} size={24} color="white" />
          </LinearGradient>
        </View>

        {/* Plan Header */}
        <View style={styles.planHeader}>
          <Text style={[
            styles.planName,
            { color: isCurrentPlan ? colors.success : isExpiredPlan ? colors.error : colors.text }
          ]}>
            {plan.name.toUpperCase()}
            {isCurrentPlan && <Text style={styles.crownEmoji}> 👑</Text>}
            {isExpiredPlan && !isCurrentPlan && <Text style={styles.warningEmoji}> ⚠️</Text>}
          </Text>
          
          {/* Level Access Info */}
          <Text style={[styles.levelAccess, { color: colors.textSecondary }]}>
            {plan.name === 'Free' && '0-3 Level Access'}
            {plan.name === 'Basic' && '0-6 Level Access'}
            {plan.name === 'Premium' && '0-9 Level Access'}
            {plan.name === 'Pro' && '0-10 Level Access'}
          </Text>

          {/* Price Display */}
          <View style={styles.priceContainer}>
          <Text style={[styles.planPrice, { color: colors.text }]}>
            ₹{plan.price}
          </Text>
          <Text style={[styles.planDuration, { color: colors.textSecondary }]}>
              /month
            </Text>
          </View>
          
          <Text style={[styles.durationText, { color: colors.textSecondary }]}>
            Duration: {plan.duration}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[
                styles.featureIcon,
                { backgroundColor: feature.included ? colors.success : colors.textSecondary }
              ]}>
                <Icon 
                  name={feature.included ? 'check' : 'lock'} 
                  size={12} 
                  color="white" 
                />
              </View>
              <Text style={[
                styles.featureText,
                { 
                  color: feature.included ? colors.text : colors.textSecondary,
                  textDecorationLine: feature.included ? 'none' : 'line-through'
                }
              ]}>
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Subscribe Button */}
        <View style={styles.buttonContainer}>
          {isCurrentPlan ? (
            <TouchableOpacity
              disabled={true}
              style={[styles.subscribeButton, styles.currentButton]}
            >
              <Icon name="check-circle" size={16} color="white" />
              <Text style={styles.buttonText}>Current Plan</Text>
            </TouchableOpacity>
          ) : isExpiredPlan ? (
            selectedPlan === plan.key ? (
              <View style={styles.paymentContainer}>
                <Text style={[styles.paymentText, { color: colors.text }]}>
                  Payment integration would go here
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedPlan(null)}
                  style={styles.cancelButton}
                >
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleSubscribe(plan.key)}
                style={[styles.subscribeButton, styles.reactivateButton]}
              >
                <Icon name="bolt" size={16} color="white" />
                <Text style={styles.buttonText}>Reactivate Plan</Text>
              </TouchableOpacity>
            )
          ) : selectedPlan === plan.key ? (
            <View style={styles.paymentContainer}>
              <Text style={[styles.paymentText, { color: colors.text }]}>
                Payment integration would go here
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedPlan(null)}
                style={styles.cancelButton}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleSubscribe(plan.key)}
              style={[styles.subscribeButton, { backgroundColor: colors.primary }]}
            >
              <Icon name="rocket-launch" size={16} color="white" />
              <Text style={styles.buttonText}>Get Started Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar title="Subscription" showBackButton={true} onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading subscription details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="Subscription" showBackButton={true} onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={colors.isDark ? ['#1F2937', '#374151', '#4B5563'] : ['#F59E0B', '#EF4444', '#EC4899']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Icon name="account-balance-wallet" size={40} color="white" />
              <View style={styles.crownBadge}>
                <Icon name="workspace-premium" size={16} color="white" />
              </View>
            </View>
            <Text style={styles.heroTitle}>Unlock Your Potential</Text>
            <Text style={styles.heroSubtitle}>
              Choose the perfect subscription plan and take your quiz experience to the next level
            </Text>
          </View>
        </LinearGradient>

        {/* Current Subscription Status */}
        {subscription && (
          <Card style={[styles.subscriptionStatusCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIconContainer}>
                <Icon name="security" size={24} color="white" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: colors.text }]}>
                  Current Subscription
                </Text>
                <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                  {subscription.status === 'active' ? 'Your active plan details' : 'Your subscription details'}
                </Text>
              </View>
            </View>

            <View style={styles.statusGrid}>
              {/* Current Plan */}
              <View style={[styles.statusItem, { backgroundColor: colors.background }]}>
                <View style={styles.statusItemIcon}>
                  <Icon name="workspace-premium" size={20} color="white" />
                </View>
                <Text style={[styles.statusItemLabel, { color: colors.textSecondary }]}>
                  Current Plan
                </Text>
                <Text style={[styles.statusItemValue, { color: colors.text }]}>
                  {subscription.planName?.toUpperCase() || 'FREE'}
                </Text>
              </View>

              {/* Status */}
              <View style={[styles.statusItem, { backgroundColor: colors.background }]}>
                <View style={styles.statusItemIcon}>
                  <Icon name="check-circle" size={20} color="white" />
                </View>
                <Text style={[styles.statusItemLabel, { color: colors.textSecondary }]}>
                  Status
                </Text>
                <Text style={[
                  styles.statusItemValue,
                  { color: subscription.status === 'active' ? colors.success : colors.error }
                ]}>
                  {subscription.status === 'active' ? 'Active' : 'Expired'}
                </Text>
              </View>

              {/* Level Access */}
              <View style={[styles.statusItem, { backgroundColor: colors.background }]}>
                <View style={styles.statusItemIcon}>
                  <Icon name="menu-book" size={20} color="white" />
                </View>
                <Text style={[styles.statusItemLabel, { color: colors.textSecondary }]}>
                  Level Access
                </Text>
                <Text style={[styles.statusItemValue, { color: colors.text }]}>
                  {subscription.planName?.toLowerCase() === 'basic' && 'Zero to Mastermind'}
                  {subscription.planName?.toLowerCase() === 'premium' && 'Zero to Wizard'}
                  {subscription.planName?.toLowerCase() === 'pro' && 'Zero to Legend'}
                  {(!subscription.planName || subscription.planName === 'free') && 'Zero to Thinker'}
                </Text>
                <Text style={[styles.statusItemSubtext, { color: colors.textSecondary }]}>
                  {subscription.planName?.toLowerCase() === 'basic' && 'Levels 0-6'}
                  {subscription.planName?.toLowerCase() === 'premium' && 'Levels 0-9'}
                  {subscription.planName?.toLowerCase() === 'pro' && 'Levels 0-10'}
                  {(!subscription.planName || subscription.planName === 'free') && 'Levels 0-3'}
                </Text>
              </View>

              {/* Expires On */}
              <View style={[styles.statusItem, { backgroundColor: colors.background }]}>
                <View style={styles.statusItemIcon}>
                  <Icon name="event" size={20} color="white" />
                </View>
                <Text style={[styles.statusItemLabel, { color: colors.textSecondary }]}>
                  Expires On
                </Text>
                <Text style={[styles.statusItemValue, { color: colors.text }]}>
                  {subscription.expiryDate ? 
                    new Date(subscription.expiryDate).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Expired Subscription Notice */}
            {subscription && subscription.status !== 'active' && (
              <View style={[styles.expiredNotice, { backgroundColor: colors.warning + '20' }]}>
                <View style={styles.expiredNoticeIcon}>
                  <Icon name="bolt" size={20} color="white" />
                </View>
                <View style={styles.expiredNoticeContent}>
                  <Text style={[styles.expiredNoticeTitle, { color: colors.text }]}>
                    Your {subscription.planName?.toUpperCase()} Plan has Expired
                  </Text>
                  <Text style={[styles.expiredNoticeText, { color: colors.textSecondary }]}>
                    Reactivate your {subscription.planName?.toUpperCase()} plan below to continue enjoying premium features and access to all levels.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.reactivateButton}
                  onPress={() => {
                    // Scroll to plans section
                  }}
                >
                  <Text style={styles.reactivateButtonText}>Reactivate Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        )}

        {/* Subscription Plans */}
        <View style={styles.plansSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose Your Perfect Plan
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Select the plan that best fits your learning goals and unlock premium features
          </Text>
          
        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
          </View>
        </View>

        {/* Benefits Section */}
        <Card style={[styles.benefitsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.benefitsTitle, { color: colors.text }]}>
            Why Choose Premium?
          </Text>
          <Text style={[styles.benefitsSubtitle, { color: colors.textSecondary }]}>
            Discover the amazing benefits that await you
          </Text>
          
          <View style={styles.benefitsGrid}>
            {[
              {
                icon: 'all-inclusive',
                title: 'Unlimited Access',
                description: 'Access all premium quizzes and features without any restrictions',
                gradient: ['#F59E0B', '#EF4444'],
              },
              {
                icon: 'emoji-events',
                title: 'Monthly Rewards',
                description: 'Top performers each month win exciting prizes',
                gradient: ['#F59E0B', '#F97316'],
              },
              {
                icon: 'support-agent',
                title: 'Priority Support',
                description: 'Get faster response times and dedicated customer support',
                gradient: ['#10B981', '#0D9488'],
              },
              {
                icon: 'analytics',
                title: 'Advanced Analytics',
                description: 'Track your progress with detailed performance insights',
                gradient: ['#EF4444', '#F59E0B'],
              },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <LinearGradient
                  colors={benefit.gradient}
                  style={styles.benefitIcon}
                >
                  <Icon name={benefit.icon} size={24} color="white" />
                </LinearGradient>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>
                  {benefit.title}
              </Text>
                <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                  {benefit.description}
              </Text>
            </View>
            ))}
          </View>
        </Card>

        {/* Call to Action */}
        <LinearGradient
          colors={colors.isDark ? ['#1F2937', '#374151', '#4B5563'] : ['#FEF3C7', '#FECACA', '#FCE7F3']}
          style={styles.ctaSection}
        >
          <Text style={[styles.ctaTitle, { color: colors.isDark ? '#F9FAFB' : '#1F2937' }]}>
            Ready to Start Your Journey?
          </Text>
          <Text style={[styles.ctaSubtitle, { color: colors.isDark ? '#D1D5DB' : '#4B5563' }]}>
            Join thousands of learners who have already upgraded their experience
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.isDark ? '#F59E0B' : '#F59E0B' }]}
            onPress={() => {
              // Scroll to plans section
            }}
          >
            <Icon name="emoji-events" size={16} color="white" />
            <Text style={styles.ctaButtonText}>Choose Your Plan Now</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  
  // Hero Section
  heroSection: {
    padding: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Subscription Status
  subscriptionStatusCard: {
    margin: 16,
    padding: 20,
    backgroundColor: 'transparent', // Will be set dynamically
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    backgroundColor: 'transparent', // Will be set dynamically
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statusItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusItemLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusItemSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  expiredNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Will be set dynamically
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  expiredNoticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expiredNoticeContent: {
    flex: 1,
  },
  expiredNoticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expiredNoticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  reactivateButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reactivateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Plans Section
  plansSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    padding: 20,
    borderRadius: 16,
    position: 'relative',
    marginBottom: 16,
    backgroundColor: 'transparent', // Will be set dynamically
  },
  currentPlanCard: {
    backgroundColor: 'transparent', // Will be set dynamically
    borderWidth: 2,
    borderColor: '#10B981',
  },
  expiredPlanCard: {
    backgroundColor: 'transparent', // Will be set dynamically
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  
  // Badges
  currentPlanBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredPlanBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // Plan Content
  planIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  crownEmoji: {
    fontSize: 16,
  },
  warningEmoji: {
    fontSize: 16,
  },
  levelAccess: {
    fontSize: 14,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  planDuration: {
    fontSize: 16,
    marginLeft: 4,
  },
  durationText: {
    fontSize: 14,
  },

  // Features
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },

  // Buttons
  buttonContainer: {
    marginTop: 'auto',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  currentButton: {
    backgroundColor: '#10B981',
  },
  reactivateButton: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paymentContainer: {
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 14,
  },

  // Benefits
  benefitsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: 'transparent', // Will be set dynamically
  },
  benefitsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  benefitsSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Call to Action
  ctaSection: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SubscriptionScreen;