import React from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";


// ================= Main Screens =================

import WelcomeScreen from "../screens/welcomeScreen";
import RoleSelectionScreen from "../screens/roleSelectionScreen";



// ================= Rider Authentication =================

import RiderLoginScreen from "../screens/auth/rider/riderLoginScreen";
import RiderRegisterScreen from "../screens/auth/rider/riderRegisterScreen";



// ================= Driver Authentication =================

import DriverLoginScreen from "../screens/auth/driver/driverLoginScreen";
import DriverRegisterScreen from "../screens/auth/driver/driverRegisterScreen";



// ================= Driver Navigation =================

import DriverNavigationTab from "./DriverNavigationTab";



// ================= Driver Screens =================

import RiderRequestsScreen from "../screens/driver/riderRequestScreen";
import RiderRequestDetailsScreen from "../screens/driver/riderRequestDetails";

import CreateRideOfferScreen from "../screens/driver/createRideOffer";

import RideConfirmationScreen from "../screens/driver/rideConfirmationScreen";

import RideOfferConfirmationScreen from "../screens/driver/rideOfferConfirmation";

import ActiveTripScreen from "../screens/driver/activeTrip";

import ViewMyRideScreen from "../screens/driver/viewMyRide";

import DriverProfileScreen from "../screens/driver/driverProfile";



// ================= Admin =================

import AdminLoginScreen from "../screens/auth/admin/adminLoginScreen";



// ================= Rider Navigation =================

import RiderTabNavigator from "./RiderNavigationTab";



// ================= Rider Screens =================

import SearchResultsScreen from "../screens/rider/searchResults";
import RideDetailsScreen from "../screens/rider/rideDetails";
import BookingConfirmedScreen from "../screens/rider/bookingConfirmed";
import PaymentMethodScreen from "../screens/rider/paymentMethod";
import TrackDriverScreen from "../screens/rider/trackDriverScreen";
import TripReceiptScreen from "../screens/rider/tripReceiptScreen";





// ================= Navigation Types =================


export type RootStackParamList = {


  // Main

  Welcome: undefined;

  RoleSelection: undefined;



  // Rider Auth

  RiderLogin: undefined;

  RiderRegister: undefined;



  // Rider

  RiderHome: undefined;

  SearchResults: undefined;

  RideDetails: undefined;

  BookingConfirmed: undefined;

  PaymentMethod: undefined;

  TrackDriver: undefined;

  TripReceipt: undefined;



  // Driver Auth

  DriverLogin: undefined;

  DriverRegister: undefined;



  // Driver Navigation

  DriverHome: undefined;



  // Driver Screens


  RiderRequests: undefined;


  RiderRequestDetails:{
    rider:{
      name:string;
      pickup:string;
      destination:string;
      pickupTime:string;
      distance:string;
      routeMatch:string;
      passengers:number;
      gender:string;
      offer:string;
    };
  };


  CreateRideOffer:undefined;


  RideConfirmation:undefined;


  ActiveTrip:undefined;


  ViewMyRide:undefined;


  RideOfferConfirmation:undefined;


  DriverProfile:undefined;



  // Admin

  AdminLogin:undefined;

  AdminDashboard:undefined;


};





const Stack =
createNativeStackNavigator<RootStackParamList>();





export default function AppNavigator(){


return(

<NavigationContainer>


<Stack.Navigator

initialRouteName="Welcome"

screenOptions={{

headerShown:false,

animation:"slide_from_right",

}}

>


{/* ================= MAIN ================= */}


<Stack.Screen

name="Welcome"

component={WelcomeScreen}

/>


<Stack.Screen

name="RoleSelection"

component={RoleSelectionScreen}

/>




{/* ================= RIDER ================= */}


<Stack.Screen

name="RiderLogin"

component={RiderLoginScreen}

/>


<Stack.Screen

name="RiderRegister"

component={RiderRegisterScreen}

/>


<Stack.Screen

name="RiderHome"

component={RiderTabNavigator}

/>


<Stack.Screen

name="SearchResults"

component={SearchResultsScreen}

/>


<Stack.Screen

name="RideDetails"

component={RideDetailsScreen}

/>


<Stack.Screen

name="BookingConfirmed"

component={BookingConfirmedScreen}

/>


<Stack.Screen

name="PaymentMethod"

component={PaymentMethodScreen}

/>


<Stack.Screen

name="TrackDriver"

component={TrackDriverScreen}

/>


<Stack.Screen

name="TripReceipt"

component={TripReceiptScreen}

/>





{/* ================= DRIVER ================= */}



<Stack.Screen

name="DriverLogin"

component={DriverLoginScreen}

/>



<Stack.Screen

name="DriverRegister"

component={DriverRegisterScreen}

/>



{/* Driver Bottom Tabs */}

<Stack.Screen

name="DriverHome"

component={DriverNavigationTab}

/>



{/* Driver Pages */}


<Stack.Screen

name="RiderRequests"

component={RiderRequestsScreen}

/>


<Stack.Screen

name="RiderRequestDetails"

component={RiderRequestDetailsScreen}

/>


<Stack.Screen

name="CreateRideOffer"

component={CreateRideOfferScreen}

/>


<Stack.Screen

name="RideConfirmation"

component={RideConfirmationScreen}

/>


<Stack.Screen

name="ActiveTrip"

component={ActiveTripScreen}

/>


<Stack.Screen

name="ViewMyRide"

component={ViewMyRideScreen}

/>


<Stack.Screen

name="RideOfferConfirmation"

component={RideOfferConfirmationScreen}

/>


<Stack.Screen

name="DriverProfile"

component={DriverProfileScreen}

/>





{/* ================= ADMIN ================= */}


<Stack.Screen

name="AdminLogin"

component={AdminLoginScreen}

/>


</Stack.Navigator>


</NavigationContainer>


);


}