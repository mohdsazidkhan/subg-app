import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
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


const WalletScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await API.getUserWallet(user?._id || '');

      if (response.success) {
        setWalletData(response.data);
      } else {
        // Mock data for demo
        setWalletData({
          balance: 1250.50,
          totalEarnings: 2500.00,
          pendingAmount: 150.00,
          transactions: [
            {
              _id: '1',
              amount: 50.00,
              type: 'credit',
              description: 'Quiz completion reward',
              date: new Date().toISOString(),
              status: 'completed',
            },
            {
              _id: '2',
              amount: 100.00,
              type: 'credit',
              description: 'Referral bonus',
              date: new Date(Date.now() - 86400000).toISOString(),
              status: 'completed',
            },
            {
              _id: '3',
              amount: 200.00,
              type: 'debit',
              description: 'Withdrawal to bank account',
              date: new Date(Date.now() - 172800000).toISOString(),
              status: 'pending',
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      showMessage({
        message: 'Failed to load wallet data',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const handleWithdraw = () => {
    if (!walletData || walletData.balance < 1000) {
      Alert.alert(
        'Insufficient Balance',
        'Minimum withdrawal amount is ₹1000. Please earn more to withdraw.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    setShowWithdrawForm(v => !v);
  };

  const submitWithdraw = async () => {
    const amountNum = Number(withdrawAmount);

    if (!amountNum || amountNum < 1000) {
      showMessage({
        message: 'Enter at least ₹1000',
        type: 'warning',
      });
      return;
    }

    if (walletData && amountNum > walletData.balance) {
      showMessage({
        message: 'Amount exceeds available balance',
        type: 'warning',
      });
      return;
    }

    if &&drawUpi) {
      showMessage({
        message: 'Enter UPI ID or bank details',
        type: 'warning',
      });
      return;
    }

    try {
      setWithdrawing(true);
      const res = await API.createWithdrawRequest({
        amount: amountNum,
        upi: withdrawUpi,
      });

      if (res?.success) {
        showMessage({
          message: 'Withdrawal request submitted',
          type: 'success',
        });
        setWithdrawAmount('');
        setWithdrawUpi('');
        setShowWithdrawForm(false);
        fetchWalletData();
      } else {
        showMessage({
          message: res.message || 'Failed to submit request',
          type: 'danger',
        });
      }
    } catch (e) {
          showMessage({
        message: e.response?.data?.message || e?.message || 'Failed to submit request',
        type: 'danger',
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const formatAmount = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? 'trending-up' : 'trending-down';
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? colors.success : colors.error;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderTransactionItem = (transaction) => (
    <Card key={transaction._id} style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Icon
            name={getTransactionIcon(transaction.type)}
            size={24}
            color={getTransactionColor(transaction.type)}
          />
          <View style={styles.transactionDetails}>
            <Text style={[styles.transactionDescription, { color: colors.text }]}>
              {transaction.description}
            </Text>
            <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
              {formatDate(transaction.date)}
            </Text>
          </View>
        </View>

        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amountText,
              { color: getTransactionColor(transaction.type) },
            ]}
          >
            {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(transaction.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(transaction.status) },
              ]}
            >
              {transaction.status}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar title="My Wallet" showBackButton={true} onBackPress={() => navigation.goBack()} />
        <Icon name="account-balance-wallet" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  if (!walletData) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar title="My Wallet" showBackButton={true} onBackPress={() => navigation.goBack()} />
        <Icon name="error" size={60} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>Failed to load wallet data</Text>
        <Button title="Retry" onPress={fetchWalletData} style={styles.retryButton} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="My Wallet" showBackButton={true} onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Header */}
        <LinearGradient
          colors={colors.backgroundGradient || [colors.primary, colors.secondary]}
          style={styles.balanceHeader}
        >
          <View style={styles.balanceContent}>
            <Icon name="account-balance-wallet" size={40} color={colors.text} />
            <Text style={[styles.balanceLabel, { color: colors.text }]}>Available Balance</Text>
            <Text style={[styles.balanceAmount, { color: colors.text }]}>
              {formatAmount(walletData.balance)}
            </Text>
            <Text style={[styles.balanceSubtext, { color: colors.textSecondary }]}>
              Ready to withdraw
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Icon name="trending-up" size={24} color={colors.success} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {formatAmount(walletData.totalEarnings)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Earnings</Text>
          </Card>

          <Card style={styles.statCard}>
            <Icon name="schedule" size={24} color={colors.warning}] />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {formatAmount(walletData.pendingAmount)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          </Card>
        </View>

        {/* Withdraw Form */}
        {showWithdrawForm && (
          <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }, { color: colors.text }]}>
              Request Withdrawal
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 8 }, { color: colors.textSecondary }]}>
              Amount (min ₹1000)
            </Text>
            <TextInput
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="Enter amount"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            />
            <Text style={{ fontSize: 16, marginTop: 16, marginBottom: 8 }, { color: colors.textSecondary }]}>
              UPI ID or Bank Details
            </Text>
            <TextInput
              value={withdrawUpi}
              onChangeText={setWithdrawUpi}
              placeholder="username@upi or bank details"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            />
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Button
                  title={withdrawing ? 'Submitting...' : 'Submit'}
                  onPress={submitWithdraw}
                  disabled={withdrawing}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowWithdrawForm(false)}
                />
              </View>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Button
            title="Withdraw Funds"
            onPress={handleWithdraw}
            icon={<Icon name="account-balance" size={20} color="white" />}
            style={styles.actionButton}
          />
          <Button
            title="Bank Details"
            onPress={() => {
              showMessage({
                message: 'Bank details feature coming soon!',
                type: 'info',
              });
            }}
            variant="outline"
            icon={<Icon name="account-balance" size={20} color={colors.primary} />}
            style={styles.actionButton}
          />
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          {walletData.transactions.length > 0 ? (
            <View style={styles.transactionsContainer}>
              {walletData.transactions.map(renderTransactionItem)}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Icon name="receipt" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No transactions yet
              </Text>
            </Card}>
          )}
        </View>

        {/* How to Earn */}
        <Card style={styles.earnCard}>
          <Text style={[styles.earnTitle, { color: colors.text }]}>How to Earn Money?</Text>
          <View style={styles.earnList}>
            <View style={styles.earnItem}>
              <Icon name="quiz" size={20} color={colors.primary} />
              <Text style={[styles.earnText, { color: colors.text }]}>
                Complete quizzes and earn points
              </Text>
            </View>
            <View style={styles.earnItem}>
              <Icon name="people" size={20} color={colors.-primary} />
              <Text style={[styles.earnText, { color: colors.text }]}>
                Refer friends and get bonus
              </Text>
            </View>
            <View style={styles.earnItem}>
              <Icon name="star" size={20} color={colors.primary} />
              <Text style={[styles.earnText, { color: colors.text }]}>
                Achieve high scores for rewards
              </Text>
            </View>
            <View style={styles.earnItem}>
              <Icon name="trending-up" size={20} color={colors.primary} />
              <Text style={[styles.earnText, { color: colors.text }]}>
                Climb leaderboards for prizes
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
  errorText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  balanceHeader: {
    padding: 30,
    alignItems: 'center',
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 8,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  balanceSubtext: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -30,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  transactionsContainer: {
    paddingHorizontal: 16,
  },
  transactionCard: {
    marginBottom: 12,
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyCard: {
    margin: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  earnCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
  },
  earnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  earnList: {
    gap: 12,
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});

export default WalletScreen;