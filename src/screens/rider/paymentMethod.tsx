import React, {
  useEffect,
  useState,
} from "react";

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
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import {
  getPaymentRideDetails,
  PaymentRideDetails,
} from "../../services/paymentServices";

import {
  supabase,
} from "../../lib/supabaseClient";


type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "PaymentMethod"
  >;


export default function PaymentMethodScreen({
  navigation,
  route,
}: Props) {

  const {
    rideId,
  } = route.params;


  const [
    selectedPayment,
    setSelectedPayment,
  ] =
    useState<
      "Cash"
      | "Card"
      | "Wallet"
    >("Cash");


  const [
    promoCode,
    setPromoCode,
  ] =
    useState("");


  const [
    cardModalVisible,
    setCardModalVisible,
  ] =
    useState(false);


  const [
    cardName,
    setCardName,
  ] =
    useState("");


  const [
    cardNumber,
    setCardNumber,
  ] =
    useState("");


  const [
    expiryDate,
    setExpiryDate,
  ] =
    useState("");


  const [
    cvv,
    setCvv,
  ] =
    useState("");


  const [
    rideSummary,
    setRideSummary,
  ] =
    useState<
      PaymentRideDetails | null
    >(null);


  const [
    loadingRide,
    setLoadingRide,
  ] =
    useState(true);


  const [
    processing,
    setProcessing,
  ] =
    useState(false);


  const [
    seatsBooked,
    setSeatsBooked,
  ] =
    useState(1);


  // ===================================================
  // LOAD RIDE
  // ===================================================

  useEffect(() => {

    let active = true;


    const loadRide = async () => {

      if (!rideId) {

        if (active) {

          setLoadingRide(false);

        }

        return;

      }


      try {

        setLoadingRide(true);


        const details =
          await getPaymentRideDetails(
            rideId,
          );


        if (active) {

          setRideSummary(details);

          setSeatsBooked(1);

        }

      } catch (error) {

        console.error(
          "Error loading payment ride:",
          error,
        );


        if (active) {

          Alert.alert(
            "Unable to load ride",
            error instanceof Error
              ? error.message
              : "The ride details could not be loaded.",
          );

        }

      } finally {

        if (active) {

          setLoadingRide(false);

        }

      }

    };


    loadRide();


    return () => {

      active = false;

    };

  }, [rideId]);


  const fare =
    rideSummary?.fare ?? 0;


  const totalFare =
    fare * seatsBooked;


  // ===================================================
  // CARD NUMBER FORMAT
  // ===================================================

  const handleCardNumberChange = (
    text: string,
  ) => {

    const cleaned =
      text.replace(
        /\D/g,
        "",
      );


    const limited =
      cleaned.slice(
        0,
        16,
      );


    const formatted =
      limited
        .replace(
          /(.{4})/g,
          "$1 ",
        )
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
      text.replace(
        /\D/g,
        "",
      );


    const limited =
      cleaned.slice(
        0,
        4,
      );


    if (
      limited.length >= 3
    ) {

      setExpiryDate(
        `${limited.slice(
          0,
          2,
        )}/${limited.slice(
          2,
        )}`,
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
      cardNumber.replace(
        /\s/g,
        "",
      ).length !== 16 ||
      expiryDate.length !== 5 ||
      cvv.length !== 3
    ) {

      Alert.alert(
        "Invalid Card Details",
        "Please enter a valid cardholder name, 16-digit card number, expiry date and CVV.",
      );

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
  // CONFIRM BOOKING
  // ===================================================

  const handleConfirmBooking = async () => {

    if (!rideSummary) {

      Alert.alert(
        "Ride Unavailable",
        "The ride details could not be loaded.",
      );

      return;

    }


    // =============================================
    // CHECK AVAILABLE SEATS
    // =============================================

    if (
      rideSummary.availableSeats <= 0
    ) {

      Alert.alert(
        "Ride Full",
        "There are no available seats left for this ride.",
      );

      return;

    }


    if (
      seatsBooked >
      rideSummary.availableSeats
    ) {

      Alert.alert(
        "Not Enough Seats",
        `Only ${rideSummary.availableSeats} seat${
          rideSummary.availableSeats === 1
            ? ""
            : "s"
        } available.`,
      );

      return;

    }


    try {

      setProcessing(true);


      // =============================================
      // GET CURRENT RIDER
      // =============================================

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();


      if (userError) {

        throw new Error(
          userError.message,
        );

      }


      if (!user) {

        Alert.alert(
          "Not Logged In",
          "Please log in before confirming your booking.",
        );

        return;

      }


      // =============================================
      // CONVERT PAYMENT METHOD
      // =============================================

      let paymentMethod:
        | "cash"
        | "card"
        | "wallet";


      if (
        selectedPayment === "Cash"
      ) {

        paymentMethod = "cash";

      } else if (
        selectedPayment === "Card"
      ) {

        paymentMethod = "card";

      } else {

        paymentMethod = "wallet";

      }


      // =============================================
      // CREATE BOOKING
      // =============================================

      console.log(
        "Creating booking...",
      );


      const {
        data: booking,
        error: bookingError,
      } =
        await supabase
          .from("bookings")
          .insert({
            ride_id:
              rideSummary.id,

            rider_id:
              user.id,

            driver_id:
              rideSummary.driverId,

            seats_booked:
              seatsBooked,

            amount:
              Number(totalFare),

            payment_method:
              paymentMethod,

            status:
              "pending",
          })
          .select()
          .single();


      if (bookingError) {

        console.error(
          "BOOKING INSERT ERROR:",
          bookingError,
        );


        Alert.alert(
          "Booking Failed",
          bookingError.message,
        );

        return;

      }


      if (!booking) {

        Alert.alert(
          "Booking Failed",
          "The booking could not be created.",
        );

        return;

      }


      console.log(
        "BOOKING CREATED:",
        booking,
      );


      // =============================================
      // CREATE PAYMENT RECORD
      // =============================================

      console.log(
        "Creating payment record...",
      );


      const paymentData = {

        booking_id:
          booking.id,

        ride_id:
          rideSummary.id,

        rider_id:
          user.id,

        amount:
          Number(totalFare),

        payment_method:
          paymentMethod,

        status:
          paymentMethod === "cash"
            ? "pending"
            : "paid",

        transaction_reference:
          paymentMethod === "cash"
            ? null
            : `RC-${Date.now()}`,

      };


      console.log(
        "Payment data:",
        paymentData,
      );


      const {
        data: payment,
        error: paymentError,
      } =
        await supabase
          .from("payments")
          .insert(
            paymentData,
          )
          .select()
          .single();


      if (paymentError) {

        console.error(
          "PAYMENT INSERT ERROR:",
          paymentError,
        );


        Alert.alert(
          "Payment Failed",
          paymentError.message,
        );

        return;

      }


      if (!payment) {

        Alert.alert(
          "Payment Failed",
          "The payment record could not be created.",
        );

        return;

      }


      console.log(
        "PAYMENT CREATED:",
        payment,
      );


      // =============================================
      // LINK PAYMENT TO BOOKING
      // =============================================

      const {
        error: bookingPaymentError,
      } =
        await supabase
          .from("bookings")
          .update({
            payment_id:
              payment.id,
          })
          .eq(
            "id",
            booking.id,
          );


      if (bookingPaymentError) {

        console.error(
          "BOOKING PAYMENT LINK ERROR:",
          bookingPaymentError.message,
        );


        Alert.alert(
          "Booking Warning",
          "Your booking was created, but the payment could not be linked.",
        );

        return;

      }


      // =============================================
      // SUCCESS
      // =============================================

      console.log(
        "Booking and payment created successfully.",
      );


      navigation.navigate(
        "BookingConfirmed",
        {
          bookingId:
            booking.id,
        },
      );

    } catch (error) {

      console.error(
        "Confirm booking error:",
        error,
      );


      Alert.alert(
        "Booking Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your booking.",
      );

    } finally {

      setProcessing(false);

    }

  };


  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loadingRide) {

    return (

      <SafeAreaView
        style={styles.container}
      >

        <View
          style={styles.loadingContainer}
        >

          <ActivityIndicator
            size="large"
            color={Colors.rider}
          />

          <Text
            style={styles.loadingText}
          >
            Loading payment details...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ===================================================
  // RIDE FAILED TO LOAD
  // ===================================================

  if (!rideSummary) {

    return (

      <SafeAreaView
        style={styles.container}
      >

        <View
          style={styles.errorContainer}
        >

          <Ionicons
            name="alert-circle-outline"
            size={60}
            color={Colors.rider}
          />

          <Text
            style={styles.errorTitle}
          >
            Ride Not Found
          </Text>

          <Text
            style={styles.errorText}
          >
            We could not load the details for this ride.
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >

            <Text
              style={styles.backButtonText}
            >
              Go Back
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>

    );

  }


  // ===================================================
  // MAIN UI
  // ===================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >

          <View
            style={styles.header}
          >

            <TouchableOpacity
              style={styles.headerBack}
              onPress={() =>
                navigation.goBack()
              }
            >

              <Ionicons
                name="arrow-back"
                size={25}
                color={Colors.primary}
              />

            </TouchableOpacity>

            <View>

              <Text
                style={styles.title}
              >
                Payment Method
              </Text>

              <Text
                style={styles.subtitle}
              >
                Choose how you want to pay
              </Text>

            </View>

          </View>


          {/* ========================================= */}
          {/* RIDE SUMMARY */}
          {/* ========================================= */}

          <View
            style={styles.summaryCard}
          >

            <Text
              style={styles.cardTitle}
            >
              Ride Summary
            </Text>


            <View
              style={styles.summaryRow}
            >

              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.rider}
              />

              <View
                style={styles.summaryText}
              >

                <Text
                  style={styles.summaryLabel}
                >
                  Driver
                </Text>

                <Text
                  style={styles.summaryValue}
                >
                  {rideSummary.driverName}
                </Text>

              </View>

            </View>


            <View
              style={styles.summaryRow}
            >

              <Ionicons
                name="location-outline"
                size={20}
                color={Colors.rider}
              />

              <View
                style={styles.summaryText}
              >

                <Text
                  style={styles.summaryLabel}
                >
                  Pickup
                </Text>

                <Text
                  style={styles.summaryValue}
                >
                  {rideSummary.pickupLocation}
                </Text>

              </View>

            </View>


            <View
              style={styles.summaryRow}
            >

              <Ionicons
                name="flag-outline"
                size={20}
                color={Colors.rider}
              />

              <View
                style={styles.summaryText}
              >

                <Text
                  style={styles.summaryLabel}
                >
                  Destination
                </Text>

                <Text
                  style={styles.summaryValue}
                >
                  {rideSummary.destination}
                </Text>

              </View>

            </View>


            <View
              style={styles.fareRow}
            >

              <Text
                style={styles.totalLabel}
              >
                Total Fare
              </Text>

              <Text
                style={styles.totalFare}
              >
                R{totalFare.toFixed(2)}
              </Text>

            </View>

          </View>


          {/* ========================================= */}
          {/* NUMBER OF PASSENGERS */}
          {/* ========================================= */}

          <Text
            style={styles.sectionTitle}
          >
            Number of Passengers
          </Text>


          <View
            style={styles.seatSelector}
          >

            <TouchableOpacity
              style={styles.seatButton}
              onPress={() => {

                if (
                  seatsBooked > 1
                ) {

                  setSeatsBooked(
                    seatsBooked - 1,
                  );

                }

              }}
              disabled={
                seatsBooked <= 1
              }
            >

              <Ionicons
                name="remove"
                size={22}
                color={
                  seatsBooked <= 1
                    ? "#BBBBBB"
                    : Colors.rider
                }
              />

            </TouchableOpacity>


            <View
              style={styles.seatCountContainer}
            >

              <Text
                style={styles.seatCount}
              >
                {seatsBooked}
              </Text>

              <Text
                style={styles.seatLabel}
              >
                {
                  seatsBooked === 1
                    ? "Passenger"
                    : "Passengers"
                }
              </Text>

            </View>


            <TouchableOpacity
              style={styles.seatButton}
              onPress={() => {

                if (
                  rideSummary &&
                  seatsBooked <
                    rideSummary.availableSeats
                ) {

                  setSeatsBooked(
                    seatsBooked + 1,
                  );

                }

              }}
              disabled={
                seatsBooked >=
                rideSummary.availableSeats
              }
            >

              <Ionicons
                name="add"
                size={22}
                color={
                  rideSummary &&
                  seatsBooked >=
                    rideSummary.availableSeats
                    ? "#BBBBBB"
                    : Colors.rider
                }
              />

            </TouchableOpacity>

          </View>


          <Text
            style={styles.availableSeatsText}
          >
            {rideSummary.availableSeats}{" "}
            {
              rideSummary.availableSeats === 1
                ? "seat"
                : "seats"
            }{" "}
            currently available
          </Text>


          {/* ========================================= */}
          {/* PAYMENT METHODS */}
          {/* ========================================= */}

          <Text
            style={styles.sectionTitle}
          >
            Select Payment Method
          </Text>


          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === "Cash" &&
                styles.selectedOption,
            ]}
            onPress={() =>
              setSelectedPayment("Cash")
            }
            activeOpacity={0.8}
          >

            <View
              style={styles.paymentIcon}
            >

              <Ionicons
                name="cash-outline"
                size={25}
                color={Colors.rider}
              />

            </View>

            <View
              style={styles.paymentText}
            >

              <Text
                style={styles.paymentTitle}
              >
                Cash
              </Text>

              <Text
                style={styles.paymentDescription}
              >
                Pay the driver in cash
              </Text>

            </View>

            <View
              style={[
                styles.radio,
                selectedPayment === "Cash" &&
                  styles.radioSelected,
              ]}
            >

              {selectedPayment === "Cash" && (
                <View
                  style={styles.radioDot}
                />
              )}

            </View>

          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === "Card" &&
                styles.selectedOption,
            ]}
            onPress={
              handleCardSelection
            }
            activeOpacity={0.8}
          >

            <View
              style={styles.paymentIcon}
            >

              <Ionicons
                name="card-outline"
                size={25}
                color={Colors.rider}
              />

            </View>

            <View
              style={styles.paymentText}
            >

              <Text
                style={styles.paymentTitle}
              >
                Card
              </Text>

              <Text
                style={styles.paymentDescription}
              >
                Pay using your bank card
              </Text>

            </View>

            <View
              style={[
                styles.radio,
                selectedPayment === "Card" &&
                  styles.radioSelected,
              ]}
            >

              {selectedPayment === "Card" && (
                <View
                  style={styles.radioDot}
                />
              )}

            </View>

          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === "Wallet" &&
                styles.selectedOption,
            ]}
            onPress={() =>
              setSelectedPayment("Wallet")
            }
            activeOpacity={0.8}
          >

            <View
              style={styles.paymentIcon}
            >

              <Ionicons
                name="wallet-outline"
                size={25}
                color={Colors.rider}
              />

            </View>

            <View
              style={styles.paymentText}
            >

              <Text
                style={styles.paymentTitle}
              >
                Wallet
              </Text>

              <Text
                style={styles.paymentDescription}
              >
                Pay using your RideConnect wallet
              </Text>

            </View>

            <View
              style={[
                styles.radio,
                selectedPayment === "Wallet" &&
                  styles.radioSelected,
              ]}
            >

              {selectedPayment === "Wallet" && (
                <View
                  style={styles.radioDot}
                />
              )}

            </View>

          </TouchableOpacity>


          {/* ========================================= */}
          {/* PROMO CODE */}
          {/* ========================================= */}

          <View
            style={styles.promoContainer}
          >

            <Text
              style={styles.sectionTitle}
            >
              Promo Code
            </Text>


            <View
              style={styles.promoRow}
            >

              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                placeholderTextColor={
                  Colors.textSecondary
                }
                value={promoCode}
                onChangeText={
                  setPromoCode
                }
                autoCapitalize="characters"
              />


              <TouchableOpacity
                style={styles.applyButton}
                onPress={() =>
                  Alert.alert(
                    "Promo Code",
                    promoCode.trim()
                      ? "Promo code entered."
                      : "Please enter a promo code.",
                  )
                }
              >

                <Text
                  style={styles.applyText}
                >
                  Apply
                </Text>

              </TouchableOpacity>

            </View>

          </View>


          {/* ========================================= */}
          {/* CONFIRM BOOKING */}
          {/* ========================================= */}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              processing &&
                styles.confirmButtonDisabled,
            ]}
            onPress={
              handleConfirmBooking
            }
            disabled={
              processing ||
              rideSummary.availableSeats <= 0
            }
            activeOpacity={0.8}
          >

            {processing ? (

              <ActivityIndicator
                size="small"
                color={Colors.white}
              />

            ) : (

              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={Colors.white}
              />

            )}


            <Text
              style={styles.confirmText}
            >
              {
                processing
                  ? "Confirming Booking..."
                  : rideSummary.availableSeats <= 0
                    ? "Ride Full"
                    : "Confirm Booking"
              }
            </Text>

          </TouchableOpacity>


          <Text
            style={styles.secureText}
          >
            Your booking will be sent to the driver for confirmation.
          </Text>

        </ScrollView>

      </KeyboardAvoidingView>


      {/* ============================================= */}
      {/* CARD MODAL */}
      {/* ============================================= */}

      <Modal
        visible={cardModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setCardModalVisible(false)
        }
      >

        <View
          style={styles.modalOverlay}
        >

          <View
            style={styles.modalContainer}
          >

            <View
              style={styles.modalHeader}
            >

              <Text
                style={styles.modalTitle}
              >
                Card Details
              </Text>


              <TouchableOpacity
                onPress={() =>
                  setCardModalVisible(false)
                }
              >

                <Ionicons
                  name="close"
                  size={25}
                  color={Colors.primary}
                />

              </TouchableOpacity>

            </View>


            <TextInput
              style={styles.input}
              placeholder="Cardholder Name"
              placeholderTextColor={
                Colors.textSecondary
              }
              value={cardName}
              onChangeText={setCardName}
              autoCapitalize="words"
            />


            <TextInput
              style={styles.input}
              placeholder="Card Number"
              placeholderTextColor={
                Colors.textSecondary
              }
              value={cardNumber}
              onChangeText={
                handleCardNumberChange
              }
              keyboardType="numeric"
              maxLength={19}
            />


            <View
              style={styles.cardRow}
            >

              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                ]}
                placeholder="MM/YY"
                placeholderTextColor={
                  Colors.textSecondary
                }
                value={expiryDate}
                onChangeText={
                  handleExpiryChange
                }
                keyboardType="numeric"
                maxLength={5}
              />


              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                ]}
                placeholder="CVV"
                placeholderTextColor={
                  Colors.textSecondary
                }
                value={cvv}
                onChangeText={(text) =>
                  setCvv(
                    text
                      .replace(
                        /\D/g,
                        "",
                      )
                      .slice(
                        0,
                        3,
                      ),
                  )
                }
                keyboardType="numeric"
                secureTextEntry
                maxLength={3}
              />

            </View>


            <TouchableOpacity
              style={
                styles.saveCardButton
              }
              onPress={
                handleSaveCard
              }
            >

              <Text
                style={
                  styles.saveCardText
                }
              >
                Save Card
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </SafeAreaView>

  );

}


