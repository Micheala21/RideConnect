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

import { supabase } from "../../lib/supabaseClient";
import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type Ride = {
  id: string;
  driver_id: string;
  pickup_location: string;
  destination: string;
  ride_date: string;
  departure_time: string;
  available_seats: number;
  fare: number;
  notes: string | null;
  status: string;
  created_at: string;
};

type DisplayStatus =
  | "available"
  | "starting_soon"
  | "accepted"
  | "active"
  | "driver_on_way"
  | "driver_arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

const ActiveRideScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [ride, setRide] = useState<Ride | null>(null);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // =========================
  // LOAD CURRENT RIDE
  // =========================

  const loadRide = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setRide(null);
        return;
      }

      const { data, error } = await supabase
        .from("rides")
        .select(`
          id,
          driver_id,
          pickup_location,
          destination,
          ride_date,
          departure_time,
          available_seats,
          fare,
          notes,
          status,
          created_at
        `)
        .eq("driver_id", user.id)
        .in("status", [
          "available",
          "accepted",
          "active",
          "driver_on_way",
          "driver_arrived",
          "in_progress",
        ])
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Error loading current ride:",
          error.message,
        );
        setRide(null);
        return;
      }

      setRide(data ?? null);
    } catch (error) {
      console.error(
        "Unexpected error loading ride:",
        error,
      );
      setRide(null);
    }
  };

  // =========================
  // LOAD RECENT RIDES
  // =========================

  const loadRecentRides = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRecentRides([]);
        return;
      }

      const { data, error } = await supabase
        .from("rides")
        .select(`
          id,
          pickup_location,
          destination,
          ride_date,
          departure_time,
          fare,
          status
        `)
        .eq("driver_id", user.id)
        .in("status", [
          "completed",
          "cancelled",
        ])
        .order("created_at", {
          ascending: false,
        })
        .limit(5);

      if (error) {
        console.error(
          "Error loading recent rides:",
          error.message,
        );
        setRecentRides([]);
        return;
      }

      setRecentRides(
        (data ?? []) as Ride[],
      );
    } catch (error) {
      console.error(
        "Unexpected error loading recent rides:",
        error,
      );
      setRecentRides([]);
    }
  };

  // =========================
  // LOAD ALL DATA
  // =========================

  const loadData = async () => {
    await Promise.all([
      loadRide(),
      loadRecentRides(),
    ]);
  };

  // =========================
  // REFRESH
  // =========================

  const onRefresh = async () => {
    setRefreshing(true);

    await loadData();

    setCurrentTime(new Date());

    setRefreshing(false);
  };

  // =========================
  // FOCUS REFRESH
  // =========================

  useFocusEffect(
    useCallback(() => {
      loadData();
      setCurrentTime(new Date());
    }, []),
  );

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);

      await loadData();

      setLoading(false);
    };

    loadInitialData();
  }, []);

  // =========================
  // UPDATE CURRENT TIME
  // =========================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // REALTIME RIDE UPDATES
  // =========================

  useEffect(() => {
    let userId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      userId = user.id;

      channel = supabase
        .channel(`driver-active-ride-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "rides",
            filter: `driver_id=eq.${user.id}`,
          },
          () => {
            loadData();
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "rides",
            filter: `driver_id=eq.${user.id}`,
          },
          () => {
            loadData();
          },
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // =========================
  // DEPARTURE DATE/TIME
  // =========================

  const getDepartureDateTime = (
    rideData: Ride,
  ) => {
    const date = new Date(
      `${rideData.ride_date}T${rideData.departure_time}`,
    );

    return date;
  };

  // =========================
  // STARTING SOON
  // =========================

  const isStartingSoon = (
    rideData: Ride,
  ) => {
    const departureTime =
      getDepartureDateTime(rideData);

    const difference =
      departureTime.getTime() -
      currentTime.getTime();

    const minutes =
      difference / (1000 * 60);

    return (
      minutes > 0 &&
      minutes <= 30
    );
  };

  // =========================
  // DISPLAY STATUS
  // =========================

  const getDisplayStatus = (
    rideData: Ride,
  ): DisplayStatus => {
    if (
      rideData.status === "accepted"
    ) {
      return "accepted";
    }

    if (
      rideData.status === "active"
    ) {
      return "active";
    }

    if (
      rideData.status === "driver_on_way"
    ) {
      return "driver_on_way";
    }

    if (
      rideData.status === "driver_arrived"
    ) {
      return "driver_arrived";
    }

    if (
      rideData.status === "in_progress"
    ) {
      return "in_progress";
    }

    if (
      rideData.status === "completed"
    ) {
      return "completed";
    }

    if (
      rideData.status === "cancelled"
    ) {
      return "cancelled";
    }

    if (
      rideData.status === "available" &&
      rideData.available_seats <= 0
    ) {
      return "accepted";
    }

    if (
      rideData.status === "available" &&
      isStartingSoon(rideData)
    ) {
      return "starting_soon";
    }

    return "available";
  };

  const displayStatus = ride
    ? getDisplayStatus(ride)
    : null;

  // =========================
  // STATUS TITLE
  // =========================

  const getStatusTitle = (
    status: DisplayStatus,
  ) => {
    switch (status) {
      case "available":
        return "Ride Offer Active";

      case "starting_soon":
        return "Starting Soon";

      case "accepted":
        return "Rider Accepted";

      case "active":
        return "Ride Accepted";

      case "driver_on_way":
        return "Heading to Rider";

      case "driver_arrived":
        return "Arrived at Rider";

      case "in_progress":
        return "Trip In Progress";

      case "completed":
        return "Trip Completed";

      case "cancelled":
        return "Trip Cancelled";

      default:
        return "Ride Status";
    }
  };

  // =========================
  // STATUS DESCRIPTION
  // =========================

  const getStatusDescription = (
    status: DisplayStatus,
  ) => {
    switch (status) {
      case "available":
        return "Your ride offer is available for riders.";

      case "starting_soon":
        return "Your departure time is within the next 30 minutes.";

      case "accepted":
        return "A rider has accepted your ride.";

      case "active":
        return "A rider has accepted your ride.";

      case "driver_on_way":
        return "You are heading to the rider's pickup location.";

      case "driver_arrived":
        return "You have arrived at the rider's pickup location.";

      case "in_progress":
        return "Your trip is currently in progress.";

      case "completed":
        return "This trip has been completed.";

      case "cancelled":
        return "This ride has been cancelled.";

      default:
        return "";
    }
  };

  // =========================
  // STATUS ICON
  // =========================

  const getStatusIcon = (
    status: DisplayStatus,
  ) => {
    switch (status) {
      case "available":
        return "🚗";

      case "starting_soon":
        return "⏰";

      case "accepted":
        return "👤";

      case "active":
        return "🚗";

      case "driver_on_way":
        return "🚗";

      case "driver_arrived":
        return "📍";

      case "in_progress":
        return "🛣️";

      case "completed":
        return "✅";

      case "cancelled":
        return "❌";

      default:
        return "🚗";
    }
  };

  // =========================
  // STATUS BADGE
  // =========================

  const getStatusBadgeText = (
    status: DisplayStatus,
  ) => {
    switch (status) {
      case "available":
        return "AVAILABLE";

      case "starting_soon":
        return "STARTING SOON";

      case "accepted":
        return "ACCEPTED";

      case "active":
        return "ACCEPTED";

      case "driver_on_way":
        return "ON THE WAY";

      case "driver_arrived":
        return "ARRIVED";

      case "in_progress":
        return "IN PROGRESS";

      case "completed":
        return "COMPLETED";

      case "cancelled":
        return "CANCELLED";

      default:
        return "";
    }
  };

  // =========================
  // NAVIGATION
  // =========================

  const viewRiderRequests = () => {
    navigation.navigate("RiderRequests");
  };

  const editRide = () => {
    navigation.navigate("CreateRideOffer");
  };

  const viewMyRide = () => {
    if (!ride) {
      return;
    }

    navigation.navigate(
      "DriverRideDetails",
      {
        rideId: ride.id,
      },
    );
  };

  const continueToTrip = () => {
    if (!ride) {
      return;
    }

    navigation.navigate(
      "DriverTrip",
      {
        rideId: ride.id,
      },
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.driver}
        />

        <Text style={styles.loadingText}>
          Loading your ride...
        </Text>
      </View>
    );
  }

  // =========================
  // MAIN SCREEN
  // =========================

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.driver}
          />
        }
      >
        {/* =========================
            HEADER
        ========================= */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Active Ride
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your current ride
          </Text>
        </View>

        {/* =========================
            CURRENT RIDE
        ========================= */}

        {ride && displayStatus ? (
          <View style={styles.rideCard}>
            {/* STATUS */}

            <View style={styles.statusHeader}>
              <View style={styles.statusIconContainer}>
                <Text style={styles.statusIcon}>
                  {getStatusIcon(
                    displayStatus,
                  )}
                </Text>
              </View>

              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>
                  {getStatusTitle(
                    displayStatus,
                  )}
                </Text>

                <Text style={styles.statusDescription}>
                  {getStatusDescription(
                    displayStatus,
                  )}
                </Text>
              </View>
            </View>

            {/* STATUS BADGE */}

            <View
              style={[
                styles.statusBadge,
                displayStatus ===
                  "accepted" &&
                  styles.acceptedBadge,
                (displayStatus ===
                  "active" ||
                  displayStatus ===
                    "in_progress") &&
                  styles.inProgressBadge,
                displayStatus ===
                  "starting_soon" &&
                  styles.startingSoonBadge,
              ]}
            >
              <Text
                style={styles.statusBadgeText}
              >
                {getStatusBadgeText(
                  displayStatus,
                )}
              </Text>
            </View>

            {/* ROUTE */}

            <View style={styles.routeCard}>
              <View style={styles.routeRow}>
                <View
                  style={
                    styles.routeDotPickup
                  }
                />

                <View style={styles.routeText}>
                  <Text
                    style={styles.routeLabel}
                  >
                    PICKUP
                  </Text>

                  <Text
                    style={styles.routeValue}
                  >
                    {ride.pickup_location}
                  </Text>
                </View>
              </View>

              <View
                style={styles.routeLine}
              />

              <View style={styles.routeRow}>
                <View
                  style={
                    styles.routeDotDestination
                  }
                />

                <View style={styles.routeText}>
                  <Text
                    style={styles.routeLabel}
                  >
                    DESTINATION
                  </Text>

                  <Text
                    style={styles.routeValue}
                  >
                    {ride.destination}
                  </Text>
                </View>
              </View>
            </View>

            {/* RIDE DETAILS */}

            <View style={styles.detailsCard}>
              <View style={styles.detailItem}>
                <Text
                  style={styles.detailLabel}
                >
                  Date
                </Text>

                <Text
                  style={styles.detailValue}
                >
                  {ride.ride_date}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text
                  style={styles.detailLabel}
                >
                  Departure
                </Text>

                <Text
                  style={styles.detailValue}
                >
                  {ride.departure_time}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text
                  style={styles.detailLabel}
                >
                  Fare
                </Text>

                <Text
                  style={styles.detailValue}
                >
                  R
                  {Number(
                    ride.fare ?? 0,
                  ).toFixed(2)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text
                  style={styles.detailLabel}
                >
                  Seats
                </Text>

                <Text
                  style={styles.detailValue}
                >
                  {ride.available_seats}
                </Text>
              </View>
            </View>

            {/* ALL SEATS BOOKED */}

            {ride.available_seats <= 0 &&
              ride.status ===
                "available" ? (
              <View
                style={
                  styles.informationBox
                }
              >
                <Text
                  style={
                    styles.informationTitle
                  }
                >
                  All Seats Booked
                </Text>

                <Text
                  style={
                    styles.informationText
                  }
                >
                  All available seats for
                  this ride have been booked.
                </Text>
              </View>
            ) : null}

            {/* STARTING SOON */}

            {displayStatus ===
              "starting_soon" ? (
              <View
                style={
                  styles.informationBox
                }
              >
                <Text
                  style={
                    styles.informationTitle
                  }
                >
                  Departure is within 30
                  minutes
                </Text>

                <Text
                  style={
                    styles.informationText
                  }
                >
                  Make sure you are ready
                  for your trip.
                </Text>
              </View>
            ) : null}

            {/* =========================
                AVAILABLE / STARTING SOON
            ========================= */}

            {displayStatus ===
              "available" ||
            displayStatus ===
              "starting_soon" ? (
              <>
                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={
                    viewRiderRequests
                  }
                >
                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    View Rider Requests
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.secondaryButton
                  }
                  onPress={editRide}
                >
                  <Text
                    style={
                      styles.secondaryButtonText
                    }
                  >
                    Edit Ride Details
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}

            {/* =========================
                ACCEPTED
            ========================= */}

            {displayStatus ===
              "accepted" ? (
              <>
                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={viewMyRide}
                >
                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    View My Ride
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.secondaryButton
                  }
                  onPress={
                    continueToTrip
                  }
                >
                  <Text
                    style={
                      styles.secondaryButtonText
                    }
                  >
                    Continue to Trip
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}

            {/* =========================
                TRIP IN PROGRESS
            ========================= */}

            {displayStatus ===
              "active" ||
            displayStatus ===
              "driver_on_way" ||
            displayStatus ===
              "driver_arrived" ||
            displayStatus ===
              "in_progress" ? (
              <>
                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={
                    continueToTrip
                  }
                >
                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Continue to Active Trip
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.secondaryButton
                  }
                  onPress={() =>
                    navigation.navigate(
                      "ChatWithRider",
                      {
                        rideId:
                          ride.id,
                      },
                    )
                  }
                >
                  <Text
                    style={
                      styles.secondaryButtonText
                    }
                  >
                    💬 Chat with Rider
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        ) : (
          /* =========================
             NO CURRENT RIDE
          ========================= */

          <View style={styles.emptyCard}>
            <View
              style={
                styles.emptyIconContainer
              }
            >
              <Text style={styles.emptyIcon}>
                🚗
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No Active Ride
            </Text>

            <Text
              style={styles.emptyDescription}
            >
              You currently don't have an
              active ride offer.
            </Text>

            <TouchableOpacity
              style={
                styles.primaryButton
              }
              onPress={() =>
                navigation.navigate(
                  "CreateRideOffer",
                )
              }
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Create Ride Offer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =========================
            QUICK ACTIONS
        ========================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={
                styles.quickActionCard
              }
              onPress={() =>
                navigation.navigate(
                  "RiderRequests",
                )
              }
            >
              <Text
                style={
                  styles.quickActionIcon
                }
              >
                👥
              </Text>

              <Text
                style={
                  styles.quickActionTitle
                }
              >
                Rider Requests
              </Text>

              <Text
                style={
                  styles.quickActionDescription
                }
              >
                View rider requests
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.quickActionCard
              }
              onPress={() =>
                navigation.navigate(
                  "CreateRideOffer",
                )
              }
            >
              <Text
                style={
                  styles.quickActionIcon
                }
              >
                ➕
              </Text>

              <Text
                style={
                  styles.quickActionTitle
                }
              >
                Create Ride
              </Text>

              <Text
                style={
                  styles.quickActionDescription
                }
              >
                Offer a new ride
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================
            RECENT ACTIVITY
        ========================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Activity
          </Text>

          {recentRides.length > 0 ? (
            recentRides.map(
              (recentRide) => (
                <View
                  key={recentRide.id}
                  style={
                    styles.recentRideCard
                  }
                >
                  <View
                    style={
                      styles.recentRideHeader
                    }
                  >
                    <Text
                      style={
                        styles.recentRideRoute
                      }
                    >
                      {
                        recentRide.pickup_location
                      }{" "}
                      →{" "}
                      {
                        recentRide.destination
                      }
                    </Text>

                    <View
                      style={[
                        styles.recentStatusBadge,
                        recentRide.status ===
                          "completed" &&
                          styles.completedBadge,
                        recentRide.status ===
                          "cancelled" &&
                          styles.cancelledBadge,
                      ]}
                    >
                      <Text
                        style={
                          styles.recentStatusText
                        }
                      >
                        {recentRide.status ===
                        "completed"
                          ? "COMPLETED"
                          : "CANCELLED"}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={
                      styles.recentRideDate
                    }
                  >
                    {recentRide.ride_date} •{" "}
                    {
                      recentRide.departure_time
                    }
                  </Text>

                  <Text
                    style={
                      styles.recentRideFare
                    }
                  >
                    R
                    {Number(
                      recentRide.fare ?? 0,
                    ).toFixed(2)}
                  </Text>
                </View>
              ),
            )
          ) : (
            <View
              style={
                styles.noRecentActivity
              }
            >
              <Text
                style={
                  styles.noRecentActivityText
                }
              >
                No recent rides yet.
              </Text>
            </View>
          )}
        </View>

        {/* =========================
            DRIVER TIP
        ========================= */}

        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>
            💡
          </Text>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Driver Tip
            </Text>

            <Text style={styles.tipText}>
              Keep your ride information
              updated so riders know exactly
              when and where to meet you.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ActiveRideScreen;

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      Colors.background,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color:
      Colors.textSecondary,
  },

  header: {
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.driver,
  },

  headerSubtitle: {
    marginTop: 5,
    fontSize: 15,
    color:
      Colors.textSecondary,
  },

  rideCard: {
    backgroundColor:
      Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor:
      Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  statusIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor:
      Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  statusIcon: {
    fontSize: 25,
  },

  statusTextContainer: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: Colors.driver,
  },

  statusDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color:
      Colors.textSecondary,
  },

  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor:
      Colors.driverLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 18,
  },

  acceptedBadge: {
    backgroundColor:
      Colors.driverLight,
  },

  inProgressBadge: {
    backgroundColor:
      Colors.driverLight,
  },

  startingSoonBadge: {
    backgroundColor:
      "#FFF3CD",
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.driver,
  },

  routeCard: {
    backgroundColor:
      Colors.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  routeDotPickup: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor:
      Colors.driver,
    marginTop: 4,
    marginRight: 12,
  },

  routeDotDestination: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor:
      Colors.success,
    marginTop: 4,
    marginRight: 12,
  },

  routeLine: {
    height: 24,
    width: 2,
    backgroundColor:
      Colors.border,
    marginLeft: 5,
    marginVertical: 2,
  },

  routeText: {
    flex: 1,
  },

  routeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color:
      Colors.textSecondary,
    marginBottom: 3,
  },

  routeValue: {
    fontSize: 15,
    fontWeight: "600",
    color:
      Colors.textPrimary,
  },

  detailsCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor:
      Colors.border,
    paddingTop: 15,
    marginBottom: 15,
  },

  detailItem: {
    width: "50%",
    marginBottom: 15,
  },

  detailLabel: {
    fontSize: 12,
    color:
      Colors.textSecondary,
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color:
      Colors.textPrimary,
  },

  informationBox: {
    backgroundColor:
      Colors.driverLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },

  informationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.driver,
    marginBottom: 4,
  },

  informationText: {
    fontSize: 13,
    lineHeight: 18,
    color:
      Colors.textSecondary,
  },

  primaryButton: {
    backgroundColor:
      Colors.driver,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor:
      Colors.driverLight,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },

  secondaryButtonText: {
    color: Colors.driver,
    fontSize: 15,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor:
      Colors.surface,
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    marginBottom: 24,
  },

  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor:
      Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 32,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.driver,
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    color:
      Colors.textSecondary,
    marginBottom: 15,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.driver,
    marginBottom: 12,
  },

  quickActions: {
    flexDirection: "row",
    gap: 12,
  },

  quickActionCard: {
    flex: 1,
    backgroundColor:
      Colors.surface,
    borderRadius: 14,
    padding: 15,
    minHeight: 130,
    shadowColor:
      Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  quickActionIcon: {
    fontSize: 25,
    marginBottom: 10,
  },

  quickActionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.driver,
    marginBottom: 4,
  },

  quickActionDescription: {
    fontSize: 12,
    lineHeight: 17,
    color:
      Colors.textSecondary,
  },

  recentRideCard: {
    backgroundColor:
      Colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },

  recentRideHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  recentRideRoute: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color:
      Colors.textPrimary,
    marginRight: 10,
  },

  recentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor:
      Colors.driverLight,
  },

  completedBadge: {
    backgroundColor:
      "#DCFCE7",
  },

  cancelledBadge: {
    backgroundColor:
      "#FEE2E2",
  },

  recentStatusText: {
    fontSize: 9,
    fontWeight: "700",
    color:
      Colors.textPrimary,
  },

  recentRideDate: {
    marginTop: 8,
    fontSize: 12,
    color:
      Colors.textSecondary,
  },

  recentRideFare: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.driver,
  },

  noRecentActivity: {
    backgroundColor:
      Colors.surface,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },

  noRecentActivityText: {
    fontSize: 14,
    color:
      Colors.textSecondary,
  },

  tipCard: {
    flexDirection: "row",
    backgroundColor:
      Colors.driverLight,
    borderRadius: 14,
    padding: 15,
    marginTop: 5,
  },

  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.driver,
    marginBottom: 4,
  },

  tipText: {
    fontSize: 13,
    lineHeight: 19,
    color:
      Colors.textSecondary,
  },
});