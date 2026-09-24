import React, {
  useState,
} from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";


// ======================================================
// NAVIGATION TYPE
// ======================================================

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "RiderHome"
  >;


// ======================================================
// RIDER HOME SCREEN
// ======================================================

export default function RiderHomeScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  // ======================================================
  // SEARCH FORM
  // ======================================================

  const [
    pickup,
    setPickup,
  ] = useState("");

  const [
    destination,
    setDestination,
  ] = useState("");

  const [
    date,
    setDate,
  ] = useState("");

  const [
    time,
    setTime,
  ] = useState("");

  const [
    passengers,
    setPassengers,
  ] = useState("");


  // ======================================================
  // SEARCH RIDE
  // ======================================================

  const handleSearchRide = () => {

    // -----------------------------------------------
    // PICKUP
    // -----------------------------------------------

    if (!pickup.trim()) {

      Alert.alert(
        "Pickup Required",
        "Please enter your pickup location."
      );

      return;
    }


    // -----------------------------------------------
    // DESTINATION
    // -----------------------------------------------

    if (!destination.trim()) {

      Alert.alert(
        "Destination Required",
        "Please enter your destination."
      );

      return;
    }


    // -----------------------------------------------
    // DATE
    // -----------------------------------------------

    if (!date.trim()) {

      Alert.alert(
        "Date Required",
        "Please enter your travel date."
      );

      return;
    }


    // -----------------------------------------------
    // TIME
    // -----------------------------------------------

    if (!time.trim()) {

      Alert.alert(
        "Departure Time Required",
        "Please enter your departure time."
      );

      return;
    }


    // -----------------------------------------------
    // PASSENGERS
    // -----------------------------------------------

    if (!passengers.trim()) {

      Alert.alert(
        "Passengers Required",
        "Please enter the number of passengers."
      );

      return;
    }


    // -----------------------------------------------
    // CHECK PASSENGER NUMBER
    // -----------------------------------------------

    const passengerCount =
      Number(passengers);


    if (
      isNaN(passengerCount) ||
      passengerCount < 1
    ) {

      Alert.alert(
        "Invalid Passengers",
        "Please enter a valid number of passengers."
      );

      return;
    }


    // -----------------------------------------------
    // SEARCH VALUES
    // -----------------------------------------------

    console.log(
      "SEARCH VALUES:",
      {
        pickup,
        destination,
        date,
        time,
        passengers,
      }
    );


    // -----------------------------------------------
    // NAVIGATE TO SEARCH RESULTS
    // -----------------------------------------------

    navigation.navigate(
      "SearchResults",
      {
        pickup:
          pickup.trim(),

        destination:
          destination.trim(),

        date:
          date.trim(),

        time:
          time.trim(),

        passengers:
          passengers.trim(),
      }
    );

  };


  // ======================================================
  // UI
  // ======================================================

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      {/* ================================================= */}
      {/* MAP PLACEHOLDER */}
      {/* ================================================= */}

      <View
        style={
          styles.mapPlaceholder
        }
      >

        <View
          style={
            styles.mapIconContainer
          }
        >

          <Ionicons
            name="map-outline"
            size={42}
            color={
              Colors.rider
            }
          />

        </View>


        <Text
          style={
            styles.mapTitle
          }
        >
          Route Map
        </Text>


        <Text
          style={
            styles.mapText
          }
        >
          Route and distance calculation
          will be available once the map
          is connected.
        </Text>

      </View>


      {/* ================================================= */}
      {/* BOTTOM CARD */}
      {/* ================================================= */}

      <View
        style={
          styles.bottomCard
        }
      >

        <ScrollView

          showsVerticalScrollIndicator={
            false
          }

          contentContainerStyle={
            styles.scrollContent
          }

        >

          {/* ============================================= */}
          {/* HEADER */}
          {/* ============================================= */}

          <View
            style={
              styles.header
            }
          >

            <Text
              style={
                styles.heading
              }
            >
              Search Ride
            </Text>


            <Text
              style={
                styles.subHeading
              }
            >
              Find a ride that matches your trip.
            </Text>

          </View>


          {/* ============================================= */}
          {/* PICKUP LOCATION */}
          {/* ============================================= */}

          <Text
            style={
              styles.label
            }
          >
            Pickup Location
          </Text>


          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="location-outline"
              size={22}
              color={
                Colors.rider
              }
            />


            <TextInput

              style={
                styles.input
              }

              placeholder="Enter pickup location"

              placeholderTextColor={
                Colors.textSecondary
              }

              value={
                pickup
              }

              onChangeText={
                setPickup
              }

            />

          </View>


          {/* ============================================= */}
          {/* DESTINATION */}
          {/* ============================================= */}

          <Text
            style={
              styles.label
            }
          >
            Destination
          </Text>


          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="flag-outline"
              size={22}
              color={
                Colors.rider
              }
            />


            <TextInput

              style={
                styles.input
              }

              placeholder="Enter destination"

              placeholderTextColor={
                Colors.textSecondary
              }

              value={
                destination
              }

              onChangeText={
                setDestination
              }

            />

          </View>


          {/* ============================================= */}
          {/* ROUTE INFORMATION PLACEHOLDER */}
          {/* ============================================= */}

          <View
            style={
              styles.routeInfoCard
            }
          >

            <View
              style={
                styles.routeInfoIcon
              }
            >

              <Ionicons
                name="navigate-outline"
                size={22}
                color={
                  Colors.rider
                }
              />

            </View>


            <View
              style={
                styles.routeInfoText
              }
            >

              <Text
                style={
                  styles.routeInfoTitle
                }
              >
                Route & Fare
              </Text>


              <Text
                style={
                  styles.routeInfoDescription
                }
              >
                Distance and estimated fare
                will be calculated once the
                map is connected.
              </Text>

            </View>

          </View>


          {/* ============================================= */}
          {/* DATE */}
          {/* ============================================= */}

          <Text
            style={
              styles.label
            }
          >
            Date
          </Text>


          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="calendar-outline"
              size={22}
              color={
                Colors.rider
              }
            />


            <TextInput

              style={
                styles.input
              }

              placeholder="Enter travel date"

              placeholderTextColor={
                Colors.textSecondary
              }

              value={
                date
              }

              onChangeText={
                setDate
              }

            />

          </View>


          {/* ============================================= */}
          {/* DEPARTURE TIME */}
          {/* ============================================= */}

          <Text
            style={
              styles.label
            }
          >
            Departure Time
          </Text>


          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="time-outline"
              size={22}
              color={
                Colors.rider
              }
            />


            <TextInput

              style={
                styles.input
              }

              placeholder="Enter departure time"

              placeholderTextColor={
                Colors.textSecondary
              }

              value={
                time
              }

              onChangeText={
                setTime
              }

            />

          </View>


          {/* ============================================= */}
          {/* PASSENGERS */}
          {/* ============================================= */}

          <Text
            style={
              styles.label
            }
          >
            Passengers
          </Text>


          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="people-outline"
              size={22}
              color={
                Colors.rider
              }
            />


            <TextInput

              style={
                styles.input
              }

              placeholder="Number of passengers"

              placeholderTextColor={
                Colors.textSecondary
              }

              value={
                passengers
              }

              onChangeText={
                setPassengers
              }

              keyboardType="numeric"

            />

          </View>


          {/* ============================================= */}
          {/* SEARCH BUTTON */}
          {/* ============================================= */}

          <TouchableOpacity

            style={
              styles.searchButton
            }

            onPress={
              handleSearchRide
            }

          >

            <Ionicons
              name="search-outline"
              size={21}
              color={
                Colors.white
              }
            />


            <Text
              style={
                styles.searchButtonText
              }
            >
              Search Ride
            </Text>

          </TouchableOpacity>

        </ScrollView>

      </View>

    </SafeAreaView>

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


    // ==================================================
    // MAP PLACEHOLDER
    // ==================================================

    mapPlaceholder: {

      flex: 1,

      backgroundColor:
        Colors.background,

      justifyContent:
        "center",

      alignItems:
        "center",

      paddingHorizontal:
        40,

    },


    mapIconContainer: {

      width:
        80,

      height:
        80,

      borderRadius:
        40,

      backgroundColor:
        Colors.riderLight,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginBottom:
        14,

    },


    mapTitle: {

      fontSize:
        20,

      fontWeight:
        "700",

      color:
        Colors.textPrimary,

      marginBottom:
        6,

    },


    mapText: {

      fontSize:
        13,

      color:
        Colors.textSecondary,

      textAlign:
        "center",

      lineHeight:
        19,

    },


    // ==================================================
    // BOTTOM CARD
    // ==================================================

    bottomCard: {

      flex: 1.25,

      backgroundColor:
        Colors.white,

      borderTopLeftRadius:
        30,

      borderTopRightRadius:
        30,

      paddingHorizontal:
        24,

      paddingTop:
        20,

    },


    scrollContent: {

      paddingBottom:
        30,

    },


    // ==================================================
    // HEADER
    // ==================================================

    header: {

      marginBottom:
        18,

    },


    heading: {

      fontSize:
        24,

      fontWeight:
        "700",

      color:
        Colors.textPrimary,

      marginBottom:
        5,

    },


    subHeading: {

      fontSize:
        14,

      color:
        Colors.textSecondary,

    },


    // ==================================================
    // LABEL
    // ==================================================

    label: {

      fontSize:
        14,

      fontWeight:
        "600",

      color:
        Colors.textPrimary,

      marginBottom:
        8,

      marginTop:
        12,

    },


    // ==================================================
    // INPUT
    // ==================================================

    inputContainer: {

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        Colors.background,

      borderRadius:
        15,

      minHeight:
        58,

      paddingHorizontal:
        16,

    },


    input: {

      flex: 1,

      fontSize:
        15,

      color:
        Colors.textPrimary,

      marginLeft:
        10,

    },


    // ==================================================
    // ROUTE INFORMATION
    // ==================================================

    routeInfoCard: {

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        Colors.riderLight,

      borderRadius:
        16,

      padding:
        15,

      marginTop:
        16,

      borderWidth:
        1,

      borderColor:
        Colors.secondary,

    },


    routeInfoIcon: {

      width:
        44,

      height:
        44,

      borderRadius:
        22,

      backgroundColor:
        Colors.white,

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    routeInfoText: {

      flex: 1,

      marginLeft:
        12,

    },


    routeInfoTitle: {

      fontSize:
        14,

      fontWeight:
        "700",

      color:
        Colors.textPrimary,

      marginBottom:
        3,

    },


    routeInfoDescription: {

      fontSize:
        12,

      color:
        Colors.textSecondary,

      lineHeight:
        17,

    },


    // ==================================================
    // SEARCH BUTTON
    // ==================================================

    searchButton: {

      height:
        58,

      borderRadius:
        16,

      backgroundColor:
        Colors.rider,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        22,

    },


    searchButtonText: {

      color:
        Colors.white,

      fontSize:
        16,

      fontWeight:
        "700",

      marginLeft:
        8,

    },

  });