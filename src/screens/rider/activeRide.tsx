import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Colors from "../../constants/colors";
import { supabase } from "../../lib/supabaseClient";

import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

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
  rideStatus: string;
};

const ActiveRideScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [rides, setRides] = useState<UpcomingRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // LOAD RIDER'S BOOKINGS AND RIDES
  // ============================================================

  const loadUpcomingRides = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "USER ERROR:",
          userError.message
        );
        return;
      }

      if (!user) {
        setRides([]);
        return;
      }

      const { data: bookingData, error: bookingError } =
        await supabase
          .from("bookings")
          .select(`
            id,
            ride_id,
            rider_id,
            status,
            rides (
              id,
              driver_id,
              pickup_location,
              destination,
              ride_date,
              departure_time,
              fare,
              status
            )
          `)
          .eq("rider_id", user.id)
          .in("status", [
            "pending",
            "confirmed",
          ]);

      if (bookingError) {
        console.error(
          "BOOKING ERROR:",
          bookingError.message
        );
        return;
      }

      if (!bookingData) {
        setRides([]);
        return;
      }

      const now = new Date();

      const upcomingBookings =
        bookingData.filter(
          (booking: any) => {
            if (!booking.rides) {
              return false;
            }

            const ride = Array.isArray(
              booking.rides
            )
              ? booking.rides[0]
              : booking.rides;

            if (!ride) {
              return false;
            }

            // Don't display completed or cancelled
            // rides as active rides.
            if (
              ride.status ===
                "completed" ||
              ride.status ===
                "cancelled"
            ) {
              return false;
            }

            // Once the driver has confirmed a booking, keep it visible even
            // if the scheduled departure time has already passed. Otherwise
            // an active trip can disappear from the rider's screen mid-ride.
            if (
              booking.status ===
              "confirmed"
            ) {
              return true;
            }

            const rideDateTime =
              new Date(
                `${ride.ride_date}T${ride.departure_time}`
              );

            return rideDateTime >= now;
          }
        );

      // ============================================================
      // GET DRIVER IDs
      // ============================================================

      const driverIds =
        upcomingBookings
          .map((booking: any) => {
            const ride =
              Array.isArray(
                booking.rides
              )
                ? booking.rides[0]
                : booking.rides;

            return ride?.driver_id;
          })
          .filter(Boolean);

      let driverProfiles: any[] = [];

      if (driverIds.length > 0) {
        const {
          data: profilesData,
          error: profilesError,
        } = await supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name
          `)
          .in("id", driverIds);

        if (profilesError) {
          console.error(
            "PROFILE ERROR:",
            profilesError.message
          );
        } else {
          driverProfiles =
            profilesData || [];
        }
      }

      // ============================================================
      // FORMAT RIDES
      // ============================================================

      const formattedRides: UpcomingRide[] =
        upcomingBookings.map(
          (booking: any) => {
            const ride =
              Array.isArray(
                booking.rides
              )
                ? booking.rides[0]
                : booking.rides;

            const driver =
              driverProfiles.find(
                (profile) =>
                  profile.id ===
                  ride.driver_id
              );

            return {
              bookingId: booking.id,
              rideId: ride.id,

              driverName: driver
                ? `${driver.first_name} ${driver.last_name}`
                : "Driver",

              pickupLocation:
                ride.pickup_location,

              destination:
                ride.destination,

              rideDate:
                ride.ride_date,

              departureTime:
                ride.departure_time,

              fare: Number(
                ride.fare
              ),

              // Booking status
              status:
                booking.status,

              // Ride status
              rideStatus:
                ride.status ||
                "pending",
            };
          }
        );

      // ============================================================
      // SORT RIDES BY DATE AND TIME
      // ============================================================

      formattedRides.sort(
        (a, b) => {
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

      setRides(formattedRides);
    } catch (error) {
      console.error(
        "LOAD RIDES ERROR:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // LOAD WHEN SCREEN OPENS / COMES INTO FOCUS
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      loadUpcomingRides();
    }, [])
  );

  // ============================================================
  // REALTIME UPDATES
  // ============================================================

  useEffect(() => {
    let bookingChannel: any;
    let rideStatusChannel: any;
    let rideDeleteChannel: any;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      // ==========================================================
      // BOOKING UPDATES
      // ==========================================================

      bookingChannel = supabase
        .channel(
          `rider-bookings-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "bookings",
            filter: `rider_id=eq.${user.id}`,
          },
          async (payload) => {
            console.log(
              "BOOKING UPDATED:",
              payload
            );

            if (
              payload.new.status ===
              "confirmed"
            ) {
              await loadUpcomingRides();

              Alert.alert(
                "Ride Confirmed",
                "Your ride has been confirmed by the driver."
              );
            }

            if (
              payload.new.status ===
              "cancelled"
            ) {
              await loadUpcomingRides();

              Alert.alert(
                "Ride Cancelled",
                "Your ride booking has been cancelled."
              );
            }
          }
        )
        .subscribe();

      // ==========================================================
      // RIDE STATUS UPDATES
      // ==========================================================

      rideStatusChannel = supabase
        .channel(
          `rider-ride-status-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "rides",
          },
          async (payload) => {
            console.log(
              "RIDE UPDATED:",
              payload
            );

            const updatedRide =
              payload.new;

            // Check if this ride belongs
            // to one of the rider's rides.
            const matchingRide =
              rides.find(
                (ride) =>
                  ride.rideId ===
                  updatedRide.id
              );

            if (!matchingRide) {
              await loadUpcomingRides();
              return;
            }

            // ======================================================
            // DRIVER IS HEADING TO PICKUP
            // ======================================================

            if (
              updatedRide.status ===
              "driver_on_way"
            ) {
              setRides(
                (currentRides) =>
                  currentRides.map(
                    (ride) =>
                      ride.rideId ===
                      updatedRide.id
                        ? {
                            ...ride,
                            rideStatus:
                              "driver_on_way",
                          }
                        : ride
                  )
              );

              Alert.alert(
                "Driver On The Way",
                "Your driver is heading to your pickup location."
              );
            }

            // ======================================================
            // DRIVER ARRIVED
            // ======================================================

            if (
              updatedRide.status ===
              "driver_arrived"
            ) {
              setRides(
                (currentRides) =>
                  currentRides.map(
                    (ride) =>
                      ride.rideId ===
                      updatedRide.id
                        ? {
                            ...ride,
                            rideStatus:
                              "driver_arrived",
                          }
                        : ride
                  )
              );

              Alert.alert(
                "Driver Arrived",
                "Your driver has arrived at the pickup location."
              );
            }

            // ======================================================
            // DRIVER STARTED TRIP
            // ======================================================

            if (
              updatedRide.status ===
              "in_progress"
            ) {
              setRides(
                (currentRides) =>
                  currentRides.map(
                    (ride) =>
                      ride.rideId ===
                      updatedRide.id
                        ? {
                            ...ride,
                            rideStatus:
                              "in_progress",
                          }
                        : ride
                  )
              );

              Alert.alert(
                "Ride Started",
                "Your driver has started the ride."
              );
            }

            // ======================================================
            // DRIVER ENDED RIDE
            // ======================================================

            if (
              updatedRide.status ===
              "completed"
            ) {
              setRides(
                (currentRides) =>
                  currentRides.map(
                    (ride) =>
                      ride.rideId ===
                      updatedRide.id
                        ? {
                            ...ride,
                            rideStatus:
                              "completed",
                          }
                        : ride
                  )
              );

              Alert.alert(
                "Ride Completed",
                "Your ride has been completed."
              );
            }

            // ======================================================
            // RIDE CANCELLED
            // ======================================================

            if (
              updatedRide.status ===
              "cancelled"
            ) {
              setRides(
                (currentRides) =>
                  currentRides.filter(
                    (ride) =>
                      ride.rideId !==
                      updatedRide.id
                  )
              );

              Alert.alert(
                "Ride Cancelled",
                "This ride has been cancelled."
              );
            }
          }
        )
        .subscribe();

      // ==========================================================
      // RIDE DELETED
      // ==========================================================

      rideDeleteChannel = supabase
        .channel(
          `rider-ride-delete-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "rides",
          },
          async (payload) => {
            const deletedRideId =
              payload.old?.id;

            if (!deletedRideId) {
              return;
            }

            const matchingRide =
              rides.find(
                (ride) =>
                  ride.rideId ===
                  deletedRideId
              );

            if (!matchingRide) {
              return;
            }

            setRides(
              (currentRides) =>
                currentRides.filter(
                  (ride) =>
                    ride.rideId !==
                    deletedRideId
                )
            );

            Alert.alert(
              "Ride Removed",
              "The ride you booked is no longer available."
            );
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (bookingChannel) {
        supabase.removeChannel(
          bookingChannel
        );
      }

      if (rideStatusChannel) {
        supabase.removeChannel(
          rideStatusChannel
        );
      }

      if (rideDeleteChannel) {
        supabase.removeChannel(
          rideDeleteChannel
        );
      }
    };
  }, [rides]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUpcomingRides();
  };

  // ============================================================
  // STATUS TEXT
  // ============================================================

  const getRideStatusText = (
    ride: UpcomingRide
  ) => {
    if (
      ride.rideStatus ===
      "driver_on_way"
    ) {
      return "Driver On The Way";
    }

    if (
      ride.rideStatus ===
      "driver_arrived"
    ) {
      return "Driver Arrived";
    }

    if (
      ride.rideStatus ===
      "in_progress"
    ) {
      return "In Progress";
    }

    if (
      ride.rideStatus ===
      "completed"
    ) {
      return "Completed";
    }

    if (
      ride.status ===
      "confirmed"
    ) {
      return "Confirmed";
    }

    return "Pending";
  };

  const getStatusDescription = (
    ride: UpcomingRide
  ) => {
    if (
      ride.rideStatus ===
      "driver_on_way"
    ) {
      return "Driver is on the way to your pickup location";
    }

    if (
      ride.rideStatus ===
      "driver_arrived"
    ) {
      return "Driver has arrived at your pickup location";
    }

    if (
      ride.rideStatus ===
      "in_progress"
    ) {
      return "Trip is in progress";
    }

    if (
      ride.rideStatus ===
      "completed"
    ) {
      return "Ride completed";
    }

    if (
      ride.status ===
      "confirmed"
    ) {
      return "Booking confirmed";
    }

    return "Waiting for driver";
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
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
          Loading your rides...
        </Text>
      </View>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
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
      >
        <Text style={styles.title}>
          My Active Ride
        </Text>

        <Text
          style={styles.subtitle}
        >
          Your upcoming and active trips
        </Text>

        {rides.length === 0 ? (
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              No Active Rides
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              You currently don't have
              any upcoming rides.
            </Text>
          </View>
        ) : (
          rides.map((ride) => (
            <View
              key={
                ride.bookingId
              }
              style={
                styles.rideCard
              }
            >
              {/* STATUS */}

              <View
                style={
                  styles.statusRow
                }
              >
                <View
                  style={[
                    styles.statusBadge,

                    ride.rideStatus ===
                      "in_progress" &&
                      styles.inProgressBadge,

                    ride.status ===
                      "confirmed" &&
                      ride.rideStatus !==
                        "in_progress" &&
                      styles.confirmedBadge,
                  ]}
                >
                  <Text
                    style={
                      styles.statusText
                    }
                  >
                    {getRideStatusText(
                      ride
                    )}
                  </Text>
                </View>
              </View>

              {/* DRIVER */}

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

              {/* ROUTE */}

              <View
                style={
                  styles.routeContainer
                }
              >
                <View
                  style={
                    styles.routeRow
                  }
                >
                  <View
                    style={
                      styles.dot
                    }
                  />

                  <View
                    style={
                      styles.locationContainer
                    }
                  >
                    <Text
                      style={
                        styles.locationLabel
                      }
                    >
                      Pickup
                    </Text>

                    <Text
                      style={
                        styles.locationText
                      }
                    >
                      {
                        ride.pickupLocation
                      }
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
                    styles.routeRow
                  }
                >
                  <View
                    style={[
                      styles.dot,
                      styles.destinationDot,
                    ]}
                  />

                  <View
                    style={
                      styles.locationContainer
                    }
                  >
                    <Text
                      style={
                        styles.locationLabel
                      }
                    >
                      Destination
                    </Text>

                    <Text
                      style={
                        styles.locationText
                      }
                    >
                      {
                        ride.destination
                      }
                    </Text>
                  </View>
                </View>
              </View>

              {/* RIDE DETAILS */}

              <View
                style={
                  styles.detailsRow
                }
              >
                <View>
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
                    {
                      ride.rideDate
                    }
                  </Text>
                </View>

                <View>
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
                    {
                      ride.departureTime
                    }
                  </Text>
                </View>

                <View>
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
                    R{ride.fare}
                  </Text>
                </View>
              </View>

              {/* STATUS DESCRIPTION */}

              <Text
                style={
                  styles.statusDescription
                }
              >
                {getStatusDescription(
                  ride
                )}
              </Text>

              {/* ==================================================
                  RIDER BUTTONS
                  ================================================== */}

              <View
                style={
                  styles.rideActions
                }
              >
                {/* TRACK DRIVER */}

                {ride.status ===
                  "confirmed" &&
                  [
                    "accepted",
                    "active",
                    "driver_on_way",
                    "driver_arrived",
                    "in_progress",
                  ].includes(
                    ride.rideStatus,
                  ) && (
                  <TouchableOpacity
                    style={
                      styles.trackButton
                    }
                    activeOpacity={
                      0.8
                    }
                    onPress={() =>
                      navigation.navigate(
                        "TrackDriver",
                        {
                          rideId:
                            ride.rideId,
                        }
                      )
                    }
                  >
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      Track Driver
                    </Text>
                  </TouchableOpacity>
                )}

                {/* CHAT WITH DRIVER */}

                {ride.status ===
                  "confirmed" && (
                  <TouchableOpacity
                    style={
                      styles.chatButton
                    }
                    activeOpacity={
                      0.8
                    }
                    onPress={() =>
                      navigation.navigate(
                        "ChatWithDriver",
                        {
                          rideId:
                            ride.rideId,
                        }
                      )
                    }
                  >
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      Chat with Driver
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ActiveRideScreen;

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: "#666666",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 15,
    color: "#777777",
    marginBottom: 20,
  },

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
  },

  rideCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },

  statusBadge: {
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  confirmedBadge: {
    backgroundColor: "#D4EDDA",
  },

  inProgressBadge: {
    backgroundColor: "#D1ECF1",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333333",
  },

  driverLabel: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 3,
  },

  driverName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 20,
  },

  routeContainer: {
    marginBottom: 20,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor:
      Colors.primary,
    marginTop: 4,
    marginRight: 12,
  },

  destinationDot: {
    backgroundColor:
      Colors.primary,
  },

  routeLine: {
    height: 25,
    width: 2,
    backgroundColor:
      "#D9D9D9",
    marginLeft: 5,
    marginVertical: 2,
  },

  locationContainer: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 2,
  },

  locationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222222",
  },

  detailsRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    borderTopWidth: 1,
    borderTopColor:
      "#EEEEEE",
    paddingTop: 15,
  },

  detailLabel: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },

  statusDescription: {
    textAlign: "center",
    fontSize: 14,
    color: "#666666",
    marginTop: 18,
    marginBottom: 15,
  },

  // ============================================================
  // BUTTONS
  // ============================================================

  rideActions: {
    width: "100%",
    marginTop: 5,
    gap: 10,
  },

  trackButton: {
    width: "100%",
    backgroundColor:
      Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  chatButton: {
    width: "100%",
    backgroundColor:
      Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});