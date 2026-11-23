import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PassengerStackParamList } from '../../navigation/types';
import { useInitializePayment, useVerifyPayment } from '../../hooks/usePayments';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Loader } from '../../components/Loader';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';
import { PaymentProvider } from '../../types/payments';

type Props = NativeStackScreenProps<PassengerStackParamList, 'Payment'>;

export const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookingId, amountNaira, email } = route.params;

  const [provider, setProvider] = useState<PaymentProvider>('squad');
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initMutation = useInitializePayment();
  const verifyMutation = useVerifyPayment();

  const handleStartPayment = async () => {
    setErrorMessage(null);
    try {
      const res = await initMutation.mutateAsync({
        booking_id: bookingId,
        provider,
        email,
      });

      setTransactionRef(res.transaction_ref);

      if (res.auth_url) {
        setAuthUrl(res.auth_url);
        setShowWebView(true);
      } else {
        // Direct mock / sandbox verification
        await handleVerify(res.transaction_ref);
      }
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleVerify = async (refToVerify?: string) => {
    const ref = refToVerify || transactionRef;
    if (!ref) {
      setErrorMessage('No transaction reference found to verify.');
      return;
    }

    try {
      const payment = await verifyMutation.mutateAsync({ transaction_ref: ref });
      setShowWebView(false);

      if (payment.status === 'success') {
        navigation.navigate('PaymentResult', {
          success: true,
          message: 'Payment completed successfully! Your booking is confirmed.',
          bookingId,
        });
      } else {
        navigation.navigate('PaymentResult', {
          success: false,
          message: payment.failure_reason || 'Payment verification failed or is still pending.',
          bookingId,
        });
      }
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    const url = navState.url || '';
    // Check if redirect contains success indicators or callback
    if (url.includes('/callback') || url.includes('success=true') || url.includes('/verify')) {
      setShowWebView(false);
      if (transactionRef) {
        handleVerify(transactionRef);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Payment Checkout" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        <Card>
          <Text style={styles.cardTitle}>Payment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking Reference:</Text>
            <Text style={styles.detailValue}>#{bookingId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Payable:</Text>
            <Text style={styles.amountText}>₦{Number(amountNaira).toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payer Email:</Text>
            <Text style={styles.detailValue}>{email}</Text>
          </View>
        </Card>

        {/* Gateway Provider Selection */}
        <Card>
          <Text style={styles.cardTitle}>Select Payment Gateway</Text>
          <View style={styles.providerRow}>
            <TouchableOpacity
              style={[styles.providerTab, provider === 'squad' && styles.providerTabActive]}
              onPress={() => setProvider('squad')}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.providerText,
                  provider === 'squad' && styles.providerTextActive,
                ]}
              >
                Squad by GTCO
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.providerTab, provider === 'paystack' && styles.providerTabActive]}
              onPress={() => setProvider('paystack')}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.providerText,
                  provider === 'paystack' && styles.providerTextActive,
                ]}
              >
                Paystack
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {transactionRef && (
          <Card style={styles.refCard}>
            <Text style={styles.refLabel}>Active Transaction Reference:</Text>
            <Text style={styles.refCode}>{transactionRef}</Text>
            <Button
              title="Verify Payment Status"
              variant="outline"
              size="sm"
              onPress={() => handleVerify()}
              loading={verifyMutation.isPending}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        )}

        <Button
          title={transactionRef ? 'Re-open Payment Gateway' : `Pay ₦${Number(amountNaira).toLocaleString()}`}
          size="lg"
          onPress={handleStartPayment}
          loading={initMutation.isPending || verifyMutation.isPending}
          style={styles.payBtn}
        />
      </ScrollView>

      {/* WebView Gateway Modal */}
      <Modal visible={showWebView} animationType="slide" onRequestClose={() => setShowWebView(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Secure Checkout ({provider.toUpperCase()})</Text>
            <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Done / Close</Text>
            </TouchableOpacity>
          </View>
          {authUrl ? (
            <WebView
              source={{ uri: authUrl }}
              onNavigationStateChange={handleNavigationStateChange}
              startInLoadingState
              renderLoading={() => <Loader fullScreen message="Loading payment portal..." />}
            />
          ) : (
            <Loader fullScreen message="Preparing secure checkout..." />
          )}
        </SafeAreaView>
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
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  amountText: {
    ...typography.h2,
    color: colors.primary,
  },
  providerRow: {
    flexDirection: 'row',
  },
  providerTab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  providerTabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  providerText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  providerTextActive: {
    color: colors.primaryDark,
  },
  refCard: {
    backgroundColor: colors.surface,
  },
  refLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  refCode: {
    ...typography.bodySmall,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.text,
    fontWeight: '700',
    marginTop: 2,
  },
  payBtn: {
    marginVertical: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
