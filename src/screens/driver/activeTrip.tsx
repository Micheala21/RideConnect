import React, { useState } from "react";
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
  const [rideCompleted, setRideCompleted] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* ================= HEADER ================= */}

        <Text style={styles.heading}>
          Active Ride
        </Text>

        <Text style={styles.subtitle}>
          Monitor the current trip.
        </Text>

        {/* ================= RIDE INFORMATION ================= */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Ride Information
          </Text>

          <DetailRow
            icon="person-outline"
            title="Passenger"
            value="Sarah Williams"
          />

          <DetailRow
            icon="location-outline"
            title="Pickup"
            value="CPUT Bellville Campus"
          />

          <DetailRow
            icon="flag-outline"
            title="Destination"
            value="Cape Town CBD"
          />

          <DetailRow
            icon="time-outline"
            title="Departure"
            value="08:30 AM"
          />

          <DetailRow
            icon="cash-outline"
            title="Fare"
            value="R75"
            last
          />
        </View>

        {/* ================= RIDE STATUS ================= */}

        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor: rideCompleted
                  ? "#DCFCE7"
                  : Colors.driverLight,
              },
            ]}
          >
            <Ionicons
              name={
                rideCompleted
                  ? "checkmark-circle"
                  : "car"
              }
              size={34}
              color={
                rideCompleted
                  ? "#16A34A"
                  : Colors.driver
              }
            />
          </View>

          <Text style={styles.statusTitle}>
            {rideCompleted
              ? "Ride Completed"
              : "Ride In Progress"}
          </Text>

          <Text style={styles.statusText}>
            {rideCompleted
              ? "The passenger has reached the destination."
              : "You are currently transporting the passenger."}
          </Text>
        </View>

        {/* ================= COMPLETE BUTTON ================= */}

        <TouchableOpacity
          style={[
            styles.button,
            rideCompleted && styles.completedButton,
          ]}
          disabled={rideCompleted}
          onPress={() => setRideCompleted(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark-circle"
            size={21}
            color={Colors.white}
          />

          <Text style={styles.buttonText}>
            {rideCompleted
              ? "Ride Completed"
              : "Complete Ride"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

interface DetailProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  last?: boolean;
}

function DetailRow({
  icon,
  title,
  value,
  last = false,
}: DetailProps) {
  return (
    <View
      style={[
        styles.row,
        last && styles.lastRow,
      ]}
    >
      <View style={styles.left}>
        <Ionicons
          name={icon}
          size={22}
          color={Colors.driver}
        />

        <Text style={styles.title}>
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
  /* ================= CONTAINER ================= */

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* ================= HEADER ================= */

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
  },

  subtitle: {
    fontSize: 15,
    marginTop: 6,
    marginBottom: 25,
    color: Colors.textSecondary,
  },

  /* ================= RIDE CARD ================= */

  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 15,
  },

  /* ================= DETAIL ROWS ================= */

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  title: {
    marginLeft: 10,
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },

  value: {
    flex: 1,
    marginLeft: 12,
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
  },

  /* ================= STATUS CARD ================= */

  statusCard: {
    width: "100%",
    backgroundColor: Colors.white,
    marginTop: 25,
    borderRadius: 18,
    alignItems: "center",
    padding: 22,
    elevation: 4,
  },

  statusIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
  },

  statusTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 15,
  },

  statusText: {
    marginTop: 8,
    color: Colors.textSecondary,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 21,
  },

  /* ================= BUTTON ================= */

  button: {
    width: "92%",
    alignSelf: "center",
    height: 58,
    backgroundColor: Colors.driver,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 30,
  },

  completedButton: {
    backgroundColor: "#16A34A",
  },

  buttonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
});