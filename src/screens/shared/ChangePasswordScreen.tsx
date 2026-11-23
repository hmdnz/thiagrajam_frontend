import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorBanner } from '../../components/ErrorBanner';
import { useChangePassword } from '../../hooks/useAuth';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { getErrorMessage } from '../../api/client';

interface Props {
  navigation: any;
}

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const changeMutation = useChangePassword();

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await changeMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccessMessage(res.message || 'Password changed successfully!');
      setTimeout(() => navigation.goBack(), 1200);
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Change Password" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          <Input
            label="Current Password"
            placeholder="Enter existing password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            isPassword
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
            title="Update Password"
            onPress={handleChangePassword}
            loading={changeMutation.isPending}
            size="lg"
            style={styles.btn}
          />
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
  container: {
    padding: spacing.md,
  },
  btn: {
    marginTop: spacing.lg,
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
});
