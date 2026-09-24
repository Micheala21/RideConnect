import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import { supabase } from "../../lib/supabaseClient";


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "CreateRideOffer"
  >;


export default function CreateRideOfferScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  // ==================================================
  // RIDE STATES
  // ==================================================

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

  const [estimatedFare, setEstimatedFare] =
    useState<number | null>(null);

  const [driverFare, setDriverFare] =
    useState("");

  const [fareAccepted, setFareAccepted] =
    useState(false);

  const [creatingRide, setCreatingRide] =
    useState(false);


  // ==================================================
  // SHOW ROUTE / ESTIMATE FARE
  // ==================================================

  const createRoute = () => {

    if (
      !pickup.trim() ||
      !destination.trim()
    ) {

      Alert.alert(
        "Missing Route",
        "Please enter both a starting point and destination."
      );

      return;
    }


    // Same estimated fare used on Home page
    const calculatedFare =
      35;


    setEstimatedFare(
      calculatedFare
    );

    setDriverFare(
      String(calculatedFare)
    );

    setFareAccepted(
      false
    );

  };


  // ==================================================
  // ACCEPT ESTIMATED FARE
  // ==================================================

  const acceptEstimatedFare = () => {

    if (
      estimatedFare === null
    ) {

      return;

    }


    setDriverFare(
      String(estimatedFare)
    );

    setFareAccepted(
      true
    );

  };


  // ==================================================
  // CREATE RIDE OFFER
  // ==================================================

  const handleCreateRide = async () => {

    // ------------------------------------------------
    // REQUIRED INFORMATION
    // ------------------------------------------------

    if (
      !pickup.trim() ||
      !destination.trim()
    ) {

      Alert.alert(
        "Missing Information",
        "Please enter your pickup location and destination."
      );

      return;

    }


    if (
      !rideDate.trim() ||
      !departureTime.trim()
    ) {

      Alert.alert(
        "Missing Information",
        "Please enter the ride date and departure time."
      );

      return;

    }


    if (
      !availableSeats.trim()
    ) {

      Alert.alert(
        "Missing Information",
        "Please enter the number of available seats."
      );

      return;

    }


    const fare =
      Number(driverFare);


    if (
      !fare ||
      fare <= 0
    ) {

      Alert.alert(
        "Invalid Fare",
        "Please enter a valid fare per passenger."
      );

      return;

    }


    const seats =
      Number(availableSeats);


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


    try {

      setCreatingRide(
        true
      );


      // ------------------------------------------------
      // GET CURRENT DRIVER
      // ------------------------------------------------

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
          "Authentication error:",
          userError?.message
        );

        Alert.alert(
          "Session Error",
          "You are not logged in."
        );

        return;

      }


      // ------------------------------------------------
      // CREATE RIDE IN SUPABASE
      // ------------------------------------------------

      const {
        data,
        error,
      } =
        await supabase

          .from("rides")

          .insert({

            driver_id:
              user.id,

            pickup_location:
              pickup.trim(),

            destination:
              destination.trim(),

            fare:
              fare,

            status:
              "available",

            ride_date:
              rideDate.trim(),

            departure_time:
              departureTime.trim(),

            available_seats:
              seats,

            notes:
              null,

          })

          .select("id")

          .single();


      // ------------------------------------------------
      // CHECK DATABASE RESULT
      // ------------------------------------------------

      if (error) {

        console.error(
          "Ride creation error:",
          error.message
        );

        Alert.alert(
          "Ride Creation Failed",
          error.message
        );

        return;

      }


      if (
        !data?.id
      ) {

        Alert.alert(
          "Error",
          "The ride was created but no ride ID was returned."
        );

        return;

      }


      console.log(
        "Created ride ID:",
        data.id
      );


      // ------------------------------------------------
      // GO TO RIDE CONFIRMATION
      // ------------------------------------------------

      navigation.navigate(
        "RideConfirmation",
        {
          rideId:
            data.id,
        }
      );


    } catch (error) {

      console.error(
        "Create ride error:",
        error
      );

      Alert.alert(
        "Error",
        "Could not create the ride offer."
      );

    } finally {

      setCreatingRide(
        false
      );

    }

  };


  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate(
              "DriverHome"
            )
          }
          activeOpacity={0.7}
          disabled={creatingRide}
        >

          <Ionicons
            name="arrow-back"
            size={25}
            color={Colors.primary}
          />

        </TouchableOpacity>


        {/* ==================================================
            HEADER
        ================================================== */}

        <Text
          style={styles.heading}
        >
          Create a Ride
        </Text>

        <Text
          style={styles.subtitle}
        >
          Enter your trip details
        </Text>


        {/* ==================================================
            FORM CARD
        ================================================== */}

        <View
          style={styles.formCard}
        >

          {/* ==================================================
              PICKUP
          ================================================== */}

          <InputField
            label="Pickup Location"
            icon="location-outline"
            placeholder="Enter pickup location"
            value={pickup}
            onChangeText={setPickup}
          />


          {/* ==================================================
              DESTINATION
          ================================================== */}

          <InputField
            label="Destination"
            icon="flag-outline"
            placeholder="Enter destination"
            value={destination}
            onChangeText={setDestination}
          />


          {/* ==================================================
              SHOW ROUTE
          ================================================== */}

          <TouchableOpacity
            style={styles.routeButton}
            onPress={createRoute}
            activeOpacity={0.8}
          >

            <Ionicons
              name="navigate-outline"
              size={21}
              color={Colors.white}
            />

            <Text
              style={styles.routeButtonText}
            >
              Show Route
            </Text>

          </TouchableOpacity>


          {/* ==================================================
              ESTIMATED FARE
          ================================================== */}

          {estimatedFare !== null && (

            <View
              style={styles.fareCard}
            >

              <View>

                <Text
                  style={styles.fareTitle}
                >
                  Estimated Fare
                </Text>

                <Text
                  style={styles.fareAmount}
                >
                  R{estimatedFare}
                </Text>

              </View>


              {!fareAccepted && (

                <TouchableOpacity
                  style={
                    styles.acceptButton
                  }
                  onPress={
                    acceptEstimatedFare
                  }
                  activeOpacity={0.8}
                >

                  <Text
                    style={
                      styles.acceptButtonText
                    }
                  >
                    Accept
                  </Text>

                </TouchableOpacity>

              )}


              {fareAccepted && (

                <View
                  style={
                    styles.acceptedBadge
                  }
                >

                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={
                      Colors.success
                    }
                  />

                  <Text
                    style={
                      styles.acceptedText
                    }
                  >
                    Accepted
                  </Text>

                </View>

              )}

            </View>

          )}


          {/* ==================================================
              RIDE DATE
          ================================================== */}

          <InputField
            label="Ride Date"
            icon="calendar-outline"
            placeholder="YYYY-MM-DD"
            value={rideDate}
            onChangeText={setRideDate}
          />


          {/* ==================================================
              DEPARTURE TIME
          ================================================== */}

          <InputField
            label="Departure Time"
            icon="time-outline"
            placeholder="08:30 AM"
            value={departureTime}
            onChangeText={setDepartureTime}
          />


          {/* ==================================================
              AVAILABLE SEATS
          ================================================== */}

          <InputField
            label="Available Seats"
            icon="people-outline"
            placeholder="Number of seats"
            value={availableSeats}
            onChangeText={
              setAvailableSeats
            }
            keyboardType="numeric"
          />


          {/* ==================================================
              FARE PER PASSENGER
          ================================================== */}

          <InputField
            label="Fare Per Passenger"
            icon="cash-outline"
            placeholder="Enter fare"
            value={driverFare}
            onChangeText={setDriverFare}
            keyboardType="numeric"
          />

        </View>


        {/* ==================================================
            CREATE RIDE BUTTON
        ================================================== */}

        <TouchableOpacity
          style={[
            styles.createButton,
            creatingRide &&
              styles.disabledButton,
          ]}
          onPress={
            handleCreateRide
          }
          disabled={
            creatingRide
          }
          activeOpacity={0.8}
        >

          {creatingRide ? (

            <>

              <ActivityIndicator
                size="small"
                color={Colors.white}
              />

              <Text
                style={
                  styles.createButtonText
                }
              >
                Creating Ride...
              </Text>

            </>

          ) : (

            <>

              <Ionicons
                name="car-outline"
                size={22}
                color={Colors.white}
              />

              <Text
                style={
                  styles.createButtonText
                }
              >
                Create Ride Offer
              </Text>

            </>

          )}

        </TouchableOpacity>


        {/* ==================================================
            CANCEL
        ================================================== */}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            navigation.navigate(
              "DriverHome"
            )
          }
          activeOpacity={0.7}
          disabled={creatingRide}
        >

          <Text
            style={styles.cancelText}
          >
            Cancel
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>

  );

}


