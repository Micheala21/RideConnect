
import React, { useState } from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { useNavigation } from "@react-navigation/native";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";


// =====================================================
// NAVIGATION
// =====================================================

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


// =====================================================
// SCREEN
// =====================================================

export default function PaymentMethodScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  // ===================================================
  // PAYMENT
  // ===================================================

  const [selectedPayment, setSelectedPayment] =
    useState("Cash");

  const [promoCode, setPromoCode] =
    useState("");


  // ===================================================
  // CARD MODAL
  // ===================================================

  const [cardModalVisible, setCardModalVisible] =
    useState(false);


  // ===================================================
  // CARD DETAILS
  // ===================================================

  const [cardName, setCardName] =
    useState("");

  const [cardNumber, setCardNumber] =
    useState("");

  const [expiryDate, setExpiryDate] =
    useState("");

  const [cvv, setCvv] =
    useState("");


  // ===================================================
  // FARE
  // ===================================================

  const fare = 120;


  // ===================================================
  // CARD NUMBER FORMAT
  // ===================================================

  const handleCardNumberChange = (
    text: string,
  ) => {

    const cleaned =
      text.replace(/\D/g, "");

    const limited =
      cleaned.slice(0, 16);

    const formatted =
      limited
        .replace(/(.{4})/g, "$1 ")
        .trim();

    setCardNumber(formatted);
  };


  // ===================================================
  // EXPIRY DATE FORMAT
  // ===================================================

  const handleExpiryChange = (
    text: string,
  ) => {

    const cleaned =
      text.replace(/\D/g, "");

    const limited =
      cleaned.slice(0, 4);

    if (limited.length >= 3) {

      setExpiryDate(
        `${limited.slice(0, 2)}/${limited.slice(2)}`
      );

    } else {

      setExpiryDate(limited);

    }
  };


  // ===================================================
  // SAVE CARD
  // ===================================================

  const handleSaveCard = () => {

    if (
      !cardName.trim() ||
      cardNumber.replace(/\s/g, "").length !== 16 ||
      expiryDate.length !== 5 ||
      cvv.length !== 3
    ) {
      return;
    }

    setSelectedPayment("Card");

    setCardModalVisible(false);
  };


  // ===================================================
  // OPEN CARD MODAL
  // ===================================================

  const handleCardSelection = () => {

    setSelectedPayment("Card");

    setCardModalVisible(true);
  };


  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =================================================
            BACK BUTTON
        ================================================= */}

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


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <View style={styles.header}>
          <Text style={styles.heading}>
            Payment Method
          </Text>

          <Text style={styles.subHeading}>
            Choose how you would like to pay.
          </Text>
        </View>


        {/* =================================================
            FARE SUMMARY
        ================================================= */}

        <View style={styles.summaryCard}>

          <View style={styles.cardTitleRow}>

            <View style={styles.sectionIcon}>
              <Ionicons
                name="receipt-outline"
                size={20}
                color={Colors.rider}
              />
            </View>

            <Text style={styles.summaryTitle}>
              Fare Summary
            </Text>

          </View>


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


        {/* =================================================
            PAYMENT METHODS
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Select Payment Method
        </Text>


        {/* =================================================
            CASH
        ================================================= */}

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

          <View style={styles.paymentIcon}>

            <Ionicons
              name="cash-outline"
              size={24}
              color={Colors.rider}
            />

          </View>


          <View style={styles.paymentInfo}>

            <Text style={styles.paymentText}>
              Cash
            </Text>

            <Text style={styles.paymentDescription}>
              Pay the driver directly
            </Text>

          </View>


          {selectedPayment === "Cash" && (

            <Ionicons
              name="checkmark-circle"
              size={25}
              color={Colors.success}
            />

          )}

        </TouchableOpacity>


        {/* =================================================
            CREDIT / DEBIT CARD
        ================================================= */}

        <TouchableOpacity
          style={[
            styles.paymentCard,
            selectedPayment === "Card" &&
              styles.selectedCard,
          ]}
          onPress={handleCardSelection}
          activeOpacity={0.8}
        >

          <View style={styles.paymentIcon}>

            <Ionicons
              name="card-outline"
              size={24}
              color={Colors.rider}
            />

          </View>


          <View style={styles.paymentInfo}>

            <Text style={styles.paymentText}>
              Credit / Debit Card
            </Text>

            {cardNumber ? (

              <Text style={styles.cardLastFour}>
                •••• {cardNumber.slice(-4)}
              </Text>

            ) : (

              <Text style={styles.paymentDescription}>
                Add a card to pay
              </Text>

            )}

          </View>


          {selectedPayment === "Card" && (

            <Ionicons
              name="checkmark-circle"
              size={25}
              color={Colors.success}
            />

          )}

        </TouchableOpacity>


        {/* =================================================
            WALLET
        ================================================= */}

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

          <View style={styles.paymentIcon}>

            <Ionicons
              name="wallet-outline"
              size={24}
              color={Colors.rider}
            />

          </View>


          <View style={styles.paymentInfo}>

            <Text style={styles.paymentText}>
              RideConnect Wallet
            </Text>

            <Text style={styles.paymentDescription}>
              Pay using your wallet balance
            </Text>

          </View>


          {selectedPayment === "Wallet" && (

            <Ionicons
              name="checkmark-circle"
              size={25}
              color={Colors.success}
            />

          )}

        </TouchableOpacity>


        {/* =================================================
            PROMO CODE
        ================================================= */}

        <Text style={styles.sectionTitle}>
          Promo Code
        </Text>


        <View style={styles.promoContainer}>

          <Ionicons
            name="pricetag-outline"
            size={20}
            color={Colors.textSecondary}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter promo code"
            placeholderTextColor="#999"
            value={promoCode}
            onChangeText={setPromoCode}
          />

          {promoCode.length > 0 && (

            <TouchableOpacity
              onPress={() => setPromoCode("")}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

          )}

        </View>


        {/* =================================================
            CONFIRM PAYMENT
        ================================================= */}

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              "BookingConfirmed",
            )
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

          <Ionicons
            name="arrow-forward"
            size={20}
            color={Colors.white}
          />

        </TouchableOpacity>

      </ScrollView>


      {/* ===================================================
          CARD DETAILS MODAL
      =================================================== */}

      <Modal
        visible={cardModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          setCardModalVisible(false)
        }
      >

        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScroll}
          >

            <View style={styles.modalCard}>

              {/* ===============================
                  MODAL HEADER
              =============================== */}

              <View style={styles.modalHeader}>

                <View>

                  <Text style={styles.modalTitle}>
                    Card Details
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Enter your card information
                  </Text>

                </View>


                <TouchableOpacity
                  onPress={() =>
                    setCardModalVisible(false)
                  }
                  style={styles.closeButton}
                >

                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors.primary}
                  />

                </TouchableOpacity>

              </View>


              {/* ===============================
                  CARD PREVIEW
              =============================== */}

              <View style={styles.cardPreview}>

                <View style={styles.cardPreviewTop}>

                  <Text style={styles.cardPreviewBank}>
                    RideConnect
                  </Text>

                  <Ionicons
                    name="card"
                    size={30}
                    color={Colors.white}
                  />

                </View>


                <Text style={styles.cardPreviewNumber}>
                  {cardNumber ||
                    "•••• •••• •••• ••••"}
                </Text>


                <View style={styles.cardPreviewBottom}>

                  <View>

                    <Text style={styles.cardPreviewLabel}>
                      CARD HOLDER
                    </Text>

                    <Text style={styles.cardPreviewValue}>
                      {cardName || "YOUR NAME"}
                    </Text>

                  </View>


                  <View>

                    <Text style={styles.cardPreviewLabel}>
                      EXPIRES
                    </Text>

                    <Text style={styles.cardPreviewValue}>
                      {expiryDate || "MM/YY"}
                    </Text>

                  </View>

                </View>

              </View>


              {/* ===============================
                  CARD HOLDER
              =============================== */}

              <Text style={styles.fieldLabel}>
                Cardholder Name
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="John Doe"
                placeholderTextColor="#94A3B8"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
              />


              {/* ===============================
                  CARD NUMBER
              =============================== */}

              <Text style={styles.fieldLabel}>
                Card Number
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#94A3B8"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="numeric"
                maxLength={19}
              />


              {/* ===============================
                  EXPIRY + CVV
              =============================== */}

              <View style={styles.cardRow}>

                <View style={styles.smallInputContainer}>

                  <Text style={styles.fieldLabel}>
                    Expiry Date
                  </Text>

                  <TextInput
                    style={styles.modalInput}
                    placeholder="MM/YY"
                    placeholderTextColor="#94A3B8"
                    value={expiryDate}
                    onChangeText={handleExpiryChange}
                    keyboardType="numeric"
                    maxLength={5}
                  />

                </View>


                <View style={styles.smallInputContainer}>

                  <Text style={styles.fieldLabel}>
                    CVV
                  </Text>

                  <TextInput
                    style={styles.modalInput}
                    placeholder="123"
                    placeholderTextColor="#94A3B8"
                    value={cvv}
                    onChangeText={(text) =>
                      setCvv(
                        text
                          .replace(/\D/g, "")
                          .slice(0, 3),
                      )
                    }
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={3}
                  />

                </View>

              </View>


              {/* ===============================
                  SAVE CARD
              =============================== */}

              <TouchableOpacity
                style={styles.saveCardButton}
                onPress={handleSaveCard}
                activeOpacity={0.8}
              >

                <Ionicons
                  name="card-outline"
                  size={21}
                  color={Colors.white}
                />

                <Text style={styles.saveCardButtonText}>
                  Save Card
                </Text>

              </TouchableOpacity>


              {/* ===============================
                  CANCEL
              =============================== */}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() =>
                  setCardModalVisible(false)
                }
              >

                <Text style={styles.cancelText}>
                  Cancel
                </Text>

              </TouchableOpacity>

            </View>

          </ScrollView>

        </KeyboardAvoidingView>

      </Modal>

    </SafeAreaView>
  );
}


