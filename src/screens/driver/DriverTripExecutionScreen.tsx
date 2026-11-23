import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DriverStackParamList } from '../../navigation/types';
import {
  useDriverBookings,
  useStartTrip,
  useCompleteTrip,
  useCancelBookingAsDriver,
} from '../../hooks/useBookings';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Loader } from '../../components/Loader';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<DriverStackParamList, 'DriverTripExecution'>;

export const DriverTripExecutionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const { data: bookings = [], isLoading, refetch } = useDriverBookings();

  const [tripNote, setTripNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const startTripMutation = useStartTrip();
  const completeTripMutation = useCompleteTrip();
  const cancelDriverMutation = useCancelBookingAsDriver();

  const booking = bookings.find((b) => b.booking_id === bookingId);

  const handleStartTrip = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await startTripMutation.mutateAsync({
        bookingId,
        input: { note: tripNote.trim() || undefined },
      });
      setSuccessMessage('Trip has officially started!');
      refetch();
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleCompleteTrip = async () => {
    Alert.alert(
      'Complete Trip',
      'Confirm that you have arrived at the destination and dropped off the passenger. This will release the fare to your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete & Release Funds',
          onPress: async () => {
            setErrorMessage(null);
            setSuccessMessage(null);
            try {
              await completeTripMutation.mutateAsync({
                bookingId,
                input: { note: tripNote.trim() || undefined },
              });
              setSuccessMessage('Trip completed! Fare has been credited to your wallet.');
              refetch();
            } catch (err: any) {
              setErrorMessage(getErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const handleCancelAsDriver = async () => {
    Alert.alert(
      'Cancel Trip',
      'Are you sure you want to cancel? Driver cancellations may affect your rating or incur wallet penalties.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setErrorMessage(null);
            try {
              await cancelDriverMutation.mutateAsync({
                bookingId,
                input: { reason: tripNote.trim() || 'Driver emergency cancellation' },
              });
              navigation.goBack();
            } catch (err: any) {
              setErrorMessage(getErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Trip Execution" onBack={() => navigation.goBack()} />
        <Loader fullScreen message="Loading trip..." />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Trip Execution" onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <Text style={styles.notFound}>Booking details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = booking.status === 'completed';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={`Trip Execution #${booking.booking_id}`} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        {successMessage && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {/* Passenger Contact Card */}
        <Card>
          <View style={styles.passengerTop}>
            <View>
              <Text style={styles.passengerTitle}>Passenger</Text>
              <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
            </View>
            <Badge label={booking.status} variant={isCompleted ? 'neutral' : 'success'} />
          </View>

          <View style={styles.contactRow}>
            {booking.passenger_phone && (
              <Button
                title={`Call ${booking.passenger_phone}`}
                size="sm"
                variant="outline"
                onPress={() => Linking.openURL(`tel:${booking.passenger_phone}`)}
                style={{ flex: 1, marginRight: spacing.xs }}
              />
            )}
            {booking.passenger_email && (
              <Button
                title="Email"
                size="sm"
                variant="outline"
                onPress={() => Linking.openURL(`mailto:${booking.passenger_email}`)}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </Card>

        {/* Trip Locations */}
        <Card>
          <Text style={styles.sectionTitle}>Journey Points</Text>
          <View style={styles.pointRow}>
            <Text style={styles.pointLabel}>Pickup:</Text>
            <Text style={styles.pointValue}>{booking.pickup_location}</Text>
          </View>
          <View style={styles.pointRow}>
            <Text style={styles.pointLabel}>Dropoff:</Text>
            <Text style={styles.pointValue}>{booking.dropoff_location}</Text>
          </View>
          <View style={styles.pointRow}>
            <Text style={styles.pointLabel}>Pickup Time:</Text>
            <Text style={styles.pointValue}>{booking.pickup_time}</Text>
          </View>
          <View style={styles.pointRow}>
            <Text style={styles.pointLabel}>Total Fare to Earn:</Text>
            <Text style={styles.fareValue}>₦{Number(booking.fare).toLocaleString()}</Text>
          </View>
        </Card>

        {/* Note input */}
        {!isCompleted && (
          <Card>
            <Input
              label="Trip Note (Optional)"
              placeholder="e.g. Passenger boarded at 8:05 AM"
              value={tripNote}
              onChangeText={setTripNote}
            />
          </Card>
        )}

        {/* Action Buttons */}
        {!isCompleted && (
          <View style={styles.actionsContainer}>
            <Button
              title="Start Trip (Passenger Picked Up)"
              size="lg"
              onPress={handleStartTrip}
              loading={startTripMutation.isPending}
              style={styles.actionBtn}
            />

            <Button
              title="Complete Trip (Dropped Off)"
              size="lg"
              variant="secondary"
              onPress={handleCompleteTrip}
              loading={completeTripMutation.isPending}
              style={styles.actionBtn}
            />

            <Button
              title="Cancel Booking as Driver"
              size="md"
              variant="danger"
              onPress={handleCancelAsDriver}
              loading={cancelDriverMutation.isPending}
              style={[styles.actionBtn, { marginTop: spacing.md }]}
            />
          </View>
        )}
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
  passengerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  passengerTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  passengerName: {
    ...typography.h3,
    color: colors.text,
  },
  contactRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  pointLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  pointValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.sm,
  },
  fareValue: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primary,
  },
  actionsContainer: {
    marginVertical: spacing.md,
  },
  actionBtn: {
    marginVertical: spacing.xs,
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
  notFound: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