// ==================================================
// INPUT FIELD
// ==================================================

interface InputFieldProps {

  label: string;

  icon:
    keyof typeof Ionicons.glyphMap;

  placeholder: string;

  value: string;

  onChangeText:
    (text: string) => void;

  keyboardType?:
    | "default"
    | "numeric"
    | "email-address"
    | "phone-pad";
}


function InputField({

  label,

  icon,

  placeholder,

  value,

  onChangeText,

  keyboardType = "default",

}: InputFieldProps) {

  return (

    <View
      style={styles.inputContainer}
    >

      <Text
        style={styles.label}
      >
        {label}
      </Text>

      <View
        style={styles.inputWrapper}
      >

        <Ionicons
          name={icon}
          size={21}
          color={Colors.driver}
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={
            Colors.textSecondary
          }
          value={value}
          onChangeText={
            onChangeText
          }
          keyboardType={
            keyboardType
          }
        />

      </View>

    </View>

  );

}


// ==================================================
// STYLES
// ==================================================

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        Colors.background,

    },


    content: {

      paddingHorizontal:
        20,

      paddingTop:
        15,

      paddingBottom:
        40,

    },


    // =================================================
    // BACK BUTTON
    // =================================================

    backButton: {

      width:
        45,

      height:
        45,

      borderRadius:
        23,

      backgroundColor:
        Colors.white,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginBottom:
        18,

      elevation:
        3,

      shadowOpacity:
        0.08,

      shadowRadius:
        5,

      shadowOffset: {

        width:
          0,

        height:
          2,

      },

    },


    // =================================================
    // HEADER
    // =================================================

    heading: {

      fontSize:
        30,

      fontWeight:
        "700",

      color:
        Colors.primary,

    },


    subtitle: {

      marginTop:
        6,

      marginBottom:
        25,

      color:
        Colors.textSecondary,

      fontSize:
        15,

      lineHeight:
        21,

    },


    // =================================================
    // FORM
    // =================================================

    formCard: {

      backgroundColor:
        Colors.white,

      borderRadius:
        20,

      padding:
        20,

      elevation:
        4,

      shadowOpacity:
        0.05,

      shadowRadius:
        7,

      shadowOffset: {

        width:
          0,

        height:
          3,

      },

    },


    inputContainer: {

      marginBottom:
        17,

    },


    label: {

      fontSize:
        14,

      fontWeight:
        "700",

      color:
        Colors.primary,

      marginBottom:
        8,

    },


    inputWrapper: {

      height:
        53,

      backgroundColor:
        "#F7F9FC",

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        "#E6EAF0",

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        15,

    },


    input: {

      flex:
        1,

      marginLeft:
        10,

      color:
        Colors.primary,

      fontSize:
        15,

    },


    // =================================================
    // ROUTE BUTTON
    // =================================================

    routeButton: {

      height:
        54,

      backgroundColor:
        Colors.driver,

      borderRadius:
        15,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        5,

      marginBottom:
        15,

    },


    routeButtonText: {

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
    // FARE CARD
    // =================================================

    fareCard: {

      backgroundColor:
        "#F7F9FC",

      borderRadius:
        16,

      padding:
        16,

      marginBottom:
        10,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E6EAF0",

    },


    fareTitle: {

      fontSize:
        13,

      color:
        Colors.textSecondary,

    },


    fareAmount: {

      fontSize:
        25,

      fontWeight:
        "700",

      color:
        Colors.driver,

      marginTop:
        2,

    },


    acceptButton: {

      backgroundColor:
        Colors.driver,

      paddingHorizontal:
        18,

      paddingVertical:
        10,

      borderRadius:
        10,

    },


    acceptButtonText: {

      color:
        Colors.white,

      fontWeight:
        "700",

    },


    acceptedBadge: {

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    acceptedText: {

      color:
        Colors.success,

      fontWeight:
        "700",

      marginLeft:
        5,

    },


    // =================================================
    // CREATE BUTTON
    // =================================================

    createButton: {

      height:
        58,

      backgroundColor:
        Colors.driver,

      borderRadius:
        16,

      justifyContent:
        "center",

      alignItems:
        "center",

      flexDirection:
        "row",

      marginTop:
        25,

      elevation:
        2,

    },


    disabledButton: {

      opacity:
        0.7,

    },


    createButtonText: {

      color:
        Colors.white,

      fontSize:
        17,

      fontWeight:
        "700",

      marginLeft:
        9,

    },


    // =================================================
    // CANCEL
    // =================================================

    cancelButton: {

      height:
        52,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginTop:
        8,

    },


    cancelText: {

      fontSize:
        15,

      fontWeight:
        "600",

      color:
        Colors.textSecondary,

    },

  });

