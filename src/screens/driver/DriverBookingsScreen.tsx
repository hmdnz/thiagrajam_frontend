import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useDriverBookings,
  useDriverPendingBookings,
  useConfirmBooking,
  useRejectBooking,
  useCancelBookingAsDriver,
} from '../../hooks/useBookings';
import { DriverPassengerBookingOut, BookingStatus } from '../../types/bookings';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

interface Props {
  navigation: any;
}

export const DriverBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'all'>('pending');
  const [rejectBookingId, setRejectBookingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: allBookings = [], isLoading: loadingAll, refetch: refetchAll } = useDriverBookings();
  const { data: pendingBookings = [], isLoading: loadingPending, refetch: refetchPending } =
    useDriverPendingBookings();

  const confirmMutation = useConfirmBooking();
  const rejectMutation = useRejectBooking();
  const cancelDriverMutation = useCancelBookingAsDriver();

  const handleRefresh = () => {
    refetchAll();
    refetchPending();
  };

  const handleConfirm = async (bookingId: number) => {
    setErrorMessage(null);
    try {
      await confirmMutation.mutateAsync({ bookingId });
      handleRefresh();
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleReject = async () => {
    if (!rejectBookingId) return;
    if (!rejectReason.trim()) {
      setErrorMessage('Please state a reason for rejecting the booking.');
      return;
    }

    setErrorMessage(null);
    try {
      await rejectMutation.mutateAsync({
        bookingId: rejectBookingId,
        input: { reason: rejectReason.trim() },
      });
      setRejectBookingId(null);
      setRejectReason('');
      handleRefresh();
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const displayedList =
    activeTab === 'pending'
      ? pendingBookings
      : activeTab === 'confirmed'
      ? allBookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress')
      : allBookings;

  const isLoading = loadingAll || loadingPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Passenger Bookings" onBack={() => navigation.goBack()} />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('pending')}
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('confirmed')}
          style={[styles.tab, activeTab === 'confirmed' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'confirmed' && styles.tabTextActive]}>
            Confirmed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All ({allBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

      {isLoading ? (
        <Loader fullScreen message="Loading bookings..." />
      ) : (
        <FlatList
          data={displayedList}
          keyExtractor={(item) => String(item.booking_id)}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <EmptyState
              title="No Bookings in this tab"
              description="New booking requests from passengers will appear here."
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.bookingCard}>
              <View style={styles.topRow}>
                <View>
                  <Text style={styles.passengerName}>
                    {item.passenger_name || 'Passenger'}
                  </Text>
                  <Text style={styles.contactText}>
                    {item.passenger_phone || item.passenger_email || 'No contact provided'}
                  </Text>
                </View>
                <Badge
                  label={item.status}
                  variant={
                    item.status === 'confirmed'
                      ? 'success'
                      : item.status === 'pending'
                      ? 'warning'
                      : 'neutral'
                  }
                />
              </View>

              <View style={styles.routeRow}>
                <Text style={styles.routeLocation}>Pickup: {item.pickup_location}</Text>
                <Text style={styles.routeLocation}>Dropoff: {item.dropoff_location}</Text>
                <Text style={styles.routeDate}>
                  Travel Date: {item.travel_date} at {item.pickup_time ? item.pickup_time.slice(0, 5) : ''}
                </Text>
              </View>

              <View style={styles.fareRow}>
                <Text style={styles.seatsText}>{item.seats_booked} seat(s)</Text>
                <Text style={styles.fareAmount}>₦{Number(item.fare).toLocaleString()}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                {item.status === 'pending' && (
                  <>
                    <Button
                      title="Confirm"
                      size="sm"
                      variant="primary"
                      onPress={() => handleConfirm(item.booking_id)}
                      loading={confirmMutation.isPending}
                      style={{ flex: 1, marginRight: spacing.xs }}
                    />
                    <Button
                      title="Reject"
                      size="sm"
                      variant="outline"
                      onPress={() => setRejectBookingId(item.booking_id)}
                      style={{ flex: 1 }}
                    />
                  </>
                )}

                {item.status === 'confirmed' && (
                  <Button
                    title="Manage / Start Trip"
                    size="sm"
                    variant="primary"
                    onPress={() =>
                      navigation.navigate('DriverTripExecution', { bookingId: item.booking_id })
                    }
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </Card>
          )}
          contentContainerStyle={{ padding: spacing.md }}
        />
      )}

      {/* Reject Reason Modal */}
      <Modal
        visible={!!rejectBookingId}
        animationType="slide"
        transparent
        onRequestClose={() => setRejectBookingId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Booking Request</Text>
            <Text style={styles.modalDesc}>
              Please explain why you cannot accept this passenger request.
            </Text>

            <Input
              label="Reason for Rejection"
              placeholder="e.g. Schedule conflict or no space for luggage"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              style={{ minHeight: 70, textAlignVertical: 'top' }}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setRejectBookingId(null)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Reject Booking"
                variant="danger"
                size="md"
                onPress={handleReject}
                loading={rejectMutation.isPending}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingVertical: spacing.sm + 2,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  bookingCard: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  passengerName: {
    ...typography.h3,
    color: colors.text,
  },
  contactText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  routeRow: {
    marginVertical: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  routeLocation: {
    ...typography.bodySmall,
    color: colors.text,
    marginVertical: 1,
  },
  routeDate: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: 4,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  seatsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  fareAmount: {
    ...typography.h3,
    color: colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalDesc: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
