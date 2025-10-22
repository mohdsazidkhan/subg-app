import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';

const PayUSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, updateUser } = useAuth();
  const { colors } = useTheme();

  const { orderDetails, transactionId } = route.params || {};

  const [orderId, setOrderId] = useState(orderDetails?.orderId || '');
  const [paymentId, setPaymentId] = useState(transactionId || '');
  const [amount, setAmount] = useState(orderDetails?.amount || 0);
  const [planName, setPlanName] = useState(orderDetails?.planName || 'Unknown Plan');

  useEffect(() => {
    if (!orderDetails) {
      Alert.alert(
        'Invalid Payment',
        'Unable to process payment details.',
        [{ text: 'OK', onPress: () => navigation.navigate('Subscription') }]
      );
      return;
    }
  }, []);

  const handleContinue = () => {
    navigation.navigate('MainTabs');
  };

  const handleViewSubscription = () => {
    navigation.navigate('Subscription');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Payment Successful"
        showBackButton={false}
      />

      <View style={styles.content}>
        {/* Success Icon */}
        <LinearGradient
          colors={[colors.success + '20', colors.success + '10']}
          style={styles.iconContainer}
        >
          <Icon name="check-circle" size={80} color={colors.success} />
        </LinearGradient>

        {/* Success Message */}
        <Text style={[styles.successTitle, { color: colors.text }]}>
          Payment Successful!
        </Text>
        <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
          Your subscription has been activated successfully
        </Text>

        {/* Payment Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>
            Payment Details
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Order ID:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {orderId}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Payment ID:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {paymentId}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Plan:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {planName}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Amount:
            </Text>
            <Text style={[styles.detailValue, styles.amountText, { color: colors.success }]}>
              ₹{amount}
            </Text>
          </View>
        </View>

        {/* Subscription Info */}
        <View style={[styles.subscriptionCard, { backgroundColor: colors.primary + '10' }]}>
          <Icon name="card-membership" size={24} color={colors.primary} />
          <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
            Subscription Activated
          </Text>
          <Text style={[styles.subscriptionText, { color: colors.textSecondary }]}>
            You now have access to all premium features!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            title="Continue to App"
            onPress={handleContinue}
            variant="primary"
            icon={<Icon name="home" size={20} color="white" />}
            style={styles.primaryButton}
          />
          
          <Button
            title="View Subscription"
            onPress={handleViewSubscription}
            variant="outline"
            icon={<Icon name="settings" size={20} color={colors.primary} />}
            style={styles.secondaryButton}
            textStyle={{ color: colors.primary }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 40,
  },
  detailsCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 16,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subscriptionCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  subscriptionText: {
    fontSize: 14,
    marginLeft: 12,
  },
  actionContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    borderColor: '#6B7280',
  },
});

export default PayUSuccessScreen;