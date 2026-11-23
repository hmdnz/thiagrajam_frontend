import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PassengerStackParamList } from '../../navigation/types';
import { useCreateBooking } from '../../hooks/useBookings';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<PassengerStackParamList, 'BookRide'>;

export const BookRideScreen: React.FC<Props> = ({ navigation, route }) => {
  const { ride, date, maxPassengers } = route.params;
  const { user } = useAuthStore();
  const [seats, setSeats] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createBookingMutation = useCreateBooking();

  const pricePerSeat = Number(ride.price_per_seat);
  const totalFare = pricePerSeat * seats;

  const handleCreateBooking = async () => {
    setErrorMessage(null);
    try {
      const booking = await createBookingMutation.mutateAsync({
        ride_id: ride.id,
        travel_date: date,
        seats_booked: seats,
      });

      // Route to Payment Screen
      navigation.navigate('Payment', {
        bookingId: booking.id,
        amountNaira: Number(booking.fare) || totalFare,
        email: user?.email || 'passenger@wenyfour.com',
      });
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Confirm Booking" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        {/* Journey Summary */}
        <Card>
          <Text style={styles.cardTitle}>Journey Details</Text>
          <Text style={styles.routeHeader}>
            {ride.origin_city} → {ride.destination_city}
          </Text>
          <Text style={styles.routeSub}>
            Pickup: {ride.pickup_location} at {ride.pickup_time.slice(0, 5)}
          </Text>
          <Text style={styles.routeSub}>Dropoff: {ride.dropoff_location}</Text>
          <Text style={styles.dateBadge}>Travel Date: {date}</Text>
        </Card>

        {/* Seat Selection */}
        <Card>
          <Text style={styles.cardTitle}>Number of Seats</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              onPress={() => setSeats((prev) => Math.max(1, prev - 1))}
              disabled={seats <= 1}
              style={[styles.counterBtn, seats <= 1 && styles.counterBtnDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Decrease seats"
            >
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.counterValue}>{seats}</Text>

            <TouchableOpacity
              onPress={() => setSeats((prev) => Math.min(maxPassengers || 4, prev + 1))}
              disabled={seats >= (maxPassengers || 4)}
              style={[styles.counterBtn, seats >= (maxPassengers || 4) && styles.counterBtnDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Increase seats"
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.seatsRemainingNote}>
            Available seats on this date: {maxPassengers}
          </Text>
        </Card>

        {/* Fare Summary */}
        <Card>
          <Text style={styles.cardTitle}>Price Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              ₦{pricePerSeat.toLocaleString()} × {seats} {seats === 1 ? 'seat' : 'seats'}
            </Text>
            <Text style={styles.breakdownValue}>₦{totalFare.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>Total Fare</Text>
            <Text style={styles.totalValue}>₦{totalFare.toLocaleString()}</Text>
          </View>
        </Card>

        <Button
          title="Proceed to Payment"
          size="lg"
          onPress={handleCreateBooking}
          loading={createBookingMutation.isPending}
          style={styles.payBtn}
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
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  routeHeader: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
  },
  routeSub: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateBadge: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterBtnText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '700',
    lineHeight: 28,
  },
  counterValue: {
    ...typography.h1,
    color: colors.text,
    marginHorizontal: spacing.xl,
    minWidth: 40,
    textAlign: 'center',
  },
  seatsRemainingNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  breakdownLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  breakdownValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    ...typography.h2,
    color: colors.primary,
  },
  payBtn: {
    marginVertical: spacing.lg,
  },
});
