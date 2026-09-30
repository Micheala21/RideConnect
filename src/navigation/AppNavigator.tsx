import React, {
  useEffect,
  useState,
} from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  ActivityIndicator,
  Alert,
  View,
} from "react-native";

import Colors from "../constants/colors";

import {
  supabase,
} from "../lib/supabaseClient";

// ================= MAIN SCREENS =================

import WelcomeScreen
  from "../screens/welcomeScreen";

import RoleSelectionScreen
  from "../screens/roleSelectionScreen";

import SignUpScreen
  from "../screens/auth/SignUpScreen";

// ================= RIDER AUTHENTICATION =================

import RiderLoginScreen
  from "../screens/auth/rider/riderLoginScreen";

import RiderRegisterScreen
  from "../screens/auth/rider/riderRegisterScreen";

// ================= SHARED AUTHENTICATION =================

import ForgotPasswordScreen
  from "../screens/auth/ForgotPassword";

import PasswordResetSentScreen
  from "../screens/auth/PasswordResetSent";

import ResetPasswordScreen
  from "../screens/auth/ResetPassword";

import EmailVerificationScreen
  from "../screens/auth/EmailVerification";

// ================= DRIVER AUTHENTICATION =================

import DriverLoginScreen
  from "../screens/auth/driver/driverLoginScreen";

import DriverRegisterScreen
  from "../screens/auth/driver/driverRegisterScreen";

// ================= DRIVER NAVIGATION =================

import DriverNavigationTab
  from "./DriverNavigationTab";

// ================= DRIVER SCREENS =================

import RiderRequestsScreen
  from "../screens/driver/riderRequestScreen";

import RiderRequestDetailsScreen
  from "../screens/driver/riderRequestDetails";

import CreateRideOfferScreen
  from "../screens/driver/createRideOffer";

import RideConfirmationScreen
  from "../screens/driver/rideConfirmationScreen";

import DriverRideDetailsScreen
  from "../screens/driver/rideDetailsScreen";

import RideOfferConfirmationScreen
  from "../screens/driver/rideOfferConfirmation";

import ActiveTripScreen
  from "../screens/driver/activeTrip";

import ViewMyRideScreen
  from "../screens/driver/viewMyRide";

import DriverAcceptedRideScreen
  from "../screens/driver/DriverAcceptedRide";

import DriverTripScreen
  from "../screens/driver/DriverTrip";

import DriverProfileScreen
  from "../screens/driver/driverProfile";

import DriverEditInformationScreen
  from "../screens/driver/driverSetupScreen";

import DriverSettingsScreen
  from "../screens/driver/driverSettingsScreen";

import ChatWithRiderScreen
  from "../screens/driver/chatWithRider";

// ================= ADMIN =================

import AdminLoginScreen
  from "../screens/auth/admin/adminLoginScreen";

// ================= RIDER NAVIGATION =================

import RiderTabNavigator
  from "./RiderNavigationTab";

// ================= RIDER SCREENS =================

import SearchResultsScreen
  from "../screens/rider/searchResults";

import RideDetailsScreen
  from "../screens/rider/rideDetails";

import ConfirmBookingScreen
  from "../screens/rider/confirmBooking";

import PaymentMethodScreen
  from "../screens/rider/paymentMethod";

import BookingConfirmedScreen
  from "../screens/rider/bookingConfirmed";

import RiderSetupScreen
  from "../screens/rider/riderSetupScreen";

import RiderProfileScreen
  from "../screens/rider/riderProfileScreen";

import TripReceiptScreen
  from "../screens/rider/tripReceiptScreen";

import TrackDriverScreen
  from "../screens/rider/trackDriverScreen";

import ReviewDriverScreen
  from "../screens/rider/reviewDriver";

import RiderSettingsScreen
  from "../screens/rider/riderSettingsScreen";

import ChatWithDriverScreen
  from "../screens/rider/chatWithDriver";

// ================= TYPES =================

export type Ride = {
  id: string;

  driver_id: string;

  pickup_location: string;

  destination: string;

  ride_date: string;

  departure_time: string;

  available_seats: number;

  fare: number;

  notes: string | null;

  status: string;

  driverName: string;

  vehicle: string;

  similarity?: number;
};

// ================= ROOT STACK PARAMS =================

