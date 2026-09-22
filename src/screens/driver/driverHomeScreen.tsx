
import React, { useEffect, useState } from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

import { supabase } from "../../lib/supabaseClient";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList
>;

type DriverUser = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  licenceNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  registrationNumber?: string;
  availableSeats?: number;
};

export default function DriverHomeScreen() {

  const navigation = useNavigation<NavigationProp>();

  const [user, setUser] = useState<DriverUser | null>(null);

  useEffect(() => {

    const loadDriver = async () => {

      try {

        // Get the currently logged-in Supabase user
        const {
          data: {
            user: authUser,
          },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error(
            "Error getting driver account:",
            authError.message
          );
          return;
        }

        if (!authUser) {
          console.error("No logged-in driver found.");
          return;
        }

        // Get driver information from profiles
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "first_name, last_name, phone_number, role"
          )
          .eq("id", authUser.id)
          .single();

        if (profileError) {
          console.error(
            "Error loading driver profile:",
            profileError.message
          );
          return;
        }

        // Get driver-specific information
        const {
          data: driverProfile,
          error: driverProfileError,
        } = await supabase
          .from("driver_profiles")
          .select(
            "licence_number, vehicle_make, vehicle_model, registration_number, available_seats"
          )
          .eq("id", authUser.id)
          .single();

        if (driverProfileError) {
          console.error(
            "Error loading driver information:",
            driverProfileError.message
          );
          return;
        }

        // Combine Supabase Auth + profiles + driver_profiles
        setUser({
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: authUser.email || "",
          phoneNumber: profile.phone_number,
          role: profile.role,
          licenceNumber: driverProfile.licence_number,
          vehicleMake: driverProfile.vehicle_make,
          vehicleModel: driverProfile.vehicle_model,
          registrationNumber:
            driverProfile.registration_number,
          availableSeats:
            driverProfile.available_seats,
        });

      } catch (error) {

        console.error(
          "Error loading driver:",
          error
        );

      }

    };

    loadDriver();

  }, []);

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Header */}

        <Text style={styles.heading}>

          Good Morning, {user?.firstName || "Driver"} 👋

        </Text>

        <Text style={styles.subtitle}>

          Ready to start driving today?

        </Text>


        {/* Driver Status */}

        <View style={styles.statusCard}>

          <View style={styles.statusLeft}>

            <View style={styles.onlineDot} />

            <View>

              <Text style={styles.statusTitle}>

                You're Online

              </Text>

              <Text style={styles.statusSubtitle}>

                Available to receive ride requests

              </Text>

            </View>

          </View>

          <Ionicons
            name="radio"
            size={30}
            color={Colors.driver}
          />

        </View>


        {/* Driver Information */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>

            Driver Information

          </Text>

          <View style={styles.infoRow}>

            <Ionicons
              name="person"
              size={22}
              color={Colors.driver}
            />

            <View style={styles.infoDetails}>

              <Text style={styles.infoLabel}>

                Name

              </Text>

              <Text style={styles.infoValue}>

                {user?.firstName} {user?.lastName}

              </Text>

            </View>

          </View>

          <View style={styles.infoRow}>

            <Ionicons
              name="mail"
              size={22}
              color={Colors.driver}
            />

            <View style={styles.infoDetails}>

              <Text style={styles.infoLabel}>

                Email

              </Text>

              <Text style={styles.infoValue}>

                {user?.email}

              </Text>

            </View>

          </View>

          <View style={styles.infoRow}>

            <Ionicons
              name="call"
              size={22}
              color={Colors.driver}
            />

            <View style={styles.infoDetails}>

              <Text style={styles.infoLabel}>

                Phone

              </Text>

              <Text style={styles.infoValue}>

                {user?.phoneNumber}

              </Text>

            </View>

          </View>

          <View style={styles.infoRow}>

            <Ionicons
              name="card"
              size={22}
              color={Colors.driver}
            />

            <View style={styles.infoDetails}>

              <Text style={styles.infoLabel}>

                Licence Number

              </Text>

              <Text style={styles.infoValue}>

                {user?.licenceNumber || "Not provided"}

              </Text>

            </View>

          </View>

        </View>


        {/* Vehicle Information */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>

            Vehicle Information

          </Text>

          <View style={styles.vehicleHeader}>

            <Ionicons
              name="car-sport"
              size={40}
              color={Colors.driver}
            />

            <View style={{ marginLeft: 15 }}>

              <Text style={styles.vehicleName}>

                {user?.vehicleMake || "Vehicle"}{" "}
                {user?.vehicleModel || ""}

              </Text>

              <Text style={styles.vehicleText}>

                Registration:{" "}
                {user?.registrationNumber || "Not provided"}

              </Text>

              <Text style={styles.vehicleText}>

                Seats Available:{" "}
                {user?.availableSeats ?? "Not provided"}

              </Text>

            </View>

          </View>

        </View>


        {/* Today's Ride */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>

            Today's Ride

          </Text>

          <Text style={styles.emptyText}>

            No ride scheduled yet.

          </Text>

        </View>


        {/* Earnings */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>

            Earnings

          </Text>

          <View style={styles.earningRow}>

            <Ionicons
              name="wallet"
              size={40}
              color={Colors.driver}
            />

            <View style={{ marginLeft: 15 }}>

              <Text style={styles.earningAmount}>

                R0

              </Text>

              <Text style={styles.vehicleText}>

                Today's Earnings

              </Text>

            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>

            <View>

              <Text style={styles.smallHeading}>

                Trips

              </Text>

              <Text style={styles.smallValue}>

                0

              </Text>

            </View>

            <View>

              <Text style={styles.smallHeading}>

                Weekly

              </Text>

              <Text style={styles.smallValue}>

                R0

              </Text>

            </View>

          </View>

        </View>


        {/* Quick Statistics */}

        <Text style={styles.sectionTitle}>

          Quick Statistics

        </Text>

        <View style={styles.quickStats}>

          <View style={styles.statCard}>

            <Ionicons
              name="star"
              size={28}
              color="#F59E0B"
            />

            <Text style={styles.statValue}>

              -

            </Text>

            <Text style={styles.statLabel}>

              Rating

            </Text>

          </View>

          <View style={styles.statCard}>

            <Ionicons
              name="car"
              size={28}
              color={Colors.driver}
            />

            <Text style={styles.statValue}>

              0

            </Text>

            <Text style={styles.statLabel}>

              Trips

            </Text>

          </View>

          <View style={styles.statCard}>

            <Ionicons
              name="people"
              size={28}
              color={Colors.driver}
            />

            <Text style={styles.statValue}>

              0

            </Text>

            <Text style={styles.statLabel}>

              Riders

            </Text>

          </View>

        </View>


        {/* Upcoming Ride */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>

            Upcoming Ride

          </Text>

          <Text style={styles.emptyText}>

            No upcoming rides.

          </Text>

        </View>


        {/* Buttons */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate("RiderRequests")
          }
        >

          <Ionicons
            name="people"
            size={22}
            color={Colors.white}
          />

          <Text style={styles.buttonText}>

            View Rider Requests

          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate("CreateRideOffer")
          }
        >

          <Ionicons
            name="add-circle"
            size={22}
            color={Colors.driver}
          />

          <Text style={styles.secondaryButtonText}>

            Create Ride Offer

          </Text>

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: 22,
    paddingBottom: 40,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 10,
  },

  subtitle: {
    color: Colors.textSecondary,
    marginTop: 5,
    marginBottom: 25,
    fontSize: 15,
  },

  /* ---------- Status ---------- */

  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    marginRight: 15,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },

  statusSubtitle: {
    marginTop: 4,
    color: Colors.textSecondary,
    fontSize: 14,
  },

  /* ---------- Cards ---------- */

  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 16,
  },

  /* ---------- Driver Information ---------- */

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  infoDetails: {
    marginLeft: 12,
    flex: 1,
  },

  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },

  infoValue: {
    marginTop: 3,
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  /* ---------- Vehicle ---------- */

  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  vehicleName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },

  vehicleText: {
    marginTop: 5,
    color: Colors.textSecondary,
    fontSize: 15,
  },

  /* ---------- Empty Information ---------- */

  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },

  /* ---------- Earnings ---------- */

  earningRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  earningAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.driver,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  smallHeading: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  smallValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },

  /* ---------- Quick Stats ---------- */

  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  statCard: {
    backgroundColor: Colors.white,
    width: "31%",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    elevation: 4,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 10,
  },

  statLabel: {
    color: Colors.textSecondary,
    marginTop: 6,
    fontSize: 14,
  },

  /* ---------- Buttons ---------- */

  primaryButton: {
    height: 58,
    backgroundColor: Colors.driver,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 15,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  secondaryButton: {
    height: 58,
    borderWidth: 2,
    borderColor: Colors.driver,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 20,
  },

  secondaryButtonText: {
    color: Colors.driver,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

});
