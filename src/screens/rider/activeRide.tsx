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
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import {
  supabase,
} from "../../lib/supabaseClient";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";


// ======================================================
// TYPES
// ======================================================

type UpcomingRide = {

  bookingId: string;

  rideId: string;

  driverName: string;

  pickupLocation: string;

  destination: string;

  rideDate: string;

  departureTime: string;

  fare: number;

  status: string;

};


// ======================================================
// NAVIGATION TYPE
// ======================================================

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


// ======================================================
// SCREEN
// ======================================================

export default function ActiveRideScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  const [rides, setRides] =
    useState<UpcomingRide[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  // ======================================================
  // LOAD UPCOMING RIDES
  // ======================================================

  const loadUpcomingRides =
    async () => {

      try {

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser();


        if (userError) {

          throw new Error(
            userError.message
          );

        }


        if (!user) {

          setRides([]);

          return;

        }


        // ================================================
        // GET RIDER BOOKINGS
        // ================================================

        const {
          data: bookings,
          error: bookingError,
        } =
          await supabase
            .from("bookings")
            .select(
              `
                id,
                ride_id,
                status,
                amount,
                rides (
                  id,
                  driver_id,
                  pickup_location,
                  destination,
                  ride_date,
                  departure_time,
                  fare
                )
              `
            )
            .eq(
              "rider_id",
              user.id
            )
            .in(
              "status",
              [
                "pending",
                "confirmed",
              ]
            );


        if (bookingError) {

          throw new Error(
            bookingError.message
          );

        }


        if (!bookings) {

          setRides([]);

          return;

        }


        // ================================================
        // CURRENT TIME
        // ================================================

        const now =
          new Date();


        // ================================================
        // FILTER UPCOMING RIDES
        // ================================================

        const upcomingBookings =
          bookings.filter(
            (booking: any) => {

              const ride =
                booking.rides;

              if (!ride) {

                return false;

              }


              const rideDateTime =
                new Date(
                  `${ride.ride_date}T${ride.departure_time}`
                );


              return (
                rideDateTime >= now
              );

            }
          );


        // ================================================
        // GET DRIVER IDS
        // ================================================

        const driverIds =
          upcomingBookings
            .map(
              (booking: any) =>
                booking.rides?.driver_id
            )
            .filter(Boolean);


        let driverProfiles: any[] =
          [];


        // ================================================
        // GET DRIVER PROFILES
        // ================================================

        if (
          driverIds.length > 0
        ) {

          const {
            data: profiles,
            error: profileError,
          } =
            await supabase
              .from("profiles")
              .select(
                "id, first_name, last_name"
              )
              .in(
                "id",
                driverIds
              );


          if (profileError) {

            console.error(
              "Driver profile error:",
              profileError.message
            );

          }

          else {

            driverProfiles =
              profiles ?? [];

          }

        }


        // ================================================
        // FORMAT RIDES
        // ================================================

        const formattedRides =
          upcomingBookings.map(
            (booking: any) => {

              const ride =
                booking.rides;


              const driver =
                driverProfiles.find(
                  (profile) =>
                    profile.id ===
                    ride.driver_id
                );


              const driverName =
                driver
                  ? `${driver.first_name ?? ""} ${driver.last_name ?? ""}`.trim()
                  : "Driver";


              return {

                bookingId:
                  booking.id,

                rideId:
                  ride.id,

                driverName:
                  driverName ||
                  "Driver",

                pickupLocation:
                  ride.pickup_location,

                destination:
                  ride.destination,

                rideDate:
                  ride.ride_date,

                departureTime:
                  ride.departure_time,

                fare:
                  Number(
                    ride.fare ??
                    booking.amount ??
                    0
                  ),

                // IMPORTANT:
                // This comes directly from bookings.status
                status:
                  booking.status,

              };

            }
          );


        // ================================================
        // SORT RIDES
        // ================================================

        formattedRides.sort(
          (
            a,
            b
          ) => {

            const dateA =
              new Date(
                `${a.rideDate}T${a.departureTime}`
              ).getTime();


            const dateB =
              new Date(
                `${b.rideDate}T${b.departureTime}`
              ).getTime();


            return dateA - dateB;

          }
        );


        setRides(
          formattedRides
        );

      }

      catch (error) {

        console.error(
          "Upcoming rides error:",
          error
        );

        setRides([]);

      }

      finally {

        setLoading(false);

        setRefreshing(false);

      }

    };


  // ======================================================
  // LOAD WHEN SCREEN OPENS
  // ======================================================

  useFocusEffect(
    useCallback(
      () => {

        loadUpcomingRides();

      },
      []
    )
  );


  // ======================================================
  // REALTIME BOOKING + RIDE DELETION
  // ======================================================

  useEffect(() => {

    let active = true;

    let bookingChannel: any = null;

    let rideChannel: any = null;


    const startRealtime =
      async () => {

        const {
          data: {
            user,
          },
          error,
        } =
          await supabase.auth.getUser();


        if (
          error ||
          !user ||
          !active
        ) {

          return;

        }


        // ==================================================
        // BOOKING STATUS REALTIME
        // ==================================================

        bookingChannel =
          supabase
            .channel(
              `rider-upcoming-bookings-${user.id}`
            )
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "bookings",
                filter:
                  `rider_id=eq.${user.id}`,
              },
              async (payload) => {

                if (!active) {

                  return;

                }


                console.log(
                  "BOOKING STATUS UPDATED:",
                  payload.new
                );


                const updatedBooking =
                  payload.new as {
                    id: string;
                    ride_id: string;
                    status: string;
                  };


                // ==========================================
                // DRIVER ACCEPTED RIDER
                // ==========================================

                if (
                  updatedBooking.status ===
                  "confirmed"
                ) {

                  console.log(
                    "DRIVER ACCEPTED BOOKING:",
                    updatedBooking.id
                  );


                  // Reload the data directly
                  // from Supabase so the screen
                  // uses the actual database status.

                  await loadUpcomingRides();

                  return;

                }


                // ==========================================
                // DRIVER DECLINED / CANCELLED
                // ==========================================

                if (
                  updatedBooking.status ===
                  "cancelled"
                ) {

                  console.log(
                    "BOOKING CANCELLED:",
                    updatedBooking.id
                  );


                  setRides(
                    currentRides => {

                      const matchingRide =
                        currentRides.find(
                          item =>
                            item.bookingId ===
                            updatedBooking.id
                        );


                      if (matchingRide) {

                        Alert.alert(
                          "Booking Cancelled",
                          "Your booking for this ride has been cancelled.",
                          [
                            {
                              text: "OK",
                            },
                          ]
                        );

                      }


                      return currentRides.filter(
                        item =>
                          item.bookingId !==
                          updatedBooking.id
                      );

                    }
                  );

                }

              }
            )
            .subscribe(
              status => {

                console.log(
                  "Booking realtime status:",
                  status
                );

              }
            );


        // ==================================================
        // RIDE DELETION REALTIME
        // ==================================================

        rideChannel =
          supabase
            .channel(
              `rider-upcoming-ride-deletion-${user.id}`
            )
            .on(
              "postgres_changes",
              {
                event: "DELETE",
                schema: "public",
                table: "rides",
              },
              (payload) => {

                if (!active) {

                  return;

                }


                const deletedRide =
                  payload.old as {
                    id?: string;
                  };


                if (
                  !deletedRide?.id
                ) {

                  return;

                }


                console.log(
                  "RIDE DELETED:",
                  deletedRide.id
                );


                setRides(
                  currentRides => {

                    const matchingRide =
                      currentRides.find(
                        item =>
                          item.rideId ===
                          deletedRide.id
                      );


                    if (!matchingRide) {

                      return currentRides;

                    }


                    Alert.alert(
                      "Ride Cancelled",
                      "The driver has cancelled and removed this ride.",
                      [
                        {
                          text: "OK",
                        },
                      ]
                    );


                    return currentRides.filter(
                      item =>
                        item.rideId !==
                        deletedRide.id
                    );

                  }
                );

              }
            )
            .subscribe(
              status => {

                console.log(
                  "Ride deletion realtime status:",
                  status
                );

              }
            );

      };


    startRealtime();


    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {

      active = false;


      if (bookingChannel) {

        supabase.removeChannel(
          bookingChannel
        );

      }


      if (rideChannel) {

        supabase.removeChannel(
          rideChannel
        );

      }

    };

  }, []);


  // ======================================================
  // REFRESH
  // ======================================================

  const handleRefresh =
    () => {

      setRefreshing(true);

      loadUpcomingRides();

    };


  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate =
    (
      date: string
    ) => {

      const formattedDate =
        new Date(
          `${date}T00:00:00`
        );


      return formattedDate.toLocaleDateString(
        "en-ZA",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );

    };


  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime =
    (
      time: string
    ) => {

      if (!time) {

        return "—";

      }


      const [
        hours,
        minutes,
      ] =
        time.split(":");


      const hour =
        Number(hours);


      const suffix =
        hour >= 12
          ? "PM"
          : "AM";


      const displayHour =
        hour % 12 || 12;


      return `${displayHour}:${minutes} ${suffix}`;

    };


  // ======================================================
  // SHOW RIDE INFORMATION
  // ======================================================

  const showRideInfo =
    (
      ride: UpcomingRide
    ) => {

      Alert.alert(
        "Ride Information",
        `Driver: ${ride.driverName}

Pickup:
${ride.pickupLocation}

Destination:
${ride.destination}

Date:
${formatDate(ride.rideDate)}

Departure:
${formatTime(ride.departureTime)}

Fare:
R${ride.fare.toFixed(2)}

Booking Status:
${
  ride.status ===
  "confirmed"
    ? "Confirmed"
    : "Pending"
}`
      );

    };


  // ======================================================
  // LOADING
  // ======================================================

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
              Colors.rider
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading your rides...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ======================================================
  // SCREEN
  // ======================================================

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      {/* ==================================================
          HEADER
          ================================================== */}

      <View
        style={
          styles.header
        }
      >

        <View>

          <Text
            style={
              styles.heading
            }
          >
            Upcoming Rides
          </Text>

          <Text
            style={
              styles.subHeading
            }
          >
            Your upcoming booked rides.
          </Text>

        </View>


        <View
          style={
            styles.headerIcon
          }
        >

          <Ionicons
            name="calendar-outline"
            size={24}
            color={
              Colors.rider
            }
          />

        </View>

      </View>


      {/* ==================================================
          RIDES
          ================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }

        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
          />
        }

        contentContainerStyle={
          rides.length === 0
            ? styles.emptyScroll
            : styles.scrollContent
        }
      >

        {rides.length === 0 ? (

          // ==================================================
          // NO UPCOMING RIDES
          // ==================================================

          <View
            style={
              styles.rideCard
            }
          >

            <View
              style={
                styles.iconContainer
              }
            >

              <Ionicons
                name="car-outline"
                size={48}
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
              No Upcoming Rides
            </Text>


            <Text
              style={
                styles.description
              }
            >
              You currently don't have
              any upcoming rides. Once
              you book a ride, it will
              appear here.
            </Text>

          </View>

        ) : (

          // ==================================================
          // UPCOMING RIDES
          // ==================================================

          rides.map(
            (
              ride
            ) => (

              <View
                key={
                  ride.bookingId
                }
                style={
                  styles.upcomingRideCard
                }
              >

                {/* ==========================================
                    DRIVER HEADER
                    ========================================== */}

                <View
                  style={
                    styles.rideHeader
                  }
                >

                  <View
                    style={
                      styles.driverIcon
                    }
                  >

                    <Ionicons
                      name="person-outline"
                      size={23}
                      color={
                        Colors.rider
                      }
                    />

                  </View>


                  <View
                    style={
                      styles.driverContent
                    }
                  >

                    <Text
                      style={
                        styles.driverLabel
                      }
                    >
                      Driver
                    </Text>


                    <Text
                      style={
                        styles.driverName
                      }
                    >
                      {ride.driverName}
                    </Text>

                  </View>


                  {/* STATUS */}

                  <View
                    style={
                      styles.statusBadge
                    }
                  >

                    <Text
                      style={
                        styles.statusBadgeText
                      }
                    >
                      {
                        ride.status ===
                        "confirmed"
                          ? "Confirmed"
                          : "Pending"
                      }
                    </Text>

                  </View>

                </View>


                {/* ==========================================
                    DATE & TIME
                    ========================================== */}

                <View
                  style={
                    styles.dateTimeContainer
                  }
                >

                  <View
                    style={
                      styles.dateTimeItem
                    }
                  >

                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={
                        Colors.rider
                      }
                    />

                    <View>

                      <Text
                        style={
                          styles.smallLabel
                        }
                      >
                        Date
                      </Text>


                      <Text
                        style={
                          styles.dateTimeText
                        }
                      >
                        {formatDate(
                          ride.rideDate
                        )}
                      </Text>

                    </View>

                  </View>


                  <View
                    style={
                      styles.dateTimeItem
                    }
                  >

                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={
                        Colors.rider
                      }
                    />

                    <View>

                      <Text
                        style={
                          styles.smallLabel
                        }
                      >
                        Departure
                      </Text>


                      <Text
                        style={
                          styles.dateTimeText
                        }
                      >
                        {formatTime(
                          ride.departureTime
                        )}
                      </Text>

                    </View>

                  </View>

                </View>


                {/* ==========================================
                    ROUTE
                    ========================================== */}

                <View
                  style={
                    styles.routeContainer
                  }
                >

                  <View
                    style={
                      styles.routeIconColumn
                    }
                  >

                    <Ionicons
                      name="radio-button-on"
                      size={16}
                      color={
                        Colors.rider
                      }
                    />


                    <View
                      style={
                        styles.routeLine
                      }
                    />


                    <Ionicons
                      name="location"
                      size={18}
                      color={
                        Colors.rider
                      }
                    />

                  </View>


                  <View
                    style={
                      styles.routeContent
                    }
                  >

                    <View>

                      <Text
                        style={
                          styles.routeLabel
                        }
                      >
                        PICKUP
                      </Text>


                      <Text
                        style={
                          styles.locationText
                        }
                      >
                        {ride.pickupLocation}
                      </Text>

                    </View>


                    <View
                      style={
                        styles.destinationContainer
                      }
                    >

                      <Text
                        style={
                          styles.routeLabel
                        }
                      >
                        DESTINATION
                      </Text>


                      <Text
                        style={
                          styles.locationText
                        }
                      >
                        {ride.destination}
                      </Text>

                    </View>

                  </View>

                </View>


                {/* ==========================================
                    FARE
                    ========================================== */}

                <View
                  style={
                    styles.rideFooter
                  }
                >

                  <View>

                    <Text
                      style={
                        styles.fareLabel
                      }
                    >
                      Fare
                    </Text>


                    <Text
                      style={
                        styles.fareText
                      }
                    >
                      R
                      {ride.fare.toFixed(
                        2
                      )}
                    </Text>

                  </View>


                  <View
                    style={
                      styles.bookingReference
                    }
                  >

                    <Ionicons
                      name={
                        ride.status ===
                        "confirmed"
                          ? "checkmark-circle"
                          : "time-outline"
                      }
                      size={18}
                      color={
                        Colors.rider
                      }
                    />


                    <Text
                      style={
                        styles.bookingText
                      }
                    >
                      {
                        ride.status ===
                        "confirmed"
                          ? "Booking confirmed"
                          : "Waiting for driver"
                      }
                    </Text>

                  </View>

                </View>


                {/* ==========================================
                    ACTION BUTTONS
                    ========================================== */}

                <View
                  style={
                    styles.rideActions
                  }
                >

                  {/* TRACK DRIVER */}

                  <TouchableOpacity
                    style={
                      styles.trackButton
                    }

                    onPress={() =>
                      navigation.navigate(
                        "TrackDriver"
                      )
                    }

                    activeOpacity={
                      0.8
                    }
                  >

                    <Ionicons
                      name="location-outline"
                      size={19}
                      color={
                        Colors.white
                      }
                    />


                    <Text
                      style={
                        styles.trackButtonText
                      }
                    >
                      Track Driver
                    </Text>

                  </TouchableOpacity>


                  {/* RIDE INFO */}

                  <TouchableOpacity
                    style={
                      styles.infoButton
                    }

                    onPress={() =>
                      showRideInfo(
                        ride
                      )
                    }

                    activeOpacity={
                      0.8
                    }
                  >

                    <Ionicons
                      name="information-circle-outline"
                      size={19}
                      color={
                        Colors.rider
                      }
                    />


                    <Text
                      style={
                        styles.infoButtonText
                      }
                    >
                      Ride Info
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>

            )
          )

        )}

      </ScrollView>

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
      paddingHorizontal: 20,
      paddingTop: 15,
    },


    // ==================================================
    // HEADER
    // ==================================================

    header: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 25,
    },


    heading: {
      fontSize: 30,
      fontWeight: "700",
      color:
        Colors.primary,
    },


    subHeading: {
      fontSize: 14,
      color:
        Colors.textSecondary,
      marginTop: 6,
    },


    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        Colors.white,
      justifyContent:
        "center",
      alignItems:
        "center",
      elevation: 3,
      shadowOpacity: 0.08,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },


    // ==================================================
    // LOADING
    // ==================================================

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },


    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color:
        Colors.textSecondary,
    },


    // ==================================================
    // SCROLL
    // ==================================================

    scrollContent: {
      paddingBottom: 25,
    },


    emptyScroll: {
      flexGrow: 1,
      justifyContent:
        "center",
      paddingBottom: 40,
    },


    // ==================================================
    // EMPTY STATE
    // ==================================================

    rideCard: {
      backgroundColor:
        Colors.white,
      borderRadius: 24,
      paddingHorizontal: 25,
      paddingVertical: 35,
      alignItems:
        "center",
      elevation: 3,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
    },


    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor:
        "#EEF5FB",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 22,
    },


    title: {
      fontSize: 23,
      fontWeight: "700",
      color:
        Colors.primary,
      marginBottom: 10,
    },


    description: {
      fontSize: 15,
      color:
        Colors.textSecondary,
      textAlign: "center",
      lineHeight: 23,
      maxWidth: 310,
    },


    // ==================================================
    // UPCOMING RIDE CARD
    // ==================================================

    upcomingRideCard: {
      backgroundColor:
        Colors.white,
      borderRadius: 22,
      padding: 20,
      marginBottom: 18,
      elevation: 3,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
    },


    // ==================================================
    // DRIVER
    // ==================================================

    rideHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
    },


    driverIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        "#EEF5FB",
      justifyContent:
        "center",
      alignItems:
        "center",
    },


    driverContent: {
      flex: 1,
      marginLeft: 12,
    },


    driverLabel: {
      fontSize: 12,
      color:
        Colors.textSecondary,
      marginBottom: 2,
    },


    driverName: {
      fontSize: 17,
      fontWeight: "700",
      color:
        Colors.primary,
    },


    statusBadge: {
      backgroundColor:
        "#EAF7EE",
      borderRadius: 20,
      paddingHorizontal: 11,
      paddingVertical: 6,
    },


    statusBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color:
        "#2E7D32",
    },


    // ==================================================
    // DATE & TIME
    // ==================================================

    dateTimeContainer: {
      flexDirection: "row",
      backgroundColor:
        "#F7F9FC",
      borderRadius: 15,
      padding: 14,
      marginBottom: 18,
    },


    dateTimeItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },


    smallLabel: {
      fontSize: 11,
      color:
        Colors.textSecondary,
      marginBottom: 2,
      marginLeft: 9,
    },


    dateTimeText: {
      fontSize: 13,
      fontWeight: "700",
      color:
        Colors.primary,
      marginLeft: 9,
    },


    // ==================================================
    // ROUTE
    // ==================================================

    routeContainer: {
      flexDirection: "row",
      marginBottom: 20,
    },


    routeIconColumn: {
      width: 25,
      alignItems:
        "center",
      paddingTop: 2,
    },


    routeLine: {
      width: 1,
      height: 35,
      backgroundColor:
        "#D9E0E8",
      marginVertical: 3,
    },


    routeContent: {
      flex: 1,
      marginLeft: 10,
    },


    routeLabel: {
      fontSize: 10,
      fontWeight: "700",
      color:
        Colors.textSecondary,
      marginBottom: 3,
    },


    locationText: {
      fontSize: 14,
      fontWeight: "600",
      color:
        Colors.primary,
    },


    destinationContainer: {
      marginTop: 18,
    },


    // ==================================================
    // FARE
    // ==================================================

    rideFooter: {
      borderTopWidth: 1,
      borderTopColor:
        "#E8ECF0",
      paddingTop: 15,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },


    fareLabel: {
      fontSize: 11,
      color:
        Colors.textSecondary,
      marginBottom: 2,
    },


    fareText: {
      fontSize: 20,
      fontWeight: "800",
      color:
        Colors.rider,
    },


    bookingReference: {
      flexDirection: "row",
      alignItems:
        "center",
    },


    bookingText: {
      fontSize: 11,
      color:
        Colors.textSecondary,
      marginLeft: 5,
    },


    // ==================================================
    // ACTION BUTTONS
    // ==================================================

    rideActions: {
      flexDirection: "row",
      marginTop: 15,
      gap: 10,
    },


    trackButton: {
      flex: 1,
      height: 48,
      borderRadius: 13,
      backgroundColor:
        Colors.rider,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems:
        "center",
    },


    trackButtonText: {
      color:
        Colors.white,
      fontSize: 13,
      fontWeight: "700",
      marginLeft: 6,
    },


    infoButton: {
      flex: 1,
      height: 48,
      borderRadius: 13,
      backgroundColor:
        Colors.white,
      borderWidth: 1.5,
      borderColor:
        Colors.rider,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems:
        "center",
    },


    infoButtonText: {
      color:
        Colors.rider,
      fontSize: 13,
      fontWeight: "700",
      marginLeft: 6,
    },

  });