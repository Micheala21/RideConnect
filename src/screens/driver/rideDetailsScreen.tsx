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
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import { supabase } from "../../lib/supabaseClient";

import Colors from "../../constants/colors";


type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "RideDetails"
  >;


type Ride = {
  id: string;
  pickup_location: string;
  destination: string;
  fare: number;
  status: string;
  ride_date: string;
  departure_time: string;
  available_seats: number;
  notes: string | null;
};


export default function RideDetailsScreen({
  navigation,
  route,
}: Props) {

  const {
    rideId,
  } = route.params;


  const [
    ride,
    setRide,
  ] =
    useState<Ride | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  useEffect(() => {

    loadRide();

  }, [rideId]);


  const loadRide =
    async () => {

      try {

        setLoading(true);


        const {
          data,
          error,
        } =
          await supabase
            .from("rides")
            .select("*")
            .eq(
              "id",
              rideId
            )
            .single();


        if (error) {

          console.error(
            "Ride details error:",
            error.message
          );


          Alert.alert(
            "Error",
            "Could not load the ride details."
          );


          return;

        }


        setRide(
          data
        );

      }

      catch (error) {

        console.error(
          "Ride details error:",
          error
        );


        Alert.alert(
          "Error",
          "Could not load the ride details."
        );

      }

      finally {

        setLoading(
          false
        );

      }

    };


  if (loading) {

    return (

      <SafeAreaView
        style={
          styles.container
        }
      >

        <View
          style={
            styles.loadingContainer
          }
        >

          <ActivityIndicator
            size="large"
            color={
              Colors.primary
            }
          />


          <Text
            style={
              styles.loadingText
            }
          >
            Loading ride details...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  if (!ride) {

    return (

      <SafeAreaView
        style={
          styles.container
        }
      >

        <View
          style={
            styles.loadingContainer
          }
        >

          <Text
            style={
              styles.errorText
            }
          >
            Ride details could not be found.
          </Text>


          <TouchableOpacity
            style={
              styles.backHomeButton
            }

            onPress={() =>
              navigation.navigate(
                "DriverHome"
              )
            }
          >

            <Text
              style={
                styles.backHomeText
              }
            >
              Back to Driver Home
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>

    );

  }


  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <View
        style={
          styles.header
        }
      >

        <TouchableOpacity
          style={
            styles.backButton
          }

          onPress={() =>
            navigation.goBack()
          }
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color={
              Colors.primary
            }
          />

        </TouchableOpacity>


        <Text
          style={
            styles.headerTitle
          }
        >
          Ride Details
        </Text>


        <View
          style={
            styles.headerSpacer
          }
        />

      </View>


      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >

        <View
          style={
            styles.statusCard
          }
        >

          <View
            style={
              styles.statusIcon
            }
          >

            <Ionicons
              name="checkmark"
              size={28}
              color="#FFFFFF"
            />

          </View>


          <View>

            <Text
              style={
                styles.statusTitle
              }
            >
              Ride Offer Created
            </Text>


            <Text
              style={
                styles.statusText
              }
            >
              {ride.status}
            </Text>

          </View>

        </View>


        <Text
          style={
            styles.sectionTitle
          }
        >
          Route
        </Text>


        <View
          style={
            styles.card
          }
        >

          <View
            style={
              styles.locationRow
            }
          >

            <Ionicons
              name="radio-button-on"
              size={20}
              color={
                Colors.primary
              }
            />


            <View
              style={
                styles.locationText
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                Pickup Location
              </Text>


              <Text
                style={
                  styles.value
                }
              >
                {ride.pickup_location}
              </Text>

            </View>

          </View>


          <View
            style={
              styles.routeLine
            }
          />


          <View
            style={
              styles.locationRow
            }
          >

            <Ionicons
              name="location"
              size={20}
              color={
                Colors.primary
              }
            />


            <View
              style={
                styles.locationText
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                Destination
              </Text>


              <Text
                style={
                  styles.value
                }
              >
                {ride.destination}
              </Text>

            </View>

          </View>

        </View>


        <Text
          style={
            styles.sectionTitle
          }
        >
          Ride Information
        </Text>


        <View
          style={
            styles.card
          }
        >

          <View
            style={
              styles.infoRow
            }
          >

            <Ionicons
              name="calendar-outline"
              size={22}
              color={
                Colors.primary
              }
            />


            <View
              style={
                styles.infoText
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                Ride Date
              </Text>


              <Text
                style={
                  styles.value
                }
              >
                {ride.ride_date}
              </Text>

            </View>

          </View>


          <View
            style={
              styles.divider
            }
          />


          <View
            style={
              styles.infoRow
            }
          >

            <Ionicons
              name="time-outline"
              size={22}
              color={
                Colors.primary
              }
            />


            <View
              style={
                styles.infoText
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                Departure Time
              </Text>


              <Text
                style={
                  styles.value
                }
              >
                {ride.departure_time}
              </Text>

            </View>

          </View>


          <View
            style={
              styles.divider
            }
          />


          <View
            style={
              styles.infoRow
            }
          >

            <Ionicons
              name="people-outline"
              size={22}
              color={
                Colors.primary
              }
            />


            <View
              style={
                styles.infoText
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                Available Seats
              </Text>


              <Text
                style={[
                  styles.value,
                  ride.available_seats === 0 &&
                    styles.fullRideText,
                ]}
              >
                {
                  ride.available_seats === 0
                    ? "Full"
                    : ride.available_seats
                }
              </Text>

            </View>

          </View>


          <View
            style={
              styles.divider
            }
          />


          <View
            style={
              styles.infoRow
            }
          >

            <Ionicons
              name="cash-outline"
              size={22}
              color={
                Colors.primary
              }
            />


            <View
              style={
                styles.infoText
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                Fare Per Passenger
              </Text>


              <Text
                style={
                  styles.fareValue
                }
              >
                R
                {Number(
                  ride.fare
                ).toFixed(2)}
              </Text>

            </View>

          </View>

        </View>


        {ride.notes ? (

          <>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Notes
            </Text>


            <View
              style={
                styles.card
              }
            >

              <Text
                style={
                  styles.notes
                }
              >
                {ride.notes}
              </Text>

            </View>

          </>

        ) : null}


        <TouchableOpacity
          style={
            styles.homeButton
          }

          onPress={() =>
            navigation.navigate(
              "DriverHome"
            )
          }

          activeOpacity={
            0.8
          }
        >

          <Ionicons
            name="home-outline"
            size={21}
            color="#FFFFFF"
          />


          <Text
            style={
              styles.homeButtonText
            }
          >
            Back to Driver Home
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>

  );

}


const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F7F7F7",
    },

    header: {
      height: 60,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      paddingHorizontal:
        18,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth:
        1,
      borderBottomColor:
        "#EEEEEE",
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    headerTitle: {
      fontSize: 19,
      fontWeight:
        "700",
      color:
        Colors.primary,
    },

    headerSpacer: {
      width: 40,
    },

    content: {
      padding:
        22,
      paddingBottom:
        40,
    },

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      padding:
        25,
    },

    loadingText: {
      marginTop:
        12,
      fontSize: 15,
      color:
        "#666666",
    },

    errorText: {
      fontSize: 16,
      color:
        "#555555",
      textAlign:
        "center",
      marginBottom:
        20,
    },

    statusCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius:
        18,
      padding:
        18,
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom:
        25,
      elevation: 3,
      shadowColor:
        "#000000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        0.08,
      shadowRadius:
        6,
    },

    statusIcon: {
      width: 55,
      height: 55,
      borderRadius: 28,
      backgroundColor:
        Colors.primary,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight:
        14,
    },

    statusTitle: {
      fontSize: 17,
      fontWeight:
        "700",
      color:
        "#222222",
    },

    statusText: {
      fontSize: 13,
      color:
        Colors.primary,
      marginTop:
        4,
      textTransform:
        "capitalize",
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight:
        "700",
      color:
        "#222222",
      marginBottom:
        10,
    },

    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius:
        18,
      padding:
        18,
      marginBottom:
        24,
      elevation: 2,
      shadowColor:
        "#000000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        0.06,
      shadowRadius:
        5,
    },

    locationRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    locationText: {
      flex: 1,
      marginLeft:
        12,
    },

    routeLine: {
      width: 1,
      height: 25,
      backgroundColor:
        "#CCCCCC",
      marginLeft:
        9,
    },

    infoRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    infoText: {
      flex: 1,
      marginLeft:
        13,
    },

    label: {
      fontSize: 12,
      color:
        "#888888",
      marginBottom:
        3,
    },

    value: {
      fontSize: 15,
      fontWeight:
        "600",
      color:
        "#333333",
    },

    fullRideText: {
      color:
        "#C0392B",
    },

    fareValue: {
      fontSize: 18,
      fontWeight:
        "800",
      color:
        Colors.primary,
    },

    divider: {
      height: 1,
      backgroundColor:
        "#EEEEEE",
      marginVertical:
        15,
    },

    notes: {
      fontSize: 14,
      lineHeight: 21,
      color:
        "#555555",
    },

    homeButton: {
      height: 55,
      borderRadius: 14,
      backgroundColor:
        Colors.primary,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginTop:
        5,
    },

    homeButtonText: {
      color:
        "#FFFFFF",
      fontSize: 16,
      fontWeight:
        "700",
      marginLeft:
        8,
    },

    backHomeButton: {
      backgroundColor:
        Colors.primary,
      paddingHorizontal:
        22,
      paddingVertical:
        13,
      borderRadius:
        12,
    },

    backHomeText: {
      color:
        "#FFFFFF",
      fontSize: 15,
      fontWeight:
        "700",
    },

  });