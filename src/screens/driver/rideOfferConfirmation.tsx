import React, {
  useEffect,
  useState,
} from "react";

import {
  ScrollView,
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

import Colors from "../../constants/colors";

import { RootStackParamList } from "../../navigation/AppNavigator";

import { supabase } from "../../lib/supabaseClient";


type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "DriverHome"
>;


type Ride = {
  pickup_location: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  fare: number;
  ride_date: string;
};


export default function RideOfferConfirmationScreen() {

  const navigation = useNavigation<NavigationProp>();

  const [ride, setRide] =
    useState<Ride | null>(null);

  const [loading, setLoading] =
    useState(true);


  // ==================================================
  // LOAD CREATED RIDE
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


        // Get the driver's most recently created ride

        const {
          data,
          error,
        } =
          await supabase
            .from("rides")
            .select(
              `
                pickup_location,
                destination,
                departure_time,
                available_seats,
                fare,
                ride_date
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

          console.error(
            "Ride loading error:",
            error.message
          );

          Alert.alert(
            "Error",
            "Unable to load your ride information."
          );

          return;

        }


        setRide(data);

      } catch (error) {

        console.error(
          "Ride confirmation error:",
          error
        );

        Alert.alert(
          "Error",
          "Something went wrong while loading your ride."
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

    const dateParts =
      date.split("-");

    if (
      dateParts.length !== 3
    ) {
      return date;
    }

    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

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

    const timeParts =
      time.split(":");

    if (
      timeParts.length < 2
    ) {
      return time;
    }

    const hours =
      Number(timeParts[0]);

    const minutes =
      timeParts[1];

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

      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color={Colors.driver}
        />

        <Text style={styles.loadingText}>
          Loading your ride...
        </Text>

      </View>

    );

  }


  // ==================================================
  // NO RIDE
  // ==================================================

  if (!ride) {

    return (

      <View style={styles.loadingContainer}>

        <Ionicons
          name="alert-circle-outline"
          size={50}
          color={Colors.driver}
        />

        <Text style={styles.loadingText}>
          Ride information could not be found.
        </Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate(
              "DriverHome"
            )
          }
        >

          <Text style={styles.secondaryButtonText}>
            Back to Home
          </Text>

        </TouchableOpacity>

      </View>

    );

  }


  return (

    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ================= SUCCESS ICON ================= */}

      <View style={styles.successCircle}>

        <Ionicons
          name="checkmark"
          size={55}
          color={Colors.white}
        />

      </View>


      {/* ================= HEADER ================= */}

      <Text style={styles.heading}>
        Ride Offer Created!
      </Text>

      <Text style={styles.subHeading}>
        Your ride is now available for riders to book.
      </Text>


      {/* ================= RIDE SUMMARY ================= */}

      <View style={styles.card}>

        <View style={styles.cardHeader}>

          <View style={styles.cardIcon}>

            <Ionicons
              name="car-outline"
              size={24}
              color={Colors.driver}
            />

          </View>

          <Text style={styles.sectionTitle}>
            Ride Summary
          </Text>

        </View>


        {/* Pickup */}

        <View style={styles.row}>

          <View style={styles.rowLeft}>

            <Ionicons
              name="location-outline"
              size={20}
              color={Colors.driver}
            />

            <Text style={styles.label}>
              Pickup
            </Text>

          </View>

          <Text style={styles.value}>
            {ride.pickup_location}
          </Text>

        </View>


        {/* Destination */}

        <View style={styles.row}>

          <View style={styles.rowLeft}>

            <Ionicons
              name="flag-outline"
              size={20}
              color={Colors.driver}
            />

            <Text style={styles.label}>
              Destination
            </Text>

          </View>

          <Text style={styles.value}>
            {ride.destination}
          </Text>

        </View>


        {/* Date */}

        <View style={styles.row}>

          <View style={styles.rowLeft}>

            <Ionicons
              name="calendar-outline"
              size={20}
              color={Colors.driver}
            />

            <Text style={styles.label}>
              Date
            </Text>

          </View>

          <Text style={styles.value}>
            {formatDate(
              ride.ride_date
            )}
          </Text>

        </View>


        {/* Departure */}

        <View style={styles.row}>

          <View style={styles.rowLeft}>

            <Ionicons
              name="time-outline"
              size={20}
              color={Colors.driver}
            />

            <Text style={styles.label}>
              Departure
            </Text>

          </View>

          <Text style={styles.value}>
            {formatTime(
              ride.departure_time
            )}
          </Text>

        </View>


        {/* Seats */}

        <View style={styles.row}>

          <View style={styles.rowLeft}>

            <Ionicons
              name="people-outline"
              size={20}
              color={Colors.driver}
            />

            <Text style={styles.label}>
              Available Seats
            </Text>

          </View>

          <Text style={styles.value}>
            {ride.available_seats}
          </Text>

        </View>


        {/* Separator */}

        <View style={styles.separator} />


        {/* Price */}

        <View style={styles.priceContainer}>

          <Text style={styles.priceLabel}>
            Price Per Rider
          </Text>

          <Text style={styles.price}>
            R{ride.fare}
          </Text>

        </View>

      </View>


      {/* ================= BUTTONS ================= */}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() =>
          navigation.navigate(
            "ViewMyRide"
          )
        }
        activeOpacity={0.8}
      >

        <Ionicons
          name="car-sport-outline"
          size={22}
          color={Colors.white}
        />

        <Text style={styles.primaryButtonText}>
          View My Ride
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() =>
          navigation.navigate(
            "DriverHome"
          )
        }
        activeOpacity={0.8}
      >

        <Ionicons
          name="home-outline"
          size={20}
          color={Colors.driver}
        />

        <Text style={styles.secondaryButtonText}>
          Back to Home
        </Text>

      </TouchableOpacity>

    </ScrollView>

  );
}


const styles = StyleSheet.create({

  /* ================= CONTAINER ================= */

  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 45,
  },


  /* ================= LOADING ================= */

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 12,
    textAlign: "center",
  },


  /* ================= SUCCESS ================= */

  successCircle: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,

    elevation: 4,
  },


  /* ================= HEADER ================= */

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },

  subHeading: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    maxWidth: "90%",
  },


  /* ================= CARD ================= */

  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,

    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  cardIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },


  /* ================= INFORMATION ROWS ================= */

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },

  value: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
    maxWidth: "52%",
    textAlign: "right",
  },


  /* ================= SEPARATOR ================= */

  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },


  /* ================= PRICE ================= */

  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  priceLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.primary,
  },

  price: {
    fontSize: 25,
    fontWeight: "700",
    color: Colors.driver,
  },


  /* ================= PRIMARY BUTTON ================= */

  primaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: Colors.driver,
    borderRadius: 15,

    marginTop: 30,

    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",

    elevation: 3,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 9,
  },


  /* ================= SECONDARY BUTTON ================= */

  secondaryButton: {
    width: "100%",
    height: 58,

    backgroundColor: Colors.white,

    borderWidth: 2,
    borderColor: Colors.driver,
    borderRadius: 15,

    marginTop: 14,

    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  secondaryButtonText: {
    color: Colors.driver,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

});
