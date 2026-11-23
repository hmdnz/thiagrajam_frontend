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
import { useForgotPassword } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const forgotMutation = useForgotPassword();

  const handleSendReset = async () => {
    if (!identifier.trim()) {
      setErrorMessage('Please enter your email address or phone number.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const isEmail = identifier.includes('@');
      const res = await forgotMutation.mutateAsync({
        email: isEmail ? identifier.trim() : undefined,
        phone_number: !isEmail ? identifier.trim() : undefined,
      });

      setSuccessMessage(res.message);
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your registered email or phone to receive password reset instructions.
            </Text>
          </View>

          <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
              <Button
                title="Proceed to Reset Screen"
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate('ResetPassword')}
                style={{ marginTop: spacing.md }}
              />
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Email or Phone Number"
              placeholder="e.g. name@example.com or 08012345678"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />

            <Button
              title="Send Reset Instructions"
              onPress={handleSendReset}
              loading={forgotMutation.isPending}
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
              <Text style={styles.backLink}>← Back to Sign In</Text>
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
    alignItems: 'center',
  },
  backLink: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
