import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useMyWallet,
  useMyPayouts,
  useRequestPayout,
  useGenerateStatement,
  useMyStatements,
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

export const DriverWalletScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'payouts' | 'statements'>('payouts');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);

  // Payout Form
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankCode, setBankCode] = useState('058'); // GTBank default
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Statement Form
  const [periodStart, setPeriodStart] = useState('2026-01-01');
  const [periodEnd, setPeriodEnd] = useState('2026-12-31');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: wallet, isLoading: loadingWallet, refetch: refetchWallet } = useMyWallet();
  const { data: payouts = [], isLoading: loadingPayouts, refetch: refetchPayouts } = useMyPayouts();
  const { data: statements = [], isLoading: loadingStatements, refetch: refetchStatements } =
    useMyStatements();

  const payoutMutation = useRequestPayout();
  const statementMutation = useGenerateStatement();

  const handleRefresh = () => {
    refetchWallet();
    refetchPayouts();
    refetchStatements();
  };

  const handleRequestPayout = async () => {
    const amountNum = parseFloat(payoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage('Please enter a valid payout amount.');
      return;
    }
    if (!accountNumber.trim() || !accountName.trim()) {
      setErrorMessage('Please fill in bank account details.');
      return;
    }

    setErrorMessage(null);
    try {
      await payoutMutation.mutateAsync({
        amount_kobo: Math.round(amountNum * 100),
        bank_code: bankCode.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
      });

      setSuccessMessage('Payout request submitted successfully!');
      setShowPayoutModal(false);
      setPayoutAmount('');
      handleRefresh();
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleGenerateStatement = async () => {
    if (!periodStart.trim() || !periodEnd.trim()) {
      setErrorMessage('Please provide both start and end dates.');
      return;
    }

    setErrorMessage(null);
    try {
      await statementMutation.mutateAsync({
        period_start: periodStart.trim(),
        period_end: periodEnd.trim(),
      });

      setSuccessMessage('Account statement generated!');
      setShowStatementModal(false);
      handleRefresh();
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const isLoading = loadingWallet || (activeTab === 'payouts' ? loadingPayouts : loadingStatements);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Driver Earnings & Wallet"
        onBack={() => navigation.goBack()}
        rightActionTitle="Request Payout"
        onRightAction={() => {
          setErrorMessage(null);
          setSuccessMessage(null);
          setShowPayoutModal(true);
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

        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ₦{Number(wallet?.available_balance_naira || 0).toLocaleString()}
          </Text>

          <View style={styles.balanceSubRow}>
            <Text style={styles.pendingText}>
              Pending (in-flight trips): ₦{Number(wallet?.pending_balance_naira || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.lifetimeRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Lifetime Credits</Text>
              <Text style={styles.statValue}>
                ₦{Number(wallet?.lifetime_credits_naira || 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Platform Commission</Text>
              <Text style={styles.statValue}>
                ₦{Number(wallet?.lifetime_commission_naira || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Action Buttons */}
        <View style={styles.btnRow}>
          <Button
            title="Request Payout"
            size="md"
            onPress={() => setShowPayoutModal(true)}
            style={{ flex: 1, marginRight: spacing.xs }}
          />
          <Button
            title="Generate Statement"
            variant="outline"
            size="md"
            onPress={() => setShowStatementModal(true)}
            style={{ flex: 1 }}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'payouts' && styles.tabActive]}
            onPress={() => setActiveTab('payouts')}
          >
            <Text style={[styles.tabText, activeTab === 'payouts' && styles.tabTextActive]}>
              Payouts ({payouts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'statements' && styles.tabActive]}
            onPress={() => setActiveTab('statements')}
          >
            <Text style={[styles.tabText, activeTab === 'statements' && styles.tabTextActive]}>
              Statements ({statements.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* List Content */}
        {activeTab === 'payouts' ? (
          payouts.length === 0 ? (
            <EmptyState
              title="No Payouts Yet"
              description="Request payouts to transfer completed trip earnings to your bank account."
              actionTitle="Request Payout"
              onAction={() => setShowPayoutModal(true)}
            />
          ) : (
            payouts.map((po) => (
              <Card key={po.id} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <View>
                    <Text style={styles.itemTitle}>Payout #{po.payout_ref}</Text>
                    <Text style={styles.itemDate}>
                      Bank: {po.bank_name || po.bank_code} • {po.account_number}
                    </Text>
                  </View>
                  <Badge
                    label={po.status}
                    variant={
                      po.status === 'processed' || po.status === 'success'
                        ? 'success'
                        : po.status === 'failed' || po.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  />
                </View>

                <View style={styles.itemBottom}>
                  <Text style={styles.itemAmount}>
                    Net: ₦{(po.net_amount_kobo / 100).toLocaleString()}
                  </Text>
                  <Text style={styles.itemGross}>
                    Gross: ₦{(po.gross_amount_kobo / 100).toLocaleString()}
                  </Text>
                </View>
              </Card>
            ))
          )
        ) : statements.length === 0 ? (
          <EmptyState
            title="No Statements Generated"
            description="Generate a PDF/JSON statement for tax, records, or bookkeeping."
            actionTitle="Generate Statement"
            onAction={() => setShowStatementModal(true)}
          />
        ) : (
          statements.map((st) => (
            <Card key={st.id} style={styles.itemCard}>
              <View style={styles.itemTop}>
                <View>
                  <Text style={styles.itemTitle}>
                    Statement: {st.period_start} to {st.period_end}
                  </Text>
                  <Text style={styles.itemDate}>
                    Generated on: {new Date(st.generated_at).toLocaleDateString()}
                  </Text>
                </View>
                <Badge label={st.status} variant="success" />
              </View>

              <View style={styles.statementStats}>
                <Text style={styles.statLine}>
                  Total Credits: ₦{Number(st.total_credits_naira).toLocaleString()}
                </Text>
                <Text style={styles.statLine}>
                  Closing Balance: ₦{Number(st.closing_balance_naira).toLocaleString()}
                </Text>
                <Text style={styles.statLine}>
                  Included Transactions: {st.transactions ? st.transactions.length : 0}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Payout Modal */}
      <Modal
        visible={showPayoutModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPayoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Bank Payout</Text>
            <Text style={styles.modalDesc}>
              Earnings will be disbursed directly to your Nigerian bank account.
            </Text>

            <Input
              label="Amount in Naira (₦)"
              placeholder="e.g. 25000"
              value={payoutAmount}
              onChangeText={setPayoutAmount}
              keyboardType="numeric"
            />

            <Input
              label="Bank Code / Name"
              placeholder="e.g. 058 (GTBank)"
              value={bankCode}
              onChangeText={setBankCode}
            />

            <Input
              label="Account Number (10 digits)"
              placeholder="e.g. 0123456789"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Input
              label="Account Holder Name"
              placeholder="e.g. John Doe"
              value={accountName}
              onChangeText={setAccountName}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setShowPayoutModal(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Submit Payout"
                size="md"
                onPress={handleRequestPayout}
                loading={payoutMutation.isPending}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Statement Modal */}
      <Modal
        visible={showStatementModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStatementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Generate Account Statement</Text>
            <Text style={styles.modalDesc}>
              Select the reporting period for your transaction breakdown.
            </Text>

            <Input
              label="Period Start Date"
              placeholder="YYYY-MM-DD"
              value={periodStart}
              onChangeText={setPeriodStart}
            />

            <Input
              label="Period End Date"
              placeholder="YYYY-MM-DD"
              value={periodEnd}
              onChangeText={setPeriodEnd}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setShowStatementModal(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Generate"
                size="md"
                onPress={handleGenerateStatement}
                loading={statementMutation.isPending}
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
    backgroundColor: '#0F172A',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  balanceLabel: {
    ...typography.caption,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  balanceAmount: {
    ...typography.h1,
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '800',
    marginVertical: spacing.xs,
  },
  balanceSubRow: {
    marginTop: spacing.xs,
  },
  pendingText: {
    ...typography.caption,
    color: '#CBD5E1',
  },
  lifetimeRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    ...typography.caption,
    color: '#94A3B8',
  },
  statValue: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
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
    fontWeight: '700',
    color: colors.text,
  },
  itemDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  itemAmount: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primary,
  },
  itemGross: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statementStats: {
    marginTop: spacing.xs,
  },
  statLine: {
    ...typography.caption,
    color: colors.textSecondary,
    marginVertical: 1,
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
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
