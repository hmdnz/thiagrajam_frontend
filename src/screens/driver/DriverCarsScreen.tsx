import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyCars, useAddCar, useDeleteCar } from '../../hooks/useCars';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { getErrorMessage } from '../../api/client';

interface Props {
  navigation: any;
}

export const DriverCarsScreen: React.FC<Props> = ({ navigation }) => {
  const { data: cars = [], isLoading, isFetching, refetch } = useMyCars();
  const addCarMutation = useAddCar();
  const deleteCarMutation = useDeleteCar();

  const [showAddModal, setShowAddModal] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2020');
  const [color, setColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [hasAc, setHasAc] = useState(true);
  const [hasWifi, setHasWifi] = useState(false);
  const [hasPowerOutlets, setHasPowerOutlets] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddCar = async () => {
    if (!make.trim() || !model.trim() || !color.trim()) {
      setErrorMessage('Please provide car make, model, and color.');
      return;
    }

    setErrorMessage(null);
    try {
      await addCarMutation.mutateAsync({
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year, 10) || 2020,
        color: color.trim(),
        plate_number: plateNumber.trim() || undefined,
        has_air_conditioning: hasAc,
        has_wifi: hasWifi,
        has_power_outlets: hasPowerOutlets,
        smoking_allowed: smokingAllowed,
        pets_allowed: petsAllowed,
        wheelchair_accessible: wheelchairAccessible,
      });

      setShowAddModal(false);
      setMake('');
      setModel('');
      setColor('');
      setPlateNumber('');
      refetch();
    } catch (err: any) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleDelete = (carId: number) => {
    Alert.alert('Delete Vehicle', 'Are you sure you want to remove this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCarMutation.mutateAsync(carId);
          } catch (err: any) {
            setErrorMessage(getErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="My Vehicles"
        onBack={() => navigation.goBack()}
        rightActionTitle="+ Add Vehicle"
        onRightAction={() => {
          setErrorMessage(null);
          setShowAddModal(true);
        }}
      />

      <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

      {isLoading ? (
        <Loader fullScreen message="Loading vehicles..." />
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => String(item.id)}
          refreshing={isFetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <EmptyState
              title="No Vehicles Registered"
              description="Add your vehicle to be eligible to publish ride offers."
              actionTitle="Add Vehicle"
              onAction={() => setShowAddModal(true)}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.carCard}>
              <View style={styles.carTop}>
                <View>
                  <Text style={styles.carTitle}>
                    {item.make} {item.model} ({item.year})
                  </Text>
                  <Text style={styles.plateText}>{item.plate_number || 'Plate Pending'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.colorText}>Color: {item.color}</Text>

              <View style={styles.badgeRow}>
                {item.has_air_conditioning && (
                  <Badge label="Air Conditioning" variant="primary" style={styles.badge} />
                )}
                {item.has_wifi && <Badge label="WiFi" variant="primary" style={styles.badge} />}
                {item.has_power_outlets && (
                  <Badge label="Power Outlet" variant="primary" style={styles.badge} />
                )}
                {item.smoking_allowed && (
                  <Badge label="Smoking Allowed" variant="neutral" style={styles.badge} />
                )}
                {item.pets_allowed && (
                  <Badge label="Pets Allowed" variant="neutral" style={styles.badge} />
                )}
              </View>
            </Card>
          )}
          contentContainerStyle={{ padding: spacing.md }}
        />
      )}

      {/* Add Car Modal */}
      <Modal visible={showAddModal} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <Header title="Add New Vehicle" onBack={() => setShowAddModal(false)} />
          <ScrollView contentContainerStyle={{ padding: spacing.md }} keyboardShouldPersistTaps="handled">
            <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />

            <Input label="Make (Brand)" placeholder="e.g. Toyota" value={make} onChangeText={setMake} />
            <Input label="Model" placeholder="e.g. Corolla / Camry" value={model} onChangeText={setModel} />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Input
                  label="Year"
                  placeholder="2020"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Color" placeholder="e.g. Silver" value={color} onChangeText={setColor} />
              </View>
            </View>

            <Input
              label="Plate Number (Optional)"
              placeholder="e.g. LAG-123-XY"
              value={plateNumber}
              onChangeText={setPlateNumber}
              autoCapitalize="characters"
            />

            <Text style={styles.featuresHeading}>Amenities & Settings</Text>

            <View style={styles.switchItem}>
              <Text style={styles.switchText}>Air Conditioning (A/C)</Text>
              <Switch value={hasAc} onValueChange={setHasAc} />
            </View>

            <View style={styles.switchItem}>
              <Text style={styles.switchText}>Free In-car WiFi</Text>
              <Switch value={hasWifi} onValueChange={setHasWifi} />
            </View>

            <View style={styles.switchItem}>
              <Text style={styles.switchText}>Power / Phone Charging Outlets</Text>
              <Switch value={hasPowerOutlets} onValueChange={setHasPowerOutlets} />
            </View>

            <View style={styles.switchItem}>
              <Text style={styles.switchText}>Pets Allowed</Text>
              <Switch value={petsAllowed} onValueChange={setPetsAllowed} />
            </View>

            <View style={styles.switchItem}>
              <Text style={styles.switchText}>Smoking / Vaping Allowed</Text>
              <Switch value={smokingAllowed} onValueChange={setSmokingAllowed} />
            </View>

            <View style={styles.switchItem}>
              <Text style={styles.switchText}>Wheelchair Accessible</Text>
              <Switch value={wheelchairAccessible} onValueChange={setWheelchairAccessible} />
            </View>

            <Button
              title="Save Vehicle"
              size="lg"
              onPress={handleAddCar}
              loading={addCarMutation.isPending}
              style={{ marginVertical: spacing.xl }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  carCard: {
    marginBottom: spacing.md,
  },
  carTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  carTitle: {
    ...typography.h3,
    color: colors.text,
  },
  plateText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  deleteText: {
    ...typography.bodySmall,
    color: colors.danger,
    fontWeight: '600',
  },
  colorText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginVertical: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  badge: {
    marginRight: spacing.xs,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  featuresHeading: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
});
