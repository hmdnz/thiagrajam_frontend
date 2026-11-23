import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePublishRide } from '../../hooks/useRides';
import { useMyCars } from '../../hooks/useCars';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';
import { StopoverIn } from '../../types/rides';

interface Props {
  navigation: any;
}

export const CreateRideScreen: React.FC<Props> = ({ navigation }) => {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const { data: cars = [], isLoading: loadingCars } = useMyCars();
  const publishMutation = usePublishRide();

  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [date, setDate] = useState(tomorrowStr);
  const [time, setTime] = useState('08:00:00');
  const [pricePerSeat, setPricePerSeat] = useState('5000');
  const [maxPassengers, setMaxPassengers] = useState('4');
  const [maxBackSeatPassengers, setMaxBackSeatPassengers] = useState('2');
  const [instantBooking, setInstantBooking] = useState(false);

  // Stopovers
  const [stopovers, setStopovers] = useState<StopoverIn[]>([]);
  const [newStopCity, setNewStopCity] = useState('');
  const [newStopLocation, setNewStopLocation] = useState('');
  const [newStopPrice, setNewStopPrice] = useState('2500');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Set default car if available
  React.useEffect(() => {
    if (cars.length > 0 && selectedCarId === null) {
      setSelectedCarId(cars[0].id);
    }
  }, [cars, selectedCarId]);

  const addStopover = () => {
    if (!newStopCity.trim()) return;
    setStopovers((prev) => [
      ...prev,
      {
        city_name: newStopCity.trim(),
        location: newStopLocation.trim() || newStopCity.trim(),
        order: prev.length + 1,
        price_from_origin: parseFloat(newStopPrice) || 0,
      },
    ]);
    setNewStopCity('');
    setNewStopLocation('');
    setNewStopPrice('');
  };

  const removeStopover = (index: number) => {
    setStopovers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePublish = async () => {
    if (!selectedCarId) {
      setErrorMessage('Please select or add a vehicle first.');
      return;
    }
    if (!originCity.trim() || !destinationCity.trim()) {
      setErrorMessage('Please specify origin and destination cities.');
      return;
    }
    if (!pickupLocation.trim() || !dropoffLocation.trim()) {
      setErrorMessage('Please specify exact pickup and dropoff points.');
      return;
    }
    const passengersCount = parseInt(maxPassengers, 10);
    if (isNaN(passengersCount) || passengersCount < 4) {
      setErrorMessage('Backend requires max_passengers to be at least 4.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await publishMutation.mutateAsync({
        car_id: selectedCarId,
        origin_city: originCity.trim(),
        destination_city: destinationCity.trim(),
        pickup_location: pickupLocation.trim(),
        dropoff_location: dropoffLocation.trim(),
        dates: [date.trim()],
        start_date: date.trim(),
        pickup_time: time.trim(),
        max_passengers: passengersCount,
        max_back_seat_passengers: parseInt(maxBackSeatPassengers, 10) || undefined,
        price_per_seat: parseFloat(pricePerSeat) || 1000,
        instant_booking: instantBooking,
        stopovers: stopovers.length > 0 ? stopovers : undefined,
      });

      setSuccessMessage('Ride offer published successfully!');
      setTimeout(() => {
        navigation.navigate('DriverRides');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Offer a Ride" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Vehicle Selection */}
          <Card>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Vehicle</Text>
              <TouchableOpacity onPress={() => navigation.navigate('DriverCars')}>
                <Text style={styles.linkText}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {cars.length === 0 ? (
              <View style={styles.noCarPrompt}>
                <Text style={styles.noCarText}>
                  You don't have any registered vehicles yet.
                </Text>
                <Button
                  title="Add Vehicle Now"
                  size="sm"
                  onPress={() => navigation.navigate('DriverCars')}
                  style={{ marginTop: spacing.sm }}
                />
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carList}>
                {cars.map((car) => (
                  <TouchableOpacity
                    key={car.id}
                    onPress={() => setSelectedCarId(car.id)}
                    style={[
                      styles.carItem,
                      selectedCarId === car.id && styles.carItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.carName,
                        selectedCarId === car.id && styles.carNameSelected,
                      ]}
                    >
                      {car.make} {car.model}
                    </Text>
                    <Text style={styles.carPlate}>{car.plate_number || `${car.color} • ${car.year}`}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Card>

          {/* Route Details */}
          <Card>
            <Text style={styles.cardTitle}>Route & Meeting Points</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Input
                  label="Origin City"
                  placeholder="e.g. Lagos"
                  value={originCity}
                  onChangeText={setOriginCity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Destination City"
                  placeholder="e.g. Ibadan"
                  value={destinationCity}
                  onChangeText={setDestinationCity}
                />
              </View>
            </View>

            <Input
              label="Pickup Location / Meeting Point"
              placeholder="e.g. Ojota Bus Stop or Total Filling Station"
              value={pickupLocation}
              onChangeText={setPickupLocation}
            />

            <Input
              label="Dropoff Location"
              placeholder="e.g. Iwo Road Underground"
              value={dropoffLocation}
              onChangeText={setDropoffLocation}
            />
          </Card>

          {/* Stopovers Section */}
          <Card>
            <Text style={styles.cardTitle}>En Route Stopovers (Optional)</Text>
            {stopovers.map((stop, idx) => (
              <View key={idx} style={styles.stopoverRow}>
                <Text style={styles.stopoverText}>
                  {idx + 1}. {stop.city_name} (₦{stop.price_from_origin})
                </Text>
                <TouchableOpacity onPress={() => removeStopover(idx)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.row}>
              <View style={{ flex: 2, marginRight: spacing.xs }}>
                <Input
                  placeholder="Stopover City"
                  value={newStopCity}
                  onChangeText={setNewStopCity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Price ₦"
                  value={newStopPrice}
                  onChangeText={setNewStopPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Button
              title="+ Add Stopover"
              variant="outline"
              size="sm"
              onPress={addStopover}
            />
          </Card>

          {/* Schedule & Pricing */}
          <Card>
            <Text style={styles.cardTitle}>Schedule & Fare</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Input
                  label="Departure Date"
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Pickup Time"
                  placeholder="HH:MM:SS"
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Input
                  label="Price Per Seat (₦)"
                  placeholder="e.g. 5000"
                  value={pricePerSeat}
                  onChangeText={setPricePerSeat}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Available Seats (min 4)"
                  placeholder="4"
                  value={maxPassengers}
                  onChangeText={setMaxPassengers}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Input
              label="Max Back Seat Passengers"
              placeholder="e.g. 2 for extra passenger comfort"
              value={maxBackSeatPassengers}
              onChangeText={setMaxBackSeatPassengers}
              keyboardType="number-pad"
            />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Instant Booking</Text>
                <Text style={styles.switchSub}>
                  Allow passengers to book without manual driver approval
                </Text>
              </View>
              <Switch
                value={instantBooking}
                onValueChange={setInstantBooking}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </Card>

          <Button
            title="Publish Ride Offer"
            size="lg"
            onPress={handlePublish}
            loading={publishMutation.isPending}
            style={styles.publishBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  linkText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  noCarPrompt: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  noCarText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  carList: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
  },
  carItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    minWidth: 140,
  },
  carItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  carName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text,
  },
  carNameSelected: {
    color: colors.primaryDark,
  },
  carPlate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
  },
  stopoverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  stopoverText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  removeText: {
    fontSize: 16,
    color: colors.danger,
    paddingHorizontal: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.text,
  },
  switchSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  publishBtn: {
    marginVertical: spacing.lg,
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
});
