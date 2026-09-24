import React, { useEffect, useState } from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  ActivityIndicator,
  View,
} from "react-native";

import Colors from "../constants/colors";

import { supabase } from "../lib/supabaseClient";


// ================= MAIN SCREENS =================

import WelcomeScreen from "../screens/welcomeScreen";
import RoleSelectionScreen from "../screens/roleSelectionScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";


// ================= RIDER AUTHENTICATION =================

import RiderLoginScreen from "../screens/auth/rider/riderLoginScreen";
import RiderRegisterScreen from "../screens/auth/rider/riderRegisterScreen";


// ================= SHARED AUTHENTICATION =================

import ForgotPasswordScreen from "../screens/auth/ForgotPassword";
import PasswordResetSentScreen from "../screens/auth/PasswordResetSent";
import ResetPasswordScreen from "../screens/auth/ResetPassword";
import EmailVerificationScreen from "../screens/auth/EmailVerification";


// ================= DRIVER AUTHENTICATION =================

import DriverLoginScreen from "../screens/auth/driver/driverLoginScreen";
import DriverRegisterScreen from "../screens/auth/driver/driverRegisterScreen";


// ================= DRIVER NAVIGATION =================

import DriverNavigationTab from "./DriverNavigationTab";


// ================= DRIVER SCREENS =================

import RiderRequestsScreen from "../screens/driver/riderRequestScreen";
import RiderRequestDetailsScreen from "../screens/driver/riderRequestDetails";

import CreateRideOfferScreen from "../screens/driver/createRideOffer";

import RideConfirmationScreen from "../screens/driver/rideConfirmationScreen";

import DriverRideDetailsScreen from "../screens/driver/rideDetailsScreen";

import RideOfferConfirmationScreen from "../screens/driver/rideOfferConfirmation";

import ActiveTripScreen from "../screens/driver/activeTrip";

import ViewMyRideScreen from "../screens/driver/viewMyRide";

import DriverProfileScreen from "../screens/driver/driverProfile";

import DriverEditInformationScreen from "../screens/driver/driverSetupScreen";

import DriverSettingsScreen from "../screens/driver/driverSettingsScreen";


// ================= ADMIN =================

import AdminLoginScreen from "../screens/auth/admin/adminLoginScreen";


// ================= RIDER NAVIGATION =================

import RiderTabNavigator from "./RiderNavigationTab";


// ================= RIDER SCREENS =================

import SearchResultsScreen from "../screens/rider/searchResults";

import RideDetailsScreen from "../screens/rider/rideDetails";

import ConfirmBookingScreen
  from "../screens/rider/confirmBooking";

import PaymentMethodScreen
  from "../screens/rider/paymentMethod";

import BookingConfirmedScreen
  from "../screens/rider/bookingConfirmed";

import RiderSetupScreen
  from "../screens/rider/riderSetupScreen";

import TrackDriverScreen
  from "../screens/rider/trackDriverScreen";

import RiderSettingsScreen
  from "../screens/rider/riderSettingsScreen";


// ======================================================
// RIDE TYPE
// ======================================================

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


// ======================================================
// NAVIGATION TYPES
// ======================================================

export type RootStackParamList = {

  // ================= MAIN =================

  Welcome: undefined;

  RoleSelection: undefined;

  // ================= RIDER AUTH =================

  RiderLogin: undefined;

  RiderRegister: undefined;

  SignUp: undefined;

  // ================= DRIVER AUTH =================

  DriverLogin: undefined;

  DriverRegister: undefined;

  // ================= EMAIL VERIFICATION =================

  EmailVerification: {

    email: string;

    token?: string;

    role: "rider" | "driver";

  };

  // ================= PASSWORD RESET =================

  ForgotPassword: {

    role: "rider" | "driver";

  };

  PasswordResetSent: {

    role: "rider" | "driver";

    email: string;

  };

  ResetPassword: {

    token: string;

    role: "rider" | "driver";

  };

  // ================= RIDER =================

  RiderHome: undefined;

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

  TrackDriver: undefined;

  TripReceipt: undefined;

  RiderEditInformation: undefined;

  RiderSettings: undefined;

  // ================= DRIVER =================

  DriverHome: undefined;

  DriverEditInformation: undefined;

  RiderRequests: undefined;

  RiderRequestDetails: {

    rider: {

      name: string;

      pickup: string;

      destination: string;

      pickupTime: string;

      distance: string;

      routeMatch: string;

      passengers: number;

      gender: string;

      offer: string;

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

  DriverProfile: undefined;

  DriverSettings: undefined;

  // ================= ADMIN =================

  AdminLogin: undefined;

};


// ======================================================
// STACK NAVIGATOR
// ======================================================

const Stack =
  createNativeStackNavigator<
    RootStackParamList
  >();


// ======================================================
// APP NAVIGATOR
// ======================================================

export default function AppNavigator() {

  const [loading, setLoading] =
    useState(true);

  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>(
      "Welcome"
    );


  // ======================================================
  // CHECK EXISTING LOGIN SESSION
  // ======================================================

  useEffect(() => {

    const checkSession = async () => {

      try {

        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();


        // ================================================
        // NO SESSION
        // ================================================

        if (!session?.user) {

          setInitialRoute(
            "Welcome"
          );

          setLoading(
            false
          );

          return;

        }


        // ================================================
        // GET USER PROFILE
        // ================================================

        const {
          data: profile,
          error,
        } =
          await supabase
            .from("profiles")
            .select("role")
            .eq(
              "id",
              session.user.id
            )
            .single();


        if (error) {

          console.error(
            "Error loading user profile:",
            error.message
          );

          setInitialRoute(
            "Welcome"
          );

          setLoading(
            false
          );

          return;

        }


        // ================================================
        // CHECK USER ROLE
        // ================================================

        if (
          profile?.role ===
          "rider"
        ) {

          console.log(
            "Existing rider session found."
          );

          setInitialRoute(
            "RiderHome"
          );

        }

        else if (
          profile?.role ===
          "driver"
        ) {

          console.log(
            "Existing driver session found."
          );

          setInitialRoute(
            "DriverHome"
          );

        }

        else {

          console.log(
            "No valid user role found."
          );

          setInitialRoute(
            "Welcome"
          );

        }

      }

      catch (error) {

        console.error(
          "Session check error:",
          error
        );

        setInitialRoute(
          "Welcome"
        );

      }

      finally {

        setLoading(
          false
        );

      }

    };


    checkSession();

  }, []);


  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (loading) {

    return (

      <View
        style={{
          flex: 1,

          backgroundColor:
            Colors.background,

          justifyContent:
            "center",

          alignItems:
            "center",
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


  // ======================================================
  // NAVIGATION
  // ======================================================

  return (

    <NavigationContainer>

      <Stack.Navigator
        key={
          initialRoute
        }

        initialRouteName={
          initialRoute
        }

        screenOptions={{
          headerShown:
            false,
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

        <Stack.Screen
          name="EmailVerification"
          component={
            EmailVerificationScreen
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
          name="TrackDriver"
          component={
            TrackDriverScreen
          }
        />

        <Stack.Screen
          name="RiderEditInformation"
          component={
            RiderSetupScreen
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
          name="RideOfferConfirmation"
          component={
            RideOfferConfirmationScreen
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