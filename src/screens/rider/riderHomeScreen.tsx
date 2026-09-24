import React, {
  useState,
} from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import Colors from "../../constants/colors";


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "RiderHome"
  >;


type Props = {
  navigation: NavigationProp;
};


export default function RiderHomeScreen({
  navigation,
}: Props) {

  const [pickup, setPickup] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [passengers, setPassengers] =
    useState("1");


  // =====================================================
  // SEARCH RIDE
  // =====================================================

  const handleSearchRide = () => {

    if (
      !pickup.trim() ||
      !destination.trim() ||
      !date.trim() ||
      !time.trim() ||
      !passengers.trim()
    ) {

      Alert.alert(
        "Missing Information",
        "Please enter all ride details before searching."
      );

      return;
    }


    navigation.navigate(
      "SearchResults",
      {
        pickup: pickup.trim(),
        destination: destination.trim(),
        date: date.trim(),
        time: time.trim(),
        passengers: passengers.trim(),
      }
    );

  };


  return (

    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>

          <View>

            <Text style={styles.greeting}>
              Find your ride
            </Text>

            <Text style={styles.subtitle}>
              Where would you like to go?
            </Text>

          </View>

          <View style={styles.profileButton}>

            <Ionicons
              name="person"
              size={22}
              color={Colors.rider}
            />

          </View>

        </View>


        {/* =====================================================
            MAP / ROUTE AREA
        ===================================================== */}

        <View style={styles.mapContainer}>

          <View style={styles.mapBackground}>

            <View style={styles.mapLineOne} />

            <View style={styles.mapLineTwo} />

            <View style={styles.mapLineThree} />


            {/* PICKUP MARKER */}

            <View
              style={[
                styles.mapMarker,
                styles.pickupMarker,
              ]}
            >

              <Ionicons
                name="location"
                size={20}
                color="#FFFFFF"
              />

            </View>


            {/* DESTINATION MARKER */}

            <View
              style={[
                styles.mapMarker,
                styles.destinationMarker,
              ]}
            >

              <Ionicons
                name="flag"
                size={18}
                color="#FFFFFF"
              />

            </View>

          </View>


          <View style={styles.mapOverlay}>

            <Text style={styles.mapTitle}>
              Plan your journey
            </Text>

            <Text style={styles.mapSubtitle}>
              Search for available rides near you
            </Text>

          </View>

        </View>


        {/* =====================================================
            SEARCH CARD
        ===================================================== */}

        <View style={styles.searchCard}>

          <Text style={styles.searchTitle}>
            Search for a ride
          </Text>


          {/* PICKUP */}

          <View style={styles.inputContainer}>

            <Ionicons
              name="radio-button-on"
              size={19}
              color={Colors.rider}
            />

            <TextInput
              style={styles.input}
              placeholder="Pickup location"
              placeholderTextColor="#999"
              value={pickup}
              onChangeText={setPickup}
            />

          </View>


          {/* DESTINATION */}

          <View style={styles.inputContainer}>

            <Ionicons
              name="location-outline"
              size={21}
              color={Colors.rider}
            />

            <TextInput
              style={styles.input}
              placeholder="Destination"
              placeholderTextColor="#999"
              value={destination}
              onChangeText={setDestination}
            />

          </View>


          {/* DATE + TIME */}

          <View style={styles.row}>

            <View
              style={[
                styles.inputContainer,
                styles.halfInput,
              ]}
            >

              <Ionicons
                name="calendar-outline"
                size={19}
                color={Colors.rider}
              />

              <TextInput
                style={styles.input}
                placeholder="Date"
                placeholderTextColor="#999"
                value={date}
                onChangeText={setDate}
              />

            </View>


            <View
              style={[
                styles.inputContainer,
                styles.halfInput,
              ]}
            >

              <Ionicons
                name="time-outline"
                size={20}
                color={Colors.rider}
              />

              <TextInput
                style={styles.input}
                placeholder="Time"
                placeholderTextColor="#999"
                value={time}
                onChangeText={setTime}
              />

            </View>

          </View>


          {/* PASSENGERS */}

          <View style={styles.inputContainer}>

            <Ionicons
              name="people-outline"
              size={21}
              color={Colors.rider}
            />

            <TextInput
              style={styles.input}
              placeholder="Number of passengers"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={passengers}
              onChangeText={setPassengers}
            />

          </View>


          {/* SEARCH BUTTON */}

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchRide}
            activeOpacity={0.8}
          >

            <Ionicons
              name="search"
              size={21}
              color="#FFFFFF"
            />

            <Text style={styles.searchButtonText}>
              Search Ride
            </Text>

          </TouchableOpacity>

        </View>


        {/* =====================================================
            ROUTE / FARE INFORMATION
        ===================================================== */}

        <View style={styles.infoCard}>

          <View style={styles.infoIcon}>

            <Ionicons
              name="car-outline"
              size={23}
              color={Colors.rider}
            />

          </View>

          <View style={styles.infoContent}>

            <Text style={styles.infoTitle}>
              Find the right ride
            </Text>

            <Text style={styles.infoText}>
              Compare available rides based on
              your route, time and passenger needs.
            </Text>

          </View>

        </View>

      </ScrollView>

    </View>

  );

}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },


  scrollContent: {
    paddingBottom: 30,
  },


  // =====================================================
  // HEADER
  // =====================================================

  header: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },


  greeting: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
  },


  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#777",
  },


  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    elevation: 2,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },


  // =====================================================
  // MAP
  // =====================================================

  mapContainer: {
    marginHorizontal: 18,
    height: 235,

    borderRadius: 24,

    overflow: "hidden",

    backgroundColor: "#E8E8E8",
  },


  mapBackground: {
    flex: 1,
    backgroundColor: "#DDE4DF",
  },


  mapLineOne: {
    position: "absolute",

    width: 330,
    height: 3,

    backgroundColor: "#FFFFFF",

    top: 55,
    left: -20,

    transform: [
      {
        rotate: "12deg",
      },
    ],
  },


  mapLineTwo: {
    position: "absolute",

    width: 350,
    height: 4,

    backgroundColor: "#FFFFFF",

    top: 135,
    left: -25,

    transform: [
      {
        rotate: "-15deg",
      },
    ],
  },


  mapLineThree: {
    position: "absolute",

    width: 280,
    height: 3,

    backgroundColor: "#FFFFFF",

    top: 185,
    left: 55,

    transform: [
      {
        rotate: "8deg",
      },
    ],
  },


  mapMarker: {
    position: "absolute",

    width: 42,
    height: 42,

    borderRadius: 21,

    justifyContent: "center",
    alignItems: "center",

    elevation: 4,
  },


  pickupMarker: {
    backgroundColor: Colors.rider,

    left: 65,
    top: 65,
  },


  destinationMarker: {
    backgroundColor: "#333",

    right: 65,
    bottom: 55,
  },


  mapOverlay: {
    position: "absolute",

    left: 18,
    bottom: 18,
    right: 18,

    padding: 14,

    borderRadius: 15,

    backgroundColor:
      "rgba(255,255,255,0.92)",
  },


  mapTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },


  mapSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#777",
  },


  // =====================================================
  // SEARCH CARD
  // =====================================================

  searchCard: {
    marginHorizontal: 18,
    marginTop: 18,

    padding: 18,

    borderRadius: 22,

    backgroundColor: "#FFFFFF",

    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },


  searchTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.text,

    marginBottom: 14,
  },


  inputContainer: {
    minHeight: 52,

    borderWidth: 1,
    borderColor: "#E2E2E2",

    borderRadius: 14,

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 12,

    backgroundColor: "#FAFAFA",
  },


  input: {
    flex: 1,

    marginLeft: 10,

    fontSize: 14,

    color: Colors.text,
  },


  row: {
    flexDirection: "row",
    gap: 10,
  },


  halfInput: {
    flex: 1,
  },


  searchButton: {
    minHeight: 54,

    borderRadius: 15,

    backgroundColor:
      Colors.rider,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 4,

    gap: 9,
  },


  searchButtonText: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "700",
  },


  // =====================================================
  // INFORMATION CARD
  // =====================================================

  infoCard: {
    marginHorizontal: 18,
    marginTop: 16,

    padding: 16,

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    elevation: 2,
  },


  infoIcon: {
    width: 45,
    height: 45,

    borderRadius: 14,

    backgroundColor:
      `${Colors.rider}15`,

    justifyContent: "center",
    alignItems: "center",
  },


  infoContent: {
    flex: 1,
    marginLeft: 12,
  },


  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },


  infoText: {
    marginTop: 4,

    fontSize: 12,

    lineHeight: 18,

    color: "#777",
  },

});