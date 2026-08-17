import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RideDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const driver = {
    name: "Alice Johnson",
    vehicle: "Toyota Prius",
    rating: 4.9,
    price: "R120",
    pickup: "CPUT Bellville Campus",
    destination: "Cape Town CBD",
    departure: "08:30 AM",
    seats: 3,
    gender: "Female",
    phone: "082 123 4567",
    avatar: "https://placehold.co/200x200",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Driver Avatar */}

        <Image
          source={{ uri: driver.avatar }}
          style={styles.avatar}
        />

        <Text style={styles.name}>
          {driver.name}
        </Text>

        <Text style={styles.rating}>
          ⭐ {driver.rating} • Verified Driver
        </Text>

        {/* Driver Information */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Driver Information
          </Text>

          <DetailRow
            icon="car-outline"
            title="Vehicle"
            value={driver.vehicle}
          />

          <DetailRow
            icon="person-outline"
            title="Gender"
            value={driver.gender}
          />

          <DetailRow
            icon="call-outline"
            title="Phone"
            value={driver.phone}
          />

          <DetailRow
            icon="people-outline"
            title="Seats Available"
            value={driver.seats.toString()}
          />
        </View>

        {/* Trip Information */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Trip Information
          </Text>

          <DetailRow
            icon="location-outline"
            title="Pickup"
            value={driver.pickup}
          />

          <DetailRow
            icon="flag-outline"
            title="Destination"
            value={driver.destination}
          />

          <DetailRow
            icon="time-outline"
            title="Departure"
            value={driver.departure}
          />

          <DetailRow
            icon="cash-outline"
            title="Price"
            value={driver.price}
          />
        </View>

        {/* Ride Information */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Ride Information
          </Text>

          <DetailRow
            icon="speedometer-outline"
            title="Estimated Duration"
            value="35 Minutes"
          />

          <DetailRow
            icon="navigate-outline"
            title="Distance"
            value="24 km"
          />

          <DetailRow
            icon="star-outline"
            title="Driver Experience"
            value="4 Years"
          />

          <DetailRow
            icon="shield-checkmark-outline"
            title="Verification"
            value="Verified"
          />
        </View>

       {/* Continue to Payment Button */}

<TouchableOpacity
  style={styles.bookButton}
  onPress={() => navigation.navigate("PaymentMethod")}
>
  <Ionicons
    name="card-outline"
    size={22}
    color={Colors.white}
  />

  <Text style={styles.bookText}>
    Continue to Payment
  </Text>
</TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DetailProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
}

function DetailRow({
  icon,
  title,
  value,
}: DetailProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Ionicons
          name={icon}
          size={22}
          color={Colors.rider}
        />

        <Text style={styles.label}>
          {title}
        </Text>
      </View>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
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

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: Colors.secondary,
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },

  rating: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 25,
    fontSize: 16,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
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
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    marginLeft: 12,
    color: Colors.primary,
    fontSize: 15,
  },

  value: {
    color: Colors.textSecondary,
    fontWeight: "600",
    maxWidth: "45%",
    textAlign: "right",
  },

  bookButton: {
    height: 58,
    backgroundColor: Colors.rider,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
  },

  bookText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
});