import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyRides } from '../../hooks/useRides';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { colors, spacing, typography } from '../../theme';

interface Props {
  navigation: any;
}

export const DriverRidesScreen: React.FC<Props> = ({ navigation }) => {
  const { data: rides = [], isLoading, isFetching, refetch } = useMyRides();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="My Published Rides"
        onBack={() => navigation.goBack()}
        rightActionTitle="+ Offer Ride"
        onRightAction={() => navigation.navigate('CreateRide')}
      />

      {isLoading ? (
        <Loader fullScreen message="Loading published rides..." />
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              title="No Rides Published Yet"
              description="Start offering rides to passengers heading the same way to cover trip costs."
              actionTitle="Offer a Ride"
              onAction={() => navigation.navigate('CreateRide')}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.rideCard}>
              <View style={styles.topRow}>
                <View>
                  <Text style={styles.routeText}>
                    {item.origin_city} → {item.destination_city}
                  </Text>
                  <Text style={styles.pickupTime}>Departs: {item.pickup_time.slice(0, 5)}</Text>
                </View>
                <Badge
                  label={item.is_active ? 'Active' : 'Completed / Inactive'}
                  variant={item.is_active ? 'success' : 'neutral'}
                />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.subText}>Meeting: {item.pickup_location}</Text>
                <Text style={styles.priceText}>₦{Number(item.price_per_seat).toLocaleString()} / seat</Text>
              </View>

              {item.car && (
                <Text style={styles.carText}>
                  Vehicle: {item.car.make} {item.car.model} ({item.car.color})
                </Text>
              )}

              {item.occurrences && item.occurrences.length > 0 && (
                <View style={styles.occurrencesRow}>
                  <Text style={styles.occurrencesTitle}>Scheduled Dates:</Text>
                  <Text style={styles.occurrencesText}>
                    {item.occurrences.map((o) => o.date).join(', ')}
                  </Text>
                </View>
              )}
            </Card>
          )}
          contentContainerStyle={{ padding: spacing.md }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rideCard: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routeText: {
    ...typography.h3,
    color: colors.text,
  },
  pickupTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  subText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  priceText: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.primary,
  },
  carText: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  occurrencesRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  occurrencesTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  occurrencesText: {
    ...typography.caption,
    color: colors.text,
    marginTop: 2,
  },
});
