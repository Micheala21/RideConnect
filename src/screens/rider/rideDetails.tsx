
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
        {/* Back Button */}

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

        {/* Driver Header */}

        <View style={styles.driverHeader}>
          <Image
            source={{ uri: driver.avatar }}
            style={styles.avatar}
          />

          <Text style={styles.name}>
            {driver.name}
          </Text>

          <View style={styles.ratingContainer}>
            <Ionicons
              name="star"
              size={18}
              color={Colors.rider}
            />

            <Text style={styles.rating}>
              {driver.rating}
            </Text>

            <View style={styles.dot} />

            <Ionicons
              name="shield-checkmark"
              size={17}
              color={Colors.rider}
            />

            <Text style={styles.verified}>
              Verified Driver
            </Text>
          </View>
        </View>

        {/* Driver Information */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.rider}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Driver Information
            </Text>
          </View>

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
            last
          />
        </View>

        {/* Trip Information */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="navigate-outline"
                size={20}
                color={Colors.rider}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Trip Information
            </Text>
          </View>

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
            highlight
            last
          />
        </View>

        {/* Ride Information */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={Colors.rider}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Ride Information
            </Text>
          </View>

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
            highlight
            last
          />
        </View>

        {/* Continue to Payment */}

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate("PaymentMethod")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="card-outline"
            size={22}
            color={Colors.white}
          />

          <Text style={styles.bookText}>
            Continue to Payment
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color={Colors.white}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DetailProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  last?: boolean;
  highlight?: boolean;
}

function DetailRow({
  icon,
  title,
  value,
  last = false,
  highlight = false,
}: DetailProps) {
  return (
    <View
      style={[
        styles.row,
        !last && styles.rowBorder,
      ]}
    >
      <View style={styles.left}>
        <View style={styles.detailIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={Colors.rider}
          />
        </View>

        <Text style={styles.label}>
          {title}
        </Text>
      </View>

      <Text
        style={[
          styles.value,
          highlight && styles.highlightValue,
        ]}
      >
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 35,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
  },

  driverHeader: {
    alignItems: "center",
    marginBottom: 25,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary,
    marginBottom: 15,
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  rating: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 5,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 9,
  },

  verified: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 5,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 5,
    marginBottom: 16,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EEF5FB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.primary,
  },

  row: {
    minHeight: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F8FB",
    justifyContent: "center",
    alignItems: "center",
  },

  label: {
    marginLeft: 10,
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },

  value: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "48%",
    textAlign: "right",
    marginLeft: 10,
  },

  highlightValue: {
    color: Colors.rider,
    fontWeight: "700",
  },

  bookButton: {
    minHeight: 58,
    backgroundColor: Colors.rider,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 10,
    paddingHorizontal: 18,
    elevation: 3,
  },

  bookText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 9,
    marginRight: 10,
  },
});
