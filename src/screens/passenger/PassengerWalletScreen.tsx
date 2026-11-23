import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useMyWallet,
  useMyTransactions,
  useMyRefunds,
  useRequestRefund,
} from '../../hooks/usePayments';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

interface Props {
  navigation: any;
}

export const PassengerWalletScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'refunds'>('transactions');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: wallet, isLoading: loadingWallet, refetch: refetchWallet } = useMyWallet();
  const { data: transactions = [], isLoading: loadingTx, refetch: refetchTx } = useMyTransactions();
  const { data: refunds = [], isLoading: loadingRefunds, refetch: refetchRefunds } = useMyRefunds();

  const refundMutation = useRequestRefund();

  const handleRefresh = () => {
    refetchWallet();
    refetchTx();
    refetchRefunds();
  };

  const handleCreateRefund = async () => {
    if (!paymentId.trim()) {
      setErrorMessage('Please enter the Payment ID.');
      return;
    }
    if (!refundReason.trim()) {
      setErrorMessage('Please provide a reason for the refund request.');
      return;
    }

    setErrorMessage(null);
    try {
      await refundMutation.mutateAsync({
        payment_id: parseInt(paymentId, 10),
        reason: refundReason.trim(),
      });

      setSuccessMessage('Refund request submitted for review!');
      setShowRefundModal(false);
      setPaymentId('');
      setRefundReason('');
      refetchRefunds();
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const isLoading = loadingWallet || (activeTab === 'transactions' ? loadingTx : loadingRefunds);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Wallet & Payments"
        onBack={() => navigation.goBack()}
        rightActionTitle="Request Refund"
        onRightAction={() => {
          setErrorMessage(null);
          setSuccessMessage(null);
          setShowRefundModal(true);
        }}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
      >
        <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        {successMessage && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {/* Wallet Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ₦{Number(wallet?.available_balance_naira || 0).toLocaleString()}
          </Text>
          <View style={styles.balanceSubRow}>
            <Text style={styles.pendingText}>
              Pending: ₦{Number(wallet?.pending_balance_naira || 0).toLocaleString()}
            </Text>
            <Text style={styles.currencyBadge}>{wallet?.currency || 'NGN'}</Text>
          </View>
        </Card>

        {/* Sub Navigation */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActive]}>
              Transactions ({transactions.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'refunds' && styles.tabActive]}
            onPress={() => setActiveTab('refunds')}
          >
            <Text style={[styles.tabText, activeTab === 'refunds' && styles.tabTextActive]}>
              Refund Requests ({refunds.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content List */}
        {activeTab === 'transactions' ? (
          transactions.length === 0 ? (
            <EmptyState
              title="No Transactions"
              description="Your payment charges and refunds will show up here."
            />
          ) : (
            transactions.map((tx) => (
              <Card key={tx.id} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <View>
                    <Text style={styles.itemTitle}>
                      {tx.description || (tx.direction === 'inflow' ? 'Credit' : 'Debit')}
                    </Text>
                    <Text style={styles.itemDate}>{tx.transaction_date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.itemAmount,
                      { color: tx.direction === 'inflow' ? colors.success : colors.danger },
                    ]}
                  >
                    {tx.direction === 'inflow' ? '+' : '-'}₦
                    {Number(tx.amount_naira).toLocaleString()}
                  </Text>
                </View>
                {tx.provider_ref && (
                  <Text style={styles.itemRef}>Ref: {tx.provider_ref}</Text>
                )}
              </Card>
            ))
          )
        ) : refunds.length === 0 ? (
          <EmptyState
            title="No Refund Requests"
            description="If you have an issue with a completed charge, you can request a refund."
            actionTitle="Request Refund"
            onAction={() => setShowRefundModal(true)}
          />
        ) : (
          refunds.map((ref) => (
            <Card key={ref.id} style={styles.itemCard}>
              <View style={styles.itemTop}>
                <View>
                  <Text style={styles.itemTitle}>Refund #{ref.refund_ref}</Text>
                  <Text style={styles.itemDate}>Reason: {ref.reason}</Text>
                </View>
                <Badge
                  label={ref.status}
                  variant={
                    ref.status === 'processed' || ref.status === 'approved'
                      ? 'success'
                      : ref.status === 'rejected'
                      ? 'danger'
                      : 'warning'
                  }
                />
              </View>
              <View style={styles.refundRow}>
                <Text style={styles.refundAmount}>₦{Number(ref.amount_naira).toLocaleString()}</Text>
                {ref.admin_note && <Text style={styles.adminNote}>Note: {ref.admin_note}</Text>}
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Request Refund Modal */}
      <Modal
        visible={showRefundModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRefundModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request a Refund</Text>
            <Text style={styles.modalDesc}>
              Submit a formal refund request to administrative review for a specific payment.
            </Text>

            <Input
              label="Payment ID"
              placeholder="e.g. 104"
              value={paymentId}
              onChangeText={setPaymentId}
              keyboardType="number-pad"
            />

            <Input
              label="Reason for Refund"
              placeholder="Describe the issue with the trip or payment"
              value={refundReason}
              onChangeText={setRefundReason}
              multiline
              numberOfLines={3}
              style={{ minHeight: 70, textAlignVertical: 'top' }}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setShowRefundModal(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Submit Request"
                size="md"
                onPress={handleCreateRefund}
                loading={refundMutation.isPending}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
  },
  balanceCard: {
    backgroundColor: '#1E293B',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  balanceLabel: {
    ...typography.caption,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    ...typography.h1,
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '800',
    marginVertical: spacing.xs,
  },
  balanceSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  pendingText: {
    ...typography.caption,
    color: '#CBD5E1',
  },
  currencyBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    backgroundColor: '#334155',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  itemCard: {
    marginBottom: spacing.sm,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  itemDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemAmount: {
    ...typography.bodyLarge,
    fontWeight: '700',
  },
  itemRef: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  refundRow: {
    marginTop: spacing.xs,
  },
  refundAmount: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
  },
  adminNote: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  successBanner: {
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  successText: {
    ...typography.bodyMedium,
    color: colors.success,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalDesc: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
