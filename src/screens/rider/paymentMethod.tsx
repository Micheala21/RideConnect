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


// ===============================
// CARD VALIDATION
// ===============================

const isValidCardNumber = (
  cardNumber: string,
) => {

  const digits =
    cardNumber.replace(
      /\D/g,
      "",
    );

  if (digits.length !== 16) {
    return false;
  }

  let sum = 0;

  let shouldDouble = false;

  for (
    let i = digits.length - 1;
    i >= 0;
    i--
  ) {

    let digit =
      Number(
        digits[i],
      );

    if (shouldDouble) {

      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }

    }

    sum += digit;

    shouldDouble =
      !shouldDouble;
  }

  return sum % 10 === 0;
};


const isValidExpiryDate = (
  expiry: string,
) => {

  if (
    !/^\d{2}\/\d{2}$/.test(
      expiry,
    )
  ) {
    return false;
  }

  const [
    monthText,
    yearText,
  ] =
    expiry.split("/");

  const month =
    Number(monthText);

  const year =
    2000 +
    Number(yearText);

  if (
    month < 1 ||
    month > 12
  ) {
    return false;
  }

  const now =
    new Date();

  const currentMonth =
    now.getMonth() + 1;

  const currentYear =
    now.getFullYear();

  return (
    year > currentYear ||
    (
      year === currentYear &&
      month >= currentMonth
    )
  );
};


// ===============================
// SCREEN
// ===============================

