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


const Tab = createBottomTabNavigator();


export default function RiderTabNavigator() {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor:
          Colors.rider,

        tabBarInactiveTintColor:
          "#94A3B8",

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

        tabBarIcon: ({
          color,
          size,
        }) => {

          let iconName:
            keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {

            iconName = "home";

          } else if (
            route.name === "Active Trips"
          ) {

            iconName = "navigate";

          } else {

            iconName = "time";

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

      <Tab.Screen
        name="Home"
        component={RiderHomeScreen}
      />

      <Tab.Screen
        name="Active Trips"
        component={TrackDriverScreen}
      />

      <Tab.Screen
        name="Past Trips"
        component={TripReceiptScreen}
      />

    </Tab.Navigator>
  );
}