const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    keyboardView: {
      flex: 1,
    },

    content: {
      paddingHorizontal:
        20,
      paddingTop:
        15,
      paddingBottom:
        35,
    },

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    loadingText: {
      marginTop:
        12,
      fontSize:
        15,
      color:
        Colors.textSecondary,
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom:
        25,
    },

    headerBack: {
      width:
        45,
      height:
        45,
      borderRadius:
        23,
      backgroundColor:
        Colors.white,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight:
        12,
      elevation:
        2,
    },

    title: {
      fontSize:
        27,
      fontWeight:
        "700",
      color:
        Colors.primary,
    },

    subtitle: {
      fontSize:
        14,
      color:
        Colors.textSecondary,
      marginTop:
        3,
    },

    summaryCard: {
      backgroundColor:
        Colors.white,
      borderRadius:
        20,
      padding:
        18,
      marginBottom:
        25,
      elevation:
        3,
    },

    cardTitle: {
      fontSize:
        19,
      fontWeight:
        "700",
      color:
        Colors.primary,
      marginBottom:
        15,
    },

    summaryRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom:
        14,
    },

    summaryText: {
      flex: 1,
      marginLeft:
        12,
    },

    summaryLabel: {
      fontSize:
        12,
      color:
        Colors.textSecondary,
      marginBottom:
        2,
    },

    summaryValue: {
      fontSize:
        15,
      fontWeight:
        "600",
      color:
        Colors.primary,
    },

    fareRow: {
      borderTopWidth:
        1,
      borderTopColor:
        "#EEEEEE",
      marginTop:
        5,
      paddingTop:
        15,
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },

    totalLabel: {
      fontSize:
        17,
      fontWeight:
        "700",
      color:
        Colors.primary,
    },

    totalFare: {
      fontSize:
        24,
      fontWeight:
        "800",
      color:
        Colors.rider,
    },

    sectionTitle: {
      fontSize:
        18,
      fontWeight:
        "700",
      color:
        Colors.primary,
      marginBottom:
        12,
    },

    seatSelector: {
      backgroundColor:
        Colors.white,
      borderRadius:
        17,
      padding:
        16,
      marginBottom:
        6,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      borderWidth:
        1,
      borderColor:
        "#EEEEEE",
    },

    seatButton: {
      width:
        45,
      height:
        45,
      borderRadius:
        23,
      backgroundColor:
        "#EEF5FB",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    seatCountContainer: {
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    seatCount: {
      fontSize:
        24,
      fontWeight:
        "800",
      color:
        Colors.primary,
    },

    seatLabel: {
      fontSize:
        12,
      color:
        Colors.textSecondary,
      marginTop:
        2,
    },

    availableSeatsText: {
      fontSize:
        12,
      color:
        Colors.textSecondary,
      marginBottom:
        20,
      textAlign:
        "center",
    },

    paymentOption: {
      backgroundColor:
        Colors.white,
      borderRadius:
        17,
      padding:
        16,
      marginBottom:
        12,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth:
        1,
      borderColor:
        "#EEEEEE",
    },

    selectedOption: {
      borderColor:
        Colors.rider,
      borderWidth:
        2,
    },

    paymentIcon: {
      width:
        45,
      height:
        45,
      borderRadius:
        23,
      backgroundColor:
        "#EEF5FB",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    paymentText: {
      flex: 1,
      marginLeft:
        12,
    },

    paymentTitle: {
      fontSize:
        16,
      fontWeight:
        "700",
      color:
        Colors.primary,
    },

    paymentDescription: {
      fontSize:
        12,
      color:
        Colors.textSecondary,
      marginTop:
        3,
    },

    radio: {
      width:
        23,
      height:
        23,
      borderRadius:
        12,
      borderWidth:
        2,
      borderColor:
        "#BBBBBB",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    radioSelected: {
      borderColor:
        Colors.rider,
    },

    radioDot: {
      width:
        11,
      height:
        11,
      borderRadius:
        6,
      backgroundColor:
        Colors.rider,
    },

    promoContainer: {
      marginTop:
        10,
      marginBottom:
        20,
    },

    promoRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    promoInput: {
      flex: 1,
      height:
        52,
      backgroundColor:
        Colors.white,
      borderRadius:
        14,
      paddingHorizontal:
        15,
      fontSize:
        14,
      color:
        Colors.primary,
      borderWidth:
        1,
      borderColor:
        "#E0E0E0",
    },

    applyButton: {
      height:
        52,
      paddingHorizontal:
        18,
      marginLeft:
        8,
      borderRadius:
        14,
      backgroundColor:
        Colors.primary,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    applyText: {
      color:
        Colors.white,
      fontSize:
        14,
      fontWeight:
        "700",
    },

    confirmButton: {
      minHeight:
        58,
      borderRadius:
        16,
      backgroundColor:
        Colors.rider,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal:
        18,
      elevation:
        3,
    },

    confirmButtonDisabled: {
      opacity:
        0.7,
    },

    confirmText: {
      color:
        Colors.white,
      fontSize:
        16,
      fontWeight:
        "700",
      marginLeft:
        9,
    },

    secureText: {
      textAlign:
        "center",
      fontSize:
        12,
      color:
        Colors.textSecondary,
      lineHeight:
        18,
      marginTop:
        10,
    },

    errorContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      padding:
        25,
    },

    errorTitle: {
      fontSize:
        24,
      fontWeight:
        "700",
      color:
        Colors.primary,
      marginTop:
        15,
    },

    errorText: {
      fontSize:
        14,
      color:
        Colors.textSecondary,
      textAlign:
        "center",
      marginTop:
        8,
      marginBottom:
        20,
    },

    backButton: {
      backgroundColor:
        Colors.rider,
      paddingHorizontal:
        25,
      paddingVertical:
        14,
      borderRadius:
        14,
    },

    backButtonText: {
      color:
        Colors.white,
      fontWeight:
        "700",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.5)",
      justifyContent:
        "flex-end",
    },

    modalContainer: {
      backgroundColor:
        Colors.white,
      borderTopLeftRadius:
        25,
      borderTopRightRadius:
        25,
      padding:
        22,
      paddingBottom:
        35,
    },

    modalHeader: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom:
        20,
    },

    modalTitle: {
      fontSize:
        22,
      fontWeight:
        "700",
      color:
        Colors.primary,
    },

    input: {
      height:
        52,
      backgroundColor:
        Colors.background,
      borderRadius:
        13,
      paddingHorizontal:
        15,
      fontSize:
        14,
      color:
        Colors.primary,
      borderWidth:
        1,
      borderColor:
        "#E0E0E0",
      marginBottom:
        12,
    },

    cardRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
    },

    halfInput: {
      width:
        "48%",
    },

    saveCardButton: {
      height:
        55,
      borderRadius:
        15,
      backgroundColor:
        Colors.rider,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginTop:
        5,
    },

    saveCardText: {
      color:
        Colors.white,
      fontSize:
        16,
      fontWeight:
        "700",
    },

  });