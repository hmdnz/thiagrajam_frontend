import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PassengerStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<PassengerStackParamList, 'PaymentResult'>;

export const PaymentResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { success, message, bookingId } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: success ? colors.successLight : colors.dangerLight },
            ]}
          >
            <Text
              style={[
                styles.iconText,
                { color: success ? colors.success : colors.danger },
              ]}
            >
              {success ? '✓' : '✕'}
            </Text>
          </View>

          <Text style={styles.title}>{success ? 'Payment Successful!' : 'Payment Failed'}</Text>
          <Text style={styles.message}>{message}</Text>

          {bookingId && (
            <Text style={styles.bookingRef}>Booking Reference: #{bookingId}</Text>
          )}

          {success ? (
            <View style={styles.btnCol}>
              <Button
                title="View My Bookings"
                size="lg"
                onPress={() => navigation.navigate('PassengerTabs', { screen: 'MyBookings' })}
                style={styles.btn}
              />
              <Button
                title="Return to Home"
                variant="outline"
                size="md"
                onPress={() => navigation.navigate('PassengerTabs', { screen: 'PassengerHome' })}
                style={styles.btn}
              />
            </View>
          ) : (
            <View style={styles.btnCol}>
              <Button
                title="Try Again"
                size="lg"
                onPress={() => navigation.goBack()}
                style={styles.btn}
              />
              <Button
                title="Return to Home"
                variant="ghost"
                size="md"
                onPress={() => navigation.navigate('PassengerTabs', { screen: 'PassengerHome' })}
                style={styles.btn}
              />
            </View>
          )}
        </Card>
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
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconText: {
    fontSize: 36,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  bookingRef: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  btnCol: {
    width: '100%',
    marginTop: spacing.xl,
  },
  btn: {
    marginVertical: spacing.xs,
  },
});