const PaymentMethodScreen = ({
  navigation,
  route,
}: Props) => {

  // ===============================
  // PAYMENT
  // ===============================

  const [
    selectedPayment,
    setSelectedPayment,
  ] =
    useState<
      "Cash" |
      "Card" |
      "Wallet"
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
    cardValidated,
    setCardValidated,
  ] =
    useState(false);


  // ===============================
  // WALLET
  // ===============================

  const [
    walletExpanded,
    setWalletExpanded,
  ] =
    useState(false);

  const [
    walletBalance,
    setWalletBalance,
  ] =
    useState(0);

  const [
    loadingWallet,
    setLoadingWallet,
  ] =
    useState(false);


  // ===============================
  // RIDE
  // ===============================

  const [
    rideSummary,
    setRideSummary,
  ] =
    useState<
      PaymentRideDetails |
      null
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


  // ===============================
  // LOAD RIDE
  // ===============================

  useEffect(() => {

    const loadRide =
      async () => {

        try {

          setLoadingRide(true);

          const rideId =
            route.params.rideId;

          const details =
            await getPaymentRideDetails(
              rideId,
            );

          setRideSummary(
            details,
          );

          setSeatsBooked(1);

        } catch (error) {

          console.error(
            "Error loading payment ride:",
            error,
          );

          Alert.alert(
            "Error",
            "Unable to load the ride details.",
          );

        } finally {

          setLoadingRide(false);

        }

      };

    loadRide();

  }, [
    route.params.rideId,
  ]);


  // ===============================
  // FARE
  // ===============================

  const fare =
    rideSummary?.fare ??
    0;

  const totalFare =
    fare * seatsBooked;

  const remainingWalletBalance =
    walletBalance -
    totalFare;


  // ===============================
  // LOAD WALLET
  // ===============================

  const loadWallet =
    async () => {

      try {

        setLoadingWallet(true);

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();


        if (!user) {

          Alert.alert(
            "Login Required",
            "Please log in to use your wallet.",
          );

          return;
        }


        const {
          data: wallet,
          error: walletError,
        } =
          await supabase
            .from("wallets")
            .select(
              "balance",
            )
            .eq(
              "user_id",
              user.id,
            )
            .maybeSingle();


        if (walletError) {

          throw new Error(
            walletError.message,
          );

        }


        if (!wallet) {

          setWalletBalance(
            0,
          );

          return;
        }


        setWalletBalance(
          Number(
            wallet.balance ??
              0,
          ),
        );

      } catch (error) {

        console.error(
          "Wallet loading error:",
          error,
        );

        Alert.alert(
          "Wallet Error",
          error instanceof Error
            ? error.message
            : "Unable to load your wallet balance.",
        );

      } finally {

        setLoadingWallet(
          false,
        );

      }

    };


  // ===============================
  // WALLET SELECTION
  // ===============================

  const handleWalletSelection =
    async () => {

      setSelectedPayment(
        "Wallet",
      );

      setWalletExpanded(
        true,
      );

      await loadWallet();

    };


  // ===============================
  // CARD NUMBER
  // ===============================

  const handleCardNumberChange = (
    value: string,
  ) => {

    const digits =
      value.replace(
        /\D/g,
        "",
      ).slice(0, 16);

    const formatted =
      digits.match(
        /.{1,4}/g,
      )?.join(" ") ??
      digits;

    setCardNumber(
      formatted,
    );

    setCardValidated(
      false,
    );

  };


  // ===============================
  // EXPIRY
  // ===============================

  const handleExpiryChange = (
    value: string,
  ) => {

    const digits =
      value.replace(
        /\D/g,
        "",
      ).slice(0, 4);

    let formatted =
      digits;

    if (
      digits.length > 2
    ) {

      formatted =
        `${digits.slice(
          0,
          2,
        )}/${digits.slice(
          2,
        )}`;

    }

    setExpiryDate(
      formatted,
    );

    setCardValidated(
      false,
    );

  };


  // ===============================
  // CARD SELECTION
  // ===============================

  const handleCardSelection =
    () => {

      setSelectedPayment(
        "Card",
      );

      setWalletExpanded(
        false,
      );

      setCardModalVisible(
        true,
      );

    };


  // ===============================
  // SAVE / VALIDATE CARD
  // ===============================

  const handleSaveCard =
    () => {

      const cleanedCardNumber =
        cardNumber.replace(
          /\s/g,
          "",
        );

      const cleanedCvv =
        cvv.replace(
          /\D/g,
          "",
        );


      if (
        !cardName.trim()
      ) {

        Alert.alert(
          "Invalid Card Details",
          "Please enter the cardholder name.",
        );

        return;
      }


      if (
        !isValidCardNumber(
          cleanedCardNumber,
        )
      ) {

        Alert.alert(
          "Invalid Card Number",
          "Please enter a valid 16-digit test card number.",
        );

        return;
      }


      if (
        !isValidExpiryDate(
          expiryDate,
        )
      ) {

        Alert.alert(
          "Invalid Expiry Date",
          "Please enter a valid expiry date that has not expired.",
        );

        return;
      }


      if (
        cleanedCvv.length !== 3
      ) {

        Alert.alert(
          "Invalid CVV",
          "Please enter a valid 3-digit CVV.",
        );

        return;
      }


      setCardValidated(
        true,
      );

      setSelectedPayment(
        "Card",
      );

      setCardModalVisible(
        false,
      );

      Alert.alert(
        "Test Card Accepted",
        "The card passed RideConnect's test validation. No real payment was processed.",
      );

    };


  // ===============================
  // CONFIRM BOOKING
  // ===============================

  const handleConfirmBooking =
    async () => {

      if (!rideSummary) {

        Alert.alert(
          "Error",
          "Ride information is unavailable.",
        );

        return;
      }


      // ===============================
      // CARD VALIDATION
      // ===============================

      if (
        selectedPayment ===
          "Card" &&
        !cardValidated
      ) {

        Alert.alert(
          "Card Payment Required",
          "Please enter and validate your test card details before confirming the booking.",
        );

        setCardModalVisible(
          true,
        );

        return;
      }


      // ===============================
      // WALLET BALANCE
      // ===============================

      if (
        selectedPayment ===
          "Wallet" &&
        walletBalance <
          totalFare
      ) {

        Alert.alert(
          "Insufficient Wallet Balance",
          `Your wallet has R${walletBalance.toFixed(
            2,
          )}, but this ride costs R${totalFare.toFixed(
            2,
          )}. Please top up your wallet or choose another payment method.`,
        );

        return;
      }


      // ===============================
      // SEATS
      // ===============================

      if (
        rideSummary.availableSeats <=
        0
      ) {

        Alert.alert(
          "Ride Full",
          "There are no available seats left on this ride.",
        );

        return;
      }


      if (
        seatsBooked >
        rideSummary.availableSeats
      ) {

        Alert.alert(
          "Not Enough Seats",
          `Only ${rideSummary.availableSeats} seat(s) are available.`,
        );

        return;
      }


      try {

        setProcessing(
          true,
        );


        // ===============================
        // CURRENT USER
        // ===============================

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();


        if (!user) {

          Alert.alert(
            "Login Required",
            "Please log in before booking a ride.",
          );

          return;
        }


        // ===============================
        // RECHECK RIDE
        // ===============================

        const {
          data: currentRide,
          error: currentRideError,
        } =
          await supabase
            .from("rides")
            .select(
              "id, available_seats, status",
            )
            .eq(
              "id",
              rideSummary.id,
            )
            .single();


        if (
          currentRideError ||
          !currentRide
        ) {

          throw new Error(
            currentRideError?.message ??
              "Unable to verify the ride.",
          );

        }


        if (
          currentRide.available_seats <=
          0
        ) {

          Alert.alert(
            "Ride Full",
            "This ride has just become full.",
          );

          return;
        }


        if (
          seatsBooked >
          currentRide.available_seats
        ) {

          Alert.alert(
            "Not Enough Seats",
            `Only ${currentRide.available_seats} seat(s) are currently available.`,
          );

          return;
        }


        // ===============================
        // RECHECK WALLET
        // ===============================

        let currentWalletBalance =
          walletBalance;


        if (
          selectedPayment ===
          "Wallet"
        ) {

          const {
            data: latestWallet,
            error:
              latestWalletError,
          } =
            await supabase
              .from("wallets")
              .select(
                "balance",
              )
              .eq(
                "user_id",
                user.id,
              )
              .maybeSingle();


          if (
            latestWalletError
          ) {

            throw new Error(
              latestWalletError.message,
            );

          }


          currentWalletBalance =
            Number(
              latestWallet?.balance ??
                0,
            );


          if (
            currentWalletBalance <
            totalFare
          ) {

            setWalletBalance(
              currentWalletBalance,
            );

            Alert.alert(
              "Insufficient Wallet Balance",
              `Your wallet has R${currentWalletBalance.toFixed(
                2,
              )}, but this ride costs R${totalFare.toFixed(
                2,
              )}.`,
            );

            return;
          }

        }


        // ===============================
        // PAYMENT METHOD
        // ===============================

        let paymentMethod:
          | "cash"
          | "card"
          | "wallet";


        if (
          selectedPayment ===
          "Cash"
        ) {

          paymentMethod =
            "cash";

        } else if (
          selectedPayment ===
          "Card"
        ) {

          paymentMethod =
            "card";

        } else {

          paymentMethod =
            "wallet";

        }


        // ===============================
        // CREATE BOOKING
        // ===============================

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
                Number(
                  totalFare,
                ),

              payment_method:
                paymentMethod,

              status:
                "pending",
            })
            .select()
            .single();


        if (
          bookingError ||
          !booking
        ) {

          throw new Error(
            bookingError?.message ??
              "Unable to create booking.",
          );

        }


        // ===============================
        // PAYMENT AUTHORISATION
        // ===============================
        // The booking must remain pending until the driver accepts it.
        // Wallet funds and ride seats are therefore NOT changed here.
        // The driver acceptance flow performs the final seat reservation
        // and payment capture exactly once.

        // ===============================
        // CREATE PAYMENT
        // ===============================

        const paymentData = {

          booking_id:
            booking.id,

          ride_id:
            rideSummary.id,

          rider_id:
            user.id,

          amount:
            Number(
              totalFare,
            ),

          payment_method:
            paymentMethod,

          status:
            "pending",

          transaction_reference:
            paymentMethod ===
            "cash"
              ? null
              : paymentMethod ===
                "card"
              ? `RC-TEST-${Date.now()}`
              : paymentMethod ===
                "wallet"
              ? `RC-WALLET-${Date.now()}`
              : `RC-${Date.now()}`,

        };


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


        if (
          paymentError ||
          !payment
        ) {

          // Do not leave an unusable pending request in the driver's queue
          // when payment authorisation could not be created.
          await supabase
            .from("bookings")
            .delete()
            .eq("id", booking.id)
            .eq("status", "pending");

          throw new Error(
            paymentError?.message ??
              "Unable to create payment.",
          );

        }


        // ===============================
        // LINK PAYMENT
        // ===============================

        const {
          error:
            bookingUpdateError,
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


        if (
          bookingUpdateError
        ) {

          // Keep booking/payment records in sync if linking fails.
          await supabase
            .from("payments")
            .delete()
            .eq("id", payment.id);

          await supabase
            .from("bookings")
            .delete()
            .eq("id", booking.id)
            .eq("status", "pending");

          throw new Error(
            bookingUpdateError.message,
          );

        }


        // ===============================
        // RIDE REMAINS AVAILABLE UNTIL DRIVER RESPONSE
        // ===============================
        // Do not decrement available_seats and do not mark the ride as
        // accepted on the rider side. The driver owns that decision.

        // ===============================
        // COMPLETE
        // ===============================

        navigation.navigate(
          "BookingConfirmed",
          {
            bookingId:
              booking.id,
          },
        );

      } catch (error) {

        console.error(
          "Booking error:",
          error,
        );

        Alert.alert(
          "Booking Failed",
          error instanceof Error
            ? error.message
            : "Something went wrong while confirming your booking.",
        );

      } finally {

        setProcessing(
          false,
        );

      }

    };


  // ===============================
  // PROMO
  // ===============================

  const handlePromoCode =
    () => {

      if (
        !promoCode.trim()
      ) {

        Alert.alert(
          "Promo Code",
          "Please enter a promo code.",
        );

        return;
      }

      Alert.alert(
        "Promo Code",
        "Promo code entered.",
      );

    };


  // ===============================
  // LOADING
  // ===============================

  if (loadingRide) {

    return (

      <SafeAreaView
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
          color={
            Colors.rider
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading payment details...
        </Text>

      </SafeAreaView>

    );

  }


  // ===============================
  // UI
  // ===============================

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >

        <TouchableOpacity
          style={
            styles.headerBack
          }
          onPress={() =>
            navigation.goBack()
          }
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color={
              Colors.rider
            }
          />

        </TouchableOpacity>


        <View
          style={
            styles.headerText
          }
        >

          <Text
            style={
              styles.title
            }
          >
            Payment Method
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Choose how you want to pay
          </Text>

        </View>

      </View>


      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* RIDE SUMMARY */}

        <View
          style={
            styles.card
          }
        >

          <Text
            style={
              styles.cardTitle
            }
          >
            Ride Summary
          </Text>


          <View
            style={
              styles.summaryRow
            }
          >

            <Text
              style={
                styles.summaryLabel
              }
            >
              Driver
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {
                rideSummary?.driverName ??
                "Driver"
              }
            </Text>

          </View>


          <View
            style={
              styles.summaryRow
            }
          >

            <Text
              style={
                styles.summaryLabel
              }
            >
              Pickup
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {
                rideSummary?.pickupLocation ??
                "—"
              }
            </Text>

          </View>


          <View
            style={
              styles.summaryRow
            }
          >

            <Text
              style={
                styles.summaryLabel
              }
            >
              Destination
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {
                rideSummary?.destination ??
                "—"
              }
            </Text>

          </View>


          <View
            style={
              styles.totalRow
            }
          >

            <Text
              style={
                styles.totalLabel
              }
            >
              Total Fare
            </Text>

            <Text
              style={
                styles.totalValue
              }
            >
              R
              {
                totalFare.toFixed(
                  2,
                )
              }
            </Text>

          </View>

        </View>


        {/* PASSENGERS */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Number of Passengers
          </Text>


          <View
            style={
              styles.seatSelector
            }
          >

            <TouchableOpacity
              style={
                styles.seatButton
              }
              onPress={() =>
                setSeatsBooked(
                  Math.max(
                    1,
                    seatsBooked - 1,
                  ),
                )
              }
              disabled={
                seatsBooked <= 1
              }
            >

              <Ionicons
                name="remove"
                size={22}
                color={
                  Colors.rider
                }
              />

            </TouchableOpacity>


            <Text
              style={
                styles.seatCount
              }
            >
              {
                seatsBooked
              }
            </Text>


            <TouchableOpacity
              style={
                styles.seatButton
              }
              onPress={() =>
                setSeatsBooked(
                  Math.min(
                    rideSummary?.availableSeats ??
                      1,
                    seatsBooked + 1,
                  ),
                )
              }
              disabled={
                seatsBooked >=
                (
                  rideSummary?.availableSeats ??
                  0
                )
              }
            >

              <Ionicons
                name="add"
                size={22}
                color={
                  Colors.rider
                }
              />

            </TouchableOpacity>

          </View>


          <Text
            style={
              styles.availableText
            }
          >
            {
              rideSummary?.availableSeats ??
              0
            } seat(s) available
          </Text>

        </View>


        {/* PAYMENT METHODS */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Payment Method
          </Text>


          {/* CASH */}

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment ===
                "Cash" &&
                styles.paymentOptionSelected,
            ]}
            onPress={() => {

              setSelectedPayment(
                "Cash",
              );

              setWalletExpanded(
                false,
              );

            }}
          >

            <View
              style={
                styles.paymentLeft
              }
            >

              <View
                style={
                  styles.paymentIcon
                }
              >

                <Ionicons
                  name="cash-outline"
                  size={23}
                  color={
                    Colors.rider
                  }
                />

              </View>


              <View>

                <Text
                  style={
                    styles.paymentTitle
                  }
                >
                  Cash
                </Text>

                <Text
                  style={
                    styles.paymentDescription
                  }
                >
                  Pay the driver in cash
                </Text>

              </View>

            </View>


            <View
              style={[
                styles.radio,
                selectedPayment ===
                  "Cash" &&
                  styles.radioSelected,
              ]}
            >

              {
                selectedPayment ===
                  "Cash" && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )
              }

            </View>

          </TouchableOpacity>


          {/* CARD */}

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment ===
                "Card" &&
                styles.paymentOptionSelected,
            ]}
            onPress={
              handleCardSelection
            }
          >

            <View
              style={
                styles.paymentLeft
              }
            >

              <View
                style={
                  styles.paymentIcon
                }
              >

                <Ionicons
                  name="card-outline"
                  size={23}
                  color={
                    Colors.rider
                  }
                />

              </View>


              <View
                style={
                  styles.paymentTextContainer
                }
              >

                <Text
                  style={
                    styles.paymentTitle
                  }
                >
                  Card
                </Text>

                <Text
                  style={
                    styles.paymentDescription
                  }
                >
                  Pay using your bank card
                </Text>

                {
                  cardValidated && (
                    <Text
                      style={
                        styles.cardValidatedText
                      }
                    >
                      Test card validated
                    </Text>
                  )
                }

              </View>

            </View>


            <View
              style={[
                styles.radio,
                selectedPayment ===
                  "Card" &&
                  styles.radioSelected,
              ]}
            >

              {
                selectedPayment ===
                  "Card" && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )
              }

            </View>

          </TouchableOpacity>


          {/* WALLET */}

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment ===
                "Wallet" &&
                styles.paymentOptionSelected,
            ]}
            onPress={
              handleWalletSelection
            }
          >

            <View
              style={
                styles.paymentLeft
              }
            >

              <View
                style={
                  styles.paymentIcon
                }
              >

                <Ionicons
                  name="wallet-outline"
                  size={23}
                  color={
                    Colors.rider
                  }
                />

              </View>


              <View
                style={
                  styles.paymentTextContainer
                }
              >

                <Text
                  style={
                    styles.paymentTitle
                  }
                >
                  Wallet
                </Text>

                <Text
                  style={
                    styles.paymentDescription
                  }
                >
                  Pay using your RideConnect wallet
                </Text>

              </View>

            </View>


            <View
              style={
                styles.walletRight
              }
            >

              <Ionicons
                name={
                  walletExpanded
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={20}
                color={
                  Colors.rider
                }
              />

            </View>

          </TouchableOpacity>


          {/* WALLET DROPDOWN */}

          {
            walletExpanded && (
              <View
                style={
                  styles.walletDropdown
                }
              >

                {
                  loadingWallet ? (

                    <View
                      style={
                        styles.walletLoading
                      }
                    >

                      <ActivityIndicator
                        size="small"
                        color={
                          Colors.rider
                        }
                      />

                      <Text
                        style={
                          styles.walletLoadingText
                        }
                      >
                        Loading wallet balance...
                      </Text>

                    </View>

                  ) : (

                    <>

                      <View
                        style={
                          styles.walletBalanceRow
                        }
                      >

                        <View>

                          <Text
                            style={
                              styles.walletLabel
                            }
                          >
                            Available Balance
                          </Text>

                          <Text
                            style={
                              styles.walletBalance
                            }
                          >
                            R
                            {
                              walletBalance.toFixed(
                                2,
                              )
                            }
                          </Text>

                        </View>


                        <Ionicons
                          name="wallet"
                          size={35}
                          color={
                            Colors.rider
                          }
                        />

                      </View>


                      <View
                        style={
                          styles.walletDivider
                        }
                      />


                      <View
                        style={
                          styles.walletAmountRow
                        }
                      >

                        <Text
                          style={
                            styles.walletAmountLabel
                          }
                        >
                          Ride Total
                        </Text>

                        <Text
                          style={
                            styles.walletAmountValue
                          }
                        >
                          R
                          {
                            totalFare.toFixed(
                              2,
                            )
                          }
                        </Text>

                      </View>


                      <View
                        style={
                          styles.walletAmountRow
                        }
                      >

                        <Text
                          style={
                            styles.walletAmountLabel
                          }
                        >
                          Remaining Balance
                        </Text>

                        <Text
                          style={[
                            styles.walletAmountValue,
                            remainingWalletBalance <
                              0 &&
                              styles.insufficientText,
                          ]}
                        >
                          R
                          {
                            Math.max(
                              remainingWalletBalance,
                              0,
                            ).toFixed(
                              2,
                            )
                          }
                        </Text>

                      </View>


                      {
                        walletBalance <
                          totalFare && (
                            <View
                              style={
                                styles.insufficientBox
                              }
                            >

                              <Ionicons
                                name="warning-outline"
                                size={19}
                                color={
                                  Colors.danger
                                }
                              />

                              <Text
                                style={
                                  styles.insufficientMessage
                                }
                              >
                                You don't have enough money in your wallet for this ride.
                              </Text>

                            </View>
                          )
                      }


                      {
                        walletBalance >=
                          totalFare && (
                            <View
                              style={
                                styles.sufficientBox
                              }
                            >

                              <Ionicons
                                name="checkmark-circle-outline"
                                size={19}
                                color={
                                  Colors.success
                                }
                              />

                              <Text
                                style={
                                  styles.sufficientMessage
                                }
                              >
                                You have enough money to pay for this ride.
                              </Text>

                            </View>
                          )
                      }

                    </>

                  )
                }

              </View>
            )
          }

        </View>


        {/* PROMO */}

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Promo Code
          </Text>


          <View
            style={
              styles.promoRow
            }
          >

            <TextInput
              style={
                styles.promoInput
              }
              placeholder="Enter promo code"
              placeholderTextColor={
                Colors.textSecondary
              }
              value={
                promoCode
              }
              onChangeText={
                setPromoCode
              }
              autoCapitalize="characters"
            />


            <TouchableOpacity
              style={
                styles.applyButton
              }
              onPress={
                handlePromoCode
              }
            >

              <Text
                style={
                  styles.applyButtonText
                }
              >
                Apply
              </Text>

            </TouchableOpacity>

          </View>

        </View>


        {/* CONFIRM */}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (
              processing ||
              (
                rideSummary?.availableSeats ??
                0
              ) <= 0 ||
              (
                selectedPayment ===
                  "Wallet" &&
                walletBalance <
                  totalFare
              )
            ) &&
              styles.confirmButtonDisabled,
          ]}
          onPress={
            handleConfirmBooking
          }
          disabled={
            processing ||
            (
              rideSummary?.availableSeats ??
              0
            ) <= 0 ||
            (
              selectedPayment ===
                "Wallet" &&
              walletBalance <
                totalFare
            )
          }
        >

          {
            processing ? (

              <ActivityIndicator
                color={
                  Colors.white
                }
              />

            ) : (

              <Text
                style={
                  styles.confirmButtonText
                }
              >
                {
                  (
                    rideSummary?.availableSeats ??
                    0
                  ) <= 0
                    ? "Ride Full"
                    : "Confirm Booking"
                }
              </Text>

            )
          }

        </TouchableOpacity>


        <View
          style={
            styles.securityContainer
          }
        >

          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={
              Colors.textSecondary
            }
          />

          <Text
            style={
              styles.securityText
            }
          >
            Your booking will be sent to the driver for confirmation.
          </Text>

        </View>

      </ScrollView>


      {/* CARD MODAL */}

      <Modal
        visible={
          cardModalVisible
        }
        animationType="slide"
        transparent
        onRequestClose={() =>
          setCardModalVisible(
            false,
          )
        }
      >

        <KeyboardAvoidingView
          style={
            styles.modalOverlay
          }
          behavior={
            Platform.OS ===
            "ios"
              ? "padding"
              : undefined
          }
        >

          <View
            style={
              styles.modalContainer
            }
          >

            <View
              style={
                styles.modalHeader
              }
            >

              <Text
                style={
                  styles.modalTitle
                }
              >
                Card Details
              </Text>


              <TouchableOpacity
                onPress={() =>
                  setCardModalVisible(
                    false,
                  )
                }
              >

                <Ionicons
                  name="close"
                  size={25}
                  color={
                    Colors.rider
                  }
                />

              </TouchableOpacity>

            </View>


            <Text
              style={
                styles.testCardNotice
              }
            >
              This is a simulated test payment. No real money will be charged.
            </Text>


            <Text
              style={
                styles.inputLabel
              }
            >
              Cardholder Name
            </Text>

            <TextInput
              style={
                styles.input
              }
              placeholder="Enter cardholder name"
              placeholderTextColor={
                Colors.textSecondary
              }
              value={
                cardName
              }
              onChangeText={(
                value,
              ) => {

                setCardName(
                  value,
                );

                setCardValidated(
                  false,
                );

              }}
              autoCapitalize="words"
            />


            <Text
              style={
                styles.inputLabel
              }
            >
              Card Number
            </Text>

            <TextInput
              style={
                styles.input
              }
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={
                Colors.textSecondary
              }
              value={
                cardNumber
              }
              onChangeText={
                handleCardNumberChange
              }
              keyboardType="number-pad"
              maxLength={19}
            />


            <View
              style={
                styles.cardInputRow
              }
            >

              <View
                style={
                  styles.cardInputHalf
                }
              >

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Expiry Date
                </Text>

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="MM/YY"
                  placeholderTextColor={
                    Colors.textSecondary
                  }
                  value={
                    expiryDate
                  }
                  onChangeText={
                    handleExpiryChange
                  }
                  keyboardType="number-pad"
                  maxLength={5}
                />

              </View>


              <View
                style={
                  styles.cardInputHalf
                }
              >

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  CVV
                </Text>

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="123"
                  placeholderTextColor={
                    Colors.textSecondary
                  }
                  value={
                    cvv
                  }
                  onChangeText={(
                    value,
                  ) => {

                    const digits =
                      value
                        .replace(
                          /\D/g,
                          "",
                        )
                        .slice(
                          0,
                          3,
                        );

                    setCvv(
                      digits,
                    );

                    setCardValidated(
                      false,
                    );

                  }}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={3}
                />

              </View>

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
                  styles.saveCardButtonText
                }
              >
                Validate Test Card
              </Text>

            </TouchableOpacity>


            <Text
              style={
                styles.testCardFooter
              }
            >
              Card details are only used for local test validation and are not stored in Supabase.
            </Text>

          </View>

        </KeyboardAvoidingView>

      </Modal>

    </SafeAreaView>

  );

};


