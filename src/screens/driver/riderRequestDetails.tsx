import React from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import Colors from "../../constants/colors";

import {
  supabase,
} from "../../lib/supabaseClient";


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


export default function RiderRequestDetailsScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  const route =
    useRoute();


  const {
    rider,
  } =
    route.params as {
      rider: {
        id: string;

        name: string;

        pickup: string;

        destination: string;

        passengers: number;

        offer: string;

        distance: string;

        gender: string;

        pickupTime: string;

        routeMatch: string;
      };
    };


  // =====================================================
  // ACCEPT RIDER
  // =====================================================
const acceptRider = async () => {

  try {

    console.log(
      "Accepting booking:",
      rider.id
    );


    // =====================================================
    // GET BOOKING INFORMATION
    // =====================================================

    const {
      data: booking,
      error: bookingError,
    } =
      await supabase
        .from("bookings")
        .select(`
          id,
          ride_id,
          seats_booked
        `)
        .eq(
          "id",
          rider.id
        )
        .single();


    if (bookingError || !booking) {

      console.error(
        "Booking loading error:",
        bookingError?.message
      );

      Alert.alert(
        "Error",
        "Unable to find this booking."
      );

      return;

    }


    // =====================================================
    // GET RIDE INFORMATION
    // =====================================================

    const {
      data: ride,
      error: rideError,
    } =
      await supabase
        .from("rides")
        .select(`
          id,
          available_seats
        `)
        .eq(
          "id",
          booking.ride_id
        )
        .single();


    if (rideError || !ride) {

      console.error(
        "Ride loading error:",
        rideError?.message
      );

      Alert.alert(
        "Error",
        "Unable to find this ride."
      );

      return;

    }


    // =====================================================
    // CALCULATE SEATS
    // =====================================================

    const seatsBooked =
      Number(
        booking.seats_booked || 1
      );

    const availableSeats =
      Number(
        ride.available_seats || 0
      );


    console.log(
      "Available seats:",
      availableSeats
    );

    console.log(
      "Seats booked:",
      seatsBooked
    );


    // =====================================================
    // CHECK AVAILABLE SEATS
    // =====================================================

    if (
      availableSeats <
      seatsBooked
    ) {

      Alert.alert(
        "Not Enough Seats",
        `This ride only has ${availableSeats} seat${
          availableSeats === 1
            ? ""
            : "s"
        } available.`
      );

      return;

    }


    // =====================================================
    // CALCULATE REMAINING SEATS
    // =====================================================

    const remainingSeats =
      availableSeats -
      seatsBooked;


    // =====================================================
    // UPDATE RIDE SEATS
    // =====================================================

    const {
      error: seatError,
    } =
      await supabase
        .from("rides")
        .update({
          available_seats:
            remainingSeats,
        })
        .eq(
          "id",
          booking.ride_id
        );


    if (seatError) {

      console.error(
        "Seat update error:",
        seatError.message
      );

      Alert.alert(
        "Error",
        "Unable to update the available seats."
      );

      return;

    }


    // =====================================================
    // CONFIRM BOOKING
    // =====================================================

    const {
      error: confirmError,
    } =
      await supabase
        .from("bookings")
        .update({
          status: "confirmed",
        })
        .eq(
          "id",
          rider.id
        );


    if (confirmError) {

      console.error(
        "Booking confirmation error:",
        confirmError.message
      );


      // Restore seats if booking confirmation fails
      await supabase
        .from("rides")
        .update({
          available_seats:
            availableSeats,
        })
        .eq(
          "id",
          booking.ride_id
        );


      Alert.alert(
        "Error",
        "Unable to confirm this rider."
      );

      return;

    }


    // =====================================================
    // SUCCESS
    // =====================================================

    console.log(
      "Booking accepted successfully."
    );

    console.log(
      "Remaining seats:",
      remainingSeats
    );


    navigation.navigate(
      "DriverHome"
    );


  } catch (error) {

    console.error(
      "Accept rider error:",
      error
    );


    Alert.alert(
      "Error",
      "Something went wrong while accepting the rider."
    );

  }

};

  // =====================================================
  // DECLINE RIDER
  // =====================================================

  const declineRider = async () => {

    try {

      console.log(
        "Declining booking:",
        rider.id
      );


      const {
        error,
      } =
        await supabase
          .from("bookings")
          .update({
            status: "cancelled",
          })
          .eq(
            "id",
            rider.id
          );


      if (error) {

        console.error(
          "Decline booking error:",
          error.message
        );


        Alert.alert(
          "Error",
          "Unable to decline this rider."
        );


        return;

      }


      console.log(
        "Booking declined successfully."
      );


      navigation.navigate(
        "DriverHome"
      );


    } catch (error) {

      console.error(
        "Decline rider error:",
        error
      );


      Alert.alert(
        "Error",
        "Something went wrong while declining the rider."
      );

    }

  };


  // =====================================================
  // SCREEN
  // =====================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >


        {/* ================= RIDER AVATAR ================= */}

        <View
          style={styles.avatar}
        >

          <Ionicons
            name="person"
            size={55}
            color={Colors.primary}
          />

        </View>


        {/* ================= RIDER NAME ================= */}

        <Text
          style={styles.name}
        >
          {rider.name}
        </Text>


        <Text
          style={styles.subtitle}
        >
          Rider Request Details
        </Text>


        {/* ================= TRIP DETAILS ================= */}

        <View
          style={styles.card}
        >

          <Text
            style={styles.sectionTitle}
          >
            Trip Details
          </Text>


          <DetailRow
            icon="location-outline"
            title="Pickup Location"
            value={rider.pickup}
          />


          <DetailRow
            icon="flag-outline"
            title="Destination"
            value={rider.destination}
          />


          <DetailRow
            icon="time-outline"
            title="Pickup Time"
            value={rider.pickupTime}
          />


          <DetailRow
            icon="navigate-outline"
            title="Distance"
            value={rider.distance}
          />


          <DetailRow
            icon="map-outline"
            title="Route Match"
            value={rider.routeMatch}
          />

        </View>


        {/* ================= RIDER INFORMATION ================= */}

        <View
          style={styles.card}
        >

          <Text
            style={styles.sectionTitle}
          >
            Rider Information
          </Text>


          <DetailRow
            icon="people-outline"
            title="Passengers"
            value={
              rider.passengers.toString()
            }
          />


          <DetailRow
            icon="person-outline"
            title="Gender"
            value={rider.gender}
          />


          <DetailRow
            icon="cash-outline"
            title="Offer Price"
            value={rider.offer}
          />

        </View>


        {/* ================= ACCEPT BUTTON ================= */}

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={acceptRider}
        >

          <Ionicons
            name="checkmark-circle"
            size={22}
            color={Colors.white}
          />

          <Text
            style={styles.acceptText}
          >
            Accept Rider
          </Text>

        </TouchableOpacity>


        {/* ================= DECLINE BUTTON ================= */}

        <TouchableOpacity
          style={styles.declineButton}
          onPress={declineRider}
        >

          <Ionicons
            name="close-circle"
            size={22}
            color={Colors.driver}
          />

          <Text
            style={styles.declineText}
          >
            Decline Request
          </Text>

        </TouchableOpacity>


      </ScrollView>

    </SafeAreaView>

  );

}


