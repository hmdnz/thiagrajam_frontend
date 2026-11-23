import { NavigatorScreenParams } from '@react-navigation/native';
import { RideSearchResult, RideOut } from '../types/rides';
import { BookingOut } from '../types/bookings';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: { role?: 'passenger' | 'driver' } | undefined;
  VerifyOtp: { phoneNumber: string };
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
};

export type PassengerTabParamList = {
  PassengerHome: undefined;
  MyBookings: undefined;
  PassengerWallet: undefined;
  Profile: undefined;
};

export type PassengerStackParamList = {
  PassengerTabs: NavigatorScreenParams<PassengerTabParamList>;
  RideDetails: { rideId: number; searchResult?: RideSearchResult };
  BookRide: { ride: RideOut; date: string; maxPassengers: number };
  Payment: { bookingId: number; amountNaira: number; email: string };
  PaymentResult: { success: boolean; message: string; bookingId?: number };
  OngoingTrip: { bookingId: number };
  RateTrip: { bookingId: number; driverName?: string };
  MyReviews: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  DriverVerification: undefined;
  Notifications: undefined;
};

export type DriverTabParamList = {
  DriverDashboard: undefined;
  CreateRide: undefined;
  DriverBookings: undefined;
  DriverWallet: undefined;
  Profile: undefined;
};

export type DriverStackParamList = {
  DriverTabs: NavigatorScreenParams<DriverTabParamList>;
  DriverRides: undefined;
  DriverCars: undefined;
  DriverTripExecution: { bookingId: number };
  DriverReviews: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  DriverVerification: undefined;
  Notifications: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  PassengerRoot: NavigatorScreenParams<PassengerStackParamList>;
  DriverRoot: NavigatorScreenParams<DriverStackParamList>;
};
