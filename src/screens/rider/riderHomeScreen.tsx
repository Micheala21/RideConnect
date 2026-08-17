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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RiderHome"
>;

export default function RiderHomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {/* ================= MAP PLACEHOLDER ================= */}

      <View style={styles.mapContainer}>
        <Ionicons
          name="map"
          size={70}
          color="#6B7280"
        />

        <Text style={styles.mapTitle}>
          Google Map
        </Text>

        <Text style={styles.mapSubtitle}>
          Map will be displayed here
        </Text>

        {/* Current Location Button */}

        <TouchableOpacity style={styles.locationButton}>
          <Ionicons
            name="locate"
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* ================= BOTTOM CARD ================= */}

      <View style={styles.bottomCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>
            Search Ride
          </Text>

          <Text style={styles.subHeading}>
            Enter your trip details below.
          </Text>

          {/* Pickup */}

          <View style={styles.inputContainer}>
            <Ionicons
              name="location"
              size={20}
              color={Colors.rider}
            />

            <TextInput
              placeholder="Pickup Location"
              value={pickup}
              onChangeText={setPickup}
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          {/* Destination */}

          <View style={styles.inputContainer}>
            <Ionicons
              name="flag"
              size={20}
              color={Colors.rider}
            />

            <TextInput
              placeholder="Destination"
              value={destination}
              onChangeText={setDestination}
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          {/* Date */}

          <View style={styles.inputContainer}>
            <Ionicons
              name="calendar"
              size={20}
              color={Colors.rider}
            />

            <TextInput
              placeholder="Date"
              value={date}
              onChangeText={setDate}
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          {/* Time */}

          <View style={styles.inputContainer}>
            <Ionicons
              name="time"
              size={20}
              color={Colors.rider}
            />

            <TextInput
              placeholder="Time"
              value={time}
              onChangeText={setTime}
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          {/* Passengers */}

          <View style={styles.inputContainer}>
            <Ionicons
              name="people"
              size={20}
              color={Colors.rider}
            />

            <TextInput
              placeholder="Passengers"
              keyboardType="numeric"
              value={passengers}
              onChangeText={setPassengers}
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>

          {/* Vicinity */}

          <View style={styles.vicinityCard}>
            <Text style={styles.vicinityTitle}>
              Nearby Information
            </Text>

            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={Colors.rider}
              />

              <Text style={styles.infoText}>
                Current Area: Bellville
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="car-outline"
                size={18}
                color={Colors.rider}
              />

              <Text style={styles.infoText}>
                Drivers Nearby: 8
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="timer-outline"
                size={18}
                color={Colors.rider}
              />

              <Text style={styles.infoText}>
                Average Wait: 5 min
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="navigate-outline"
                size={18}
                color={Colors.rider}
              />

              <Text style={styles.infoText}>
                Closest Driver: 850 m
              </Text>
            </View>
          </View>

          {/* Search Button */}

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate("SearchResults")}
          >
            <Text style={styles.searchButtonText}>
              Search Ride
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  mapContainer: {
    flex: 1,
    backgroundColor: "#DCEAF5",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  mapTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 15,
  },

  mapSubtitle: {
    color: Colors.textSecondary,
    marginTop: 8,
  },

  locationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: Colors.rider,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  bottomCard: {
    flex: 1.25,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },

  subHeading: {
    color: Colors.textSecondary,
    marginTop: 5,
    marginBottom: 20,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    height: 55,
    marginLeft: 10,
    color: Colors.primary,
  },

  vicinityCard: {
    marginTop: 10,
    backgroundColor: "#EEF5FB",
    borderRadius: 18,
    padding: 18,
  },

  vicinityTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 15,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  infoText: {
    marginLeft: 10,
    color: Colors.textSecondary,
    fontSize: 15,
  },

  searchButton: {
    backgroundColor: Colors.rider,
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 20,
  },

  searchButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 18,
  },
});