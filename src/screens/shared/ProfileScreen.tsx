import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface Props {
  navigation: any;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, activeRole, switchRole, logout } = useAuthStore();

  const handleRoleToggle = () => {
    const nextRole = activeRole === 'passenger' ? 'driver' : 'passenger';
    switchRole(nextRole);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            {user?.photo_url ? (
              <Image source={{ uri: user.photo_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}

            <View style={styles.infoCol}>
              <Text style={styles.name}>{user?.full_name || 'Winnie4 User'}</Text>
              <Text style={styles.email}>{user?.email || user?.phone_number || 'No contact set'}</Text>
              <View style={styles.badgesRow}>
                <Badge
                  label={activeRole === 'driver' ? 'Driver Mode' : 'Passenger Mode'}
                  variant="primary"
                  style={styles.badge}
                />
                <Badge
                  label={`NIN: ${user?.nin_verification_status || 'unverified'}`}
                  variant={user?.nin_verified ? 'success' : 'warning'}
                  style={styles.badge}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Mode Switcher */}
        <Card style={styles.modeCard}>
          <View style={styles.modeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modeTitle}>
                {activeRole === 'passenger' ? 'Driver Mode' : 'Passenger Mode'}
              </Text>
              <Text style={styles.modeDesc}>
                {activeRole === 'passenger'
                  ? 'Switch to driver dashboard to offer rides & earn'
                  : 'Switch to passenger mode to search & book rides'}
              </Text>
            </View>
            <Button
              title={activeRole === 'passenger' ? 'Switch to Driver' : 'Switch to Passenger'}
              variant="outline"
              size="sm"
              onPress={handleRoleToggle}
            />
          </View>
        </Card>

        {/* Verification Status */}
        <Card>
          <Text style={styles.sectionTitle}>Verification & ID</Text>
          <View style={styles.verifRow}>
            <Text style={styles.verifLabel}>National ID (NIN):</Text>
            <Badge
              label={user?.nin_verified ? 'Verified' : user?.nin_verification_status || 'Unverified'}
              variant={user?.nin_verified ? 'success' : 'warning'}
            />
          </View>
          <View style={styles.verifRow}>
            <Text style={styles.verifLabel}>Driver's License:</Text>
            <Badge
              label={
                user?.driver_profile?.license_verification_status ||
                (user?.can_offer_rides ? 'Verified' : 'Not Uploaded')
              }
              variant={user?.can_offer_rides ? 'success' : 'warning'}
            />
          </View>
          <Button
            title="Upload ID / Driver License"
            variant="secondary"
            size="sm"
            onPress={() => navigation.navigate('DriverVerification')}
            style={{ marginTop: spacing.md }}
          />
        </Card>

        {/* Account Menu */}
        <Card>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.menuText}>Edit Profile & Preferences</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.menuText}>Change Password</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate(activeRole === 'driver' ? 'DriverReviews' : 'MyReviews')}
          >
            <Text style={styles.menuText}>Ratings & Reviews</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        <Button
          title="Sign Out"
          variant="danger"
          size="md"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>
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
  profileCard: {
    marginBottom: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarInitials: {
    ...typography.h2,
    color: colors.primary,
  },
  infoCol: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  badge: {
    marginRight: spacing.xs,
    marginTop: 4,
  },
  modeCard: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  modeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  verifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  verifLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: colors.textMuted,
  },
  logoutBtn: {
    marginVertical: spacing.lg,
  },
});
