import React, {
  useEffect,
  useState,
} from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/AppNavigator";

import Colors from "../../constants/colors";

import { supabase } from "../../lib/supabaseClient";


type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;


type Ride = {
  id: string;
  pickup_location: string;
  destination: string;
  ride_date: string;
  departure_time: string;
  available_seats: number; 
  fare: number;
  notes: string | null;
  status: string;
};


export default function ActiveRideScreen() {

  const navigation =
    useNavigation<NavigationProp>();

  const [ride, setRide] =
    useState<Ride | null>(null);

  const [loading, setLoading] =
    useState(true);


  // ==================================================
  // LOAD DRIVER'S RIDE
  // ==================================================

  useEffect(() => {

    const loadRide = async () => {

      try {

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();


        if (userError || !user) {

          console.error(
            "User error:",
            userError?.message
          );

          Alert.alert(
            "Error",
            "Unable to identify the driver."
          );

          return;

        }


        const {
          data,
          error,
        } =
          await supabase
            .from("rides")
            .select(
              `
                id,
                pickup_location,
                destination,
                ride_date,
                departure_time,
                available_seats,
                fare,
                notes,
                status
              `
            )
            .eq(
              "driver_id",
              user.id
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            )
            .limit(1)
            .single();


        if (error) {

          if (
            error.code === "PGRST116"
          ) {

            setRide(null);

            return;

          }


          console.error(
            "Ride loading error:",
            error.message
          );

          Alert.alert(
            "Error",
            "Unable to load your ride."
          );

          return;

        }


        setRide(data);

      } catch (error) {

        console.error(
          "Active ride error:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    loadRide();

  }, []);


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (
    date: string
  ) => {

    const parts =
      date.split("-");

    if (
      parts.length !== 3
    ) {
      return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;

  };


  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (
    time: string
  ) => {

    if (!time) {
      return time;
    }

    const parts =
      time.split(":");

    if (
      parts.length < 2
    ) {
      return time;
    }

    const hours =
      Number(parts[0]);

    const minutes =
      parts[1];

    const period =
      hours >= 12
        ? "PM"
        : "AM";

    const formattedHour =
      hours % 12 || 12;

    return `${formattedHour}:${minutes} ${period}`;

  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <SafeAreaView style={styles.container}>

        <View style={styles.loadingContainer}>

          <ActivityIndicator
            size="large"
            color={Colors.driver}
          />

          <Text style={styles.loadingText}>
            Loading ride activity...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  return (

    <SafeAreaView style={styles.container}>

      <View style={styles.content}>

        {/* ================= BACK BUTTON ================= */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate(
              "DriverHome"
            )
          }
          activeOpacity={0.7}
        >

          <Ionicons
            name="arrow-back"
            size={28}
            color={Colors.primary}
          />

        </TouchableOpacity>


        {/* ================= HEADER ================= */}

        <Text style={styles.heading}>
          Activity
        </Text>

        <Text style={styles.subtitle}>
          Manage your current ride activity.
        </Text>


        {/* ================= CURRENT ACTIVITY ================= */}

        <View style={styles.card}>

          <View style={styles.iconContainer}>

            <Ionicons
              name="car-outline"
              size={42}
              color={Colors.driver}
            />

          </View>


          {ride ? (

            <>

              <Text style={styles.title}>
                Ride Offer Active
              </Text>


              <Text style={styles.description}>
                Your ride is available for riders to book.
              </Text>


              {/* ================= RIDE INFORMATION ================= */}

              <View style={styles.rideInfo}>

                {/* Pickup */}

                <View style={styles.infoRow}>

                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={Colors.driver}
                  />

                  <View style={styles.infoContent}>

                    <Text style={styles.infoLabel}>
                      Pickup
                    </Text>

                    <Text style={styles.infoValue}>
                      {ride.pickup_location}
                    </Text>

                  </View>

                </View>


                {/* Destination */}

                <View style={styles.infoRow}>

                  <Ionicons
                    name="flag-outline"
                    size={20}
                    color={Colors.driver}
                  />

                  <View style={styles.infoContent}>

                    <Text style={styles.infoLabel}>
                      Destination
                    </Text>

                    <Text style={styles.infoValue}>
                      {ride.destination}
                    </Text>

                  </View>

                </View>


                {/* Date */}

                <View style={styles.infoRow}>

                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={Colors.driver}
                  />

                  <View style={styles.infoContent}>

                    <Text style={styles.infoLabel}>
                      Date
                    </Text>

                    <Text style={styles.infoValue}>
                      {formatDate(
                        ride.ride_date
                      )}
                    </Text>

                  </View>

                </View>


                {/* Departure */}

                <View style={styles.infoRow}>

                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={Colors.driver}
                  />

                  <View style={styles.infoContent}>

                    <Text style={styles.infoLabel}>
                      Departure
                    </Text>

                    <Text style={styles.infoValue}>
                      {formatTime(
                        ride.departure_time
                      )}
                    </Text>

                  </View>

                </View>


                {/* Seats */}

                <View style={styles.infoRow}>

                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={Colors.driver}
                  />

                  <View style={styles.infoContent}>

                    <Text style={styles.infoLabel}>
                      Available Seats
                    </Text>

                    <Text style={styles.infoValue}>
                      {ride.available_seats}
                    </Text>

                  </View>

                </View>


                {/* Price */}

                <View style={styles.infoRow}>

                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={Colors.driver}
                  />

                  <View style={styles.infoContent}>

                    <Text style={styles.infoLabel}>
                      Price Per Rider
                    </Text>

                    <Text style={styles.infoValue}>
                      R{ride.fare}
                    </Text>

                  </View>

                </View>

              </View>


              {/* ================= VIEW REQUESTS ================= */}

              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.navigate(
                    "RiderRequests"
                  )
                }
                activeOpacity={0.8}
              >

                <Ionicons
                  name="people-outline"
                  size={21}
                  color={Colors.white}
                />

                <Text style={styles.buttonText}>
                  View Ride Requests
                </Text>

              </TouchableOpacity>

            </>

          ) : (

            <>

              <Text style={styles.title}>
                No Active Ride
              </Text>


              <Text style={styles.description}>
                You currently don't have an active ride.
                New ride requests and current trip activity
                will appear here.
              </Text>


              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.navigate(
                    "RiderRequests"
                  )
                }
                activeOpacity={0.8}
              >

                <Ionicons
                  name="people-outline"
                  size={21}
                  color={Colors.white}
                />

                <Text style={styles.buttonText}>
                  View Ride Requests
                </Text>

              </TouchableOpacity>

            </>

          )}

        </View>


        {/* ================= ACTIVITY OPTIONS ================= */}

        <Text style={styles.sectionTitle}>
          Ride Activity
        </Text>


        {/* ================= RIDE REQUESTS ================= */}

        <TouchableOpacity
          style={styles.activityCard}
          onPress={() =>
            navigation.navigate(
              "RiderRequests"
            )
          }
          activeOpacity={0.7}
        >

          <View style={styles.activityIcon}>

            <Ionicons
              name="people-outline"
              size={24}
              color={Colors.primary}
            />

          </View>


          <View style={styles.activityText}>

            <Text style={styles.activityTitle}>
              Ride Requests
            </Text>

            <Text style={styles.activityDescription}>
              View and manage incoming ride requests.
            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.textSecondary}
          />

        </TouchableOpacity>


        {/* ================= CREATE RIDE ================= */}

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() =>
            navigation.navigate(
              "CreateRideOffer"
            )
          }
          activeOpacity={0.7}
        >

          <View style={styles.optionIcon}>

            <Ionicons
              name="add-circle-outline"
              size={25}
              color={Colors.driver}
            />

          </View>


          <View style={styles.optionContent}>

            <Text style={styles.optionTitle}>
              Create Ride Offer
            </Text>

            <Text style={styles.optionText}>
              Create a ride and allow riders to request a seat.
            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.textSecondary}
          />

        </TouchableOpacity>


      </View>

    </SafeAreaView>

  );

}


const styles = StyleSheet.create({

  /* ================= CONTAINER ================= */

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },


  /* ================= LOADING ================= */

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 12,
  },


  /* ================= BACK BUTTON ================= */

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
  },


  /* ================= HEADER ================= */

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
  },

  subtitle: {
    fontSize: 15,
    marginTop: 6,
    marginBottom: 25,
    color: Colors.textSecondary,
  },


  /* ================= MAIN ACTIVITY CARD ================= */

  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    elevation: 4,
  },

  iconContainer: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 18,
    textAlign: "center",
  },

  description: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },


  /* ================= RIDE INFORMATION ================= */

  rideInfo: {
    width: "100%",
    marginTop: 20,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 2,
  },


  /* ================= BUTTON ================= */

  button: {
    width: "100%",
    height: 54,
    backgroundColor: Colors.driver,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 22,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },


  /* ================= ACTIVITY OPTIONS ================= */

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 28,
    marginBottom: 14,
  },

  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
  },

  activityIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  activityText: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },

  activityDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },


  /* ================= OPTION CARD ================= */

  optionCard: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 17,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },

  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
  },

  optionContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },

  optionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },

});
