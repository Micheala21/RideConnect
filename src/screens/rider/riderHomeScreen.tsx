
import React, { useState } from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

import RideMap from "../../components/RideMap";


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "RiderHome"
  >;


export default function RiderHomeScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  const [pickup, setPickup] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [passengers, setPassengers] =
    useState("");


  return (

    <SafeAreaView
      style={styles.container}
    >

      {/* ================= MAP ================= */}

      <View style={styles.mapContainer}>

        <RideMap />

      </View>


      {/* ================= BOTTOM CARD ================= */}

      <View style={styles.bottomCard}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* ================= HEADER ================= */}

          <View style={styles.header}>

            <Text style={styles.heading}>
              Search Ride
            </Text>

            <Text style={styles.subHeading}>
              Find a ride that matches your trip.
            </Text>

          </View>


          {/* ================= PICKUP ================= */}

          <Text style={styles.label}>
            Pickup Location
          </Text>

          <View
            style={styles.inputContainer}
          >

            <View style={styles.iconContainer}>

              <Ionicons
                name="location"
                size={20}
                color={Colors.rider}
              />

            </View>

            <TextInput
              placeholder="Enter pickup location"
              value={pickup}
              onChangeText={setPickup}
              style={styles.input}
              placeholderTextColor={Colors.textSecondary}
            />

          </View>


          {/* ================= DESTINATION ================= */}

          <Text style={styles.label}>
            Destination
          </Text>

          <View
            style={styles.inputContainer}
          >

            <View style={styles.iconContainer}>

              <Ionicons
                name="flag"
                size={20}
                color={Colors.rider}
              />

            </View>

            <TextInput
              placeholder="Enter destination"
              value={destination}
              onChangeText={setDestination}
              style={styles.input}
              placeholderTextColor={Colors.textSecondary}
            />

          </View>


          {/* ================= DATE ================= */}

          <Text style={styles.label}>
            Date
          </Text>

          <View
            style={styles.inputContainer}
          >

            <View style={styles.iconContainer}>

              <Ionicons
                name="calendar"
                size={20}
                color={Colors.rider}
              />

            </View>

            <TextInput
              placeholder="Select date"
              value={date}
              onChangeText={setDate}
              style={styles.input}
              placeholderTextColor={Colors.textSecondary}
            />

          </View>


          {/* ================= TIME ================= */}

          <Text style={styles.label}>
            Departure Time
          </Text>

          <View
            style={styles.inputContainer}
          >

            <View style={styles.iconContainer}>

              <Ionicons
                name="time"
                size={20}
                color={Colors.rider}
              />

            </View>

            <TextInput
              placeholder="Select departure time"
              value={time}
              onChangeText={setTime}
              style={styles.input}
              placeholderTextColor={Colors.textSecondary}
            />

          </View>


          {/* ================= PASSENGERS ================= */}

          <Text style={styles.label}>
            Passengers
          </Text>

          <View
            style={styles.inputContainer}
          >

            <View style={styles.iconContainer}>

              <Ionicons
                name="people"
                size={20}
                color={Colors.rider}
              />

            </View>

            <TextInput
              placeholder="Number of passengers"
              keyboardType="numeric"
              value={passengers}
              onChangeText={setPassengers}
              style={styles.input}
              placeholderTextColor={Colors.textSecondary}
            />

          </View>


          {/* ================= SEARCH BUTTON ================= */}

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() =>
              navigation.navigate(
                "SearchResults"
              )
            }
            activeOpacity={0.8}
          >

            <Ionicons
              name="search"
              size={21}
              color={Colors.white}
            />

            <Text
              style={styles.searchButtonText}
            >
              Search Ride
            </Text>

          </TouchableOpacity>


        </ScrollView>

      </View>

    </SafeAreaView>

  );
}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  // ================= CONTAINER =================

  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },


  // ================= MAP =================

  mapContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },


  // ================= BOTTOM CARD =================

  bottomCard: {
    flex: 1.25,

    backgroundColor:
      Colors.white,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    paddingTop: 24,
    paddingHorizontal: 20,

    elevation: 8,
  },


  scrollContent: {
    paddingBottom: 25,
  },


  // ================= HEADER =================

  header: {
    marginBottom: 12,
  },


  heading: {
    fontSize: 28,

    fontWeight: "700",

    color:
      Colors.primary,
  },


  subHeading: {
    color:
      Colors.textSecondary,

    fontSize: 15,

    marginTop: 5,

    lineHeight: 21,
  },


  // ================= LABELS =================

  label: {
    fontSize: 14,

    fontWeight: "600",

    color:
      Colors.primary,

    marginBottom: 7,

    marginTop: 10,
  },


  // ================= INPUTS =================

  inputContainer: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      Colors.background,

    borderRadius: 15,

    minHeight: 58,

    paddingHorizontal: 12,

    marginBottom: 8,

    borderWidth: 1,

    borderColor: "#E6EAF0",
  },


  iconContainer: {
    width: 36,

    height: 36,

    borderRadius: 18,

    backgroundColor:
      Colors.white,

    justifyContent:
      "center",

    alignItems:
      "center",
  },


  input: {
    flex: 1,

    height: 55,

    marginLeft: 10,

    color:
      Colors.primary,

    fontSize: 15,
  },


  // ================= SEARCH BUTTON =================

  searchButton: {
    backgroundColor:
      Colors.rider,

    height: 58,

    borderRadius: 16,

    justifyContent:
      "center",

    alignItems:
      "center",

    flexDirection: "row",

    marginTop: 22,

    marginBottom: 10,

    elevation: 3,
  },


  searchButtonText: {
    color:
      Colors.white,

    fontWeight: "700",

    fontSize: 18,

    marginLeft: 8,
  },

});
