import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "DriverHome"
>;

export default function RideOfferConfirmationScreen() {
  const navigation = useNavigation<NavigationProp>();

  const ride = {
    pickup: "CPUT Bellville Campus",
    destination: "Cape Town CBD",
    departure: "08:30 AM",
    seats: 3,
    price: "R120",
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Icon */}

      <View style={styles.successCircle}>
        <Ionicons
          name="checkmark"
          size={55}
          color={Colors.white}
        />
      </View>

      <Text style={styles.heading}>
        Ride Offer Created!
      </Text>

      <Text style={styles.subHeading}>
        Your ride is now available for riders to book.
      </Text>

      {/* Ride Summary */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Ride Summary
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>
            {ride.pickup}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.value}>
            {ride.destination}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Departure</Text>
          <Text style={styles.value}>
            {ride.departure}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Available Seats</Text>
          <Text style={styles.value}>
            {ride.seats}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>
            Price Per Rider
          </Text>

          <Text style={styles.price}>
            {ride.price}
          </Text>
        </View>

      </View>

      {/* Buttons */}

      <TouchableOpacity
  style={styles.primaryButton}
  onPress={() => navigation.navigate("ViewMyRide")}
>
        <Ionicons
          name="car-sport"
          size={20}
          color={Colors.white}
        />

        <Text style={styles.primaryButtonText}>
          View My Ride
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("DriverHome")}
      >
        <Text style={styles.secondaryButtonText}>
          Back to Home
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    padding: 20,
    paddingBottom: 40,
  },

  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 20,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
  },

  subHeading: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25,
  },

  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
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
    justifyContent: "space-between",
    marginVertical: 8,
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 15,
  },

  value: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 15,
    maxWidth: "55%",
    textAlign: "right",
  },

  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },

  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  priceLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },

  price: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.driver,
  },

  primaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: Colors.driver,
    borderRadius: 14,
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },

  secondaryButton: {
    width: "100%",
    height: 58,
    borderWidth: 2,
    borderColor: Colors.driver,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  secondaryButtonText: {
    color: Colors.driver,
    fontSize: 18,
    fontWeight: "700",
  },

});