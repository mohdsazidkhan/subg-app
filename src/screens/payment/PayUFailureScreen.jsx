import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';

const PayUFailureScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { colors } = useTheme();

  const { orderDetails, errorMessage } = route.params || {};

  const [orderId, setOrderId] = useState(orderDetails?.orderId || '');
  const [amount, setAmount] = useState(orderDetails?.amount || 0);
  const [planName, setPlanName] = useState(orderDetails?.planName || 'Unknown Plan');

  useEffect(() => {
    if (!orderDetails) {
      Alert.alert(
        'Payment Failed',
        'Unable to process payment. Please try again.',
        [{ text: 'OK', onPress: () => navigation.navigate('Subscription') }]
      );
      return;
    }
  }, []);

  const handleRetryPayment = () => {
    navigation.navigate('Subscription');
  };

  const handleContactSupport = () => {
    navigation.navigate('ContactUs');
  };

  const handleGoHome = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Payment Failed"
        showBackButton={false}
      />

      <View style={styles.content}>
        {/* Failure Icon */}
        <LinearGradient
          colors={[colors.error + '20', colors.error + '10']}
          style={styles.iconContainer}
        >
          <Icon name="error" size={80} color={colors.error} />
        </LinearGradient>

        {/* Failure Message */}
        <Text style={[styles.failureTitle, { color: colors.text }]}>
          Payment Failed
        </Text>
        <Text style={[styles.failureSubtitle, { color: colors.textSecondary }]}>
          We're sorry, your payment could not be processed
        </Text>

        {/* Error Details */}
        {errorMessage && (
          <View style={[styles.errorCard, { backgroundColor: colors.surface }]}>
            <Icon name="info" size={20} color={colors.warning} />
            <Text style={[styles.errorText, { color: colors.text }]}>
              {errorMessage}
            </Text>
          </View>
        )}

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
            <Text style={[styles.detailValue, styles.amountText, { color: colors.textSecondary }]}>
              ₹{amount}
            </Text>
          </View>
        </View>

        {/* Help Text */}
        <View style={[styles.helpCard, { backgroundColor: colors.info + '10' }]}>
          <Icon name="help" size={24} color={colors.info} />
          <Text style={[styles.helpTitle, { color: colors.text }]}>
            Need Help?
          </Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            Payment failures can happen due to various reasons like insufficient funds, 
            network issues, or bank declines. Please check with your bank or try again.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            title="Try Payment Again"
            onPress={handleRetryPayment}
            variant="primary"
            icon={<Icon name="refresh" size={20} color="white" />}
            style={styles.primaryButton}
          />
          
          <Button
            title="Contact Support"
            onPress={handleContactSupport}
            variant="outline"
            icon={<Icon name="support" size={20} color={colors.primary} />}
            style={styles.secondaryButton}
            textStyle={{ color: colors.primary }}
          />
          
          <Button
            title="Go Home"
            onPress={handleGoHome}
            variant="secondary"
            icon={<Icon name="home" size={20} color={colors.text} />}
            style={styles.tertiaryButton}
          />
        </View>

        {/* Additional Help */}
        <View style={styles.additionalHelp}>
          <Text style={[styles.helpLinkText, { color: colors.textSecondary }]}>
            Having trouble? Check our{' '}
          </Text>
          <TouchableOpacity>
            <Text style={[styles.helpLink, { color: colors.primary }]}>
              Payment FAQ
            </Text>
          </TouchableOpacity>
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
  failureTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  failureSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 30,
  },
  errorCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
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
  helpCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    marginBottom: 8,
    flex: 1,
  },
  helpText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
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
  tertiaryButton: {
    opacity: 0.7,
  },
  additionalHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  helpLinkText: {
    fontSize: 14,
  },
  helpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PayUFailureScreen;