export type RootStackParamList = {
  // ================= MAIN =================

  Welcome: undefined;

  RoleSelection: undefined;

  SignUp: undefined;

  // ================= RIDER AUTH =================

  RiderLogin: undefined;

  RiderRegister: undefined;

  // ================= SHARED AUTH =================

  EmailVerification: {
    email: string;
    token?: string;
    role: "rider" | "driver";
  };

  ForgotPassword: {
    role: "rider" | "driver";
  };

  PasswordResetSent: {
    role: "rider" | "driver";
    email: string;
  };

  ResetPassword: {
    token?: string;
    role: "rider" | "driver";
  };

  // ================= DRIVER AUTH =================

  DriverLogin: undefined;

  DriverRegister: undefined;

  // ================= RIDER =================

  RiderHome:
    | {
        screen?:
          | "Home"
          | "Active Trips"
          | "Past Trips";
      }
    | undefined;

  SearchResults: {
    pickup: string;
    destination: string;
    date: string;
    time: string;
    passengers: string;
  };

  RideDetails: {
    ride: Ride;
  };

  ConfirmBooking: {
    ride: Ride;
  };

  PaymentMethod: {
    rideId: string;
  };

  BookingConfirmed: {
    bookingId: string;
  };

  // ================= RIDER TRACK DRIVER =================

  TrackDriver: {
    rideId: string;
  };

  // ================= RIDER REVIEW =================

  ReviewDriver: {
    rideId: string;
  };

  // ================= RIDER CHAT =================

  ChatWithDriver: {
    rideId: string;
  };

  TripReceipt: {
    rideId: string;
  };

  RiderProfile: undefined;

  RiderEditInformation: undefined;

  RiderSettings: undefined;

  // ================= DRIVER =================

  DriverHome:
    | {
        screen?:
          | "Home"
          | "Activity"
          | "Past Trips";
      }
    | undefined;

  DriverEditInformation: undefined;

  RiderRequests: undefined;

  RiderRequestDetails: {
    rider: {
      id: string;
      name: string;
      pickup: string;
      destination: string;
      passengers: number;
      offer: string;
      distance: string;
      gender: string;
      pickupTime: string;
      routeMatch: string;
    };
  };

  CreateRideOffer: undefined;

  RideConfirmation: {
    rideId: string;
  };

  DriverRideDetails: {
    rideId: string;
  };

  ActiveTrip: undefined;

  ViewMyRide: undefined;

  RideOfferConfirmation: {
    rideId: string;
  };

  // ================= NEW DRIVER RIDE FLOW =================

  DriverAcceptedRide: {
    rideId: string;
  };

  DriverTrip: {
    rideId: string;
  };

  DriverProfile: undefined;

  DriverSettings: undefined;

  // ================= DRIVER CHAT =================

  ChatWithRider: {
    rideId: string;
  };

  // ================= ADMIN =================

  AdminLogin: undefined;
};

// ================= STACK =================

const Stack =
  createNativeStackNavigator<
    RootStackParamList
  >();

// ================= APP NAVIGATOR =================

