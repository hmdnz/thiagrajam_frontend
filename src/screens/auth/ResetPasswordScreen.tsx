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
import { useResetPassword } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const [token, setToken] = useState(route.params?.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetMutation = useResetPassword();

  const handleReset = async () => {
    if (!token.trim()) {
      setErrorMessage('Please provide your reset token.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await resetMutation.mutateAsync({
        token: token.trim(),
        new_password: newPassword,
      });

      setSuccessMessage(res.message);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter the token you received and choose a new password.</Text>
          </View>

          <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Reset Token"
              placeholder="Paste token here"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
            />

            <Input
              label="New Password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
            />

            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
            />

            <Button
              title="Reset Password"
              onPress={handleReset}
              loading={resetMutation.isPending}
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} accessibilityRole="button">
              <Text style={styles.backLink}>← Return to Sign In</Text>
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
