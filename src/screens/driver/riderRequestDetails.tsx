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

    let walletRefund:
      | {
          userId: string;
          originalBalance: number;
        }
      | null = null;

    try {

      const {
        data: {
          user: driverUser,
        },
      } =
        await supabase.auth.getUser();


      if (!driverUser) {

        Alert.alert(
          "Login Required",
          "Please sign in again before accepting a rider."
        );

        return;

      }


      // =====================================================
      // GET THE PENDING BOOKING
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
            rider_id,
            driver_id,
            seats_booked,
            amount,
            payment_method,
            payment_id,
            status
          `)
          .eq(
            "id",
            rider.id
          )
          .single();


      if (
        bookingError ||
        !booking
      ) {

        Alert.alert(
          "Error",
          bookingError?.message ||
            "Unable to find this booking."
        );

        return;

      }


      if (
        booking.driver_id !==
        driverUser.id
      ) {

        Alert.alert(
          "Not Allowed",
          "This rider request belongs to another driver."
        );

        return;

      }


      if (
        booking.status ===
        "confirmed"
      ) {

        Alert.alert(
          "Already Accepted",
          "This rider has already been accepted."
        );

        navigation.navigate(
          "DriverTrip",
          {
            rideId:
              booking.ride_id,
          }
        );

        return;

      }


      if (
        booking.status !==
        "pending"
      ) {

        Alert.alert(
          "Request Unavailable",
          "This rider request is no longer pending."
        );

        return;

      }


      if (!booking.rider_id) {

        Alert.alert(
          "Error",
          "This booking is missing its rider information."
        );

        return;

      }


      // =====================================================
      // GET CURRENT RIDE STATE
      // =====================================================

      const {
        data: ride,
        error: rideError,
      } =
        await supabase
          .from("rides")
          .select(`
            id,
            driver_id,
            rider_id,
            available_seats,
            status
          `)
          .eq(
            "id",
            booking.ride_id
          )
          .single();


      if (
        rideError ||
        !ride
      ) {

        Alert.alert(
          "Error",
          rideError?.message ||
            "Unable to find this ride."
        );

        return;

      }


      if (
        ride.driver_id !==
        driverUser.id
      ) {

        Alert.alert(
          "Not Allowed",
          "You are not the driver of this ride."
        );

        return;

      }


      const seatsBooked =
        Math.max(
          1,
          Number(
            booking.seats_booked ||
              1
          )
        );

      const availableSeats =
        Number(
          ride.available_seats ||
            0
        );


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
      // CAPTURE WALLET PAYMENT ONLY AFTER DRIVER ACCEPTS
      // =====================================================

      if (
        booking.payment_method ===
        "wallet"
      ) {

        const {
          data: wallet,
          error: walletError,
        } =
          await supabase
            .from("wallets")
            .select(
              "balance"
            )
            .eq(
              "user_id",
              booking.rider_id
            )
            .maybeSingle();


        if (
          walletError ||
          !wallet
        ) {

          Alert.alert(
            "Wallet Error",
            walletError?.message ||
              "The rider's wallet could not be verified."
          );

          return;

        }


        const originalBalance =
          Number(
            wallet.balance ||
              0
          );

        const amount =
          Number(
            booking.amount ||
              0
          );


        if (
          originalBalance <
          amount
        ) {

          Alert.alert(
            "Payment Could Not Be Captured",
            "The rider no longer has enough wallet balance for this booking."
          );

          return;

        }


        const {
          error:
            walletUpdateError,
        } =
          await supabase
            .from("wallets")
            .update({
              balance:
                Number(
                  (
                    originalBalance -
                    amount
                  ).toFixed(
                    2
                  )
                ),

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "user_id",
              booking.rider_id
            );


        if (
          walletUpdateError
        ) {

          Alert.alert(
            "Wallet Error",
            walletUpdateError.message
          );

          return;

        }


        walletRefund = {
          userId:
            booking.rider_id,
          originalBalance,
        };

      }


      // =====================================================
      // RESERVE SEATS ONCE
      // =====================================================

      const remainingSeats =
        availableSeats -
        seatsBooked;


      const {
        data:
          reservedRide,
        error:
          rideUpdateError,
      } =
        await supabase
          .from("rides")
          .update({
            available_seats:
              remainingSeats,

            rider_id:
              booking.rider_id,

            status:
              "accepted",
          })
          .eq(
            "id",
            booking.ride_id
          )
          .eq(
            "driver_id",
            driverUser.id
          )
          .eq(
            "available_seats",
            availableSeats
          )
          .select("id")
          .maybeSingle();


      if (
        rideUpdateError ||
        !reservedRide
      ) {

        if (walletRefund) {

          await supabase
            .from("wallets")
            .update({
              balance:
                walletRefund.originalBalance,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "user_id",
              walletRefund.userId
            );

        }

        Alert.alert(
          "Ride Changed",
          "The ride availability changed while you were accepting this rider. Please refresh and try again."
        );

        return;

      }


      // =====================================================
      // CONFIRM BOOKING - THIS REALTIME CHANGE NOTIFIES RIDER
      // =====================================================

      const {
        data:
          confirmedBooking,
        error:
          confirmError,
      } =
        await supabase
          .from("bookings")
          .update({
            status:
              "confirmed",
          })
          .eq(
            "id",
            booking.id
          )
          .eq(
            "status",
            "pending"
          )
          .select("id")
          .maybeSingle();


      if (
        confirmError ||
        !confirmedBooking
      ) {

        // Best-effort rollback so the same booking does not consume seats
        // without becoming confirmed.
        await supabase
          .from("rides")
          .update({
            available_seats:
              availableSeats,

            rider_id:
              ride.rider_id,

            status:
              ride.status,
          })
          .eq(
            "id",
            booking.ride_id
          );

        if (walletRefund) {

          await supabase
            .from("wallets")
            .update({
              balance:
                walletRefund.originalBalance,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "user_id",
              walletRefund.userId
            );

        }

        Alert.alert(
          "Error",
          "Unable to confirm this rider. No seats were reserved."
        );

        return;

      }


      // =====================================================
      // FINALISE NON-CASH PAYMENT
      // =====================================================

      if (
        booking.payment_id &&
        (
          booking.payment_method ===
            "card" ||
          booking.payment_method ===
            "wallet"
        )
      ) {

        const {
          error:
            paymentUpdateError,
        } =
          await supabase
            .from("payments")
            .update({
              status:
                "paid",
            })
            .eq(
              "id",
              booking.payment_id
            );


        if (
          paymentUpdateError
        ) {

          // The booking itself is valid. Keep the trip usable and log the
          // payment bookkeeping issue instead of crashing the driver flow.
          console.error(
            "Payment finalisation error:",
            paymentUpdateError.message
          );

        }

      }


      Alert.alert(
        "Rider Accepted",
        "The rider has been confirmed and their app will update automatically.",
        [
          {
            text:
              "View Active Trip",

            onPress:
              () =>
                navigation.navigate(
                  "DriverTrip",
                  {
                    rideId:
                      booking.ride_id,
                  }
                ),
          },
        ]
      );


    } catch (error) {

      console.error(
        "Accept rider error:",
        error
      );


      if (walletRefund) {

        await supabase
          .from("wallets")
          .update({
            balance:
              walletRefund.originalBalance,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "user_id",
            walletRefund.userId
          );

      }


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

      const {
        data: booking,
        error: bookingLoadError,
      } =
        await supabase
          .from("bookings")
          .select(
            "id, payment_id, status"
          )
          .eq(
            "id",
            rider.id
          )
          .single();


      if (
        bookingLoadError ||
        !booking
      ) {

        Alert.alert(
          "Error",
          "Unable to find this booking."
        );

        return;

      }


      if (
        booking.status !==
        "pending"
      ) {

        Alert.alert(
          "Request Unavailable",
          "This request has already been handled."
        );

        return;

      }


      const {
        error,
      } =
        await supabase
          .from("bookings")
          .update({
            status:
              "cancelled",
          })
          .eq(
            "id",
            rider.id
          )
          .eq(
            "status",
            "pending"
          );


      if (error) {

        Alert.alert(
          "Error",
          "Unable to decline this rider."
        );

        return;

      }


      if (booking.payment_id) {

        const {
          error: paymentCancelError,
        } =
          await supabase
            .from("payments")
            .update({
              status:
                "cancelled",
            })
            .eq(
              "id",
              booking.payment_id
            );


        if (paymentCancelError) {

          // The booking is already cancelled; do not make the driver flow
          // fail because optional payment bookkeeping could not update.
          console.error(
            "Payment cancellation error:",
            paymentCancelError.message
          );

        }

      }


      // No seats or wallet funds have been taken while the booking is
      // pending, so declining the request requires no financial rollback.
      Alert.alert(
        "Request Declined",
        "The rider has been notified that this request was not accepted.",
        [
          {
            text:
              "OK",

            onPress:
              () =>
                navigation.navigate(
                  "DriverHome"
                ),
          },
        ]
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
            color={Colors.driver}
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
      color: Colors.driver,
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
      color: Colors.driver,
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
      color: Colors.driver,
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