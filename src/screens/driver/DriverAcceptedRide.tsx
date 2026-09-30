import React, {
  useCallback,
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
  supabase,
} from "../../lib/supabaseClient";


type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "DriverAcceptedRide"
  >;


type Ride = {
  id: string;
  driver_id: string;
  rider_id?: string | null;
  pickup_location: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  fare: number;
  ride_date: string;
  notes?: string | null;
  status: string;
  created_at: string;
};


type Rider = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
};


export default function DriverAcceptedRideScreen({
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
    useState<Ride | null>(null);


  const [
    rider,
    setRider,
  ] =
    useState<Rider | null>(null);


  const [
    seatsBooked,
    setSeatsBooked,
  ] =
    useState(0);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  // ==================================================
  // LOAD ACCEPTED RIDE
  // ==================================================

  const loadRide =
    useCallback(
      async () => {

        try {

          setLoading(true);


          console.log(
            "DRIVER ACCEPTED RIDE ID:",
            rideId
          );


          // ==========================================
          // LOAD RIDE
          // ==========================================

          const {
            data: rideData,
            error: rideError,
          } =
            await supabase
              .from("rides")
              .select(`
                id,
                driver_id,
                rider_id,
                pickup_location,
                destination,
                departure_time,
                available_seats,
                fare,
                ride_date,
                notes,
                status,
                created_at
              `)
              .eq(
                "id",
                rideId
              )
              .maybeSingle();


          if (rideError) {

            console.error(
              "Ride loading error:",
              rideError
            );

            throw rideError;

          }


          if (!rideData) {

            console.error(
              "NO RIDE FOUND FOR RIDE ID:",
              rideId
            );

            Alert.alert(
              "Ride Not Found",
              "This ride could not be found. Please return to Activity and try again.",
              [
                {
                  text: "OK",
                  onPress: () =>
                    navigation.goBack(),
                },
              ]
            );

            return;

          }


          setRide(
            rideData
          );


          // ==========================================
          // LOAD LATEST BOOKING
          // ==========================================

          const {
            data: bookingData,
            error: bookingError,
          } =
            await supabase
              .from("bookings")
              .select(`
                rider_id,
                seats_booked
              `)
              .eq(
                "ride_id",
                rideId
              )
              .order(
                "created_at",
                {
                  ascending: false,
                }
              )
              .limit(1)
              .maybeSingle();


          if (bookingError) {

            console.error(
              "Booking loading error:",
              bookingError
            );

          }


          if (
            bookingData?.seats_booked
          ) {

            setSeatsBooked(
              bookingData.seats_booked
            );

          }


          // ==========================================
          // GET RIDER ID
          // ==========================================

          let riderId =
            rideData.rider_id;


          if (
            !riderId &&
            bookingData?.rider_id
          ) {

            riderId =
              bookingData.rider_id;

          }


          if (!riderId) {

            console.log(
              "No rider ID found for this ride."
            );

            return;

          }


          // ==========================================
          // LOAD RIDER PROFILE
          // ==========================================

          const {
            data: riderData,
            error: riderError,
          } =
            await supabase
              .from("profiles")
              .select(`
                id,
                first_name,
                last_name,
                phone_number
              `)
              .eq(
                "id",
                riderId
              )
              .maybeSingle();


          if (riderError) {

            console.error(
              "Rider loading error:",
              riderError
            );

            return;

          }


          if (!riderData) {

            console.log(
              "No rider profile found for:",
              riderId
            );

            return;

          }


          setRider(
            riderData
          );


        } catch (error) {

          console.error(
            "Error loading accepted ride:",
            error
          );

          Alert.alert(
            "Error",
            "Unable to load the accepted ride."
          );

        } finally {

          setLoading(false);

        }

      },
      [
        rideId,
        navigation,
      ]
    );


  useEffect(() => {

    loadRide();

  }, [
    loadRide,
  ]);


  // ==================================================
  // GROUP CHAT FOR THIS RIDE
  // ==================================================

  const openGroupChat =
    () => {

      if (!ride) {

        Alert.alert(
          "Ride Not Found",
          "The ride information is not available yet."
        );

        return;

      }


      navigation.navigate(
        "ChatWithRider",
        {
          rideId:
            ride.id,
        }
      );

    };


  // ==================================================
  // CONTINUE TRIP
  // ==================================================

  const continueTrip =
    () => {

      if (!ride) {
        return;
      }


      navigation.navigate(
        "DriverTrip",
        {
          rideId:
            ride.id,
        }
      );

    };


  // ==================================================
  // LOADING
  // ==================================================

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
              Colors.driver
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading accepted ride...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ==================================================
  // NO RIDE
  // ==================================================

  if (!ride) {

    return (

      <SafeAreaView
        style={
          styles.container
        }
      >

        <View
          style={
            styles.emptyContainer
          }
        >

          <Ionicons
            name="car-outline"
            size={60}
            color={
              Colors.driver
            }
          />

          <Text
            style={
              styles.emptyTitle
            }
          >
            Ride Not Found
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            This ride could not be found.
          </Text>

          <TouchableOpacity
            style={
              styles.primaryButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >

            <Text
              style={
                styles.primaryButtonText
              }
            >
              Back
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>

    );

  }


  // ==================================================
  // MAIN SCREEN
  // ==================================================

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
            size={25}
            color={
              Colors.driver
            }
          />

        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          Rider Accepted
        </Text>

      </View>


      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
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
              name="checkmark-circle"
              size={34}
              color={
                Colors.driver
              }
            />

          </View>

          <View
            style={
              styles.statusInfo
            }
          >

            <Text
              style={
                styles.statusTitle
              }
            >
              Rider Accepted
            </Text>

            <Text
              style={
                styles.statusText
              }
            >
              Your ride has been accepted by a rider.
            </Text>

          </View>

        </View>


        <View
          style={
            styles.card
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Rider
          </Text>


          {rider ? (

            <View
              style={
                styles.riderRow
              }
            >

              <View
                style={
                  styles.riderIcon
                }
              >

                <Ionicons
                  name="person"
                  size={24}
                  color={
                    Colors.driver
                  }
                />

              </View>


              <View
                style={
                  styles.riderInfo
                }
              >

                <Text
                  style={
                    styles.riderName
                  }
                >
                  {rider.first_name}{" "}
                  {rider.last_name}
                </Text>

                {rider.phone_number ? (

                  <Text
                    style={
                      styles.riderPhone
                    }
                  >
                    {rider.phone_number}
                  </Text>

                ) : null}

              </View>

            </View>

          ) : (

            <Text
              style={
                styles.noRiderText
              }
            >
              Rider information is not available.
            </Text>

          )}

        </View>


        <View
          style={
            styles.card
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Ride Details
          </Text>


          <View
            style={
              styles.routeRow
            }
          >

            <Ionicons
              name="location"
              size={20}
              color={
                Colors.driver
              }
            />

            <View
              style={
                styles.routeInfo
              }
            >

              <Text
                style={
                  styles.routeLabel
                }
              >
                Pickup
              </Text>

              <Text
                style={
                  styles.routeText
                }
              >
                {ride.pickup_location}
              </Text>

            </View>

          </View>


          <View
            style={
              styles.routeRow
            }
          >

            <Ionicons
              name="flag"
              size={20}
              color={
                Colors.driver
              }
            />

            <View
              style={
                styles.routeInfo
              }
            >

              <Text
                style={
                  styles.routeLabel
                }
              >
                Destination
              </Text>

              <Text
                style={
                  styles.routeText
                }
              >
                {ride.destination}
              </Text>

            </View>

          </View>


          <View
            style={
              styles.detailsGrid
            }
          >

            <View
              style={
                styles.detailItem
              }
            >

              <Text
                style={
                  styles.detailLabel
                }
              >
                Date
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                {ride.ride_date}
              </Text>

            </View>


            <View
              style={
                styles.detailItem
              }
            >

              <Text
                style={
                  styles.detailLabel
                }
              >
                Time
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                {ride.departure_time}
              </Text>

            </View>


            <View
              style={
                styles.detailItem
              }
            >

              <Text
                style={
                  styles.detailLabel
                }
              >
                Seats Booked
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                {seatsBooked}
              </Text>

            </View>


            <View
              style={
                styles.detailItem
              }
            >

              <Text
                style={
                  styles.detailLabel
                }
              >
                Fare
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                R{Number(ride.fare).toFixed(2)}
              </Text>

            </View>

          </View>

        </View>


        <TouchableOpacity
          style={
            styles.chatButton
          }
          onPress={
            openGroupChat
          }
        >

          <Ionicons
            name="chatbubbles-outline"
            size={20}
            color={
              Colors.driver
            }
          />

          <Text
            style={
              styles.chatButtonText
            }
          >
            Ride Group Chat
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={
            styles.primaryButton
          }
          onPress={
            continueTrip
          }
        >

          <Text
            style={
              styles.primaryButtonText
            }
          >
            Continue Trip
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color={
              Colors.white
            }
          />

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>

  );

}


// ==================================================
// STYLES
// ==================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color:
        Colors.textSecondary,
    },

    emptyContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      padding: 30,
    },

    emptyTitle: {
      marginTop: 15,
      fontSize: 20,
      fontWeight: "700",
      color:
        Colors.driver,
    },

    emptyText: {
      marginTop: 8,
      fontSize: 14,
      color:
        Colors.textSecondary,
      textAlign: "center",
    },

    header: {
      height: 70,
      backgroundColor:
        Colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor:
        "#E5E7EB",
      elevation: 2,
    },

    backButton: {
      width: 42,
      height: 42,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 10,
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color:
        Colors.driver,
    },

    content: {
      padding: 18,
      paddingBottom: 35,
    },

    statusCard: {
      backgroundColor:
        Colors.white,
      borderRadius: 16,
      padding: 18,
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 15,
    },

    statusIcon: {
      width: 55,
      height: 55,
      borderRadius: 28,
      backgroundColor:
        "#EEF5FB",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 14,
    },

    statusInfo: {
      flex: 1,
    },

    statusTitle: {
      fontSize: 18,
      fontWeight: "700",
      color:
        Colors.driver,
    },

    statusText: {
      marginTop: 4,
      fontSize: 13,
      color:
        Colors.textSecondary,
    },

    card: {
      backgroundColor:
        Colors.white,
      borderRadius: 16,
      padding: 18,
      marginBottom: 15,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color:
        Colors.driver,
      marginBottom: 15,
    },

    riderRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    riderIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor:
        "#EEF5FB",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 12,
    },

    riderInfo: {
      flex: 1,
    },

    riderName: {
      fontSize: 16,
      fontWeight: "700",
      color:
        Colors.driver,
    },

    riderPhone: {
      marginTop: 4,
      fontSize: 13,
      color:
        Colors.textSecondary,
    },

    noRiderText: {
      fontSize: 14,
      color:
        Colors.textSecondary,
    },

    routeRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      marginBottom: 16,
    },

    routeInfo: {
      flex: 1,
      marginLeft: 12,
    },

    routeLabel: {
      fontSize: 12,
      color:
        Colors.textSecondary,
      marginBottom: 3,
    },

    routeText: {
      fontSize: 15,
      fontWeight: "600",
      color:
        Colors.driver,
    },

    detailsGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      marginTop: 5,
    },

    detailItem: {
      width: "50%",
      marginBottom: 15,
    },

    detailLabel: {
      fontSize: 12,
      color:
        Colors.textSecondary,
      marginBottom: 4,
    },

    detailValue: {
      fontSize: 15,
      fontWeight: "600",
      color:
        Colors.driver,
    },

    chatButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor:
        Colors.white,
      borderWidth: 1,
      borderColor:
        Colors.driver,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 12,
    },

    chatButtonText: {
      marginLeft: 8,
      fontSize: 15,
      fontWeight: "700",
      color:
        Colors.driver,
    },

    primaryButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor:
        Colors.driver,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal: 20,
    },

    primaryButtonText: {
      color:
        Colors.white,
      fontSize: 15,
      fontWeight: "700",
      marginRight: 8,
    },

  });