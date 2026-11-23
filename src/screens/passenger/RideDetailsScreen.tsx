import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PassengerStackParamList } from '../../navigation/types';
import { useRideDetails } from '../../hooks/useRides';
import { useUserRating } from '../../hooks/useReviews';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { RatingStars } from '../../components/RatingStars';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Props = NativeStackScreenProps<PassengerStackParamList, 'RideDetails'>;

export const RideDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { rideId, searchResult } = route.params;
  const { data: ride, isLoading, error, refetch } = useRideDetails(rideId);
  const driverId = ride?.driver_id || searchResult?.driver_id;
  const { data: driverRating } = useUserRating(driverId || '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Trip Details" onBack={() => navigation.goBack()} />
        <Loader fullScreen message="Loading trip details..." />
      </SafeAreaView>
    );
  }

  if (error || !ride) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Trip Details" onBack={() => navigation.goBack()} />
        <View style={{ padding: spacing.md }}>
          <ErrorBanner message="Failed to load ride details." onRetry={refetch} />
        </View>
      </SafeAreaView>
    );
  }

  const travelDate = searchResult?.searched_date || (ride.occurrences?.[0]?.date as string) || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Trip Details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Journey Summary */}
        <Card>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.timeTitle}>{ride.pickup_time.slice(0, 5)}</Text>
              <Text style={styles.dateSubtitle}>{travelDate}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>₦{Number(ride.price_per_seat).toLocaleString()}</Text>
              <Text style={styles.priceSubtitle}>per seat</Text>
            </View>
          </View>

          <View style={styles.routeContainer}>
            <View style={styles.routeStop}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={styles.stopInfo}>
                <Text style={styles.cityText}>{ride.origin_city}</Text>
                <Text style={styles.addressText}>{ride.pickup_location}</Text>
              </View>
            </View>

            {ride.stopovers && ride.stopovers.length > 0 && (
              <View style={styles.stopoversList}>
                {ride.stopovers.map((stop, idx) => (
                  <View key={stop.id || idx} style={styles.stopoverItem}>
                    <View style={styles.stopoverDot} />
                    <Text style={styles.stopoverText}>
                      Stop: {stop.city_name || stop.location || 'Intermediate Stop'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.routeStop}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <View style={styles.stopInfo}>
                <Text style={styles.cityText}>{ride.destination_city}</Text>
                <Text style={styles.addressText}>{ride.dropoff_location}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Driver Details & Rating */}
        <Card>
          <Text style={styles.sectionTitle}>Driver</Text>
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.avatarInitials}>
                {ride.driver?.full_name ? ride.driver.full_name[0] : 'D'}
              </Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{ride.driver?.full_name || 'Verified Driver'}</Text>
              <View style={styles.ratingRow}>
                <RatingStars
                  rating={driverRating?.average_rating || 5}
                  size={16}
                  showText
                />
                <Text style={styles.reviewCount}>
                  ({driverRating?.total_reviews || 0} reviews)
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Vehicle Information */}
        {ride.car && (
          <Card>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <Text style={styles.carName}>
              {ride.car.make} {ride.car.model} ({ride.car.year})
            </Text>
            <Text style={styles.carColor}>Color: {ride.car.color}</Text>

            <View style={styles.featuresRow}>
              {ride.car.has_air_conditioning && <Badge label="AC" variant="primary" style={styles.featureBadge} />}
              {ride.car.has_wifi && <Badge label="WiFi" variant="primary" style={styles.featureBadge} />}
              {ride.car.has_power_outlets && <Badge label="Power Outlet" variant="primary" style={styles.featureBadge} />}
              {ride.car.smoking_allowed && <Badge label="Smoking OK" variant="neutral" style={styles.featureBadge} />}
              {ride.car.pets_allowed && <Badge label="Pets OK" variant="neutral" style={styles.featureBadge} />}
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomPrice}>₦{Number(ride.price_per_seat).toLocaleString()}</Text>
          <Text style={styles.bottomSeats}>
            Max {ride.max_passengers} seats
          </Text>
        </View>
        <Button
          title="Continue to Book"
          size="lg"
          onPress={() =>
            navigation.navigate('BookRide', {
              ride,
              date: travelDate,
              maxPassengers: searchResult?.seats_remaining_for_date ?? ride.max_passengers,
            })
          }
          style={styles.bookBtn}
        />
      </View>
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
    paddingBottom: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  timeTitle: {
    ...typography.h1,
    color: colors.text,
  },
  dateSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    ...typography.h1,
    color: colors.primary,
  },
  priceSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  routeContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  routeStop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.xs,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: spacing.md,
  },
  stopInfo: {
    flex: 1,
  },
  cityText: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  stopoversList: {
    paddingLeft: spacing.lg,
    marginVertical: spacing.xs,
  },
  stopoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  stopoverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderDark,
    marginRight: spacing.sm,
  },
  stopoverText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarInitials: {
    ...typography.h3,
    color: colors.primary,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  carName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  carColor: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  featureBadge: {
    marginRight: spacing.xs,
    marginTop: spacing.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceInfo: {
    flex: 1,
  },
  bottomPrice: {
    ...typography.h2,
    color: colors.primary,
  },
  bottomSeats: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bookBtn: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