export default function AppNavigator() {

  const [
    session,
    setSession,
  ] = useState<any>(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {

    const getSession =
      async () => {

        const {
          data,
        } =
          await supabase.auth.getSession();


        setSession(
          data.session
        );


        setLoading(false);

      };


    getSession();


    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {

          setSession(
            session
          );

        }
      );


    return () => {

      subscription.unsubscribe();

    };

  }, []);


  // ================= APP-WIDE RIDE NOTIFICATIONS =================
  // These are in-app realtime alerts. They do not require the rider or
  // driver to already be on a particular trip screen. OS-level push
  // notifications would require device push tokens and a notification
  // delivery service, which is separate from this Supabase realtime flow.

  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId) {
      return;
    }

    const riderChannel = supabase
      .channel(`app-rider-booking-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `rider_id=eq.${userId}`,
        },
        (payload) => {
          const previousStatus = (payload.old as { status?: string })?.status;
          const nextStatus = (payload.new as { status?: string })?.status;

          if (previousStatus === nextStatus) {
            return;
          }

          if (nextStatus === "confirmed") {
            Alert.alert(
              "Ride Accepted",
              "Your driver accepted the booking. Open Active Trips to chat with or track the driver.",
            );
          } else if (nextStatus === "cancelled") {
            Alert.alert(
              "Ride Request Declined",
              "The driver declined this booking request. You can search for another available ride.",
            );
          }
        },
      )
      .subscribe();

    const driverChannel = supabase
      .channel(`app-driver-booking-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `driver_id=eq.${userId}`,
        },
        (payload) => {
          const booking = payload.new as { status?: string };

          if (booking.status === "pending") {
            Alert.alert(
              "New Rider Request",
              "A rider requested your trip. Open Activity and Rider Requests to review it.",
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(riderChannel);
      void supabase.removeChannel(driverChannel);
    };
  }, [session?.user?.id]);


  // ================= LOADING =================

  if (loading) {

    return (

      <View
        style={{
          flex: 1,

          justifyContent:
            "center",

          alignItems:
            "center",

          backgroundColor:
            Colors.background,
        }}
      >

        <ActivityIndicator
          size="large"
          color={
            Colors.primary
          }
        />

      </View>

    );

  }


  return (

    <NavigationContainer>

      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >

        {/* ================= MAIN ================= */}

        <Stack.Screen
          name="Welcome"
          component={
            WelcomeScreen
          }
        />

        <Stack.Screen
          name="RoleSelection"
          component={
            RoleSelectionScreen
          }
        />

        <Stack.Screen
          name="SignUp"
          component={
            SignUpScreen
          }
        />


        {/* ================= RIDER AUTH ================= */}

        <Stack.Screen
          name="RiderLogin"
          component={
            RiderLoginScreen
          }
        />

        <Stack.Screen
          name="RiderRegister"
          component={
            RiderRegisterScreen
          }
        />


        {/* ================= DRIVER AUTH ================= */}

        <Stack.Screen
          name="DriverLogin"
          component={
            DriverLoginScreen
          }
        />

        <Stack.Screen
          name="DriverRegister"
          component={
            DriverRegisterScreen
          }
        />


        {/* ================= SHARED AUTH ================= */}

        <Stack.Screen
          name="EmailVerification"
          component={
            EmailVerificationScreen
          }
        />

        <Stack.Screen
          name="ForgotPassword"
          component={
            ForgotPasswordScreen
          }
        />

        <Stack.Screen
          name="PasswordResetSent"
          component={
            PasswordResetSentScreen
          }
        />

        <Stack.Screen
          name="ResetPassword"
          component={
            ResetPasswordScreen
          }
        />


        {/* ================= RIDER NAVIGATION ================= */}

        <Stack.Screen
          name="RiderHome"
          component={
            RiderTabNavigator
          }
        />


        {/* ================= RIDER SCREENS ================= */}

        <Stack.Screen
          name="SearchResults"
          component={
            SearchResultsScreen
          }
        />

        <Stack.Screen
          name="RideDetails"
          component={
            RideDetailsScreen
          }
        />

        <Stack.Screen
          name="ConfirmBooking"
          component={
            ConfirmBookingScreen
          }
        />

        <Stack.Screen
          name="PaymentMethod"
          component={
            PaymentMethodScreen
          }
        />

        <Stack.Screen
          name="BookingConfirmed"
          component={
            BookingConfirmedScreen
          }
        />

        <Stack.Screen
          name="RiderProfile"
          component={
            RiderProfileScreen
          }
        />

        <Stack.Screen
          name="RiderEditInformation"
          component={
            RiderSetupScreen
          }
        />

        <Stack.Screen
          name="TripReceipt"
          component={
            TripReceiptScreen
          }
        />


        {/* ================= TRACK DRIVER ================= */}

        <Stack.Screen
          name="TrackDriver"
          component={
            TrackDriverScreen
          }
        />


        {/* ================= RIDER REVIEW ================= */}

        <Stack.Screen
          name="ReviewDriver"
          component={
            ReviewDriverScreen
          }
        />


        {/* ================= RIDER CHAT ================= */}

        <Stack.Screen
          name="ChatWithDriver"
          component={
            ChatWithDriverScreen
          }
        />

        <Stack.Screen
          name="RiderSettings"
          component={
            RiderSettingsScreen
          }
        />


        {/* ================= DRIVER NAVIGATION ================= */}

        <Stack.Screen
          name="DriverHome"
          component={
            DriverNavigationTab
          }
        />


        {/* ================= DRIVER SCREENS ================= */}

        <Stack.Screen
          name="RiderRequests"
          component={
            RiderRequestsScreen
          }
        />

        <Stack.Screen
          name="RiderRequestDetails"
          component={
            RiderRequestDetailsScreen
          }
        />

        <Stack.Screen
          name="CreateRideOffer"
          component={
            CreateRideOfferScreen
          }
        />

        <Stack.Screen
          name="RideConfirmation"
          component={
            RideConfirmationScreen
          }
        />

        <Stack.Screen
          name="DriverRideDetails"
          component={
            DriverRideDetailsScreen
          }
        />

        <Stack.Screen
          name="ActiveTrip"
          component={
            ActiveTripScreen
          }
        />

        <Stack.Screen
          name="ViewMyRide"
          component={
            ViewMyRideScreen
          }
        />


        {/* ================= NEW DRIVER RIDE FLOW ================= */}

        <Stack.Screen
          name="DriverAcceptedRide"
          component={
            DriverAcceptedRideScreen
          }
        />

        <Stack.Screen
          name="DriverTrip"
          component={
            DriverTripScreen
          }
        />

        <Stack.Screen
          name="RideOfferConfirmation"
          component={
            RideOfferConfirmationScreen
          }
        />

        <Stack.Screen
          name="DriverProfile"
          component={
            DriverProfileScreen
          }
        />

        <Stack.Screen
          name="DriverEditInformation"
          component={
            DriverEditInformationScreen
          }
        />

        <Stack.Screen
          name="DriverSettings"
          component={
            DriverSettingsScreen
          }
        />


        {/* ================= DRIVER CHAT ================= */}

        <Stack.Screen
          name="ChatWithRider"
          component={
            ChatWithRiderScreen
          }
        />


        {/* ================= ADMIN ================= */}

        <Stack.Screen
          name="AdminLogin"
          component={
            AdminLoginScreen
          }
        />

      </Stack.Navigator>

    </NavigationContainer>

  );

}