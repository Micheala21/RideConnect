import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
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

export default function BookingConfirmedScreen() {
  const navigation = useNavigation<NavigationProp>();

  const booking = {
    driver: "Alice Johnson",
    vehicle: "Toyota Prius",
    rating: 4.9,
    price: "R120",
    pickupTime: "08:30 AM",
    pickupLocation: "CPUT Bellville Campus",
    destination: "Cape Town CBD",
    seats: 3,
    avatar: "https://placehold.co/150x150",
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
        Booking Confirmed!
      </Text>

      <Text style={styles.subHeading}>
        Your driver has accepted your booking.
      </Text>

      {/* Driver Image */}

      <Image
        source={{ uri: booking.avatar }}
        style={styles.avatar}
      />

      {/* Driver Details */}

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Driver Details
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Driver</Text>
          <Text style={styles.value}>{booking.driver}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Vehicle</Text>
          <Text style={styles.value}>{booking.vehicle}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Rating</Text>
          <Text style={styles.value}>⭐ {booking.rating}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Seats</Text>
          <Text style={styles.value}>{booking.seats}</Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>
          Trip Details
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>{booking.pickupLocation}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.value}>{booking.destination}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Pickup Time</Text>
          <Text style={styles.value}>{booking.pickupTime}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>
            Total Fare
          </Text>

          <Text style={styles.price}>
            {booking.price}
          </Text>
        </View>

      </View>

      {/* Buttons */}

<TouchableOpacity
  style={styles.primaryButton}
  onPress={() => navigation.navigate("TrackDriver")}
>
  <Ionicons
    name="navigate"
    size={20}
    color={Colors.white}
  />

  <Text style={styles.primaryButtonText}>
    Track Driver
  </Text>
</TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("RiderHome")}
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
    marginTop: 20,
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

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 25,
    backgroundColor: Colors.secondary,
  },

  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 15,
  },

  value: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
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
    color: Colors.rider,
  },

  primaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: Colors.rider,
    borderRadius: 14,
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.rider,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  secondaryButtonText: {
    color: Colors.rider,
    fontSize: 18,
    fontWeight: "700",
  },
});