// =====================================================
// DETAIL ROW
// =====================================================

interface DetailProps {

  icon:
    keyof typeof Ionicons.glyphMap;

  title: string;

  value: string;

}


function DetailRow({
  icon,
  title,
  value,
}: DetailProps) {

  return (

    <View
      style={styles.row}
    >

      <View
        style={styles.left}
      >

        <Ionicons
          name={icon}
          size={22}
          color={Colors.driver}
        />


        <Text
          style={styles.title}
        >
          {title}
        </Text>

      </View>


      <Text
        style={styles.value}
      >
        {value}
      </Text>

    </View>

  );

}


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },


    content: {
      padding: 22,
      paddingBottom: 40,
    },


    avatar: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor:
        Colors.white,
      justifyContent:
        "center",
      alignItems:
        "center",
      alignSelf:
        "center",
      marginTop: 20,
    },


    name: {
      fontSize: 28,
      fontWeight: "700",
      color: Colors.primary,
      textAlign: "center",
      marginTop: 15,
    },


    subtitle: {
      textAlign: "center",
      color:
        Colors.textSecondary,
      marginTop: 5,
      marginBottom: 25,
    },


    card: {
      backgroundColor:
        Colors.white,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      elevation: 4,
    },


    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors.primary,
      marginBottom: 15,
    },


    row: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor:
        "#ECECEC",
    },


    left: {
      flexDirection: "row",
      alignItems: "center",
    },


    title: {
      marginLeft: 12,
      fontSize: 15,
      color: Colors.primary,
    },


    value: {
      fontSize: 15,
      fontWeight: "600",
      color:
        Colors.textSecondary,
      maxWidth: "45%",
      textAlign: "right",
    },


    acceptButton: {
      height: 58,
      backgroundColor:
        Colors.driver,
      borderRadius: 15,
      justifyContent:
        "center",
      alignItems:
        "center",
      flexDirection: "row",
    },


    acceptText: {
      color: Colors.white,
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 8,
    },


    declineButton: {
      height: 58,
      borderWidth: 2,
      borderColor:
        Colors.driver,
      borderRadius: 15,
      justifyContent:
        "center",
      alignItems:
        "center",
      flexDirection: "row",
      marginTop: 15,
    },


    declineText: {
      color: Colors.driver,
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 8,
    },

  });