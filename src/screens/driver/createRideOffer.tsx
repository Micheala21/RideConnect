import React, { useState } from "react";
import {
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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreateRideOffer"
>;
export default function CreateRideOfferScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreateRide = () => {
    console.log("Ride Created");

    // Later:
    // navigation.navigate("RideOfferCreated");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>
          Create Ride Offer
        </Text>

        <Text style={styles.subtitle}>
          Enter your trip details to make your ride available to passengers.
        </Text>

        {/* Pickup */}

        <Text style={styles.label}>Pickup Location</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="location-outline"
            size={22}
            color={Colors.driver}
          />

          <TextInput
            placeholder="Enter pickup location"
            value={pickup}
            onChangeText={setPickup}
            style={styles.input}
          />
        </View>

        {/* Destination */}

        <Text style={styles.label}>Destination</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="flag-outline"
            size={22}
            color={Colors.driver}
          />

          <TextInput
            placeholder="Enter destination"
            value={destination}
            onChangeText={setDestination}
            style={styles.input}
          />
        </View>

        {/* Date */}

        <Text style={styles.label}>Date</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={Colors.driver}
          />

          <TextInput
            placeholder="DD/MM/YYYY"
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />
        </View>

        {/* Time */}

        <Text style={styles.label}>Departure Time</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="time-outline"
            size={22}
            color={Colors.driver}
          />

          <TextInput
            placeholder="08:30 AM"
            value={time}
            onChangeText={setTime}
            style={styles.input}
          />
        </View>

        {/* Seats */}

        <Text style={styles.label}>Available Seats</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="people-outline"
            size={22}
            color={Colors.driver}
          />

          <TextInput
            placeholder="Number of seats"
            keyboardType="numeric"
            value={seats}
            onChangeText={setSeats}
            style={styles.input}
          />
        </View>

        {/* Price */}

        <Text style={styles.label}>Price Per Passenger</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="cash-outline"
            size={22}
            color={Colors.driver}
          />

          <TextInput
            placeholder="R120"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            style={styles.input}
          />
        </View>

        {/* Notes */}

        <Text style={styles.label}>Additional Notes</Text>

        <TextInput
          style={styles.notesInput}
          placeholder="Any extra information..."
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />

     <TouchableOpacity
  style={styles.secondaryButton}
  onPress={() => navigation.navigate("RideOfferConfirmation")}
>
  <Ionicons
    name="checkmark-circle"
    size={22}
    color={Colors.driver}
  />

  <Text style={styles.secondaryButtonText}>
    Create Ride Offer
  </Text>
</TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 30,
    color: Colors.textSecondary,
    fontSize: 15,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 8,
    marginTop: 10,
  },

  inputContainer: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    color: Colors.primary,
    fontSize: 16,
  },

  notesInput: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    minHeight: 120,
    padding: 15,
    color: Colors.primary,
    marginBottom: 30,
    elevation: 2,
  },

  button: {
    height: 58,
    backgroundColor: Colors.driver,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  secondaryButton: {
     width: "100%",
  height: 58,
  borderWidth: 2,
  borderColor: Colors.driver,
  borderRadius: 15,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  marginTop: 15,
},

secondaryButtonText: {
  color: Colors.driver,
  fontSize: 18,
  fontWeight: "700",
  marginLeft: 10,
},
});