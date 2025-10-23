import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import TopBar from '../../components/TopBar';

const RefundScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Refund Policy"
        showMenuButton={false}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.contentContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Refund & Subscription Policy
          </Text>

          <Text style={[styles.section, { color: colors.text }]}>
            Thank you for using SUBG QUIZ. Please read this Refund & Subscription Policy carefully. By subscribing or purchasing any plan, you agree to the terms below.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            1) General Policy
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            • All subscription purchases are final and non‑refundable.{'\n\n'}
            • Subscriptions provide access to content and features for a fixed duration. Access is not contingent on performance, leaderboard position, or rewards outcomes.{'\n\n'}
            • SUBG QUIZ is a skill‑based platform. Fees are charged for access to premium content/features, not for winning rewards.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            2) Subscriptions
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            • Plan Access: Plans grant access to specific levels/features as shown on the subscription page.{'\n\n'}
            • Validity: Subscriptions are prepaid and remain active until their stated expiry date.{'\n\n'}
            • Renewals: If auto‑renewal is enabled on your account or payment method, the plan may renew automatically at the then‑current price. You can disable renewal any time before the next billing date from your account or payment provider.{'\n\n'}
            • Upgrades: Upgrades are supported and may take effect immediately; the new plan price applies. No pro‑rated refunds for the remaining period of the previous plan.{'\n\n'}
            • Downgrades/Cancellations: Downgrades or cancellations apply from the next cycle. We do not provide partial/remaining‑period refunds.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            3) Payments & Invoicing
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            • Payment processing fees are non‑refundable.{'\n\n'}
            • We will provide automated invoices/order receipts upon successful payment via email.{'\n\n'}
            • After payment, we will process the order and send a receipt to your registered email.{'\n\n'}
            • Receipts may take time to generate; delays of up to 15 minutes are not considered errors.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            4) Cancellation of Orders
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            • Orders cannot be cancelled after automatic processing begins (within minutes of payment completion).{'\n\n'}
            • Contact us immediately if you wish to cancel an order before processing, but cancellation is not guaranteed.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            5) How to Upgrade/Downgrade/Cancel
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            • Manage your renewal through your payment provider (Google Pay/Play Store or Razorpay/PayU), as applicable, up to 24 hours before the next billing date.{'\n\n'}
            • Alternatively, contact us with your order ID.{'\n\n'}
            • Downgrades/cancellations only take effect for future billing cycles. No partial refunds are issued for cancellation period.
          </Text>

          <Text style={[styles.subheading, { color: colors.text }]}>
            6) Contact Us
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            If you have questions regarding orders, payments, plan validities, or billing discrepancies, contact us at:
          </Text>
          
          <Text style={[styles.section, { color: colors.text }]}>
            Email: support@mohdsazidkhan.com
          </Text>

          <Text style={[styles.footer, { color: colors.textSecondary }]}>
            Last Updated 2025
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#3B82F6',
  },
  section: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  footer: {
    fontSize: 14,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default RefundScreen;