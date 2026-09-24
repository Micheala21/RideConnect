import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/AppNavigator";
import Colors from "../../constants/colors";
import { supabase } from "../../lib/supabaseClient";


type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type Ride = {
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
};


export default function ActiveRideScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  const [ride, setRide] =
    useState<Ride | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [rideDeleted, setRideDeleted] =
    useState(false);


  // ==================================================
  // EDIT RIDE STATES
  // ==================================================

  const [showRideDetails, setShowRideDetails] =
    useState(false);

  const [pickup, setPickup] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [rideDate, setRideDate] =
    useState("");

  const [departureTime, setDepartureTime] =
    useState("");

  const [availableSeats, setAvailableSeats] =
    useState("");

  const [fare, setFare] =
    useState("");


  // ==================================================
  // LOAD DRIVER'S RIDE
  // ==================================================

  const loadRide = async () => {

    if (rideDeleted) {

      setRide(null);

      setLoading(false);

      return;

    }


    try {

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();


      if (
        userError ||
        !user
      ) {

        console.error(
          "User error:",
          userError?.message
        );

        setRide(null);

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
              driver_id,
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
          .eq(
            "status",
            "available"
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


      setRide(
        data
      );


      setPickup(
        data.pickup_location
      );

      setDestination(
        data.destination
      );

      setRideDate(
        data.ride_date
      );

      setDepartureTime(
        data.departure_time
      );

      setAvailableSeats(
        String(
          data.available_seats
        )
      );

      setFare(
        String(
          data.fare
        )
      );

    } catch (error) {

      console.error(
        "Active ride error:",
        error
      );

    } finally {

      setLoading(
        false
      );

    }

  };


  // ==================================================
  // REFRESH WHEN SCREEN GETS FOCUS
  // ==================================================

  useFocusEffect(
    useCallback(() => {

      loadRide();

    }, [rideDeleted])
  );


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
      Number(
        parts[0]
      );

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
  // UPDATE RIDE
  // ==================================================

  const updateRide = async () => {

    if (!ride) {

      return;

    }


    if (
      !pickup.trim() ||
      !destination.trim() ||
      !rideDate.trim() ||
      !departureTime.trim() ||
      !availableSeats.trim() ||
      !fare.trim()
    ) {

      Alert.alert(
        "Missing Information",
        "Please complete all ride information."
      );

      return;

    }


    const seats =
      Number(
        availableSeats
      );

    const rideFare =
      Number(
        fare
      );


    if (
      !seats ||
      seats <= 0
    ) {

      Alert.alert(
        "Invalid Seats",
        "Please enter a valid number of available seats."
      );

      return;

    }


    if (
      !rideFare ||
      rideFare <= 0
    ) {

      Alert.alert(
        "Invalid Fare",
        "Please enter a valid fare per person."
      );

      return;

    }


    try {

      const {
        error,
      } =
        await supabase
          .from("rides")
          .update({

            pickup_location:
              pickup.trim(),

            destination:
              destination.trim(),

            ride_date:
              rideDate.trim(),

            departure_time:
              departureTime.trim(),

            available_seats:
              seats,

            fare:
              rideFare,

          })
          .eq(
            "id",
            ride.id
          );


      if (error) {

        console.error(
          "Ride update error:",
          error.message
        );

        Alert.alert(
          "Error",
          error.message
        );

        return;

      }


      setRide({

        ...ride,

        pickup_location:
          pickup.trim(),

        destination:
          destination.trim(),

        ride_date:
          rideDate.trim(),

        departure_time:
          departureTime.trim(),

        available_seats:
          seats,

        fare:
          rideFare,

      });


      setShowRideDetails(
        false
      );


      Alert.alert(
        "Ride Updated",
        "Your ride information has been updated successfully."
      );

    } catch (error) {

      console.error(
        "Update ride error:",
        error
      );

      Alert.alert(
        "Error",
        "Something went wrong while updating your ride."
      );

    }

  };


  // ==================================================
  // DELETE RIDE
  // ==================================================

 const deleteRide = async () => {
  if (!ride?.id) {
    Alert.alert("Error", "No ride was selected.");
    return;
  }

  try {
    // Get the currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("USER ERROR:", userError);
      Alert.alert("Error", "You are not logged in.");
      return;
    }

    console.log("========== DELETE DEBUG ==========");
    console.log("Logged-in user ID:", user.id);
    console.log("Ride ID:", ride.id);
    console.log("Ride driver ID:", ride.driver_id);
    console.log("===================================");

    // Check that the ride belongs to this driver
    if (ride.driver_id !== user.id) {
      Alert.alert(
        "Delete Failed",
        "This ride does not belong to the currently logged-in driver."
      );
      return;
    }

    const { error } = await supabase
      .from("rides")
      .delete()
      .eq("id", ride.id);

    console.log("DELETE ERROR:", error);

    if (error) {
      console.error("DELETE ERROR MESSAGE:", error.message);
      console.error("DELETE ERROR DETAILS:", error.details);
      console.error("DELETE ERROR HINT:", error.hint);

      Alert.alert(
        "Delete Failed",
        error.message
      );

      return;
    }

    console.log("DELETE SUCCESSFUL");

    // Remove it immediately from the frontend
    setRide(null);
    setRideDeleted(true);
    setShowRideDetails(false);

    setPickup("");
    setDestination("");
    setRideDate("");
    setDepartureTime("");
    setAvailableSeats("");
    setFare("");

    Alert.alert(
      "Trip Deleted",
      "Your trip has been deleted successfully."
    );

  } catch (error) {
    console.error("DELETE CRASH:", error);

    Alert.alert(
      "Delete Failed",
      "Something went wrong while deleting the trip."
    );
  }
};

  // ==================================================
  // CREATE NEW RIDE
  // ==================================================

  const createNewRide = () => {

    setRideDeleted(
      false
    );

    navigation.navigate(
      "CreateRideOffer"
    );

  };


  // ==================================================
  // LOADING SCREEN
  // ==================================================

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
            color={Colors.primary}
          />

          <Text
            style={styles.loadingText}
          >
            Loading your ride...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ==================================================
  // MAIN SCREEN
  // ==================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <Text
          style={styles.title}
        >
          Activity
        </Text>

        <Text
          style={styles.subtitle}
        >
          Manage your current ride activity.
        </Text>


        {/* ==================================================
            CURRENT RIDE
        ================================================== */}

        <View
          style={styles.card}
        >

          <View
            style={styles.cardHeader}
          >

            <View
              style={styles.iconContainer}
            >

              <Ionicons
                name="car-outline"
                size={25}
                color={Colors.primary}
              />

            </View>

            <View
              style={styles.headerTextContainer}
            >

              <Text
                style={styles.cardTitle}
              >
                {ride
                  ? "Ride Offer Active"
                  : "No Active Ride"}
              </Text>

              <Text
                style={styles.cardSubtitle}
              >
                {ride
                  ? "Your ride offer is currently available."
                  : "You currently do not have an active ride offer."}
              </Text>

            </View>

          </View>


          {/* ==================================================
              RIDE INFORMATION
          ================================================== */}

          {ride ? (

            <>

              <View
                style={styles.routeContainer}
              >

                <View
                  style={styles.routeRow}
                >

                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={Colors.primary}
                  />

                  <View
                    style={styles.routeTextContainer}
                  >

                    <Text
                      style={styles.routeLabel}
                    >
                      Pickup
                    </Text>

                    <Text
                      style={styles.routeText}
                    >
                      {ride.pickup_location}
                    </Text>

                  </View>

                </View>


                <View
                  style={styles.routeLine}
                />


                <View
                  style={styles.routeRow}
                >

                  <Ionicons
                    name="flag-outline"
                    size={20}
                    color={Colors.primary}
                  />

                  <View
                    style={styles.routeTextContainer}
                  >

                    <Text
                      style={styles.routeLabel}
                    >
                      Destination
                    </Text>

                    <Text
                      style={styles.routeText}
                    >
                      {ride.destination}
                    </Text>

                  </View>

                </View>

              </View>


              {/* ==================================================
                  RIDE DETAILS
              ================================================== */}

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() =>
                  setShowRideDetails(
                    !showRideDetails
                  )
                }
                activeOpacity={0.8}
              >

                <Text
                  style={styles.detailsButtonText}
                >
                  {showRideDetails
                    ? "Hide Ride Details"
                    : "View / Edit Ride Details"}
                </Text>

                <Ionicons
                  name={
                    showRideDetails
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color={Colors.primary}
                />

              </TouchableOpacity>


              {showRideDetails && (

                <View
                  style={styles.rideDetails}
                >

                  <Text
                    style={styles.inputLabel}
                  >
                    Pickup Location
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={pickup}
                    onChangeText={setPickup}
                    placeholder="Enter pickup location"
                  />


                  <Text
                    style={styles.inputLabel}
                  >
                    Destination
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="Enter destination"
                  />


                  <Text
                    style={styles.inputLabel}
                  >
                    Ride Date
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={rideDate}
                    onChangeText={setRideDate}
                    placeholder="YYYY-MM-DD"
                  />


                  <Text
                    style={styles.inputLabel}
                  >
                    Departure Time
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={departureTime}
                    onChangeText={setDepartureTime}
                    placeholder="HH:MM"
                  />


                  <Text
                    style={styles.inputLabel}
                  >
                    Available Seats
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={availableSeats}
                    onChangeText={setAvailableSeats}
                    keyboardType="numeric"
                    placeholder="Available seats"
                  />


                  <Text
                    style={styles.inputLabel}
                  >
                    Fare Per Person
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={fare}
                    onChangeText={setFare}
                    keyboardType="numeric"
                    placeholder="Fare"
                  />


                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={updateRide}
                    activeOpacity={0.8}
                  >

                    <Ionicons
                      name="save-outline"
                      size={20}
                      color={Colors.white}
                    />

                    <Text
                      style={styles.updateButtonText}
                    >
                      Update Ride
                    </Text>

                  </TouchableOpacity>

                </View>

              )}


              {/* ==================================================
                  VIEW RIDE REQUESTS
              ================================================== */}

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

                <Text
                  style={styles.buttonText}
                >
                  View Ride Requests
                </Text>

              </TouchableOpacity>


              {/* ==================================================
                  DELETE RIDE
              ================================================== */}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={deleteRide}
                activeOpacity={0.8}
              >

                <Ionicons
                  name="trash-outline"
                  size={21}
                  color={Colors.white}
                />

                <Text
                  style={styles.deleteButtonText}
                >
                  Delete Trip
                </Text>

              </TouchableOpacity>

            </>

          ) : (

            <>

              <View
                style={styles.emptyContainer}
              >

                <Ionicons
                  name="car-outline"
                  size={45}
                  color={Colors.textSecondary}
                />

                <Text
                  style={styles.emptyTitle}
                >
                  No Active Ride
                </Text>

                <Text
                  style={styles.emptyText}
                >
                  You do not currently have an active ride offer.
                </Text>

              </View>


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

                <Text
                  style={styles.buttonText}
                >
                  View Ride Requests
                </Text>

              </TouchableOpacity>

            </>

          )}

        </View>


        {/* ==================================================
            RIDE ACTIVITY
        ================================================== */}

        <Text
          style={styles.sectionTitle}
        >
          Ride Activity
        </Text>


        <View
          style={styles.activityCard}
        >

          <Ionicons
            name="time-outline"
            size={25}
            color={Colors.primary}
          />

          <View
            style={styles.activityTextContainer}
          >

            <Text
              style={styles.activityTitle}
            >
              Current Ride
            </Text>

            <Text
              style={styles.activityText}
            >
              {ride
                ? `${formatDate(ride.ride_date)} at ${formatTime(ride.departure_time)}`
                : "No active ride"}
            </Text>

          </View>

        </View>


        {/* ==================================================
            RIDE REQUESTS
        ================================================== */}

        <View
          style={styles.optionCard}
        >

          <Ionicons
            name="people-outline"
            size={26}
            color={Colors.primary}
          />

          <View
            style={styles.optionTextContainer}
          >

            <Text
              style={styles.optionTitle}
            >
              Ride Requests
            </Text>

            <Text
              style={styles.optionText}
            >
              View and manage requests from riders.
            </Text>

          </View>

        </View>


        {/* ==================================================
            CREATE RIDE OFFER
        ================================================== */}

        <TouchableOpacity
          style={styles.optionCard}
          onPress={createNewRide}
          activeOpacity={0.8}
        >

          <Ionicons
            name="add-circle-outline"
            size={26}
            color={Colors.primary}
          />

          <View
            style={styles.optionTextContainer}
          >

            <Text
              style={styles.optionTitle}
            >
              Create Ride Offer
            </Text>

            <Text
              style={styles.optionText}
            >
              Create a new ride offer for riders.
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={Colors.textSecondary}
          />

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>

  );

}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: Colors.textSecondary,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 20,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  routeContainer: {
    marginTop: 25,
    marginBottom: 15,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  routeTextContainer: {
    marginLeft: 10,
    flex: 1,
  },

  routeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },

  routeText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  routeLine: {
    width: 1,
    height: 25,
    backgroundColor: Colors.textSecondary,
    marginLeft: 9,
  },

  detailsButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 5,
  },

  detailsButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  rideDetails: {
    marginTop: 15,
    padding: 15,
    backgroundColor: Colors.background,
    borderRadius: 15,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    width: "100%",
    height: 48,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  updateButton: {
    width: "100%",
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
  },

  updateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  button: {
    width: "100%",
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 15,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  deleteButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#C62828",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },

  deleteButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 10,
  },

  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },

  activityTextContainer: {
    marginLeft: 12,
    flex: 1,
  },

  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  activityText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
  },

  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  optionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },

});