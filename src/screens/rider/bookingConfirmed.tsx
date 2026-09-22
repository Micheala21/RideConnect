
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
      {/* Back Button */}

      <View style={styles.topSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={26}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Success Section */}

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

      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: booking.avatar }}
          style={styles.avatar}
        />

        <View style={styles.verifiedBadge}>
          <Ionicons
            name="checkmark"
            size={15}
            color={Colors.white}
          />
        </View>
      </View>

      {/* Driver Details Card */}

      <View style={styles.card}>

        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Ionicons
              name="person-outline"
              size={21}
              color={Colors.rider}
            />
          </View>

          <Text style={styles.sectionTitle}>
            Driver Details
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="person-outline"
              size={18}
              color={Colors.rider}
            />
          </View>

          <View style={styles.detailText}>
            <Text style={styles.label}>Driver</Text>
            <Text style={styles.value}>
              {booking.driver}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="car-outline"
              size={18}
              color={Colors.rider}
            />
          </View>

          <View style={styles.detailText}>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.value}>
              {booking.vehicle}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="star-outline"
              size={18}
              color={Colors.rider}
            />
          </View>

          <View style={styles.detailText}>
            <Text style={styles.label}>Rating</Text>
            <Text style={styles.value}>
              {booking.rating}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="people-outline"
              size={18}
              color={Colors.rider}
            />
          </View>

          <View style={styles.detailText}>
            <Text style={styles.label}>Available Seats</Text>
            <Text style={styles.value}>
              {booking.seats}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Trip Details */}

        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Ionicons
              name="navigate-outline"
              size={21}
              color={Colors.rider}
            />
          </View>

          <Text style={styles.sectionTitle}>
            Trip Details
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="location-outline"
              size={18}
              color={Colors.rider}
            />
          </View>

          <View style={styles.detailText}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.value}>
              {booking.pickupLocation}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="flag-outline"
              size={18}
              color={Colors.rider}
            />
          </View>

          <View style={styles.detailText}>
            <Text style={styles.label}>Destination</Text>
            <Text style={styles.value}>
              {booking.destination}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ionicons
              name="time-outline"
              size={18}
              color={Colors.rider}
            />
          </View>

          <View style={styles.detailText}>
            <Text style={styles.label}>Pickup Time</Text>
            <Text style={styles.value}>
              {booking.pickupTime}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Fare */}

        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>
              Total Fare
            </Text>

            <Text style={styles.priceSubtext}>
              Payment confirmed
            </Text>
          </View>

          <Text style={styles.price}>
            {booking.price}
          </Text>
        </View>
      </View>

      {/* Track Driver Button */}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("TrackDriver")}
        activeOpacity={0.8}
      >
        <Ionicons
          name="navigate"
          size={21}
          color={Colors.white}
        />

        <Text style={styles.primaryButtonText}>
          Track Driver
        </Text>

        <Ionicons
          name="arrow-forward"
          size={20}
          color={Colors.white}
          style={styles.buttonArrow}
        />
      </TouchableOpacity>

      {/* Back to Home */}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("RiderHome")}
        activeOpacity={0.8}
      >
        <Ionicons
          name="home-outline"
          size={20}
          color={Colors.rider}
        />

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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },

  topSection: {
    marginBottom: 10,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 5,
    marginBottom: 18,
    elevation: 4,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },

  subHeading: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 22,
    lineHeight: 21,
  },

  avatarContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 25,
  },

  avatar: {
    width: 115,
    height: 115,
    borderRadius: 58,
    backgroundColor: Colors.secondary,
    borderWidth: 4,
    borderColor: Colors.white,
  },

  verifiedBadge: {
    position: "absolute",
    right: 2,
    bottom: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.rider,
    borderWidth: 3,
    borderColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  cardHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF5FB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  detailText: {
    flex: 1,
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },

  value: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },

  separator: {
    height: 1,
    backgroundColor: "#E6EAF0",
    marginVertical: 10,
  },

  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 3,
  },

  priceLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },

  priceSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  price: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.rider,
  },

  primaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: Colors.rider,
    borderRadius: 16,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

  buttonArrow: {
    position: "absolute",
    right: 18,
  },

  secondaryButton: {
    width: "100%",
    height: 58,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.rider,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 13,
  },

  secondaryButtonText: {
    color: Colors.rider,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
});
