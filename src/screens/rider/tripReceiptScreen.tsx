
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TripReceipt"
>;

export default function TripReceiptScreen() {

  // ==================================================
  // NAVIGATION
  // ==================================================

  const navigation = useNavigation<NavigationProp>();

  // ==================================================
  // RATING STATE
  // ==================================================

  const [showRating, setShowRating] =
    useState(true);

  const [rating, setRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [ratingSubmitted, setRatingSubmitted] =
    useState(false);


  // ==================================================
  // RECEIPT DATA
  // ==================================================

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


  // ==================================================
  // SUBMIT RATING
  // ==================================================

  const handleSubmitRating = () => {

    if (rating === 0) {
      return;
    }

    setRatingSubmitted(true);

    setTimeout(() => {
      setShowRating(false);
    }, 800);
  };


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ================= BACK BUTTON ================= */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("RiderHome")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={26}
            color={Colors.primary}
          />
        </TouchableOpacity>


        {/* ================= HEADER ================= */}

        <View style={styles.header}>

          <View style={styles.headerIcon}>

            <Ionicons
              name="checkmark-circle"
              size={30}
              color={Colors.success}
            />

          </View>

          <View style={styles.headerText}>

            <Text style={styles.heading}>
              Trip Receipt
            </Text>

            <Text style={styles.subHeading}>
              Thank you for choosing RideConnect.
            </Text>

          </View>

        </View>


        {/* ================= RECEIPT ================= */}

        <View style={styles.receiptCard}>

          {/* Receipt Header */}

          <View style={styles.receiptHeader}>

            <View style={styles.receiptIcon}>

              <Ionicons
                name="receipt-outline"
                size={28}
                color={Colors.rider}
              />

            </View>

            <View style={styles.receiptHeaderText}>

              <Text style={styles.receiptTitle}>
                Payment Receipt
              </Text>

              <Text style={styles.receiptSubtitle}>
                RideConnect Trip
              </Text>

            </View>

          </View>


          <View style={styles.divider} />


          {/* ================= RECEIPT INFORMATION ================= */}

          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>

              <Ionicons
                name="document-text-outline"
                size={18}
                color={Colors.rider}
              />

            </View>

            <View style={styles.infoText}>

              <Text style={styles.label}>
                Receipt Number
              </Text>

              <Text style={styles.value}>
                {receipt.receiptNo}
              </Text>

            </View>

          </View>


          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>

              <Ionicons
                name="bookmark-outline"
                size={18}
                color={Colors.rider}
              />

            </View>

            <View style={styles.infoText}>

              <Text style={styles.label}>
                Booking ID
              </Text>

              <Text style={styles.value}>
                {receipt.bookingId}
              </Text>

            </View>

          </View>


          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>

              <Ionicons
                name="calendar-outline"
                size={18}
                color={Colors.rider}
              />

            </View>

            <View style={styles.infoText}>

              <Text style={styles.label}>
                Date
              </Text>

              <Text style={styles.value}>
                {receipt.date}
              </Text>

            </View>

          </View>


          <View style={styles.infoRow}>

            <View style={styles.infoIcon}>

              <Ionicons
                name="time-outline"
                size={18}
                color={Colors.rider}
              />

            </View>

            <View style={styles.infoText}>

              <Text style={styles.label}>
                Time
              </Text>

              <Text style={styles.value}>
                {receipt.time}
              </Text>

            </View>

          </View>


          <View style={styles.divider} />


          {/* ================= DRIVER DETAILS ================= */}

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>

              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.rider}
              />

            </View>

            <Text style={styles.sectionTitle}>
              Driver Details
            </Text>

          </View>


          <View style={styles.row}>

            <Text style={styles.label}>
              Driver
            </Text>

            <Text style={styles.valueRight}>
              {receipt.driver}
            </Text>

          </View>


          <View style={styles.row}>

            <Text style={styles.label}>
              Vehicle
            </Text>

            <Text style={styles.valueRight}>
              {receipt.vehicle}
            </Text>

          </View>


          <View style={styles.row}>

            <Text style={styles.label}>
              Registration
            </Text>

            <Text style={styles.valueRight}>
              {receipt.registration}
            </Text>

          </View>


          <View style={styles.divider} />


          {/* ================= TRIP DETAILS ================= */}

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>

              <Ionicons
                name="navigate-outline"
                size={20}
                color={Colors.rider}
              />

            </View>

            <Text style={styles.sectionTitle}>
              Trip Details
            </Text>

          </View>


          <View style={styles.row}>

            <Text style={styles.label}>
              Pickup
            </Text>

            <Text style={styles.valueRight}>
              {receipt.pickup}
            </Text>

          </View>


          <View style={styles.row}>

            <Text style={styles.label}>
              Destination
            </Text>

            <Text style={styles.valueRight}>
              {receipt.destination}
            </Text>

          </View>


          <View style={styles.row}>

            <Text style={styles.label}>
              Distance
            </Text>

            <Text style={styles.valueRight}>
              {receipt.distance}
            </Text>

          </View>


          <View style={styles.row}>

            <Text style={styles.label}>
              Duration
            </Text>

            <Text style={styles.valueRight}>
              {receipt.duration}
            </Text>

          </View>


          <View style={styles.divider} />


          {/* ================= PAYMENT ================= */}

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>

              <Ionicons
                name="card-outline"
                size={20}
                color={Colors.rider}
              />

            </View>

            <Text style={styles.sectionTitle}>
              Payment
            </Text>

          </View>


          <View style={styles.row}>

            <Text style={styles.label}>
              Payment Method
            </Text>

            <View style={styles.paymentBadge}>

              <Ionicons
                name="cash-outline"
                size={15}
                color={Colors.success}
              />

              <Text style={styles.paymentText}>
                {receipt.paymentMethod}
              </Text>

            </View>

          </View>


          {/* ================= TOTAL ================= */}

          <View style={styles.totalContainer}>

            <View>

              <Text style={styles.totalLabel}>
                Total Paid
              </Text>

              <Text style={styles.totalSubtext}>
                Payment completed
              </Text>

            </View>

            <Text style={styles.totalPrice}>
              {receipt.fare}
            </Text>

          </View>

        </View>


        {/* ================= BUTTONS ================= */}

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
        >

          <Ionicons
            name="download-outline"
            size={21}
            color={Colors.white}
          />

          <Text style={styles.primaryButtonText}>
            Download Receipt
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color={Colors.white}
            style={styles.buttonArrow}
          />

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
        >

          <Ionicons
            name="share-social-outline"
            size={21}
            color={Colors.rider}
          />

          <Text style={styles.secondaryButtonText}>
            Share Receipt
          </Text>

        </TouchableOpacity>


        {/* ================= RATE DRIVER ================= */}

        {!ratingSubmitted && (

          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => setShowRating(true)}
            activeOpacity={0.8}
          >

            <Ionicons
              name="star-outline"
              size={21}
              color={Colors.white}
            />

            <Text style={styles.rateButtonText}>
              Rate Driver
            </Text>

          </TouchableOpacity>

        )}

      </ScrollView>


      {/* ==================================================
          RATING POPUP
      ================================================== */}

      <Modal
        visible={showRating}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setShowRating(false)
        }
      >

        <View style={styles.modalOverlay}>

          <View style={styles.ratingModal}>

            {/* Close */}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() =>
                setShowRating(false)
              }
              activeOpacity={0.7}
            >

              <Ionicons
                name="close"
                size={24}
                color={Colors.textSecondary}
              />

            </TouchableOpacity>


            {/* Icon */}

            <View style={styles.ratingIcon}>

              <Ionicons
                name="star"
                size={32}
                color="#F5B301"
              />

            </View>


            {/* Title */}

            <Text style={styles.ratingTitle}>
              Rate Your Driver
            </Text>


            <Text style={styles.ratingSubtitle}>
              How was your ride with {receipt.driver}?
            </Text>


            {/* ================= STARS ================= */}

            <View style={styles.starContainer}>

              {[1, 2, 3, 4, 5].map((star) => (

                <TouchableOpacity
                  key={star}
                  onPress={() =>
                    setRating(star)
                  }
                  activeOpacity={0.7}
                >

                  <Ionicons
                    name={
                      star <= rating
                        ? "star"
                        : "star-outline"
                    }
                    size={42}
                    color="#F5B301"
                  />

                </TouchableOpacity>

              ))}

            </View>


            {/* Rating Text */}

            <Text style={styles.ratingText}>

              {rating === 0
                ? "Tap a star to rate"
                : rating === 1
                ? "Poor"
                : rating === 2
                ? "Needs Improvement"
                : rating === 3
                ? "Good"
                : rating === 4
                ? "Very Good"
                : "Excellent"}

            </Text>


            {/* ================= COMMENT ================= */}

            <TextInput
              style={styles.commentInput}
              placeholder="Leave a comment (optional)"
              placeholderTextColor="#999"
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
            />


            {/* ================= SUBMIT ================= */}

            <TouchableOpacity
              style={[
                styles.submitRatingButton,
                rating === 0 &&
                  styles.disabledButton,
              ]}
              disabled={rating === 0}
              onPress={handleSubmitRating}
              activeOpacity={0.8}
            >

              <Text style={styles.submitRatingText}>
                {ratingSubmitted
                  ? "Rating Submitted"
                  : "Submit Rating"}
              </Text>

            </TouchableOpacity>


            {/* Maybe Later */}

            {!ratingSubmitted && (

              <TouchableOpacity
                onPress={() =>
                  setShowRating(false)
                }
                activeOpacity={0.7}
              >

                <Text style={styles.laterText}>
                  Maybe Later
                </Text>

              </TouchableOpacity>

            )}

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
}


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },


  // ================= BACK BUTTON =================

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    elevation: 3,
  },


  // ================= HEADER =================

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 2,
  },

  headerText: {
    flex: 1,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },

  subHeading: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 19,
  },


  // ================= RECEIPT =================

  receiptCard: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
  },

  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  receiptIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EEF5FB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  receiptHeaderText: {
    flex: 1,
  },

  receiptTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },

  receiptSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },


  // ================= DIVIDER =================

  divider: {
    height: 1,
    backgroundColor: "#E6EAF0",
    marginVertical: 17,
  },


  // ================= INFORMATION =================

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 7,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  infoText: {
    flex: 1,
  },


  // ================= SECTIONS =================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },


  // ================= ROWS =================

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 7,
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },

  value: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 15,
    flex: 1,
  },

  valueRight: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 15,
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },


  // ================= PAYMENT =================

  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF7EF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },

  paymentText: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 5,
  },


  // ================= TOTAL =================

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7F9FB",
    borderRadius: 15,
    padding: 15,
    marginTop: 5,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },

  totalSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  totalPrice: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.rider,
  },


  // ================= PRIMARY BUTTON =================

  primaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: Colors.rider,
    borderRadius: 16,
    marginTop: 25,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    elevation: 3,
    position: "relative",
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


  // ================= SECONDARY BUTTON =================

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


  // ================= RATE BUTTON =================

  rateButton: {
    width: "100%",
    height: 58,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 13,
    marginBottom: 20,
    elevation: 3,
  },

  rateButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },


  // ==================================================
  // RATING MODAL
  // ==================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  ratingModal: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    elevation: 10,
  },

  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  ratingIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF4CC",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  ratingTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 15,
  },

  ratingSubtitle: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 21,
  },


  // ================= STARS =================

  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  ratingText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.rider,
    marginBottom: 20,
  },


  // ================= COMMENT =================

  commentInput: {
    width: "100%",
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#E1E5EA",
    borderRadius: 15,
    padding: 14,
    fontSize: 15,
    color: Colors.primary,
    marginBottom: 18,
    backgroundColor: "#FAFBFC",
  },


  // ================= SUBMIT =================

  submitRatingButton: {
    width: "100%",
    height: 55,
    backgroundColor: Colors.rider,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.45,
  },

  submitRatingText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  laterText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 18,
  },

});
