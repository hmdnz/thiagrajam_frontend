import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyBookings, useCancelBookingAsPassenger } from '../../hooks/useBookings';
import { BookingOut, BookingStatus, BookingCancellationOut } from '../../types/bookings';
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

export const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [cancelModalBooking, setCancelModalBooking] = useState<BookingOut | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellationResult, setCancellationResult] = useState<BookingCancellationOut | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: bookings = [], isLoading, isFetching, error, refetch } = useMyBookings();
  const cancelMutation = useCancelBookingAsPassenger();

  const getStatusVariant = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'rejected':
      case 'failed':
        return 'danger';
      case 'completed':
      default:
        return 'neutral';
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['pending', 'confirmed', 'in_progress'].includes(b.status);
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return ['cancelled', 'rejected', 'failed'].includes(b.status);
    return true;
  });

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setErrorMessage(null);
    try {
      const res = await cancelMutation.mutateAsync({
        bookingId: cancelModalBooking.id,
        input: { reason: cancelReason.trim() || undefined },
      });
      setCancellationResult(res);
      refetch();
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['all', 'active', 'completed', 'cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

      {isLoading ? (
        <Loader fullScreen message="Loading bookings..." />
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              title="No Bookings Found"
              description="You have not booked any trips in this category yet."
              actionTitle="Search Rides"
              onAction={() => navigation.navigate('PassengerHome')}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.bookingId}>Booking #{item.id}</Text>
                  <Text style={styles.travelDate}>Date: {item.travel_date}</Text>
                </View>
                <Badge label={item.status} variant={getStatusVariant(item.status)} />
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>{item.seats_booked} seat(s) booked</Text>
                <Text style={styles.fareText}>₦{Number(item.fare).toLocaleString()}</Text>
              </View>

              <View style={styles.cardActions}>
                {['confirmed', 'in_progress'].includes(item.status) && (
                  <Button
                    title="Live Trip Status"
                    size="sm"
                    variant="primary"
                    onPress={() => navigation.navigate('OngoingTrip', { bookingId: item.id })}
                    style={styles.actionBtn}
                  />
                )}

                {item.status === 'completed' && (
                  <Button
                    title="Rate Trip"
                    size="sm"
                    variant="secondary"
                    onPress={() => navigation.navigate('RateTrip', { bookingId: item.id })}
                    style={styles.actionBtn}
                  />
                )}

                {['pending', 'confirmed'].includes(item.status) && (
                  <Button
                    title="Cancel Booking"
                    size="sm"
                    variant="outline"
                    onPress={() => {
                      setCancellationResult(null);
                      setCancelReason('');
                      setCancelModalBooking(item);
                    }}
                    style={styles.actionBtn}
                  />
                )}
              </View>
            </Card>
          )}
          contentContainerStyle={{ padding: spacing.md }}
        />
      )}

      {/* Cancellation Modal */}
      <Modal
        visible={!!cancelModalBooking}
        animationType="slide"
        transparent
        onRequestClose={() => setCancelModalBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Booking #{cancelModalBooking?.id}</Text>

            {!cancellationResult ? (
              <>
                <Text style={styles.modalDesc}>
                  Are you sure you want to cancel this booking? Cancellations within short notice may
                  incur penalty fees according to the cancellation policy.
                </Text>

                <Input
                  label="Cancellation Reason (Optional)"
                  placeholder="e.g. Schedule changed"
                  value={cancelReason}
                  onChangeText={setCancelReason}
                />

                <View style={styles.modalActions}>
                  <Button
                    title="Keep Booking"
                    variant="outline"
                    size="md"
                    onPress={() => setCancelModalBooking(null)}
                    style={{ flex: 1, marginRight: spacing.sm }}
                  />
                  <Button
                    title="Confirm Cancel"
                    variant="danger"
                    size="md"
                    onPress={handleCancelBooking}
                    loading={cancelMutation.isPending}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.cancelResultMsg}>{cancellationResult.message}</Text>
                <View style={styles.cancellationStats}>
                  <Text style={styles.statLine}>
                    Original Fare: ₦{(cancellationResult.original_fare_kobo / 100).toLocaleString()}
                  </Text>
                  <Text style={styles.statLine}>
                    Penalty Deducted: ₦{(cancellationResult.penalty_kobo / 100).toLocaleString()}
                  </Text>
                  <Text style={[styles.statLine, { color: colors.success, fontWeight: '700' }]}>
                    Refund to Passenger: ₦
                    {(cancellationResult.passenger_refund_kobo / 100).toLocaleString()}
                  </Text>
                </View>
                <Button
                  title="Close"
                  size="md"
                  onPress={() => setCancelModalBooking(null)}
                  style={{ marginTop: spacing.md }}
                />
              </>
            )}
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
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingId: {
    ...typography.h3,
    color: colors.text,
  },
  travelDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  detailText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  fareText: {
    ...typography.h3,
    color: colors.primary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionBtn: {
    marginLeft: spacing.sm,
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
    marginBottom: spacing.sm,
  },
  modalDesc: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  cancelResultMsg: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
    marginVertical: spacing.sm,
  },
  cancellationStats: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
  },
  statLine: {
    ...typography.bodyMedium,
    marginVertical: 2,
  },
});
