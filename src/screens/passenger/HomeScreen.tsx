import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchRides } from '../../hooks/useRides';
import { RideSearchResult } from '../../types/rides';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

interface Props {
  navigation: any;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [departureDate, setDepartureDate] = useState(todayStr);
  const [passengers, setPassengers] = useState('1');
  const [hasSearched, setHasSearched] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSearchRides(
    {
      from_location: fromLocation.trim() || undefined,
      to_location: toLocation.trim() || undefined,
      departure_date: departureDate.trim(),
      passengers: parseInt(passengers, 10) || 1,
      page: 1,
      limit: 20,
    },
    hasSearched
  );

  const handleSearch = () => {
    setHasSearched(true);
    refetch();
  };

  const rides = data?.items || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.appName}>Winnie4</Text>
        <Text style={styles.headerTitle}>Find a Ride</Text>
      </View>

      <FlatList
        data={rides}
        keyExtractor={(item) => `${item.id}-${item.searched_date}`}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListHeaderComponent={
          <View style={styles.searchSection}>
            <Card style={styles.searchCard}>
              <Input
                label="Leaving from"
                placeholder="Origin City or Pickup location"
                value={fromLocation}
                onChangeText={setFromLocation}
              />
              <Input
                label="Going to"
                placeholder="Destination City or Dropoff location"
                value={toLocation}
                onChangeText={setToLocation}
              />
              <View style={styles.row}>
                <View style={{ flex: 2, marginRight: spacing.sm }}>
                  <Input
                    label="Date"
                    placeholder="YYYY-MM-DD"
                    value={departureDate}
                    onChangeText={setDepartureDate}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Seats"
                    placeholder="1"
                    value={passengers}
                    onChangeText={setPassengers}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Button
                title="Search Available Rides"
                onPress={handleSearch}
                size="md"
                loading={isLoading}
              />
            </Card>

            {error && <ErrorBanner message={getErrorMessage(error)} onRetry={refetch} />}

            {hasSearched && (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  {rides.length} {rides.length === 1 ? 'Ride' : 'Rides'} Available
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          hasSearched && !isLoading ? (
            <EmptyState
              title="No Rides Found"
              description="Try adjusting your cities, dates, or seat requirements."
            />
          ) : !hasSearched ? (
            <View style={styles.emptyPrompt}>
              <Text style={styles.promptTitle}>Travel Smart Across Nigeria</Text>
              <Text style={styles.promptSubtitle}>
                Search by origin and destination to view verified drivers heading your way.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('RideDetails', {
                rideId: item.id,
                searchResult: item,
              })
            }
            activeOpacity={0.8}
            style={styles.rideItemContainer}
          >
            <Card style={styles.rideCard}>
              <View style={styles.topCardRow}>
                <View>
                  <Text style={styles.timeText}>{item.pickup_time.slice(0, 5)}</Text>
                  <Text style={styles.dateText}>{item.searched_date}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>₦{Number(item.price_per_seat).toLocaleString()}</Text>
                  <Text style={styles.pricePerSeat}>per seat</Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.locationRow}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {item.origin_city} ({item.pickup_location})
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.locationRow}>
                  <View style={[styles.dot, { backgroundColor: colors.success }]} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {item.destination_city} ({item.dropoff_location})
                  </Text>
                </View>
              </View>

              <View style={styles.bottomCardRow}>
                <View style={styles.driverInfo}>
                  <Text style={styles.carText}>
                    {item.car ? `${item.car.make} ${item.car.model} (${item.car.color})` : 'Standard Ride'}
                  </Text>
                </View>
                <Badge
                  label={`${item.seats_remaining_for_date} seats left`}
                  variant={item.seats_remaining_for_date > 0 ? 'success' : 'danger'}
                />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      />
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
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  appName: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  searchSection: {
    padding: spacing.md,
  },
  searchCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  resultsHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  resultsTitle: {
    ...typography.h3,
    color: colors.text,
  },
  emptyPrompt: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  promptTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  promptSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 280,
  },
  rideItemContainer: {
    paddingHorizontal: spacing.md,
  },
  rideCard: {
    marginBottom: spacing.sm,
  },
  topCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  timeText: {
    ...typography.h2,
    color: colors.text,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    ...typography.h2,
    color: colors.primary,
  },
  pricePerSeat: {
    ...typography.caption,
    color: colors.textMuted,
  },
  routeContainer: {
    marginVertical: spacing.sm,
    paddingLeft: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.borderDark,
    marginLeft: 4,
    marginVertical: 2,
  },
  locationText: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  bottomCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  driverInfo: {
    flex: 1,
  },
  carText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
