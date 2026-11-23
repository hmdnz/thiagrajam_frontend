import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { PassengerStackParamList, PassengerTabParamList } from './types';
import { HomeScreen } from '../screens/passenger/HomeScreen';
import { MyBookingsScreen } from '../screens/passenger/MyBookingsScreen';
import { PassengerWalletScreen } from '../screens/passenger/PassengerWalletScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { RideDetailsScreen } from '../screens/passenger/RideDetailsScreen';
import { BookRideScreen } from '../screens/passenger/BookRideScreen';
import { PaymentScreen } from '../screens/passenger/PaymentScreen';
import { PaymentResultScreen } from '../screens/passenger/PaymentResultScreen';
import { OngoingTripScreen } from '../screens/passenger/OngoingTripScreen';
import { RateTripScreen } from '../screens/passenger/RateTripScreen';
import { MyReviewsScreen } from '../screens/passenger/MyReviewsScreen';
import { EditProfileScreen } from '../screens/shared/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/shared/ChangePasswordScreen';
import { DriverVerificationScreen } from '../screens/shared/DriverVerificationScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<PassengerTabParamList>();
const Stack = createNativeStackNavigator<PassengerStackParamList>();

const PassengerTabs: React.FC = () => {
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
        name="PassengerHome"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎫</Text>,
        }}
      />
      <Tab.Screen
        name="PassengerWallet"
        component={PassengerWalletScreen}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💳</Text>,
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

export const PassengerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="PassengerTabs" component={PassengerTabs} />
      <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
      <Stack.Screen name="BookRide" component={BookRideScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
      <Stack.Screen name="OngoingTrip" component={OngoingTripScreen} />
      <Stack.Screen name="RateTrip" component={RateTripScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="DriverVerification" component={DriverVerificationScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};
