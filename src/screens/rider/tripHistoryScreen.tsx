import React, {
  useCallback,
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
} from "react-native";

import {
  useFocusEffect,
} from "@react-navigation/native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/colors";

import { supabase } from "../../lib/supabaseClient";

type Trip = {
  id: string;
  rider_id: string | null;
  driver_id: string | null;
  pickup_location: string;
  destination: string;
  fare: number | null;
  ride_date: string | null;
  departure_time: string | null;
  completed_at: string | null;
  status: string;
};

type Booking = {
  id: string;
  ride_id: string;
  rider_id: string;
  status: string;
  seats_booked: number;
};

type DriverProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export default function TripHistoryScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);

  const [driverNames, setDriverNames] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadTrips = async () => {
    try {
      setLoading(true);

      /*
       * Get the currently logged-in rider.
       */
      const {
        data: {
          user,
        },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "User error:",
          userError.message,
        );

        setTrips([]);
        return;
      }

      if (!user) {
        console.log(
          "No logged-in user found.",
        );

        setTrips([]);
        return;
      }

      console.log(
        "Logged-in rider ID:",
        user.id,
      );

      /*
       * STEP 1
       *
       * Find this rider's bookings.
       *
       * We use bookings.rider_id instead of
       * rides.rider_id because rides.rider_id
       * is currently NULL and a ride can have
       * multiple riders.
       */
      const {
        data: bookings,
        error: bookingError,
      } = await supabase
        .from("bookings")
        .select(
          `
          id,
          ride_id,
          rider_id,
          status,
          seats_booked
        `,
        )
        .eq("rider_id", user.id);

      if (bookingError) {
        console.error(
          "Booking history error:",
          bookingError.message,
        );

        setTrips([]);
        return;
      }

      console.log(
        "Rider bookings:",
        bookings,
      );

      const riderBookings =
        (bookings ?? []) as Booking[];

      /*
       * No bookings means no past trips.
       */
      if (riderBookings.length === 0) {
        setTrips([]);
        setDriverNames({});
        return;
      }

      /*
       * Get the ride IDs belonging to
       * this rider's bookings.
       */
      const rideIds = [
        ...new Set(
          riderBookings
            .map(
              (booking) =>
                booking.ride_id,
            )
            .filter(Boolean),
        ),
      ];

      if (rideIds.length === 0) {
        setTrips([]);
        setDriverNames({});
        return;
      }

      /*
       * STEP 2
       *
       * Get the actual rides and only keep
       * rides that have been completed.
       */
      const {
        data: rides,
        error: rideError,
      } = await supabase
        .from("rides")
        .select(
          `
          id,
          rider_id,
          driver_id,
          pickup_location,
          destination,
          fare,
          ride_date,
          departure_time,
          completed_at,
          status
        `,
        )
        .in("id", rideIds)
        .eq("status", "completed")
        .order("completed_at", {
          ascending: false,
        });

      if (rideError) {
        console.error(
          "Ride history error:",
          rideError.message,
        );

        setTrips([]);
        return;
      }

      console.log(
        "Completed rides found:",
        rides,
      );

      const completedTrips =
        (rides ?? []) as Trip[];

      setTrips(completedTrips);

      /*
       * STEP 3
       *
       * Get the driver IDs from the
       * completed rides.
       */
      const driverIds = completedTrips
        .map(
          (trip) =>
            trip.driver_id,
        )
        .filter(
          (
            id,
          ): id is string =>
            Boolean(id),
        );

      if (driverIds.length === 0) {
        setDriverNames({});
        return;
      }

      /*
       * STEP 4
       *
       * Get driver names.
       */
      const {
        data: profiles,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name",
        )
        .in(
          "id",
          [
            ...new Set(driverIds),
          ],
        );

      if (profileError) {
        console.error(
          "Driver profile error:",
          profileError.message,
        );

        return;
      }

      const names: Record<
        string,
        string
      > = {};

      (
        profiles ?? []
      ).forEach(
        (
          profile: DriverProfile,
        ) => {
          const fullName = [
            profile.first_name,
            profile.last_name,
          ]
            .filter(Boolean)
            .join(" ");

          names[profile.id] =
            fullName || "Driver";
        },
      );

      setDriverNames(names);
    } catch (error) {
      console.error(
        "Trip history error:",
        error,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const formatDate = (
    date: string | null,
  ) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-ZA",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const formatTime = (
    time: string | null,
  ) => {
    if (!time) {
      return "";
    }

    const parts =
      time.split(":");

    if (parts.length < 2) {
      return time;
    }

    const hours =
      Number(parts[0]);

    const minutes =
      parts[1];

    if (
      Number.isNaN(hours)
    ) {
      return time;
    }

    const period =
      hours >= 12
        ? "PM"
        : "AM";

    const displayHour =
      hours % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  const getDriverName = (
    driverId: string | null,
  ) => {
    if (!driverId) {
      return "Driver";
    }

    return (
      driverNames[driverId] ||
      "Driver"
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text
            style={styles.heading}
          >
            Past Trips
          </Text>

          <Text
            style={styles.subHeading}
          >
            View your previous rides
            and trip history.
          </Text>
        </View>

        <View
          style={styles.headerIcon}
        >
          <Ionicons
            name="time-outline"
            size={24}
            color={Colors.rider}
          />
        </View>
      </View>

      {/* Loading */}
      {loading ? (
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={Colors.rider}
          />

          <Text
            style={styles.loadingText}
          >
            Loading your trips...
          </Text>
        </View>
      ) : trips.length === 0 ? (

        /* Empty State */
        <View
          style={styles.emptyCard}
        >
          <View
            style={
              styles.iconContainer
            }
          >
            <Ionicons
              name="car-outline"
              size={48}
              color={Colors.rider}
            />
          </View>

          <Text
            style={styles.emptyTitle}
          >
            No Past Trips
          </Text>

          <Text
            style={styles.emptyText}
          >
            You haven't completed
            any rides yet. Once you
            complete a ride, your
            trip details will appear
            here.
          </Text>

          <View
            style={styles.infoRow}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors.rider}
            />

            <Text
              style={styles.infoText}
            >
              Your completed trips
              will be saved here for
              easy access.
            </Text>
          </View>
        </View>

      ) : (

        /* Past Trips */
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
              tintColor={
                Colors.rider
              }
            />
          }
          contentContainerStyle={
            styles.tripList
          }
        >

          {trips.map(
            (trip) => (
              <View
                key={trip.id}
                style={
                  styles.tripCard
                }
              >

                {/* Trip Header */}
                <View
                  style={
                    styles.tripHeader
                  }
                >
                  <View
                    style={
                      styles.tripIcon
                    }
                  >
                    <Ionicons
                      name="car"
                      size={22}
                      color={
                        Colors.rider
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.tripHeaderInfo
                    }
                  >
                    <Text
                      style={
                        styles.tripTitle
                      }
                    >
                      Ride with{" "}
                      {getDriverName(
                        trip.driver_id,
                      )}
                    </Text>

                    <Text
                      style={
                        styles.tripDate
                      }
                    >
                      {formatDate(
                        trip.completed_at ||
                          trip.ride_date,
                      )}

                      {trip.departure_time
                        ? ` • ${formatTime(
                            trip.departure_time,
                          )}`
                        : ""}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.completedBadge
                    }
                  >
                    <Text
                      style={
                        styles.completedBadgeText
                      }
                    >
                      Completed
                    </Text>
                  </View>
                </View>

                {/* Route */}
                <View
                  style={
                    styles.routeContainer
                  }
                >
                  <View
                    style={
                      styles.routeIndicator
                    }
                  >
                    <View
                      style={
                        styles.pickupDot
                      }
                    />

                    <View
                      style={
                        styles.routeLine
                      }
                    />

                    <View
                      style={
                        styles.destinationDot
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.routeText
                    }
                  >
                    <View
                      style={
                        styles.locationBlock
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
                          styles.locationValue
                        }
                        numberOfLines={
                          2
                        }
                      >
                        {
                          trip.pickup_location
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.locationBlock
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
                          styles.locationValue
                        }
                        numberOfLines={
                          2
                        }
                      >
                        {
                          trip.destination
                        }
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Fare */}
                <View
                  style={
                    styles.tripFooter
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.fareLabel
                      }
                    >
                      Trip Fare
                    </Text>

                    <Text
                      style={
                        styles.fareValue
                      }
                    >
                      R
                      {Number(
                        trip.fare || 0,
                      ).toFixed(2)}
                    </Text>
                  </View>

                  <Ionicons
                    name="receipt-outline"
                    size={25}
                    color={
                      Colors.rider
                    }
                  />
                </View>

              </View>
            ),
          )}

        </ScrollView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
  },

  subHeading: {
    fontSize: 14,
    color:
      Colors.textSecondary,
    marginTop: 6,
    maxWidth: 270,
    lineHeight: 20,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      Colors.white,
    justifyContent:
      "center",
    alignItems: "center",
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  loadingContainer: {
    flex: 1,
    justifyContent:
      "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color:
      Colors.textSecondary,
  },

  emptyCard: {
    backgroundColor:
      Colors.white,
    borderRadius: 24,
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: "center",
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
    alignItems: "center",
    marginBottom: 22,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 15,
    color:
      Colors.textSecondary,
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 300,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "#F7F9FC",
    borderRadius: 14,
    padding: 14,
    marginTop: 25,
    width: "100%",
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color:
      Colors.textSecondary,
    lineHeight: 19,
    marginLeft: 10,
  },

  tripList: {
    paddingBottom: 30,
  },

  tripCard: {
    backgroundColor:
      Colors.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  tripIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor:
      "#EEF5FB",
    justifyContent:
      "center",
    alignItems: "center",
  },

  tripHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },

  tripTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },

  tripDate: {
    fontSize: 12,
    color:
      Colors.textSecondary,
    marginTop: 4,
  },

  completedBadge: {
    backgroundColor:
      "#EAF7EE",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  completedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2E7D32",
  },

  routeContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingVertical: 5,
  },

  routeIndicator: {
    width: 20,
    alignItems: "center",
    paddingTop: 5,
  },

  pickupDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor:
      Colors.rider,
  },

  routeLine: {
    width: 1,
    height: 38,
    backgroundColor:
      "#D5D5D5",
    marginVertical: 3,
  },

  destinationDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor:
      Colors.primary,
  },

  routeText: {
    flex: 1,
    marginLeft: 10,
  },

  locationBlock: {
    marginBottom: 13,
  },

  locationLabel: {
    fontSize: 10,
    color:
      Colors.textSecondary,
    marginBottom: 3,
    textTransform:
      "uppercase",
    fontWeight: "600",
  },

  locationValue: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
    lineHeight: 20,
  },

  tripFooter: {
    borderTopWidth: 1,
    borderTopColor:
      "#EEEEEE",
    marginTop: 5,
    paddingTop: 14,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  fareLabel: {
    fontSize: 11,
    color:
      Colors.textSecondary,
  },

  fareValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 2,
  },
});