// =====================================================
// STYLES
// =====================================================

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


  // ===================================================
  // BACK BUTTON
  // ===================================================

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


  // ===================================================
  // HEADER
  // ===================================================

  header: {
    marginBottom: 22,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
  },

  subHeading: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 6,
  },


  // ===================================================
  // FARE SUMMARY
  // ===================================================

  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 27,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
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

  summaryTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.primary,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 7,
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  value: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
    maxWidth: "58%",
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
    fontSize: 23,
    fontWeight: "700",
    color: Colors.rider,
  },


  // ===================================================
  // SECTION
  // ===================================================

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 13,
  },


  // ===================================================
  // PAYMENT CARDS
  // ===================================================

  paymentCard: {
    minHeight: 72,
    backgroundColor: Colors.white,
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E6EAF0",
    elevation: 2,
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
    backgroundColor: "#EEF5FB",
  },

  paymentInfo: {
    flex: 1,
    marginLeft: 13,
  },

  paymentText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },

  paymentDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  cardLastFour: {
    marginTop: 3,
    color: Colors.textSecondary,
    fontSize: 12,
  },


  // ===================================================
  // PROMO
  // ===================================================

  promoContainer: {
    minHeight: 58,
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6EAF0",
    marginBottom: 30,
  },

  input: {
    flex: 1,
    height: 56,
    marginLeft: 10,
    color: Colors.primary,
    fontSize: 15,
  },


  // ===================================================
  // CONFIRM BUTTON
  // ===================================================

  button: {
    minHeight: 58,
    width: "100%",
    backgroundColor: Colors.rider,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 15,
    elevation: 3,
  },

  buttonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 17,
    marginLeft: 8,
    marginRight: 10,
  },


  // ===================================================
  // MODAL
  // ===================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },

  modalScroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
  },

  modalSubtitle: {
    marginTop: 4,
    color: Colors.textSecondary,
    fontSize: 14,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },


  // ===================================================
  // CARD PREVIEW
  // ===================================================

  cardPreview: {
    height: 190,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    padding: 20,
    marginBottom: 20,
  },

  cardPreviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardPreviewBank: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },

  cardPreviewNumber: {
    color: Colors.white,
    fontSize: 20,
    letterSpacing: 2,
    marginTop: 30,
  },

  cardPreviewBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },

  cardPreviewLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 9,
    fontWeight: "600",
  },

  cardPreviewValue: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },


  // ===================================================
  // MODAL INPUTS
  // ===================================================

  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 7,
  },

  modalInput: {
    height: 50,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: Colors.primary,
    fontSize: 15,
    marginBottom: 15,
  },

  cardRow: {
    flexDirection: "row",
    gap: 12,
  },

  smallInputContainer: {
    flex: 1,
  },


  // ===================================================
  // SAVE CARD
  // ===================================================

  saveCardButton: {
    height: 55,
    borderRadius: 14,
    backgroundColor: Colors.rider,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 5,
  },

  saveCardButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },


  // ===================================================
  // CANCEL
  // ===================================================

  cancelButton: {
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  cancelText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },

});
