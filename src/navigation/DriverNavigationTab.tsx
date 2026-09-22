
import React from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  Ionicons,
} from "@expo/vector-icons";

import DriverHomeScreen from "../screens/driver/driverHomeScreen";

import ActiveTripScreen from "../screens/driver/activeTrip";

import ViewMyRideScreen from "../screens/driver/viewMyRide";

import DriverProfileScreen from "../screens/driver/driverProfile";

import Colors from "../constants/colors";


const Tab = createBottomTabNavigator();


export default function DriverNavigationTab() {

  return (

    <Tab.Navigator

      screenOptions={({ route }) => ({

        headerShown: false,

        tabBarActiveTintColor:
          Colors.driver,

        tabBarInactiveTintColor:
          Colors.textSecondary,

        tabBarStyle: {

          height: 70,

          paddingBottom: 8,

          paddingTop: 8,

          backgroundColor:
            Colors.white,

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

          let iconName:
            keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {

            iconName = "home";

          } else if (
            route.name === "Activity"
          ) {

            iconName = "pulse";

          } else if (
            route.name === "Past Trips"
          ) {

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

      <Tab.Screen

        name="Home"

        component={DriverHomeScreen}

      />


      <Tab.Screen

        name="Activity"

        component={ActiveTripScreen}

      />


      <Tab.Screen

        name="Past Trips"

        component={ViewMyRideScreen}

      />


      <Tab.Screen

        name="Account"

        component={DriverProfileScreen}

      />

    </Tab.Navigator>

  );

}
