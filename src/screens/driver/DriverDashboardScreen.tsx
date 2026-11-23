import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useMyWallet } from '../../hooks/usePayments';
import { useDriverPendingBookings } from '../../hooks/useBookings';
import { useMyRides } from '../../hooks/useRides';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface Props {
  navigation: any;
}

export const DriverDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, switchRole } = useAuthStore();
  const { data: wallet, isFetching: loadingWallet, refetch: refetchWallet } = useMyWallet();
  const { data: pendingBookings = [], isFetching: loadingPending, refetch: refetchPending } =
    useDriverPendingBookings();
  const { data: myRides = [], isFetching: loadingRides, refetch: refetchRides } = useMyRides();

  const isRefreshing = loadingWallet || loadingPending || loadingRides;

  const handleRefresh = () => {
    refetchWallet();
    refetchPending();
    refetchRides();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Driver Dashboard</Text>
          <Text style={styles.driverName}>{user?.full_name || 'Driver'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => switchRole('passenger')}
          style={styles.switchPill}
          accessibilityRole="button"
        >
          <Text style={styles.switchPillText}>Passenger Mode ⇄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Earnings Card */}
        <Card style={styles.walletCard}>
          <Text style={styles.walletLabel}>Available for Payout</Text>
          <Text style={styles.walletAmount}>
            ₦{Number(wallet?.available_balance_naira || 0).toLocaleString()}
          </Text>
          <View style={styles.walletSub}>
            <Text style={styles.pendingText}>
              Pending: ₦{Number(wallet?.pending_balance_naira || 0).toLocaleString()}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('DriverWallet')}>
              <Text style={styles.walletLink}>View Wallet & Payouts ›</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Action Shortcuts */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('CreateRide')}
          >
            <Text style={styles.shortcutIcon}>➕</Text>
            <Text style={styles.shortcutTitle}>Offer Ride</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('DriverRides')}
          >
            <Text style={styles.shortcutIcon}>🚗</Text>
            <Text style={styles.shortcutTitle}>My Rides ({myRides.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutBtn}
            onPress={() => navigation.navigate('DriverCars')}
          >
            <Text style={styles.shortcutIcon}>🚘</Text>
            <Text style={styles.shortcutTitle}>My Vehicles</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Requests Alert */}
        {pendingBookings.length > 0 ? (
          <Card style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View>
                <Text style={styles.alertTitle}>
                  {pendingBookings.length} Pending Booking Request{pendingBookings.length > 1 ? 's' : ''}
                </Text>
                <Text style={styles.alertSubtitle}>
                  Passengers are waiting for your confirmation.
                </Text>
              </View>
              <Badge label="Action Required" variant="warning" />
            </View>
            <Button
              title="Review Booking Requests"
              size="sm"
              onPress={() => navigation.navigate('DriverBookings')}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ) : (
          <Card>
            <Text style={styles.emptyTitle}>No Pending Booking Requests</Text>
            <Text style={styles.emptySubtitle}>
              When passengers request seats on your trips, they will appear here.
            </Text>
          </Card>
        )}

        {/* Verification Status Banner if unverified */}
        {!user?.can_offer_rides && (
          <Card style={styles.warningCard}>
            <Text style={styles.warningTitle}>License Verification Required</Text>
            <Text style={styles.warningText}>
              Your driver's license must be verified before you can publish offers to passengers.
            </Text>
            <Button
              title="Complete Verification"
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate('DriverVerification')}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        )}

        {/* Quick Menu */}
        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.menuHeader}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DriverReviews')}
          >
            <Text style={styles.menuTitle}>Ratings & Feedback</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DriverCars')}
          >
            <Text style={styles.menuTitle}>Manage Vehicles & Features</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DriverWallet')}
          >
            <Text style={styles.menuTitle}>Request Payout / Download Statement</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  driverName: {
    ...typography.h2,
    color: colors.text,
  },
  switchPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  switchPillText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  container: {
    padding: spacing.md,
  },
  walletCard: {
    backgroundColor: '#0F172A',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  walletLabel: {
    ...typography.caption,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  walletAmount: {
    ...typography.h1,
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '800',
    marginVertical: spacing.xs,
  },
  walletSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  pendingText: {
    ...typography.caption,
    color: '#CBD5E1',
  },
  walletLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  shortcutBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  shortcutTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  alertCard: {
    borderColor: colors.warning,
    borderWidth: 1.5,
    backgroundColor: colors.warningLight,
    marginBottom: spacing.md,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
  },
  alertSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyTitle: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  warningCard: {
    borderColor: colors.danger,
    borderWidth: 1,
    backgroundColor: colors.dangerLight,
    marginTop: spacing.md,
  },
  warningTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.danger,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.danger,
    marginTop: 2,
  },
  menuHeader: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 18,
    color: colors.textMuted,
  },
});
