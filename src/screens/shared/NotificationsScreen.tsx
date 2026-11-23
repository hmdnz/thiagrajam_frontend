import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing, typography } from '../../theme';

interface Props {
  navigation: any;
}

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const notifications: Array<{ id: string; title: string; message: string; time: string }> = [
    {
      id: '1',
      title: 'Welcome to Winnie4',
      message: 'Find rides across Nigeria or publish trips to start earning today.',
      time: 'Just now',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Notifications" onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              title="No Notifications"
              description="You will see ride updates, confirmations, and alerts here."
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.notifCard}>
              <View style={styles.topRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
            </Card>
          )}
          contentContainerStyle={{ padding: spacing.md }}
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
    flex: 1,
  },
  notifCard: {
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
