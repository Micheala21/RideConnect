import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export default function PaymentMethodScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [promoCode, setPromoCode] = useState("");

  const fare = 120;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Page Header */}

        <Text style={styles.heading}>
          Payment Method
        </Text>

        <Text style={styles.subHeading}>
          Choose how you would like to pay.
        </Text>

        {/* ================= FARE SUMMARY ================= */}

        <View style={styles.summaryCard}>

          <Text style={styles.summaryTitle}>
            Fare Summary
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Driver
            </Text>

            <Text style={styles.value}>
              Alice Johnson
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Pickup
            </Text>

            <Text style={styles.value}>
              CPUT Bellville
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Destination
            </Text>

            <Text style={styles.value}>
              Cape Town CBD
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>

            <Text style={styles.totalLabel}>
              Total Fare
            </Text>

            <Text style={styles.totalPrice}>
              R{fare}
            </Text>

          </View>

        </View>

        {/* ================= PAYMENT METHODS ================= */}

        <Text style={styles.sectionTitle}>
          Select Payment Method
        </Text>

        {/* Cash */}

        <TouchableOpacity
          style={[
            styles.paymentCard,
            selectedPayment === "Cash" &&
              styles.selectedCard,
          ]}
          onPress={() =>
            setSelectedPayment("Cash")
          }
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.paymentIcon,
              {
                backgroundColor:
                  Colors.riderLight,
              },
            ]}
          >
            <Ionicons
              name="cash"
              size={25}
              color={Colors.rider}
            />
          </View>

          <Text style={styles.paymentText}>
            Cash
          </Text>

          {selectedPayment === "Cash" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.success}
            />
          )}

        </TouchableOpacity>

        {/* Card */}

        <TouchableOpacity
          style={[
            styles.paymentCard,
            selectedPayment === "Card" &&
              styles.selectedCard,
          ]}
          onPress={() =>
            setSelectedPayment("Card")
          }
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.paymentIcon,
              {
                backgroundColor:
                  Colors.riderLight,
              },
            ]}
          >
            <Ionicons
              name="card"
              size={25}
              color={Colors.rider}
            />
          </View>

          <Text style={styles.paymentText}>
            Credit / Debit Card
          </Text>

          {selectedPayment === "Card" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.success}
            />
          )}

        </TouchableOpacity>

        {/* Wallet */}

        <TouchableOpacity
          style={[
            styles.paymentCard,
            selectedPayment === "Wallet" &&
              styles.selectedCard,
          ]}
          onPress={() =>
            setSelectedPayment("Wallet")
          }
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.paymentIcon,
              {
                backgroundColor:
                  Colors.riderLight,
              },
            ]}
          >
            <Ionicons
              name="wallet"
              size={25}
              color={Colors.rider}
            />
          </View>

          <Text style={styles.paymentText}>
            RideConnect Wallet
          </Text>

          {selectedPayment === "Wallet" && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.success}
            />
          )}

        </TouchableOpacity>

        {/* ================= PROMO CODE ================= */}

        <Text style={styles.sectionTitle}>
          Promo Code
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter promo code"
          placeholderTextColor="#999"
          value={promoCode}
          onChangeText={setPromoCode}
        />

        {/* ================= CONFIRM BUTTON ================= */}

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("BookingConfirmed")
          }
          activeOpacity={0.8}
        >

          <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color={Colors.white}
          />

          <Text style={styles.buttonText}>
            Confirm Payment
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

  /* ================= FARE CARD ================= */

  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 25,
    elevation: 4,
  },

  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 7,
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 15,
  },

  value: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 15,
    maxWidth: "55%",
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 15,
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

  /* ================= SECTION ================= */

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 15,
  },

  /* ================= PAYMENT CARDS ================= */

  paymentCard: {
    width: "100%",
    minHeight: 64,
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },

  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.rider,
  },

  paymentIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  paymentText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },

  /* ================= PROMO INPUT ================= */

  input: {
    width: "100%",
    height: 58,
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.primary,
    marginBottom: 30,
  },

  /* ================= BUTTON ================= */

  button: {
    width: "92%",
    alignSelf: "center",
    height: 58,
    backgroundColor: Colors.rider,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 20,
  },

  buttonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 17,
    marginLeft: 8,
  },

});