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

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import {
  supabase,
} from "../../lib/supabaseClient";


// =====================================================
// NAVIGATION
// =====================================================

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "BookingConfirmed"
  >;


// =====================================================
// BOOKING STATUS
// =====================================================

type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";


// =====================================================
// SCREEN
// =====================================================

export default function BookingConfirmedScreen({
  navigation,
  route,
}: Props) {

  // ===================================================
  // REAL BOOKING ID
  // ===================================================

  const {
    bookingId,
  } = route.params;


  // ===================================================
  // RIDE ID
  // ===================================================

  const [
    rideId,
    setRideId,
  ] =
    useState<string | null>(
      null,
    );


  // ===================================================
  // BOOKING STATUS
  // ===================================================

  const [
    bookingStatus,
    setBookingStatus,
  ] =
    useState<BookingStatus>(
      "pending",
    );


  // ===================================================
  // LOADING
  // ===================================================

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  // ===================================================
  // LOAD BOOKING + REALTIME
  // ===================================================

  useEffect(() => {

    let active = true;


    // =================================================
    // LOAD CURRENT BOOKING
    // =================================================

    const loadBooking = async () => {

      try {

        const {
          data: booking,
          error,
        } =
          await supabase
            .from("bookings")
            .select(
              "status, ride_id",
            )
            .eq(
              "id",
              bookingId,
            )
            .single();


        if (error) {

          console.error(
            "Error loading booking:",
            error.message,
          );

          return;

        }


        if (
          active &&
          booking
        ) {

          if (
            booking.status
          ) {

            setBookingStatus(
              booking.status as BookingStatus,
            );

          }


          if (
            booking.ride_id
          ) {

            setRideId(
              booking.ride_id,
            );

          }

        }

      } catch (error) {

        console.error(
          "Booking status error:",
          error,
        );

      } finally {

        if (active) {

          setLoading(
            false,
          );

        }

      }

    };


    loadBooking();


    // =================================================
    // REALTIME BOOKING LISTENER
    // =================================================

    const bookingChannel =
      supabase
        .channel(
          `booking-${bookingId}`,
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",

            schema: "public",

            table: "bookings",

            filter:
              `id=eq.${bookingId}`,
          },

          (payload) => {

            console.log(
              "BOOKING UPDATED:",
              payload.new,
            );


            const updatedBooking =
              payload.new as {
                status: string;
              };


            if (
              active &&
              (
                updatedBooking.status ===
                  "pending" ||

                updatedBooking.status ===
                  "confirmed" ||

                updatedBooking.status ===
                  "cancelled" ||

                updatedBooking.status ===
                  "completed"
              )
            ) {

              setBookingStatus(
                updatedBooking.status as BookingStatus,
              );

            }

          },
        )
        .subscribe(
          status => {

            console.log(
              "Booking realtime status:",
              status,
            );

          },
        );


    // =================================================
    // CLEANUP BOOKING LISTENER
    // =================================================

    return () => {

      active = false;

      supabase.removeChannel(
        bookingChannel,
      );

    };

  }, [bookingId]);


  // ===================================================
  // REALTIME RIDE DELETION
  // ===================================================

  useEffect(() => {

    if (!rideId) {
      return;
    }


    let active = true;


    const rideChannel =
      supabase
        .channel(
          `booking-ride-deletion-${rideId}`,
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",

            schema: "public",

            table: "rides",

            filter:
              `id=eq.${rideId}`,
          },

          () => {

            if (!active) {
              return;
            }


            console.log(
              "BOOKING RIDE DELETED:",
              rideId,
            );


            Alert.alert(
              "Ride No Longer Available",
              "The driver has cancelled and removed this ride.",
              [
                {
                  text: "OK",

                  onPress: () =>
                    navigation.navigate(
                      "RiderHome",
                    ),
                },
              ],
            );

          },
        )
        .subscribe(
          status => {

            console.log(
              "Ride deletion realtime status:",
              status,
            );

          },
        );


    // =================================================
    // CLEANUP RIDE LISTENER
    // =================================================

    return () => {

      active = false;

      supabase.removeChannel(
        rideChannel,
      );

    };

  }, [rideId]);


  // ===================================================
  // STATUS CONTENT
  // ===================================================

  const getStatusContent = () => {

    switch (
      bookingStatus
    ) {

      // ===============================================
      // CONFIRMED
      // ===============================================

      case "confirmed":

        return {

          icon:
            "checkmark-circle" as const,

          title:
            "Booking Confirmed!",

          message:
            "Your driver has accepted your booking.",

          subMessage:
            "Your ride is confirmed and ready to go.",

        };


      // ===============================================
      // CANCELLED
      // ===============================================

      case "cancelled":

        return {

          icon:
            "close-circle" as const,

          title:
            "Booking Cancelled",

          message:
            "Your driver did not accept this booking.",

          subMessage:
            "You can return to the home screen and choose another ride.",

        };


      // ===============================================
      // COMPLETED
      // ===============================================

      case "completed":

        return {

          icon:
            "checkmark-done-circle" as const,

          title:
            "Trip Completed",

          message:
            "Your ride has been completed.",

          subMessage:
            "Thank you for using RideConnect.",

        };


      // ===============================================
      // PENDING
      // ===============================================

      case "pending":

      default:

        return {

          icon:
            "time-outline" as const,

          title:
            "Waiting for Driver",

          message:
            "Your booking has been sent to the driver.",

          subMessage:
            "Please wait while the driver reviews your request.",

        };

    }

  };


  const statusContent =
    getStatusContent();


  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {

    return (

      <SafeAreaView
        style={
          styles.container
        }
      >

        <View
          style={
            styles.loadingContainer
          }
        >

          <ActivityIndicator
            size="large"
            color={
              Colors.rider
            }
          />


          <Text
            style={
              styles.loadingText
            }
          >
            Loading booking status...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ===================================================
  // MAIN UI
  // ===================================================

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <View
        style={
          styles.content
        }
      >

        {/* ================================================= */}
        {/* STATUS ICON */}
        {/* ================================================= */}

        <View
          style={
            styles.successCircle
          }
        >

          <Ionicons
            name={
              statusContent.icon
            }
            size={65}
            color={
              Colors.white
            }
          />

        </View>


        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <Text
          style={
            styles.title
          }
        >
          {
            statusContent.title
          }
        </Text>


        {/* ================================================= */}
        {/* MESSAGE */}
        {/* ================================================= */}

        <Text
          style={
            styles.message
          }
        >
          {
            statusContent.message
          }
        </Text>


        <Text
          style={
            styles.subMessage
          }
        >
          {
            statusContent.subMessage
          }
        </Text>


        {/* ================================================= */}
        {/* BOOKING STATUS CARD */}
        {/* ================================================= */}

        <View
          style={
            styles.confirmationCard
          }
        >

          <View
            style={
              styles.confirmationRow
            }
          >

            <Ionicons
              name={
                bookingStatus ===
                "confirmed"

                  ? "checkmark-circle"

                  : bookingStatus ===
                    "cancelled"

                  ? "close-circle"

                  : bookingStatus ===
                    "completed"

                  ? "checkmark-done-circle"

                  : "time-outline"
              }

              size={24}

              color={
                Colors.rider
              }
            />


            <View
              style={
                styles.confirmationTextContainer
              }
            >

              <Text
                style={
                  styles.confirmationTitle
                }
              >
                {
                  bookingStatus ===
                  "pending"

                    ? "Waiting for Driver"

                    : bookingStatus ===
                      "confirmed"

                    ? "Driver Accepted"

                    : bookingStatus ===
                      "cancelled"

                    ? "Booking Cancelled"

                    : "Trip Completed"
                }
              </Text>


              <Text
                style={
                  styles.confirmationText
                }
              >
                {
                  bookingStatus ===
                  "pending"

                    ? "Your booking is waiting for the driver's response."

                    : bookingStatus ===
                      "confirmed"

                    ? "Your driver has accepted the booking."

                    : bookingStatus ===
                      "cancelled"

                    ? "This booking has been cancelled."

                    : "This trip has been completed."
                }
              </Text>

            </View>

          </View>

        </View>


        {/* ================================================= */}
        {/* TRACK DRIVER */}
        {/* ================================================= */}

        {
          bookingStatus ===
            "confirmed" && (

            <TouchableOpacity
              style={
                styles.trackButton
              }

              onPress={() =>
                navigation.navigate(
                  "TrackDriver",
                )
              }

              activeOpacity={
                0.8
              }
            >

              <Ionicons
                name="location-outline"
                size={21}
                color={
                  Colors.white
                }
              />


              <Text
                style={
                  styles.trackButtonText
                }
              >
                Track Driver
              </Text>

            </TouchableOpacity>

          )
        }


        {/* ================================================= */}
        {/* BACK TO HOME */}
        {/* ================================================= */}

        <TouchableOpacity
          style={
            styles.homeButton
          }

          onPress={() =>
            navigation.navigate(
              "RiderHome",
            )
          }

          activeOpacity={
            0.8
          }
        >

          <Text
            style={
              styles.homeButtonText
            }
          >
            Back to Home
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>

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


    // =================================================
    // LOADING
    // =================================================

    loadingContainer: {

      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    loadingText: {

      marginTop:
        12,

      fontSize:
        15,

      color:
        Colors.textSecondary,

    },


    // =================================================
    // CONTENT
    // =================================================

    content: {

      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        25,

    },


    // =================================================
    // STATUS ICON
    // =================================================

    successCircle: {

      width:
        115,

      height:
        115,

      borderRadius:
        58,

      backgroundColor:
        Colors.rider,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginBottom:
        25,

      elevation:
        5,

    },


    // =================================================
    // TITLE
    // =================================================

    title: {

      fontSize:
        28,

      fontWeight:
        "800",

      color:
        Colors.primary,

      textAlign:
        "center",

      marginBottom:
        12,

    },


    // =================================================
    // MESSAGE
    // =================================================

    message: {

      fontSize:
        17,

      fontWeight:
        "600",

      color:
        Colors.primary,

      textAlign:
        "center",

      marginBottom:
        8,

    },


    subMessage: {

      fontSize:
        14,

      color:
        Colors.textSecondary,

      textAlign:
        "center",

      lineHeight:
        21,

      marginBottom:
        25,

      paddingHorizontal:
        10,

    },


    // =================================================
    // STATUS CARD
    // =================================================

    confirmationCard: {

      width:
        "100%",

      backgroundColor:
        Colors.white,

      borderRadius:
        18,

      padding:
        18,

      marginBottom:
        30,

      elevation:
        3,

    },


    confirmationRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    confirmationTextContainer: {

      flex: 1,

      marginLeft:
        12,

    },


    confirmationTitle: {

      fontSize:
        15,

      fontWeight:
        "700",

      color:
        Colors.primary,

      marginBottom:
        4,

    },


    confirmationText: {

      fontSize:
        13,

      color:
        Colors.textSecondary,

      lineHeight:
        19,

    },


    // =================================================
    // TRACK DRIVER
    // =================================================

    trackButton: {

      width:
        "100%",

      height:
        56,

      borderRadius:
        16,

      backgroundColor:
        Colors.rider,

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      elevation:
        3,

      marginBottom:
        12,

    },


    trackButtonText: {

      color:
        Colors.white,

      fontSize:
        16,

      fontWeight:
        "700",

      marginLeft:
        8,

    },


    // =================================================
    // HOME BUTTON
    // =================================================

    homeButton: {

      width:
        "100%",

      height:
        56,

      borderRadius:
        16,

      backgroundColor:
        Colors.white,

      borderWidth:
        1.5,

      borderColor:
        Colors.rider,

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    homeButtonText: {

      color:
        Colors.rider,

      fontSize:
        16,

      fontWeight:
        "700",

    },

  });