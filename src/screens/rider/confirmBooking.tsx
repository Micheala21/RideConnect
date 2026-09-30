import React from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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


// ======================================================
// PROPS
// ======================================================

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "ConfirmBooking"
  >;


// ======================================================
// SCREEN
// ======================================================

export default function ConfirmBookingScreen({
  route,
  navigation,
}: Props) {

  const {
    ride,
  } = route.params;


  // ====================================================
  // CONTINUE TO PAYMENT
  // ====================================================

  const continueToPayment = () => {

    navigation.navigate(
      "PaymentMethod",
      {
        rideId:
          ride.id,
      },
    );

  };


  // ====================================================
  // UI
  // ====================================================

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.content
        }
      >

        {/* ============================================ */}
        {/* BACK BUTTON */}
        {/* ============================================ */}

        <TouchableOpacity
          style={
            styles.backButton
          }

          onPress={() =>
            navigation.goBack()
          }

          activeOpacity={
            0.7
          }
        >

          <Ionicons
            name="arrow-back"
            size={26}
            color={
              Colors.primary
            }
          />

        </TouchableOpacity>


        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}

        <View
          style={
            styles.header
          }
        >

          <View
            style={
              styles.headerIcon
            }
          >

            <Ionicons
              name="checkmark-circle-outline"
              size={34}
              color={
                Colors.rider
              }
            />

          </View>


          <Text
            style={
              styles.title
            }
          >
            Confirm Your Booking
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Please review your ride details before continuing.
          </Text>

        </View>


        {/* ============================================ */}
        {/* DRIVER */}
        {/* ============================================ */}

        <View
          style={
            styles.card
          }
        >

          <View
            style={
              styles.cardHeader
            }
          >

            <View
              style={
                styles.sectionIcon
              }
            >

              <Ionicons
                name="person-outline"
                size={20}
                color={
                  Colors.rider
                }
              />

            </View>


            <Text
              style={
                styles.sectionTitle
              }
            >
              Driver
            </Text>

          </View>


          <View
            style={
              styles.driverRow
            }
          >

            <View
              style={
                styles.driverAvatar
              }
            >

              <Ionicons
                name="person"
                size={30}
                color={
                  Colors.rider
                }
              />

            </View>


            <View
              style={
                styles.driverInfo
              }
            >

              <Text
                style={
                  styles.driverName
                }
              >
                {ride.driverName}
              </Text>


              <View
                style={
                  styles.verifiedRow
                }
              >

                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={
                    Colors.rider
                  }
                />

                <Text
                  style={
                    styles.verifiedText
                  }
                >
                  Verified Driver
                </Text>

              </View>

            </View>

          </View>

        </View>


        {/* ============================================ */}
        {/* TRIP DETAILS */}
        {/* ============================================ */}

        <View
          style={
            styles.card
          }
        >

          <View
            style={
              styles.cardHeader
            }
          >

            <View
              style={
                styles.sectionIcon
              }
            >

              <Ionicons
                name="navigate-outline"
                size={20}
                color={
                  Colors.rider
                }
              />

            </View>


            <Text
              style={
                styles.sectionTitle
              }
            >
              Trip Details
            </Text>

          </View>


          <DetailRow
            icon="location-outline"
            title="Pickup"
            value={
              ride.pickup_location
            }
          />


          <DetailRow
            icon="flag-outline"
            title="Destination"
            value={
              ride.destination
            }
          />


          <DetailRow
            icon="calendar-outline"
            title="Date"
            value={
              ride.ride_date
            }
          />


          <DetailRow
            icon="time-outline"
            title="Departure"
            value={
              ride.departure_time
            }
            last
          />

        </View>


        {/* ============================================ */}
        {/* VEHICLE */}
        {/* ============================================ */}

        <View
          style={
            styles.card
          }
        >

          <View
            style={
              styles.cardHeader
            }
          >

            <View
              style={
                styles.sectionIcon
              }
            >

              <Ionicons
                name="car-outline"
                size={20}
                color={
                  Colors.rider
                }
              />

            </View>


            <Text
              style={
                styles.sectionTitle
              }
            >
              Vehicle Information
            </Text>

          </View>


          <DetailRow
            icon="car-outline"
            title="Vehicle"
            value={
              ride.vehicle ||
              "Not provided"
            }
          />


          <DetailRow
            icon="people-outline"
            title="Seats Available"
            value={
              `${ride.available_seats} seats`
            }
            last
          />

        </View>


        {/* ============================================ */}
        {/* FARE */}
        {/* ============================================ */}

        <View
          style={
            styles.fareCard
          }
        >

          <View>

            <Text
              style={
                styles.fareLabel
              }
            >
              Total Fare
            </Text>


            <Text
              style={
                styles.fareDescription
              }
            >
              Choose your payment method on the next step.
            </Text>

          </View>


          <Text
            style={
              styles.fare
            }
          >
            R
            {Number(
              ride.fare,
            ).toFixed(2)}
          </Text>

        </View>


        {/* ============================================ */}
        {/* INFORMATION */}
        {/* ============================================ */}

        <View
          style={
            styles.infoBox
          }
        >

          <Ionicons
            name="information-circle-outline"
            size={22}
            color={
              Colors.rider
            }
          />


          <Text
            style={
              styles.infoText
            }
          >
            Your booking will only be created after you confirm your payment.
          </Text>

        </View>


        {/* ============================================ */}
        {/* CONTINUE */}
        {/* ============================================ */}

        <TouchableOpacity
          style={
            styles.confirmButton
          }

          onPress={
            continueToPayment
          }

          activeOpacity={
            0.8
          }
        >

          <Text
            style={
              styles.confirmText
            }
          >
            Continue to Payment
          </Text>


          <Ionicons
            name="arrow-forward"
            size={22}
            color={
              Colors.white
            }
          />

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>

  );

}


