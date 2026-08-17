import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RideConfirmation"
>;

export default function RideConfirmationScreen() {
  const navigation = useNavigation<NavigationProp>();

  const ride = {
    rider: "Sarah Williams",
    pickup: "CPUT Bellville Campus",
    destination: "Cape Town CBD",
    pickupTime: "08:30 AM",
    passengers: 2,
    fare: "R120",
    avatar: "https://placehold.co/150x150",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.successCircle}>
          <Ionicons
            name="checkmark"
            size={55}
            color={Colors.white}
          />
        </View>

        <Text style={styles.heading}>
          Rider Accepted!
        </Text>

        <Text style={styles.subHeading}>
          The ride has been confirmed.
        </Text>

        <Image
          source={{ uri: ride.avatar }}
          style={styles.avatar}
        />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Rider Details
          </Text>

          <DetailRow
            icon="person-outline"
            title="Rider"
            value={ride.rider}
          />

          <DetailRow
            icon="people-outline"
            title="Passengers"
            value={ride.passengers.toString()}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            Trip Details
          </Text>

          <DetailRow
            icon="location-outline"
            title="Pickup"
            value={ride.pickup}
          />

          <DetailRow
            icon="flag-outline"
            title="Destination"
            value={ride.destination}
          />

          <DetailRow
            icon="time-outline"
            title="Pickup Time"
            value={ride.pickupTime}
          />

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Expected Earnings
            </Text>

            <Text style={styles.price}>
              {ride.fare}
            </Text>
          </View>
        </View>

        <TouchableOpacity
  style={styles.primaryButton}
  onPress={() => navigation.navigate("ActiveTrip")}
>
          <Ionicons
            name="car-sport"
            size={20}
            color={Colors.white}
          />

          <Text style={styles.primaryButtonText}>
            Start Trip
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
          color={Colors.driver}
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

  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginTop: 20,
  },

  subHeading: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 25,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    marginBottom: 25,
    backgroundColor: Colors.secondary,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
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
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    marginLeft: 10,
    color: Colors.primary,
  },

  value: {
    color: Colors.textSecondary,
    fontWeight: "600",
    maxWidth: "45%",
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },

  priceRow: {
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
    height: 58,
    backgroundColor: Colors.driver,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 30,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },

  secondaryButton: {
    height: 58,
    borderWidth: 2,
    borderColor: Colors.driver,
    borderRadius: 15,
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