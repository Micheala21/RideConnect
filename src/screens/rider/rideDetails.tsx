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

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

type RideDetailsRouteProp =
  RouteProp<
    RootStackParamList,
    "RideDetails"
  >;

export default function RideDetailsScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const route =
    useRoute<RideDetailsRouteProp>();

  const { ride } = route.params;

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
            source={{
              uri: "https://placehold.co/200x200",
            }}
            style={styles.avatar}
          />

          <Text style={styles.name}>
            {ride.driverName}
          </Text>

          <View style={styles.ratingContainer}>

            <Ionicons
              name="shield-checkmark"
              size={18}
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
            value={ride.vehicle}
          />

          <DetailRow
            icon="people-outline"
            title="Seats Available"
            value={ride.available_seats.toString()}
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
            value={ride.pickup_location}
          />

          <DetailRow
            icon="flag-outline"
            title="Destination"
            value={ride.destination}
          />

          <DetailRow
            icon="calendar-outline"
            title="Date"
            value={ride.ride_date}
          />

          <DetailRow
            icon="time-outline"
            title="Departure"
            value={ride.departure_time}
          />

          <DetailRow
            icon="cash-outline"
            title="Price"
            value={`R${ride.fare}`}
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
            icon="people-outline"
            title="Passengers"
            value={`${ride.available_seats} seats available`}
          />

          <DetailRow
            icon="checkmark-circle-outline"
            title="Status"
            value={ride.status}
          />

          <DetailRow
            icon="document-text-outline"
            title="Notes"
            value={
              ride.notes || "No additional notes"
            }
            last
          />

        </View>

        {/* Match Percentage */}

        <View style={styles.matchCard}>

          <View style={styles.matchIcon}>
            <Ionicons
              name="sparkles-outline"
              size={22}
              color={Colors.rider}
            />
          </View>

          <View style={styles.matchContent}>

            <Text style={styles.matchTitle}>
              Ride Match
            </Text>

            <Text style={styles.matchDescription}>
              This ride matches your search
              preferences.
            </Text>

          </View>

          <Text style={styles.matchPercentage}>
            {ride.similarity}%
          </Text>

        </View>

        {/* Continue to Payment */}

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate(
              "PaymentMethod"
            )
          }
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
          highlight &&
            styles.highlightValue,
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

  verified: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
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

  matchCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 17,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },

  matchIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF5FB",
    justifyContent: "center",
    alignItems: "center",
  },

  matchContent: {
    flex: 1,
    marginLeft: 12,
  },

  matchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },

  matchDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  matchPercentage: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.rider,
    marginLeft: 8,
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