// ======================================================
// DETAIL ROW
// ======================================================

interface DetailProps {

  icon:
    keyof typeof Ionicons.glyphMap;

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

        !last &&
          styles.rowBorder,
      ]}
    >

      <View
        style={
          styles.left
        }
      >

        <View
          style={
            styles.detailIcon
          }
        >

          <Ionicons
            name={
              icon
            }
            size={18}
            color={
              Colors.rider
            }
          />

        </View>


        <Text
          style={
            styles.label
          }
        >
          {title}
        </Text>

      </View>


      <Text
        style={
          styles.value
        }
      >
        {value}
      </Text>

    </View>

  );

}


// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        Colors.background,

    },


    content: {

      paddingHorizontal:
        20,

      paddingTop:
        10,

      paddingBottom:
        35,

    },


    // ==================================================
    // BACK BUTTON
    // ==================================================

    backButton: {

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

      marginBottom:
        15,

      elevation:
        3,

    },


    // ==================================================
    // HEADER
    // ==================================================

    header: {

      alignItems:
        "center",

      marginBottom:
        25,

    },


    headerIcon: {

      width:
        65,

      height:
        65,

      borderRadius:
        33,

      backgroundColor:
        "#EEF5FB",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginBottom:
        12,

    },


    title: {

      fontSize:
        27,

      fontWeight:
        "700",

      color:
        Colors.primary,

      textAlign:
        "center",

    },


    subtitle: {

      fontSize:
        14,

      color:
        Colors.textSecondary,

      textAlign:
        "center",

      marginTop:
        7,

      lineHeight:
        20,

    },


    // ==================================================
    // CARD
    // ==================================================

    card: {

      backgroundColor:
        Colors.white,

      borderRadius:
        20,

      paddingHorizontal:
        17,

      paddingTop:
        17,

      paddingBottom:
        5,

      marginBottom:
        16,

      elevation:
        3,

      shadowColor:
        Colors.shadow,

      shadowOffset: {

        width:
          0,

        height:
          2,

      },

      shadowOpacity:
        0.1,

      shadowRadius:
        5,

    },


    cardHeader: {

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        5,

    },


    sectionIcon: {

      width:
        38,

      height:
        38,

      borderRadius:
        19,

      backgroundColor:
        "#EEF5FB",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight:
        10,

    },


    sectionTitle: {

      fontSize:
        19,

      fontWeight:
        "700",

      color:
        Colors.primary,

    },


    // ==================================================
    // DRIVER
    // ==================================================

    driverRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        12,

    },


    driverAvatar: {

      width:
        60,

      height:
        60,

      borderRadius:
        30,

      backgroundColor:
        "#EEF5FB",

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    driverInfo: {

      marginLeft:
        14,

      flex: 1,

    },


    driverName: {

      fontSize:
        18,

      fontWeight:
        "700",

      color:
        Colors.primary,

    },


    verifiedRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        5,

    },


    verifiedText: {

      fontSize:
        13,

      color:
        Colors.textSecondary,

      marginLeft:
        5,

    },


    // ==================================================
    // DETAILS
    // ==================================================

    row: {

      minHeight:
        58,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

    },


    rowBorder: {

      borderBottomWidth:
        1,

      borderBottomColor:
        "#ECECEC",

    },


    left: {

      flexDirection:
        "row",

      alignItems:
        "center",

      flex: 1,

    },


    detailIcon: {

      width:
        32,

      height:
        32,

      borderRadius:
        16,

      backgroundColor:
        "#F5F8FB",

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    label: {

      marginLeft:
        10,

      color:
        Colors.primary,

      fontSize:
        14,

      fontWeight:
        "500",

    },


    value: {

      color:
        Colors.textSecondary,

      fontSize:
        14,

      fontWeight:
        "600",

      maxWidth:
        "48%",

      textAlign:
        "right",

      marginLeft:
        10,

    },


    // ==================================================
    // FARE
    // ==================================================

    fareCard: {

      backgroundColor:
        Colors.white,

      borderRadius:
        20,

      padding:
        20,

      marginBottom:
        16,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      elevation:
        3,

      shadowColor:
        Colors.shadow,

      shadowOffset: {

        width:
          0,

        height:
          2,

      },

      shadowOpacity:
        0.1,

      shadowRadius:
        5,

    },


    fareLabel: {

      fontSize:
        18,

      fontWeight:
        "700",

      color:
        Colors.primary,

    },


    fareDescription: {

      fontSize:
        12,

      color:
        Colors.textSecondary,

      marginTop:
        4,

    },


    fare: {

      fontSize:
        25,

      fontWeight:
        "800",

      color:
        Colors.rider,

    },


    // ==================================================
    // INFO
    // ==================================================

    infoBox: {

      backgroundColor:
        "#EEF5FB",

      borderRadius:
        16,

      padding:
        15,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginBottom:
        18,

    },


    infoText: {

      flex: 1,

      marginLeft:
        10,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        Colors.primary,

    },


    // ==================================================
    // BUTTON
    // ==================================================

    confirmButton: {

      minHeight:
        58,

      backgroundColor:
        Colors.rider,

      borderRadius:
        16,

      justifyContent:
        "center",

      alignItems:
        "center",

      flexDirection:
        "row",

      marginTop:
        5,

      marginBottom:
        10,

      paddingHorizontal:
        18,

      elevation:
        3,

    },


    confirmText: {

      color:
        Colors.white,

      fontSize:
        17,

      fontWeight:
        "700",

      marginRight:
        10,

    },

  });