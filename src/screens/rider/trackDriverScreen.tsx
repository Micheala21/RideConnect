import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TrackDriver"
>;

export default function TrackDriverScreen() {
  const navigation = useNavigation<NavigationProp>();

  const driver = {
    name: "Alice Johnson",
    vehicle: "Toyota Prius",
    registration: "CA 123-456",
    rating: 4.9,
    eta: "5 mins",
    pickup: "CPUT Bellville Campus",
    destination: "Cape Town CBD",
    avatar: "https://placehold.co/150x150",
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Placeholder */}

      <View style={styles.mapContainer}>
        <Ionicons
          name="map"
          size={70}
          color="#64748B"
        />

        <Text style={styles.mapTitle}>
          Live Map
        </Text>

        <Text style={styles.mapSubtitle}>
          Driver location will appear here
        </Text>

        <TouchableOpacity style={styles.locationButton}>
          <Ionicons
            name="locate"
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Information Card */}

      <ScrollView
        style={styles.bottomCard}
        showsVerticalScrollIndicator={false}
      >
        {/* Driver */}

        <View style={styles.driverSection}>
          <Image
            source={{ uri: driver.avatar }}
            style={styles.avatar}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>
              {driver.name}
            </Text>

            <Text style={styles.driverInfo}>
              {driver.vehicle}
            </Text>

            <Text style={styles.driverInfo}>
              ⭐ {driver.rating}
            </Text>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <Ionicons
              name="call"
              size={22}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Trip Status */}

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            Driver Status
          </Text>

          <View style={styles.statusRow}>
            <Ionicons
              name="time-outline"
              size={20}
              color={Colors.rider}
            />

            <Text style={styles.statusText}>
              ETA: {driver.eta}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Ionicons
              name="location-outline"
              size={20}
              color={Colors.rider}
            />

            <Text style={styles.statusText}>
              Pickup: {driver.pickup}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Ionicons
              name="flag-outline"
              size={20}
              color={Colors.rider}
            />

            <Text style={styles.statusText}>
              Destination: {driver.destination}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Ionicons
              name="car-sport-outline"
              size={20}
              color={Colors.rider}
            />

            <Text style={styles.statusText}>
              Registration: {driver.registration}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("TripReceipt")}
        >
          <Ionicons
            name="receipt-outline"
            size={20}
            color={Colors.white}
          />

          <Text style={styles.primaryButtonText}>
            View Trip Receipt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons
            name="close-circle-outline"
            size={20}
            color={Colors.danger}
          />

          <Text style={styles.secondaryButtonText}>
            Cancel Ride
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

  mapContainer: {
    flex: 1.1,
    backgroundColor: "#DCEAF5",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  mapTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 15,
  },

  mapSubtitle: {
    color: Colors.textSecondary,
    marginTop: 8,
    fontSize: 15,
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
    elevation: 5,
  },

  bottomCard: {
    flex: 0.9,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },  driverSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: Colors.secondary,
    marginRight: 15,
  },

  driverName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
  },

  driverInfo: {
    marginTop: 5,
    color: Colors.textSecondary,
    fontSize: 15,
  },

  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
  },

  statusCard: {
    backgroundColor: "#EEF5FB",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 15,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  statusText: {
    marginLeft: 10,
    color: Colors.textPrimary,
    flex: 1,
  },

  primaryButton: {
    backgroundColor: Colors.rider,
    height: 58,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 15,
  },

  primaryButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 17,
    marginLeft: 8,
  },

  secondaryButton: {
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.danger,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 30,
  },

  secondaryButtonText: {
    color: Colors.danger,
    fontWeight: "700",
    fontSize: 17,
    marginLeft: 8,
  },
});