export default PaymentMethodScreen;


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    loadingContainer: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 15,
      color:
        Colors.textSecondary,
    },


    // HEADER

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal:
        20,
      paddingTop:
        15,
      paddingBottom:
        15,
      backgroundColor:
        Colors.white,
    },

    headerBack: {
      width: 42,
      height: 42,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: 24,
      fontWeight:
        "700",
      color:
        Colors.rider,
    },

    subtitle: {
      marginTop: 3,
      fontSize: 14,
      color:
        Colors.textSecondary,
    },


    // SCROLL

    scrollContent: {
      padding: 20,
      paddingBottom: 35,
    },


    // RIDE SUMMARY

    card: {
      backgroundColor:
        Colors.white,
      borderRadius: 16,
      padding: 18,
      marginBottom: 24,
      borderWidth: 1,
      borderColor:
        Colors.border,
    },

    cardTitle: {
      fontSize: 18,
      fontWeight:
        "700",
      color:
        Colors.rider,
      marginBottom: 16,
    },

    summaryRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "flex-start",
      marginBottom: 13,
    },

    summaryLabel: {
      flex: 1,
      fontSize: 14,
      color:
        Colors.textSecondary,
    },

    summaryValue: {
      flex: 1.5,
      fontSize: 14,
      fontWeight:
        "600",
      color:
        Colors.rider,
      textAlign:
        "right",
    },

    totalRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginTop: 5,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor:
        Colors.border,
    },

    totalLabel: {
      fontSize: 16,
      fontWeight:
        "700",
      color:
        Colors.rider,
    },

    totalValue: {
      fontSize: 20,
      fontWeight:
        "800",
      color:
        Colors.rider,
    },


    // SECTIONS

    section: {
      marginBottom: 24,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight:
        "700",
      color:
        Colors.rider,
      marginBottom: 12,
    },


    // SEATS

    seatSelector: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 25,
    },

    seatButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        Colors.riderLight,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    seatCount: {
      minWidth: 35,
      textAlign:
        "center",
      fontSize: 20,
      fontWeight:
        "700",
      color:
        Colors.rider,
    },

    availableText: {
      textAlign:
        "center",
      marginTop: 10,
      fontSize: 13,
      color:
        Colors.textSecondary,
    },


    // PAYMENT

    paymentOption: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      backgroundColor:
        Colors.white,
      borderWidth: 1,
      borderColor:
        Colors.border,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },

    paymentOptionSelected: {
      borderColor:
        Colors.rider,
      borderWidth: 2,
    },

    paymentLeft: {
      flexDirection:
        "row",
      alignItems:
        "center",
      flex: 1,
    },

    paymentIcon: {
      width: 45,
      height: 45,
      borderRadius: 23,
      backgroundColor:
        Colors.riderLight,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    paymentTextContainer: {
      flex: 1,
    },

    paymentTitle: {
      fontSize: 16,
      fontWeight:
        "700",
      color:
        Colors.rider,
    },

    paymentDescription: {
      marginTop: 3,
      fontSize: 13,
      color:
        Colors.textSecondary,
    },

    cardValidatedText: {
      marginTop: 4,
      fontSize: 12,
      fontWeight:
        "600",
      color:
        Colors.success,
    },

    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor:
        Colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginLeft: 10,
    },

    radioSelected: {
      borderColor:
        Colors.rider,
    },

    radioInner: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor:
        Colors.rider,
    },

    walletRight: {
      width: 30,
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    // WALLET DROPDOWN

    walletDropdown: {
      backgroundColor:
        Colors.white,
      borderWidth: 1,
      borderColor:
        Colors.rider,
      borderRadius: 14,
      padding: 16,
      marginTop: -3,
      marginBottom: 10,
    },

    walletLoading: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingVertical: 15,
    },

    walletLoadingText: {
      marginLeft: 10,
      fontSize: 13,
      color:
        Colors.textSecondary,
    },

    walletBalanceRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    walletLabel: {
      fontSize: 13,
      color:
        Colors.textSecondary,
    },

    walletBalance: {
      marginTop: 4,
      fontSize: 25,
      fontWeight:
        "800",
      color:
        Colors.rider,
    },

    walletDivider: {
      height: 1,
      backgroundColor:
        Colors.border,
      marginVertical: 15,
    },

    walletAmountRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 9,
    },

    walletAmountLabel: {
      fontSize: 14,
      color:
        Colors.textSecondary,
    },

    walletAmountValue: {
      fontSize: 14,
      fontWeight:
        "700",
      color:
        Colors.rider,
    },

    insufficientText: {
      color:
        Colors.danger,
    },

    insufficientBox: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#FEF2F2",
      borderRadius: 9,
      padding: 10,
      marginTop: 7,
    },

    insufficientMessage: {
      flex: 1,
      marginLeft: 7,
      fontSize: 12,
      lineHeight: 17,
      color:
        Colors.danger,
    },

    sufficientBox: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#F0FDF4",
      borderRadius: 9,
      padding: 10,
      marginTop: 7,
    },

    sufficientMessage: {
      flex: 1,
      marginLeft: 7,
      fontSize: 12,
      lineHeight: 17,
      color:
        Colors.success,
    },


    // PROMO

    promoRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    promoInput: {
      flex: 1,
      height: 48,
      backgroundColor:
        Colors.white,
      borderWidth: 1,
      borderColor:
        Colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: 14,
      color:
        Colors.rider,
      marginRight: 10,
    },

    applyButton: {
      height: 48,
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor:
        Colors.rider,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    applyButtonText: {
      color:
        Colors.white,
      fontSize: 14,
      fontWeight:
        "700",
    },


    // CONFIRM

    confirmButton: {
      height: 54,
      borderRadius: 13,
      backgroundColor:
        Colors.rider,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 5,
    },

    confirmButtonDisabled: {
      opacity: 0.5,
    },

    confirmButtonText: {
      color:
        Colors.white,
      fontSize: 16,
      fontWeight:
        "700",
    },


    // SECURITY

    securityContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 15,
      paddingHorizontal: 10,
    },

    securityText: {
      flex: 1,
      marginLeft: 7,
      fontSize: 12,
      lineHeight: 18,
      color:
        Colors.textSecondary,
      textAlign:
        "center",
    },


    // CARD MODAL

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0, 0, 0, 0.5)",
      justifyContent:
        "flex-end",
    },

    modalContainer: {
      backgroundColor:
        Colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 22,
      paddingBottom: 30,
    },

    modalHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 18,
    },

    modalTitle: {
      fontSize: 21,
      fontWeight:
        "700",
      color:
        Colors.rider,
    },

    testCardNotice: {
      backgroundColor:
        Colors.riderLight,
      borderRadius: 10,
      padding: 11,
      fontSize: 12,
      lineHeight: 18,
      color:
        Colors.rider,
      marginBottom: 16,
    },

    inputLabel: {
      fontSize: 13,
      fontWeight:
        "600",
      color:
        Colors.textPrimary,
      marginBottom: 6,
    },

    input: {
      height: 48,
      borderWidth: 1,
      borderColor:
        Colors.border,
      borderRadius: 10,
      paddingHorizontal: 13,
      fontSize: 15,
      color:
        Colors.rider,
      backgroundColor:
        Colors.white,
      marginBottom: 14,
    },

    cardInputRow: {
      flexDirection:
        "row",
      gap: 12,
    },

    cardInputHalf: {
      flex: 1,
    },

    saveCardButton: {
      height: 52,
      borderRadius: 12,
      backgroundColor:
        Colors.rider,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 5,
    },

    saveCardButtonText: {
      color:
        Colors.white,
      fontSize: 15,
      fontWeight:
        "700",
    },

    testCardFooter: {
      marginTop: 12,
      fontSize: 11,
      lineHeight: 16,
      textAlign:
        "center",
      color:
        Colors.textSecondary,
    },

  });