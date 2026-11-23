import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing } from '../../theme';
import { Loader } from '../../components/Loader';

export const SplashScreen: React.FC = () => {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Winnie4</Text>
      <Text style={styles.tagline}>Smart, Reliable Car-Sharing</Text>
      <Loader />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logo: {
    ...typography.h1,
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    ...typography.bodyMedium,
    color: '#94A3B8',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
