import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/colors";

export default function TripReceiptScreen() {
  const receipt = {
    receiptNo: "RC-2026-000145",
    bookingId: "BK458721",
    date: "12 August 2026",
    time: "08:30 AM",
    driver: "Alice Johnson",
    vehicle: "Toyota Prius",
    registration: "CA 123-456",
    pickup: "CPUT Bellville Campus",
    destination: "Cape Town CBD",
    paymentMethod: "Cash",
    distance: "18 km",
    duration: "30 mins",
    fare: "R120",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ================= HEADER ================= */}

        <Text style={styles.heading}>
          Trip Receipt
        </Text>

        <Text style={styles.subHeading}>
          Thank you for choosing RideConnect.
        </Text>

        {/* ================= RECEIPT ================= */}

        <View style={styles.receiptCard}>

          <View style={styles.receiptHeader}>
            <View style={styles.receiptIcon}>
              <Ionicons
                name="receipt"
                size={30}
                color={Colors.rider}
              />
            </View>

            <Text style={styles.receiptTitle}>
              Payment Receipt
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Receipt Information */}

          <View style={styles.row}>
            <Text style={styles.label}>
              Receipt No.
            </Text>

            <Text style={styles.value}>
              {receipt.receiptNo}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Booking ID
            </Text>

            <Text style={styles.value}>
              {receipt.bookingId}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Date
            </Text>

            <Text style={styles.value}>
              {receipt.date}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Time
            </Text>

            <Text style={styles.value}>
              {receipt.time}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Driver Details */}

          <Text style={styles.sectionTitle}>
            Driver Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Driver
            </Text>

            <Text style={styles.value}>
              {receipt.driver}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Vehicle
            </Text>

            <Text style={styles.value}>
              {receipt.vehicle}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Registration
            </Text>

            <Text style={styles.value}>
              {receipt.registration}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Trip Details */}

          <Text style={styles.sectionTitle}>
            Trip Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Pickup
            </Text>

            <Text style={styles.value}>
              {receipt.pickup}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Destination
            </Text>

            <Text style={styles.value}>
              {receipt.destination}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Distance
            </Text>

            <Text style={styles.value}>
              {receipt.distance}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Duration
            </Text>

            <Text style={styles.value}>
              {receipt.duration}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Payment */}

          <Text style={styles.sectionTitle}>
            Payment
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Method
            </Text>

            <Text style={styles.value}>
              {receipt.paymentMethod}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total Paid
            </Text>

            <Text style={styles.totalPrice}>
              {receipt.fare}
            </Text>
          </View>

        </View>

        {/* ================= BUTTONS ================= */}

        <TouchableOpacity style={styles.primaryButton}>
          <Ionicons
            name="download-outline"
            size={20}
            color={Colors.white}
          />

          <Text style={styles.primaryButtonText}>
            Download Receipt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons
            name="share-social-outline"
            size={20}
            color={Colors.rider}
          />

          <Text style={styles.secondaryButtonText}>
            Share Receipt
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
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

  subHeading: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 6,
    marginBottom: 25,
  },

  /* ================= RECEIPT CARD ================= */

  receiptCard: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    elevation: 4,
  },

  receiptHeader: {
    alignItems: "center",
    marginBottom: 10,
  },

  receiptIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.riderLight,
    justifyContent: "center",
    alignItems: "center",
  },

  receiptTitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },

  /* ================= DIVIDER ================= */

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },

  /* ================= SECTIONS ================= */

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 10,
  },

  /* ================= ROWS ================= */

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 7,
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 15,
    flex: 1,
  },

  value: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 15,
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },

  totalPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.rider,
  },

  /* ================= PRIMARY BUTTON ================= */

  primaryButton: {
    width: "92%",
    alignSelf: "center",
    height: 58,
    backgroundColor: Colors.rider,
    borderRadius: 15,
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

  /* ================= SECONDARY BUTTON ================= */

  secondaryButton: {
    width: "92%",
    alignSelf: "center",
    height: 58,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.rider,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 20,
  },

  secondaryButtonText: {
    color: Colors.rider,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

});