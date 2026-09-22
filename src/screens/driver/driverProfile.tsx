import React, { useEffect, useState } from "react";


import {
  Alert,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/colors";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import { supabase } from "../../lib/supabaseClient";


// ==================================================
// DRIVER USER TYPE
// ==================================================

type DriverUser = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licenceNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  registrationNumber?: string;
  availableSeats?: number;
};


// ==================================================
// SCREEN
// ==================================================

export default function DriverProfileScreen() {

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [driver, setDriver] =
    useState<DriverUser | null>(null);


  // ==================================================
  // LOAD DRIVER
  // ==================================================

  useEffect(() => {

    const loadDriver = async () => {

      try {

        // ==================================================
        // GET LOGGED-IN AUTH USER
        // ==================================================

        const {
          data: {
            user: authUser,
          },
          error: authError,
        } =
          await supabase.auth.getUser();


        if (authError) {

          console.error(
            "Error getting driver:",
            authError.message
          );

          return;
        }


        if (!authUser) {

          console.error(
            "No logged-in driver found."
          );

          return;
        }


        console.log(
          "Loading driver profile:",
          authUser.id
        );


        // ==================================================
        // GET PERSONAL PROFILE
        // ==================================================

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select(
              "first_name, last_name, phone_number, role"
            )
            .eq(
              "id",
              authUser.id
            )
            .single();


        if (profileError) {

          console.error(
            "Error loading driver profile:",
            profileError.message
          );

          return;
        }


        // ==================================================
        // GET DRIVER INFORMATION
        // ==================================================

        const {
          data: driverProfile,
          error: driverProfileError,
        } =
          await supabase
            .from("driver_profiles")
            .select(
              "licence_number, vehicle_make, vehicle_model, registration_number, available_seats"
            )
            .eq(
              "id",
              authUser.id
            )
            .single();


        if (driverProfileError) {

          console.error(
            "Error loading driver information:",
            driverProfileError.message
          );

          return;
        }


        // ==================================================
        // COMBINE DRIVER INFORMATION
        // ==================================================

        setDriver({

          firstName:
            profile.first_name,

          lastName:
            profile.last_name,

          email:
            authUser.email || "",

          phoneNumber:
            profile.phone_number,

          licenceNumber:
            driverProfile.licence_number,

          vehicleMake:
            driverProfile.vehicle_make,

          vehicleModel:
            driverProfile.vehicle_model,

          registrationNumber:
            driverProfile.registration_number,

          availableSeats:
            driverProfile.available_seats,

        });


        console.log(
          "Driver profile loaded successfully."
        );

      } catch (error) {

        console.error(
          "Error loading driver:",
          error
        );

      }

    };


    loadDriver();

  }, []);


  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {

    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Log Out",
          style: "destructive",

          onPress: async () => {

            try {

              const {
                error,
              } =
                await supabase.auth.signOut();


              if (error) {

                console.error(
                  "Logout error:",
                  error.message
                );

                Alert.alert(
                  "Logout Failed",
                  error.message
                );

                return;
              }


              navigation.navigate(
                "DriverLogin"
              );

            } catch (error) {

              console.error(
                "Logout error:",
                error
              );

            }

          },

        },

      ],
    );

  };


  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ================= HEADER ================= */}

        <Text style={styles.heading}>
          Account
        </Text>

        <Text style={styles.subtitle}>
          Manage your driver account.
        </Text>


        {/* ================= DRIVER PROFILE ================= */}

        <View style={styles.profileCard}>

          <View style={styles.profileTop}>

            <View style={styles.profileCircle}>

              <Ionicons
                name="person"
                size={45}
                color={Colors.driver}
              />

            </View>


            <View style={styles.profileInfo}>

              <Text style={styles.name}>

                {driver?.firstName || "Driver"}{" "}

                {driver?.lastName || ""}

              </Text>


              <Text style={styles.email}>

                {driver?.email ||
                  "No email available"}

              </Text>

            </View>

          </View>


          {/* Phone */}

          <View style={styles.profileRow}>

            <Ionicons
              name="call-outline"
              size={21}
              color={Colors.driver}
            />

            <Text style={styles.profileText}>

              {driver?.phoneNumber ||
                "No phone number available"}

            </Text>

          </View>


          {/* Rating */}

          <View style={styles.ratingRow}>

            <Ionicons
              name="star"
              size={21}
              color="#F59E0B"
            />

            <Text style={styles.rating}>
              -
            </Text>

            <Text style={styles.ratingLabel}>
              Driver Rating
            </Text>

          </View>

        </View>


        {/* ================= ACCOUNT ================= */}

        <Text style={styles.sectionTitle}>
          Account
        </Text>


        <View style={styles.card}>

          <AccountOption
            icon="create-outline"
            title="Edit Information"
            description="Update your personal and vehicle information"
            onPress={() =>
              navigation.navigate(
                "DriverEditInformation"
              )
            }
          />


          <AccountOption
            icon="settings-outline"
            title="Settings"
            description="Manage your app preferences"
            onPress={() =>
              navigation.navigate(
                "DriverSettings"
              )
            }
          />


          <AccountOption
            icon="wallet-outline"
            title="Earnings & Payments"
            description="View your earnings and payment history"
          />


          <AccountOption
            icon="alert-circle-outline"
            title="Report an Issue"
            description="Report a problem with a ride or the app"
          />


          <AccountOption
            icon="help-circle-outline"
            title="Help & Support"
            description="Get help with RideConnect"
            last
          />

        </View>


        {/* ================= LOGOUT ================= */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >

          <Ionicons
            name="log-out-outline"
            size={22}
            color="#DC2626"
          />

          <Text style={styles.logoutText}>
            Log Out
          </Text>

        </TouchableOpacity>


      </ScrollView>

    </SafeAreaView>

  );
}


// ==================================================
// ACCOUNT OPTION
// ==================================================

interface AccountOptionProps {

  icon: keyof typeof Ionicons.glyphMap;

  title: string;

  description: string;

  onPress?: () => void;

  last?: boolean;

}


function AccountOption({

  icon,

  title,

  description,

  onPress,

  last = false,

}: AccountOptionProps) {

  return (

    <TouchableOpacity
      style={[
        styles.option,
        last && styles.lastOption,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >

      <View style={styles.optionIcon}>

        <Ionicons
          name={icon}
          size={23}
          color={Colors.driver}
        />

      </View>


      <View style={styles.optionContent}>

        <Text style={styles.optionTitle}>
          {title}
        </Text>

        <Text style={styles.optionDescription}>
          {description}
        </Text>

      </View>


      <Ionicons
        name="chevron-forward"
        size={21}
        color={Colors.textSecondary}
      />

    </TouchableOpacity>

  );
}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  /* ================= CONTAINER ================= */

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },


  /* ================= HEADER ================= */

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 10,
  },

  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 5,
    marginBottom: 22,
  },


  /* ================= PROFILE ================= */

  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    marginBottom: 28,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
  },

  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 5,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
  },

  profileText: {
    fontSize: 15,
    color: Colors.primary,
    marginLeft: 10,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  rating: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginLeft: 8,
  },

  ratingLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 5,
  },


  /* ================= ACCOUNT ================= */

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 14,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    elevation: 4,
    marginBottom: 25,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  lastOption: {
    borderBottomWidth: 0,
  },

  optionIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
  },

  optionContent: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },

  optionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },


  /* ================= LOGOUT ================= */

  logoutButton: {
    height: 55,
    borderWidth: 1.5,
    borderColor: "#DC2626",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  logoutText: {
    color: "#DC2626",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

});

