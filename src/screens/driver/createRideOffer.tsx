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


type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreateRideOffer"
>;


export default function CreateRideOfferScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  const [pickup, setPickup] = useState("");

  const [destination, setDestination] =
    useState("");

  const [date, setDate] = useState("");

  const [time, setTime] = useState("");

  const [price, setPrice] = useState("");

  const [seats, setSeats] = useState("");

  const [notes, setNotes] = useState("");

  const [saving, setSaving] =
    useState(false);


  // ==================================================
  // CREATE RIDE OFFER
  // ==================================================

  const handleCreateRide = async () => {

    // ------------------------------------------------
    // VALIDATION
    // ------------------------------------------------

    if (
      !pickup.trim() ||
      !destination.trim() ||
      !date.trim() ||
      !time.trim() ||
      !price.trim() ||
      !seats.trim()
    ) {

      Alert.alert(
        "Missing Information",
        "Please complete all required ride details."
      );

      return;
    }


    const numericPrice =
      Number(price.replace("R", "").trim());

    const numericSeats =
      Number(seats);


    if (
      Number.isNaN(numericPrice) ||
      numericPrice <= 0
    ) {

      Alert.alert(
        "Invalid Price",
        "Please enter a valid price."
      );

      return;
    }


    if (
      Number.isNaN(numericSeats) ||
      numericSeats <= 0
    ) {

      Alert.alert(
        "Invalid Seats",
        "Please enter a valid number of available seats."
      );

      return;
    }


    try {

      setSaving(true);


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


      if (userError || !user) {

        console.error(
          "Authentication error:",
          userError?.message
        );

        Alert.alert(
          "Authentication Error",
          "Please log in again before creating a ride offer."
        );

        return;
      }


      console.log(
        "Creating ride for driver:",
        user.id
      );


      // ------------------------------------------------
      // SAVE RIDE TO SUPABASE
      // ------------------------------------------------

      const {
        data: ride,
        error: rideError,
      } =
        await supabase
          .from("rides")
          .insert({
            driver_id: user.id,

            pickup_location:
              pickup.trim(),

            destination:
              destination.trim(),

            fare:
              numericPrice,

            status:
              "requested",

            ride_date:
              date.trim(),

            departure_time:
              time.trim(),

            available_seats:
              numericSeats,

            notes:
              notes.trim(),
          })
          .select()
          .single();


      // ------------------------------------------------
      // CHECK IF RIDE WAS SAVED
      // ------------------------------------------------

      if (rideError) {

        console.error(
          "Ride creation error:",
          rideError.message
        );

        Alert.alert(
          "Ride Creation Failed",
          rideError.message
        );

        return;
      }


      // ------------------------------------------------
      // CONFIRM DATABASE SAVE
      // ------------------------------------------------

      console.log(
        "Ride saved to Supabase:",
        ride
      );


      // ------------------------------------------------
      // SUCCESS
      // ------------------------------------------------

      navigation.navigate(
        "RideOfferConfirmation",
        {
          rideId: ride.id,
        }
      );


    } catch (error) {

      console.error(
        "Create ride error:",
        error
      );

      Alert.alert(
        "Error",
        "Something went wrong while saving the ride offer."
      );

    } finally {

      setSaving(false);

    }
  };


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
            navigation.navigate("DriverHome")
          }
          activeOpacity={0.7}
          disabled={saving}
        >

          <Ionicons
            name="arrow-back"
            size={25}
            color={Colors.primary}
          />

        </TouchableOpacity>


        {/* ================= HEADER ================= */}

        <Text style={styles.heading}>
          Create Ride Offer
        </Text>

        <Text style={styles.subtitle}>
          Enter your trip details to make your
          ride available to passengers.
        </Text>


        {/* ================= FORM CARD ================= */}

        <View style={styles.formCard}>

          {/* Pickup */}

          <InputField
            label="Pickup Location"
            icon="location-outline"
            placeholder="Enter pickup location"
            value={pickup}
            onChangeText={setPickup}
          />


          {/* Destination */}

          <InputField
            label="Destination"
            icon="flag-outline"
            placeholder="Enter destination"
            value={destination}
            onChangeText={setDestination}
          />


          {/* Date */}

          <InputField
            label="Date"
            icon="calendar-outline"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />


          {/* Time */}

          <InputField
            label="Departure Time"
            icon="time-outline"
            placeholder="08:30 AM"
            value={time}
            onChangeText={setTime}
          />


          {/* Seats */}

          <InputField
            label="Available Seats"
            icon="people-outline"
            placeholder="Number of seats"
            value={seats}
            onChangeText={setSeats}
            keyboardType="numeric"
          />


          {/* Price */}

          <InputField
            label="Price Per Passenger"
            icon="cash-outline"
            placeholder="R120"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />


          {/* Notes */}

          <Text style={styles.label}>
            Additional Notes
          </Text>

          <TextInput
            style={styles.notesInput}
            placeholder="Any extra information..."
            placeholderTextColor={
              Colors.textSecondary
            }
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />

        </View>


        {/* ================= CREATE BUTTON ================= */}

        <TouchableOpacity
          style={[
            styles.createButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleCreateRide}
          activeOpacity={0.8}
          disabled={saving}
        >

          {saving ? (

            <ActivityIndicator
              size="small"
              color={Colors.white}
            />

          ) : (

            <>

              <Ionicons
                name="checkmark-circle-outline"
                size={23}
                color={Colors.white}
              />

              <Text style={styles.createButtonText}>
                Create Ride Offer
              </Text>

            </>

          )}

        </TouchableOpacity>


        {/* ================= CANCEL ================= */}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            navigation.navigate("DriverHome")
          }
          activeOpacity={0.7}
          disabled={saving}
        >

          <Text style={styles.cancelText}>
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

  icon: keyof typeof Ionicons.glyphMap;

  placeholder: string;

  value: string;

  onChangeText: (text: string) => void;

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

    <View style={styles.inputContainer}>

      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.inputWrapper}>

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
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />

      </View>

    </View>
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

  content: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },


  // =================================================
  // BACK BUTTON
  // =================================================

  backButton: {
    width: 45,
    height: 45,

    borderRadius: 23,

    backgroundColor: Colors.white,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 18,

    elevation: 3,

    shadowOpacity: 0.08,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },


  // =================================================
  // HEADER
  // =================================================

  heading: {
    fontSize: 30,

    fontWeight: "700",

    color: Colors.primary,
  },

  subtitle: {
    marginTop: 6,

    marginBottom: 25,

    color: Colors.textSecondary,

    fontSize: 15,

    lineHeight: 21,
  },


  // =================================================
  // FORM
  // =================================================

  formCard: {
    backgroundColor: Colors.white,

    borderRadius: 20,

    padding: 20,

    elevation: 4,

    shadowOpacity: 0.05,

    shadowRadius: 7,

    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  inputContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 14,

    fontWeight: "700",

    color: Colors.primary,

    marginBottom: 8,
  },

  inputWrapper: {
    height: 53,

    backgroundColor: "#F7F9FC",

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#E6EAF0",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 15,
  },

  input: {
    flex: 1,

    marginLeft: 10,

    color: Colors.primary,

    fontSize: 15,
  },

  notesInput: {
    backgroundColor: "#F7F9FC",

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#E6EAF0",

    minHeight: 115,

    padding: 15,

    color: Colors.primary,

    fontSize: 15,

    marginBottom: 2,
  },


  // =================================================
  // CREATE BUTTON
  // =================================================

  createButton: {
    height: 58,

    backgroundColor: Colors.driver,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    flexDirection: "row",

    marginTop: 25,

    elevation: 2,
  },

  disabledButton: {
    opacity: 0.7,
  },

  createButtonText: {
    color: Colors.white,

    fontSize: 17,

    fontWeight: "700",

    marginLeft: 9,
  },


  // =================================================
  // CANCEL
  // =================================================

  cancelButton: {
    height: 52,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 8,
  },

  cancelText: {
    fontSize: 15,

    fontWeight: "600",

    color: Colors.textSecondary,
  },

});