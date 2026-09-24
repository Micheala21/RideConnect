import React, { useState } from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import DriverHomeScreen from "../screens/driver/driverHomeScreen";

import ActiveTripScreen from "../screens/driver/activeTrip";

import ViewMyRideScreen from "../screens/driver/viewMyRide";

import Colors from "../constants/colors";

import { supabase } from "../lib/supabaseClient";

import type {
  RootStackParamList,
} from "./AppNavigator";


const Tab =
  createBottomTabNavigator();


export default function DriverNavigationTab() {

  const [menuVisible, setMenuVisible] =
    useState(false);

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();


  return (

    <View style={styles.container}>

      <Tab.Navigator

        screenOptions={({ route }) => ({

          // ================= HEADER =================

          headerShown: true,

          // Remove the page name
          headerTitle: "",

          headerTitleAlign: "center",

          headerTintColor:
            Colors.textPrimary,

          headerStyle: {
            backgroundColor:
              Colors.background,
              height:50
          },

          headerShadowVisible: false,


          // ================= HAMBURGER =================

          headerLeft: () => (

            <TouchableOpacity
              onPress={() =>
                setMenuVisible(true)
              }
              style={styles.menuButton}
            >

              <Ionicons
                name="menu"
                size={28}
                color={Colors.textPrimary}
              />

            </TouchableOpacity>

          ),


          // ================= TAB BAR =================

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

          tabBarIcon: ({
            color,
            size,
          }) => {

            let iconName:
              keyof typeof Ionicons.glyphMap;

            if (
              route.name === "Home"
            ) {

              iconName = "home";

            } else if (
              route.name === "Activity"
            ) {

              iconName = "pulse";

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

        {/* ================= HOME ================= */}

        <Tab.Screen
          name="Home"
          component={DriverHomeScreen}
        />


        {/* ================= ACTIVITY ================= */}

        <Tab.Screen
          name="Activity"
          component={ActiveTripScreen}
        />


        {/* ================= PAST TRIPS ================= */}

        <Tab.Screen
          name="Past Trips"
          component={ViewMyRideScreen}
        />

      </Tab.Navigator>


      {/* ==================================================
          DRIVER HAMBURGER MENU
      ================================================== */}

      <Modal

        visible={menuVisible}

        transparent={true}

        animationType="fade"

        onRequestClose={() =>
          setMenuVisible(false)
        }

      >

        <View style={styles.modalContainer}>

          {/* ================= OVERLAY ================= */}

          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() =>
              setMenuVisible(false)
            }
          />


          {/* ================= MENU ================= */}

          <View
            style={styles.menu}
          >

            {/* ================= PROFILE ================= */}

            <View
              style={styles.profileHeader}
            >

              <View
                style={styles.avatar}
              >

                <Ionicons
                  name="person"
                  size={30}
                  color={Colors.driver}
                />

              </View>


              <View
                style={styles.profileInfo}
              >

                <Text
                  style={styles.driverName}
                >
                  Driver
                </Text>


                <View
                  style={styles.statusRow}
                >

                  <View
                    style={styles.verifiedBadge}
                  >

                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color={Colors.driver}
                    />

                    <Text
                      style={styles.verifiedText}
                    >
                      Verified
                    </Text>

                  </View>


                  <View
                    style={styles.onlineStatus}
                  >

                    <View
                      style={styles.onlineDot}
                    />

                    <Text
                      style={styles.onlineText}
                    >
                      Online
                    </Text>

                  </View>

                </View>


                <Text
                  style={styles.roleText}
                >
                  Driver
                </Text>

              </View>


              <TouchableOpacity
                onPress={() =>
                  setMenuVisible(false)
                }
                style={styles.closeButton}
              >

                <Ionicons
                  name="close"
                  size={24}
                  color={Colors.textSecondary}
                />

              </TouchableOpacity>

            </View>


            {/* ================= DIVIDER ================= */}

            <View
              style={styles.divider}
            />


            {/* ================= NOTIFICATIONS ================= */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                setMenuVisible(false);

                // Notifications will be connected here.

              }}
            >

              <Ionicons
                name="notifications-outline"
                size={22}
                color={Colors.driver}
              />

              <Text
                style={styles.menuItemText}
              >
                Notifications
              </Text>

            </TouchableOpacity>


            {/* ================= EARNINGS ================= */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                setMenuVisible(false);

                // Earnings History will be connected here.

              }}
            >

              <Ionicons
                name="cash-outline"
                size={22}
                color={Colors.driver}
              />

              <Text
                style={styles.menuItemText}
              >
                Earnings History
              </Text>

            </TouchableOpacity>


            {/* ================= WALLET ================= */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                setMenuVisible(false);

                // Wallet will be connected here.

              }}
            >

              <Ionicons
                name="wallet-outline"
                size={22}
                color={Colors.driver}
              />

              <Text
                style={styles.menuItemText}
              >
                Wallet
              </Text>

            </TouchableOpacity>


            {/* ================= SCHEDULED TRIPS ================= */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                setMenuVisible(false);

                // Scheduled Trips will be connected here.

              }}
            >

              <Ionicons
                name="calendar-outline"
                size={22}
                color={Colors.driver}
              />

              <Text
                style={styles.menuItemText}
              >
                Scheduled Trips
              </Text>

            </TouchableOpacity>


            {/* ================= UPDATE INFORMATION ================= */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                setMenuVisible(false);

                navigation.navigate(
                  "DriverEditInformation"
                );

              }}
            >

              <Ionicons
                name="create-outline"
                size={22}
                color={Colors.driver}
              />

              <Text
                style={styles.menuItemText}
              >
                Update Information
              </Text>

            </TouchableOpacity>


            {/* ================= DIVIDER ================= */}

            <View
              style={styles.divider}
            />


            {/* ================= HELP ================= */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                setMenuVisible(false);

                // Help & Support will be connected here.

              }}
            >

              <Ionicons
                name="call-outline"
                size={22}
                color={Colors.driver}
              />

              <Text
                style={styles.menuItemText}
              >
                Help & Support
              </Text>

            </TouchableOpacity>


            {/* ================= SETTINGS ================= */}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {

                setMenuVisible(false);

                navigation.navigate(
                  "DriverSettings"
                );

              }}
            >

              <Ionicons
                name="settings-outline"
                size={22}
                color={Colors.driver}
              />

              <Text
                style={styles.menuItemText}
              >
                Settings
              </Text>

            </TouchableOpacity>


            {/* ================= BOTTOM ACTIONS ================= */}

            <View
              style={styles.bottomActions}
            >

              {/* ================= SWITCH TO RIDER ================= */}

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {

                  setMenuVisible(false);

                  navigation.navigate(
                    "RiderHome"
                  );

                }}
              >

                <Ionicons
                  name="swap-horizontal-outline"
                  size={20}
                  color={Colors.driver}
                />

                <Text
                  style={styles.switchButtonText}
                >
                  Switch to Rider
                </Text>

              </TouchableOpacity>


              {/* ================= LOGOUT ================= */}

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={async () => {

                  setMenuVisible(false);

                  const {
                    error,
                  } =
                    await supabase.auth.signOut();

                  if (error) {

                    console.error(
                      "Logout error:",
                      error.message
                    );

                    return;

                  }

                  navigation.navigate(
                    "SignUp"
                  );

                }}
              >

                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={Colors.white}
                />

                <Text
                  style={styles.logoutButtonText}
                >
                  Logout
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

    </View>

  );

}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },


  // ==================================================
  // HEADER
  // ==================================================

