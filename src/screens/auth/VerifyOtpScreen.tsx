import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useVerifyOtp, useResendOtp } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOtp'>;

export const VerifyOtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  const handleVerify = async () => {
    if (!otp.trim()) {
      setErrorMessage('Please enter the verification code.');
      return;
    }
    setErrorMessage(null);
    try {
      await verifyOtpMutation.mutateAsync({
        phone_number: phoneNumber,
        otp: otp.trim(),
      });
      // useVerifyOtp sets auth state automatically, triggering navigation
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleResend = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await resendOtpMutation.mutateAsync({ phone_number: phoneNumber });
      setSuccessMessage(res.message || 'Verification code resent.');
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Verify Phone</Text>
            <Text style={styles.subtitle}>
              We sent a verification code via SMS to{' '}
              <Text style={styles.phoneHighlight}>{phoneNumber}</Text>
            </Text>
          </View>

          <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Verification Code (OTP)"
              placeholder="e.g. 123456"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Button
              title="Verify Code"
              onPress={handleVerify}
              loading={verifyOtpMutation.isPending}
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn't receive the code? </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendOtpMutation.isPending}
              accessibilityRole="button"
            >
              <Text style={styles.resendLink}>
                {resendOtpMutation.isPending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  phoneHighlight: {
    color: colors.text,
    fontWeight: '700',
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  successBanner: {
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
  },
  successText: {
    ...typography.bodySmall,
    color: colors.success,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  resendLink: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
  },
});
