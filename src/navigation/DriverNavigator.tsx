import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { DriverStackParamList, DriverTabParamList } from './types';
import { DriverDashboardScreen } from '../screens/driver/DriverDashboardScreen';
import { CreateRideScreen } from '../screens/driver/CreateRideScreen';
import { DriverBookingsScreen } from '../screens/driver/DriverBookingsScreen';
import { DriverWalletScreen } from '../screens/driver/DriverWalletScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { DriverRidesScreen } from '../screens/driver/DriverRidesScreen';
import { DriverCarsScreen } from '../screens/driver/DriverCarsScreen';
import { DriverTripExecutionScreen } from '../screens/driver/DriverTripExecutionScreen';
import { DriverReviewsScreen } from '../screens/driver/DriverReviewsScreen';
import { EditProfileScreen } from '../screens/shared/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/shared/ChangePasswordScreen';
import { DriverVerificationScreen } from '../screens/shared/DriverVerificationScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<DriverTabParamList>();
const Stack = createNativeStackNavigator<DriverStackParamList>();

const DriverTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="DriverDashboard"
        component={DriverDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="CreateRide"
        component={CreateRideScreen}
        options={{
          tabBarLabel: 'Offer Ride',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>➕</Text>,
        }}
      />
      <Tab.Screen
        name="DriverBookings"
        component={DriverBookingsScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="DriverWallet"
        component={DriverWalletScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const DriverNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DriverTabs" component={DriverTabs} />
      <Stack.Screen name="DriverRides" component={DriverRidesScreen} />
      <Stack.Screen name="DriverCars" component={DriverCarsScreen} />
      <Stack.Screen name="DriverTripExecution" component={DriverTripExecutionScreen} />
      <Stack.Screen name="DriverReviews" component={DriverReviewsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="DriverVerification" component={DriverVerificationScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};
