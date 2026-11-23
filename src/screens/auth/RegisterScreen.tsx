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
import { useRegister } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation, route }) => {
  const [role, setRole] = useState<'passenger' | 'driver'>(route.params?.role || 'passenger');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registerMutation = useRegister();

  const handleRegister = async () => {
    if (!email.trim() && !phoneNumber.trim()) {
      setErrorMessage('Please provide an email or phone number.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage(null);
    try {
      await registerMutation.mutateAsync({
        email: email.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        password,
        role,
      });

      if (phoneNumber.trim()) {
        navigation.navigate('VerifyOtp', { phoneNumber: phoneNumber.trim() });
      } else {
        navigation.navigate('Login');
      }
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Winnie4 to ride or drive</Text>
          </View>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleTab, role === 'passenger' && styles.roleTabActive]}
              onPress={() => setRole('passenger')}
              accessibilityRole="button"
            >
              <Text style={[styles.roleText, role === 'passenger' && styles.roleTextActive]}>
                Passenger
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleTab, role === 'driver' && styles.roleTabActive]}
              onPress={() => setRole('driver')}
              accessibilityRole="button"
            >
              <Text style={[styles.roleText, role === 'driver' && styles.roleTextActive]}>
                Driver
              </Text>
            </TouchableOpacity>
          </View>

          <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="e.g. name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Phone Number"
              placeholder="e.g. 08012345678"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            <Input
              label="Password"
              placeholder="Min. 6 characters"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
            />

            <Button
              title={role === 'driver' ? 'Register as Driver' : 'Register as Passenger'}
              onPress={handleRegister}
              loading={registerMutation.isPending}
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} accessibilityRole="button">
              <Text style={styles.loginLink}>Sign In</Text>
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
    marginBottom: spacing.lg,
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
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  roleTab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  roleTabActive: {
    backgroundColor: colors.surface,
  },
  roleText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleTextActive: {
    color: colors.primary,
  },
  form: {
    marginBottom: spacing.lg,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  footerText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
  },
});
