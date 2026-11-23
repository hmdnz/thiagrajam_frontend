import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile } from '../../hooks/useAuth';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { getErrorMessage } from '../../api/client';
import { Chattiness, Music, Smoking, Pets, Gender } from '../../types/auth';

interface Props {
  navigation: any;
}

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const updateProfileMutation = useUpdateProfile();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [nin, setNin] = useState(user?.nin || '');
  const [aboutMe, setAboutMe] = useState(user?.about_me || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || '');
  const [nextOfKinName, setNextOfKinName] = useState(user?.next_of_kin_name || '');
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState(user?.next_of_kin_relationship || '');
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || '');
  const [gender, setGender] = useState<Gender | ''>(user?.gender || '');
  const [chattiness, setChattiness] = useState<Chattiness | ''>(user?.chattiness || '');
  const [music, setMusic] = useState<Music | ''>(user?.music_preference || '');
  const [smoking, setSmoking] = useState<Smoking | ''>(user?.smoking_preference || '');
  const [pets, setPets] = useState<Pets | ''>(user?.pets_preference || '');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateProfileMutation.mutateAsync({
        full_name: fullName.trim() || undefined,
        address: address.trim() || undefined,
        nin: nin.trim() || undefined,
        about_me: aboutMe.trim() || undefined,
        emergency_contact: emergencyContact.trim() || undefined,
        next_of_kin_name: nextOfKinName.trim() || undefined,
        next_of_kin_relationship: nextOfKinRelationship.trim() || undefined,
        blood_group: (bloodGroup.trim() as any) || undefined,
        gender: (gender as Gender) || undefined,
        chattiness: (chattiness as Chattiness) || undefined,
        music: (music as Music) || undefined,
        smoking: (smoking as Smoking) || undefined,
        pets: (pets as Pets) || undefined,
      });

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => navigation.goBack(), 1200);
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Edit Profile" onBack={() => navigation.goBack()} />
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

          <Text style={styles.sectionHeader}>Personal Details</Text>
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={fullName}
            onChangeText={setFullName}
          />

          <Input
            label="Home / Work Address"
            placeholder="e.g. 15 Marina St, Lagos"
            value={address}
            onChangeText={setAddress}
          />

          <Input
            label="National Identification Number (NIN)"
            placeholder="11-digit NIN"
            value={nin}
            onChangeText={setNin}
            keyboardType="number-pad"
            maxLength={11}
          />

          <Input
            label="About Me (Bio)"
            placeholder="Tell co-riders a bit about yourself"
            value={aboutMe}
            onChangeText={setAboutMe}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Text style={styles.sectionHeader}>Safety & Medical Information</Text>
          <Input
            label="Emergency Contact Phone"
            placeholder="e.g. 08098765432"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            keyboardType="phone-pad"
          />

          <Input
            label="Next of Kin Name"
            placeholder="e.g. Jane Doe"
            value={nextOfKinName}
            onChangeText={setNextOfKinName}
          />

          <Input
            label="Next of Kin Relationship"
            placeholder="e.g. Spouse, Brother, Parent"
            value={nextOfKinRelationship}
            onChangeText={setNextOfKinRelationship}
          />

          <Input
            label="Blood Group"
            placeholder="e.g. O+, A+, B-"
            value={bloodGroup}
            onChangeText={setBloodGroup}
            autoCapitalize="characters"
          />

          <Text style={styles.sectionHeader}>Ride Preferences</Text>
          <Input
            label="Chattiness Preference"
            placeholder="e.g. Talkative depending on mood / Quiet rides"
            value={chattiness}
            onChangeText={(v) => setChattiness(v as any)}
          />

          <Input
            label="Music Preference"
            placeholder="e.g. Afrobeats & Pop / Podcasts / Silence"
            value={music}
            onChangeText={(v) => setMusic(v as any)}
          />

          <Input
            label="Smoking Preference"
            placeholder="e.g. No smoking allowed"
            value={smoking}
            onChangeText={(v) => setSmoking(v as any)}
          />

          <Input
            label="Pets Preference"
            placeholder="e.g. No pets allowed / Pets in carrier"
            value={pets}
            onChangeText={(v) => setPets(v as any)}
          />

          <Button
            title="Save Profile"
            onPress={handleSave}
            loading={updateProfileMutation.isPending}
            size="lg"
            style={styles.saveBtn}
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
  sectionHeader: {
    ...typography.h3,
    color: colors.primaryDark,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  saveBtn: {
    marginVertical: spacing.xl,
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
