
import React from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  Ionicons,
} from "@expo/vector-icons";

import Colors from "../constants/colors";


// Rider Screens

import RiderHomeScreen
from "../screens/rider/riderHomeScreen";

import TrackDriverScreen
from "../screens/rider/activeRide";

import TripReceiptScreen
from "../screens/rider/tripHistoryScreen";

import RiderProfileScreen
from "../screens/rider/riderProfileScreen";


const Tab = createBottomTabNavigator();


export default function RiderTabNavigator() {

  return (

    <Tab.Navigator

      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarActiveTintColor: Colors.rider,

        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: Colors.white,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          textAlign: "center",
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarIcon: ({ color, size }) => {

          let iconName: keyof typeof Ionicons.glyphMap;


          if (route.name === "Home") {

            iconName = "home";

          } else if (route.name === "Active Trip") {

            iconName = "navigate";

          } else if (route.name === "Past Trips") {

            iconName = "time";

          } else {

            iconName = "person";

          }


          return (

            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />

          );

        },

      })}

    >

      {/* ================= HOME ================= */}

      <Tab.Screen
        name="Home"
        component={RiderHomeScreen}
      />


      {/* ================= ACTIVE TRIP ================= */}

      <Tab.Screen
        name="Active Trip"
        component={TrackDriverScreen}
      />


      {/* ================= PAST TRIPS ================= */}

      <Tab.Screen
        name="Past Trips"
        component={TripReceiptScreen}
      />


      {/* ================= ACCOUNT ================= */}

      <Tab.Screen
        name="Account"
        component={RiderProfileScreen}
      />

    </Tab.Navigator>

  );

}
