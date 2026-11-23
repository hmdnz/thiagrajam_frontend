import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PassengerStackParamList } from '../../navigation/types';
import { useMyBookings } from '../../hooks/useBookings';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = NativeStackScreenProps<PassengerStackParamList, 'OngoingTrip'>;

export const OngoingTripScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const { data: bookings = [], isLoading, refetch } = useMyBookings();

  const booking = bookings.find((b) => b.id === bookingId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Ongoing Trip" onBack={() => navigation.goBack()} />
        <Loader fullScreen message="Loading trip status..." />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Ongoing Trip" onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <Text style={styles.notFound}>Booking not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isStarted = !!booking.trip_started_at;
  const isCompleted = booking.status === 'completed' || !!booking.trip_completed_at;

  const handleCallEmergency = () => {
    Linking.openURL('tel:112');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Live Trip Status"
        onBack={() => navigation.goBack()}
        rightActionTitle="Refresh"
        onRightAction={refetch}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Status Banner */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Trip Progress</Text>
            <Badge
              label={booking.status}
              variant={isCompleted ? 'neutral' : isStarted ? 'primary' : 'success'}
            />
          </View>

          <View style={styles.timeline}>
            <View style={styles.timelineStep}>
              <View style={[styles.stepDot, styles.stepDotDone]} />
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Driver Confirmed</Text>
                <Text style={styles.stepTime}>
                  {booking.driver_confirmed_at ? new Date(booking.driver_confirmed_at).toLocaleTimeString() : 'Confirmed'}
                </Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineStep}>
              <View style={[styles.stepDot, isStarted ? styles.stepDotDone : styles.stepDotPending]} />
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Trip In Progress</Text>
                <Text style={styles.stepTime}>
                  {booking.trip_started_at ? new Date(booking.trip_started_at).toLocaleTimeString() : 'Awaiting start'}
                </Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.timelineStep}>
              <View style={[styles.stepDot, isCompleted ? styles.stepDotDone : styles.stepDotPending]} />
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Destination Reached</Text>
                <Text style={styles.stepTime}>
                  {booking.trip_completed_at ? new Date(booking.trip_completed_at).toLocaleTimeString() : 'Pending completion'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Booking Details */}
        <Card>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Booking ID:</Text>
            <Text style={styles.value}>#{booking.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ride ID:</Text>
            <Text style={styles.value}>#{booking.ride_id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Travel Date:</Text>
            <Text style={styles.value}>{booking.travel_date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Seats Booked:</Text>
            <Text style={styles.value}>{booking.seats_booked}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fare Paid:</Text>
            <Text style={styles.fareValue}>₦{Number(booking.fare).toLocaleString()}</Text>
          </View>
        </Card>

        {/* Safety & Emergency Contact */}
        <Card style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>Safety & Assistance</Text>
          <Text style={styles.safetyDesc}>
            If you need urgent assistance during your journey, tap below to contact emergency services.
          </Text>
          <Button
            title="Call Emergency Services (112)"
            variant="danger"
            size="sm"
            onPress={handleCallEmergency}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        {/* If Completed, Offer Rating */}
        {isCompleted && (
          <Button
            title="Rate This Trip"
            size="lg"
            onPress={() => navigation.navigate('RateTrip', { bookingId: booking.id })}
            style={{ marginTop: spacing.md }}
          />
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
  statusCard: {
    marginBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTitle: {
    ...typography.h3,
    color: colors.text,
  },
  timeline: {
    paddingLeft: spacing.sm,
    marginVertical: spacing.xs,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.md,
  },
  stepDotDone: {
    backgroundColor: colors.primary,
  },
  stepDotPending: {
    backgroundColor: colors.borderDark,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text,
  },
  stepTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 6,
    marginVertical: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  fareValue: {
    ...typography.bodyLarge,
    color: colors.primary,
    fontWeight: '700',
  },
  safetyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.dangerLight,
  },
  safetyTitle: {
    ...typography.h3,
    color: colors.danger,
  },
  safetyDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginVertical: spacing.xs,
  },
  notFound: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