menuButton: {
  marginLeft: 18,
  marginTop:20,
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: Colors.white,
  alignItems: "center",
  justifyContent: "center",
},


  // ==================================================
  // MODAL
  // ==================================================

  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },

  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.35)",
  },


  // ==================================================
  // MENU
  // ==================================================

  menu: {
    width: "70%",
    height: "100%",
    backgroundColor:
      Colors.white,
    paddingTop: 55,
    paddingHorizontal: 20,
    elevation: 10,
  },


  // ==================================================
  // PROFILE
  // ==================================================

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor:
      Colors.driverLight,
    alignItems: "center",
    justifyContent: "center",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },

  driverName: {
    fontSize: 17,
    fontWeight: "800",
    color:
      Colors.textPrimary,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  verifiedText: {
    fontSize: 11,
    fontWeight: "600",
    color:
      Colors.driver,
    marginLeft: 3,
  },

  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor:
      Colors.success,
    marginRight: 4,
  },

  onlineText: {
    fontSize: 11,
    fontWeight: "600",
    color:
      Colors.success,
  },

  roleText: {
    fontSize: 11,
    color:
      Colors.textSecondary,
    marginTop: 3,
  },

  closeButton: {
    padding: 5,
  },


  // ==================================================
  // MENU ITEMS
  // ==================================================

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color:
      Colors.textPrimary,
    marginLeft: 14,
  },


  // ==================================================
  // DIVIDER
  // ==================================================

  divider: {
    height: 1,
    backgroundColor:
      Colors.border,
    marginVertical: 7,
  },


  // ==================================================
  // BOTTOM ACTIONS
  // ==================================================

  bottomActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: "auto",
    paddingTop: 15,
    paddingBottom: 20,
  },

  switchButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor:
      Colors.driver,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  switchButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color:
      Colors.driver,
    marginTop: 3,
    textAlign: "center",
  },

  logoutButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor:
      Colors.driver,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  logoutButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color:
      Colors.white,
    marginTop: 3,
    textAlign: "center",
  },

});