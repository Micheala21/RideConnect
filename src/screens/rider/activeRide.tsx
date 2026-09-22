
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/colors";

export default function ActiveRideScreen() {
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>
            Active Ride
          </Text>

          <Text style={styles.subHeading}>
            Track your current ride.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="navigate-outline"
            size={24}
            color={Colors.rider}
          />
        </View>
      </View>

      {/* Active Ride Card */}
      <View style={styles.rideCard}>

        <View style={styles.iconContainer}>
          <Ionicons
            name="car-outline"
            size={48}
            color={Colors.rider}
          />
        </View>

        <Text style={styles.title}>
          No Active Ride
        </Text>

        <Text style={styles.description}>
          You currently don't have an active ride.
          Once you book a ride, you will be able to
          track your driver and trip progress here.
        </Text>

        {/* Ride Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusIcon}>
            <Ionicons
              name="location-outline"
              size={20}
              color={Colors.rider}
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              Ride Status
            </Text>

            <Text style={styles.statusText}>
              Waiting for a ride to be booked
            </Text>
          </View>
        </View>

      </View>

      {/* Information Section */}
      <View style={styles.infoCard}>

        <View style={styles.infoIcon}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={Colors.rider}
          />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            Your active ride will appear here
          </Text>

          <Text style={styles.infoText}>
            After confirming a booking, you can view
            your driver's details, pickup location,
            destination and trip progress.
          </Text>
        </View>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
  },

  subHeading: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  rideCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: "center",
    elevation: 3,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EEF5FB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },

  title: {
    fontSize: 23,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 10,
  },

  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 310,
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 16,
    padding: 15,
    marginTop: 25,
    width: "100%",
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },

  statusContent: {
    flex: 1,
    marginLeft: 12,
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 3,
  },

  statusText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  infoCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF5FB",
    justifyContent: "center",
    alignItems: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 5,
  },

  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },

});

