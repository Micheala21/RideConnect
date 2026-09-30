import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import { supabase } from "../../lib/supabaseClient";

import { RootStackParamList } from "../../navigation/AppNavigator";


type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ViewMyRide"
>;


type Ride = {
  id: string;
  pickup_location: string;
  destination: string;
  departure_time: string;
  ride_date: string;
  available_seats: number;
  fare: number;
  status: string;
  created_at: string;
};


export default function ViewMyRideScreen() {

  const navigation =
    useNavigation<NavigationProp>();

  const [rides, setRides] = useState<Ride[]>([]);

  const [loading, setLoading] =
    useState(true);


  /* ================= LOAD PAST RIDES ================= */

  const loadPastRides = async () => {

    try {

      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();


      if (userError) {

        console.error(
          "GET USER ERROR:",
          userError
        );

        return;
      }


      if (!user) {

        console.log(
          "NO DRIVER LOGGED IN"
        );

        return;
      }


      console.log(
        "LOADING PAST RIDES FOR DRIVER:",
        user.id
      );


      const {
        data,
        error,
      } = await supabase
        .from("rides")
        .select(`
          id,
          pickup_location,
          destination,
          departure_time,
          ride_date,
          available_seats,
          fare,
          status,
          created_at
        `)
        .eq("driver_id", user.id)
        .eq("status", "completed")
        .order("created_at", {
          ascending: false,
        });


      if (error) {

        console.error(
          "LOAD PAST RIDES ERROR:",
          error
        );

        return;
      }


      console.log(
        "PAST RIDES:",
        data
      );


      setRides(data || []);

    } catch (error) {

      console.error(
        "PAST RIDES ERROR:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  /*
   * Reload every time the driver
   * opens this screen.
   */
  useFocusEffect(
    useCallback(() => {

      loadPastRides();

    }, [])
  );


  /* ================= STATISTICS ================= */

  const completedTrips =
    rides.length;


  const totalEarnings =
    rides.reduce(
      (total, ride) =>
        total + Number(ride.fare || 0),
      0
    );


  /* ================= LOADING ================= */

  if (loading) {

    return (

      <SafeAreaView
        style={styles.container}
      >

        <View
          style={styles.loadingContainer}
        >

          <ActivityIndicator
            size="large"
            color={Colors.driver}
          />

          <Text
            style={styles.loadingText}
          >
            Loading past trips...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

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
            size={26}
            color={Colors.driver}
          />

        </TouchableOpacity>


        {/* ================= HEADER ================= */}

        <View style={styles.header}>

          <View style={styles.headerIcon}>

            <Ionicons
              name="time-outline"
              size={38}
              color={Colors.driver}
            />

          </View>

          <Text style={styles.heading}>
            Past Trips
          </Text>

          <Text style={styles.subtitle}>
            View your completed rides and trip history.
          </Text>

        </View>


        {/* ================= PAST RIDES ================= */}

        {rides.length === 0 ? (

          <View style={styles.emptyCard}>

            <View style={styles.emptyIcon}>

              <Ionicons
                name="car-outline"
                size={42}
                color={Colors.driver}
              />

            </View>


            <Text style={styles.emptyTitle}>
              No Past Trips
            </Text>


            <Text style={styles.emptyText}>
              You haven't completed any rides yet.
              Your completed trips will appear here.
            </Text>

          </View>

        ) : (

          <View>

            {rides.map((ride) => (

              <View
                key={ride.id}
                style={styles.rideCard}
              >

                {/* RIDE HEADER */}

                <View
                  style={styles.rideHeader}
                >

                  <View
                    style={styles.rideIcon}
                  >

                    <Ionicons
                      name="car-outline"
                      size={24}
                      color={Colors.driver}
                    />

                  </View>

                  <View
                    style={styles.rideHeaderText}
                  >

                    <Text
                      style={styles.rideTitle}
                    >
                      Completed Ride
                    </Text>

                    <Text
                      style={styles.rideDate}
                    >
                      {ride.ride_date}
                    </Text>

                  </View>

                  <View
                    style={styles.completedBadge}
                  >

                    <Text
                      style={styles.completedBadgeText}
                    >
                      Completed
                    </Text>

                  </View>

                </View>


                {/* PICKUP */}

                <View
                  style={styles.locationRow}
                >

                  <Ionicons
                    name="location-outline"
                    size={21}
                    color={Colors.driver}
                  />

                  <View
                    style={styles.locationTextContainer}
                  >

                    <Text
                      style={styles.locationLabel}
                    >
                      Pickup
                    </Text>

                    <Text
                      style={styles.locationText}
                    >
                      {ride.pickup_location}
                    </Text>

                  </View>

                </View>


                {/* DESTINATION */}

                <View
                  style={styles.locationRow}
                >

                  <Ionicons
                    name="flag-outline"
                    size={21}
                    color={Colors.driver}
                  />

                  <View
                    style={styles.locationTextContainer}
                  >

                    <Text
                      style={styles.locationLabel}
                    >
                      Destination
                    </Text>

                    <Text
                      style={styles.locationText}
                    >
                      {ride.destination}
                    </Text>

                  </View>

                </View>


                {/* RIDE INFORMATION */}

                <View
                  style={styles.infoContainer}
                >

                  <View
                    style={styles.infoItem}
                  >

                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={Colors.driver}
                    />

                    <Text
                      style={styles.infoText}
                    >
                      {ride.departure_time}
                    </Text>

                  </View>


                  <View
                    style={styles.infoItem}
                  >

                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={Colors.driver}
                    />

                    <Text
                      style={styles.infoText}
                    >
                      {ride.available_seats} seats
                    </Text>

                  </View>


                  <View
                    style={styles.infoItem}
                  >

                    <Ionicons
                      name="cash-outline"
                      size={20}
                      color={Colors.driver}
                    />

                    <Text
                      style={styles.fareText}
                    >
                      R{ride.fare}
                    </Text>

                  </View>

                </View>

              </View>

            ))}

          </View>

        )}


        {/* ================= TRIP STATISTICS ================= */}

        <Text style={styles.sectionTitle}>
          Trip Statistics
        </Text>


        <View style={styles.statsContainer}>

          <View style={styles.statCard}>

            <Ionicons
              name="car-outline"
              size={28}
              color={Colors.driver}
            />

            <Text style={styles.statValue}>
              {completedTrips}
            </Text>

            <Text style={styles.statLabel}>
              Completed Trips
            </Text>

          </View>


          <View style={styles.statCard}>

            <Ionicons
              name="cash-outline"
              size={28}
              color={Colors.driver}
            />

            <Text style={styles.statValue}>
              R{totalEarnings}
            </Text>

            <Text style={styles.statLabel}>
              Total Earnings
            </Text>

          </View>

        </View>


      </ScrollView>

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
    padding: 20,
    paddingBottom: 40,
  },


  /* ================= LOADING ================= */

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 15,
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

  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.driver,
    marginTop: 12,
  },

  subtitle: {
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
    fontSize: 15,
  },


  /* ================= EMPTY STATE ================= */

  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 3,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.driver,
    marginTop: 18,
  },

  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 8,
  },


  /* ================= RIDE CARD ================= */

  rideCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },

  rideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  rideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
  },

  rideHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  rideTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.driver,
  },

  rideDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  completedBadge: {
    backgroundColor: "#E7F6EA",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  completedBadgeText: {
    color: "#2E7D32",
    fontSize: 11,
    fontWeight: "700",
  },


  /* ================= LOCATIONS ================= */

  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },

  locationTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  locationLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },

  locationText: {
    fontSize: 15,
    color: Colors.driver,
    fontWeight: "600",
  },


  /* ================= RIDE INFO ================= */

  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 15,
    marginTop: 5,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 5,
  },

  fareText: {
    fontSize: 14,
    color: Colors.driver,
    fontWeight: "700",
    marginLeft: 5,
  },


  /* ================= STATISTICS ================= */

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.driver,
    marginTop: 28,
    marginBottom: 14,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    elevation: 3,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.driver,
    marginTop: 10,
  },

  statLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
  },

});