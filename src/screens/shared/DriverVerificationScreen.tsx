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
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ErrorBanner } from '../../components/ErrorBanner';
import { usersApi } from '../../api/users';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { getErrorMessage } from '../../api/client';

interface Props {
  navigation: any;
}

export const DriverVerificationScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useAuthStore();

  const [nin, setNin] = useState(user?.nin || '');
  const [licenseNumber, setLicenseNumber] = useState(user?.driver_profile?.license_number || '');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState(
    user?.driver_profile?.license_expiry_date || ''
  );
  const [licensePhotoUrl, setLicensePhotoUrl] = useState(
    user?.driver_profile?.license_photo_url || ''
  );

  const [loadingNin, setLoadingNin] = useState(false);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSaveNin = async () => {
    if (!nin.trim() || nin.trim().length !== 11) {
      setErrorMessage('Please provide an 11-digit NIN.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoadingNin(true);
    try {
      const updated = await usersApi.updateMyProfile({ nin: nin.trim() });
      await updateUser(updated);
      setSuccessMessage('NIN submitted for verification!');
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setLoadingNin(false);
    }
  };

  const handleUploadLicense = async () => {
    if (!licenseNumber.trim()) {
      setErrorMessage("Please enter your Driver's License Number.");
      return;
    }
    if (!licenseExpiryDate.trim()) {
      setErrorMessage('Please enter the license expiry date (YYYY-MM-DD).');
      return;
    }
    if (!licensePhotoUrl.trim()) {
      setErrorMessage('Please enter a photo URI or image file path for the license.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setLoadingLicense(true);
    try {
      const updated = await usersApi.uploadDriverLicense(
        licensePhotoUrl.trim(),
        licenseNumber.trim(),
        licenseExpiryDate.trim()
      );
      await updateUser(updated);
      setSuccessMessage("Driver's License submitted for admin review!");
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setLoadingLicense(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Verification & ID" onBack={() => navigation.goBack()} />
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

          {/* NIN Section */}
          <Card>
            <View style={styles.sectionRow}>
              <Text style={styles.cardTitle}>National ID (NIN)</Text>
              <Badge
                label={user?.nin_verified ? 'Verified' : user?.nin_verification_status || 'Unverified'}
                variant={user?.nin_verified ? 'success' : 'warning'}
              />
            </View>
            <Text style={styles.description}>
              NIN verification is required by Nigerian regulations before booking or publishing rides.
            </Text>

            <Input
              label="11-Digit NIN"
              placeholder="e.g. 12345678901"
              value={nin}
              onChangeText={setNin}
              keyboardType="number-pad"
              maxLength={11}
            />

            <Button
              title="Submit NIN"
              variant="outline"
              size="sm"
              onPress={handleSaveNin}
              loading={loadingNin}
            />
          </Card>

          {/* Driver License Section */}
          <Card style={{ marginTop: spacing.md }}>
            <View style={styles.sectionRow}>
              <Text style={styles.cardTitle}>Driver's License Verification</Text>
              <Badge
                label={
                  user?.driver_profile?.license_verification_status ||
                  (user?.can_offer_rides ? 'Verified' : 'Pending')
                }
                variant={user?.can_offer_rides ? 'success' : 'warning'}
              />
            </View>
            <Text style={styles.description}>
              Drivers must have a verified license before publishing car-share offers.
            </Text>

            <Input
              label="License Number"
              placeholder="e.g. ABC123456789"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              autoCapitalize="characters"
            />

            <Input
              label="Expiry Date"
              placeholder="YYYY-MM-DD (e.g. 2027-12-31)"
              value={licenseExpiryDate}
              onChangeText={setLicenseExpiryDate}
            />

            <Input
              label="License Document URI / S3 Key"
              placeholder="e.g. file:///... or photo url"
              value={licensePhotoUrl}
              onChangeText={setLicensePhotoUrl}
            />

            <Button
              title="Submit Driver's License"
              variant="primary"
              size="md"
              onPress={handleUploadLicense}
              loading={loadingLicense}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
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
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
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
