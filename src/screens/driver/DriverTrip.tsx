import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import * as Location from "expo-location";

import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import RideMap from "../../components/RideMap";
import Colors from "../../constants/colors";
import { supabase } from "../../lib/supabaseClient";
import { RootStackParamList } from "../../navigation/AppNavigator";

type DriverTripRouteProp = RouteProp<RootStackParamList, "DriverTrip">;
type DriverTripNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type RideStatus =
  | "available"
  | "accepted"
  | "active"
  | "driver_on_way"
  | "driver_arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

type Ride = {
  id: string;
  driver_id: string;
  rider_id?: string | null;
  pickup_location: string;
  destination: string;
  departure_time: string;
  ride_date: string;
  available_seats: number;
  fare: number;
  notes?: string | null;
  status: RideStatus;
  started_at?: string | null;
  completed_at?: string | null;
};

type Rider = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
};

export default function DriverTripScreen() {
  const navigation = useNavigation<DriverTripNavigationProp>();
  const route = useRoute<DriverTripRouteProp>();
  const { rideId } = route.params;

  const [ride, setRide] = useState<Ride | null>(null);
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const locationSyncUnavailableRef = useRef(false);

  // ==========================================================
  // LOAD RIDE + CONFIRMED RIDER
  // ==========================================================

  const loadRide = async () => {
    try {
      setLoading(true);

      const { data: rideData, error: rideError } = await supabase
        .from("rides")
        .select(`
          id,
          driver_id,
          rider_id,
          pickup_location,
          destination,
          departure_time,
          ride_date,
          available_seats,
          fare,
          notes,
          status,
          started_at,
          completed_at
        `)
        .eq("id", rideId)
        .maybeSingle();

      if (rideError) {
        throw new Error(rideError.message);
      }

      if (!rideData) {
        Alert.alert("Ride Not Found", "This ride could not be found.");
        navigation.navigate("DriverHome");
        return;
      }

      setRide(rideData as Ride);

      // Prefer a confirmed booking. Falling back to ride.rider_id keeps
      // compatibility with the existing database shape.
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("rider_id")
        .eq("ride_id", rideId)
        .in("status", ["confirmed", "completed"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bookingError) {
        console.error("Confirmed booking lookup error:", bookingError.message);
      }

      const riderId = bookingData?.rider_id || rideData.rider_id;

      if (!riderId) {
        setRider(null);
        return;
      }

      const { data: riderData, error: riderError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone_number")
        .eq("id", riderId)
        .maybeSingle();

      if (riderError) {
        console.error("Rider profile error:", riderError.message);
        return;
      }

      setRider(riderData || null);
    } catch (error) {
      console.error("Load driver trip error:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Something went wrong while loading the trip.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRide();
  }, [rideId]);

  // Keep this screen synchronised if the ride is changed elsewhere.
  useEffect(() => {
    const channel = supabase
      .channel(`driver-trip-${rideId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rides",
          filter: `id=eq.${rideId}`,
        },
        (payload) => {
          setRide((current) =>
            current
              ? {
                  ...current,
                  ...(payload.new as Partial<Ride>),
                }
              : current,
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId]);

  // ==========================================================
  // OPTIONAL LIVE DRIVER GPS SYNC
  // ==========================================================
  // The app continues to work without the driver_locations table; the
  // included Supabase SQL file enables true live driver movement on the
  // rider Track Driver map.

  useEffect(() => {
    if (!ride) {
      return;
    }

    const shouldShareLocation = [
      "driver_on_way",
      "driver_arrived",
      "in_progress",
    ].includes(ride.status);

    if (!shouldShareLocation || locationSyncUnavailableRef.current) {
      return;
    }

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    const publishLocation = async (location: Location.LocationObject) => {
      if (cancelled || locationSyncUnavailableRef.current) {
        return;
      }

      const { error } = await supabase
        .from("driver_locations")
        .upsert(
          {
            ride_id: ride.id,
            driver_id: ride.driver_id,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: Number.isFinite(location.coords.heading)
              ? location.coords.heading
              : null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "ride_id",
          },
        );

      if (error) {
        // Missing-table/schema-cache errors should never crash the driver.
        console.warn("Live driver location is unavailable:", error.message);
        locationSyncUnavailableRef.current = true;
        subscription?.remove();
        subscription = null;
      }
    };

    const startSharing = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== Location.PermissionStatus.GRANTED) {
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            void publishLocation(location);
          },
        );
      } catch (error) {
        console.warn("Driver location sharing could not start:", error);
      }
    };

    void startSharing();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [ride?.id, ride?.driver_id, ride?.status]);

  // Remove the final live location when the trip ends.
  useEffect(() => {
    if (!ride || ride.status !== "completed" || locationSyncUnavailableRef.current) {
      return;
    }

    void supabase
      .from("driver_locations")
      .delete()
      .eq("ride_id", ride.id)
      .then(({ error }) => {
        if (error) {
          console.warn("Driver location cleanup skipped:", error.message);
          locationSyncUnavailableRef.current = true;
        }
      });
  }, [ride?.status]);

  // ==========================================================
  // STATUS UPDATE
  // ==========================================================

  const updateRideStatus = async (
    expectedStatus: RideStatus | RideStatus[],
    nextStatus: RideStatus,
    options?: {
      startedAt?: string;
      completedAt?: string;
    },
  ) => {
    if (!ride) {
      return false;
    }

    const allowed = Array.isArray(expectedStatus)
      ? expectedStatus
      : [expectedStatus];

    if (!allowed.includes(ride.status)) {
      Alert.alert(
        "Trip Stage Changed",
        "The trip is no longer at the expected stage. Refresh the screen and try again.",
      );
      return false;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Authentication Error", "No logged-in driver was found.");
        return false;
      }

      if (user.id !== ride.driver_id) {
        Alert.alert("Not Allowed", "You are not the driver of this ride.");
        return false;
      }

      const updatePayload: Record<string, string> = {
        status: nextStatus,
      };

      if (options?.startedAt) {
        updatePayload.started_at = options.startedAt;
      }

      if (options?.completedAt) {
        updatePayload.completed_at = options.completedAt;
      }

      let query = supabase
        .from("rides")
        .update(updatePayload)
        .eq("id", ride.id)
        .eq("driver_id", user.id);

      // Prevent a stale button press from skipping stages in the database.
      if (allowed.length === 1) {
        query = query.eq("status", allowed[0]);
      } else {
        query = query.in("status", allowed);
      }

      const { data, error } = await query
        .select("id, status, started_at, completed_at")
        .maybeSingle();

      if (error) {
        Alert.alert("Update Failed", error.message);
        return false;
      }

      if (!data) {
        await loadRide();
        Alert.alert(
          "Trip Updated Elsewhere",
          "The trip changed before this action completed. The latest status has been loaded.",
        );
        return false;
      }

      setRide((current) =>
        current
          ? {
              ...current,
              status: data.status as RideStatus,
              started_at: data.started_at ?? current.started_at,
              completed_at: data.completed_at ?? current.completed_at,
            }
          : current,
      );

      return true;
    } catch (error) {
      console.error("Ride status update error:", error);
      Alert.alert(
        "Error",
        "Something went wrong while updating the ride status.",
      );
      return false;
    }
  };

  const runStatusAction = async (action: () => Promise<boolean>) => {
    if (updatingStatus) {
      return false;
    }

    setUpdatingStatus(true);
    try {
      return await action();
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Start Trip / On the Way
  const startRide = async () => {
    const updated = await runStatusAction(() =>
      updateRideStatus(["accepted", "active"], "driver_on_way"),
    );

    if (updated) {
      Alert.alert(
        "On the Way",
        "The rider can now see that you are travelling to the pickup location.",
      );
    }
  };

  // Arrived at Rider
  const markArrived = async () => {
    const updated = await runStatusAction(() =>
      updateRideStatus("driver_on_way", "driver_arrived"),
    );

    if (updated) {
      Alert.alert(
        "Arrival Confirmed",
        "The rider has been notified that you have arrived.",
      );
    }
  };

  // Pick Up / Start Ride
  const startTrip = async () => {
    const updated = await runStatusAction(() =>
      updateRideStatus("driver_arrived", "in_progress", {
        startedAt: new Date().toISOString(),
      }),
    );

    if (updated) {
      Alert.alert("Trip Started", "The rider can now see that the trip is in progress.");
    }
  };

  // End Trip
  const endRide = async () => {
    const updated = await runStatusAction(() =>
      updateRideStatus("in_progress", "completed", {
        completedAt: new Date().toISOString(),
      }),
    );

    if (!updated || !ride) {
      return;
    }

    // Keep booking history in sync with the completed ride. This also allows
    // BookingConfirmed/other rider listeners to recognise completion.
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("ride_id", ride.id)
      .eq("status", "confirmed");

    if (bookingError) {
      console.error("Booking completion sync error:", bookingError.message);
    }

    // Cash stays pending while the request is awaiting the driver. Once the
    // completed ride finishes, any remaining pending payment is finalised.
    const { error: paymentError } = await supabase
      .from("payments")
      .update({ status: "paid" })
      .eq("ride_id", ride.id)
      .eq("status", "pending");

    if (paymentError) {
      console.error("Payment completion sync error:", paymentError.message);
    }

    Alert.alert(
      "Trip Completed",
      "The rider's app will show the completed-trip receipt and review option.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("DriverHome", { screen: "Past Trips" }),
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.driver} />
        <Text style={styles.loadingText}>Loading ride...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Ride not found.</Text>
      </View>
    );
  }

  const rideOnWay = ride.status === "driver_on_way";
  const driverArrived = ride.status === "driver_arrived";
  const rideInProgress = ride.status === "in_progress";
  const rideCompleted = ride.status === "completed";
  const canStart = ride.status === "accepted" || ride.status === "active";

  const statusLabel: Record<RideStatus, string> = {
    available: "Waiting for Rider",
    accepted: "Rider Accepted",
    active: "Ready to Start",
    driver_on_way: "On the Way to Rider",
    driver_arrived: "Arrived at Rider",
    in_progress: "Trip in Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <View style={styles.container}>
      {/* =====================================================
          MAP
      ===================================================== */}
      <View style={styles.mapContainer}>
        <RideMap
          pickup={ride.pickup_location}
          destination={ride.destination}
          showCurrentLocation
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.mapStatusPill}>
          <Text style={styles.mapStatusText}>{statusLabel[ride.status]}</Text>
        </View>
      </View>

      {/* =====================================================
          SLIDE-UP STYLE INFORMATION PANEL
      ===================================================== */}
      <ScrollView
        style={styles.panel}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dragHandle} />

        <Text style={styles.title}>
          {rideCompleted
            ? "Trip Completed"
            : rideInProgress
              ? "Trip In Progress"
              : driverArrived
                ? "Pick Up Rider"
                : rideOnWay
                  ? "Heading to Rider"
                  : "Trip Information"}
        </Text>

        <Text style={styles.subtitle}>
          Move through each stage in order. The rider side updates from the same live ride status.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.value}>{ride.pickup_location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Destination</Text>
            <Text style={styles.value}>{ride.destination}</Text>
          </View>
          <View style={styles.detailGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{ride.ride_date}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Departure</Text>
              <Text style={styles.value}>{ride.departure_time}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Fare</Text>
              <Text style={styles.value}>R{Number(ride.fare).toFixed(2)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Seats Left</Text>
              <Text style={styles.value}>{ride.available_seats}</Text>
            </View>
          </View>
        </View>

        {rider && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Rider</Text>
            <Text style={styles.riderName}>
              {[rider.first_name, rider.last_name].filter(Boolean).join(" ") || "Rider"}
            </Text>
            {rider.phone_number ? (
              <Text style={styles.phone}>{rider.phone_number}</Text>
            ) : null}
          </View>
        )}

        {rider && !rideCompleted && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              navigation.navigate("ChatWithRider", {
                rideId: ride.id,
              })
            }
          >
            <Text style={styles.chatButtonText}>Chat with Rider</Text>
          </TouchableOpacity>
        )}

        {canStart && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startRide}
            disabled={updatingStatus}
          >
            {updatingStatus ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Start Trip / On the Way</Text>
            )}
          </TouchableOpacity>
        )}

        {rideOnWay && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={markArrived}
            disabled={updatingStatus}
          >
            {updatingStatus ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Arrived at Rider</Text>
            )}
          </TouchableOpacity>
        )}

        {driverArrived && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startTrip}
            disabled={updatingStatus}
          >
            {updatingStatus ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Pick Up / Start Ride</Text>
            )}
          </TouchableOpacity>
        )}

        {rideInProgress && (
          <TouchableOpacity
            style={styles.endButton}
            onPress={endRide}
            disabled={updatingStatus}
          >
            {updatingStatus ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>End Trip</Text>
            )}
          </TouchableOpacity>
        )}

        {ride.status === "available" && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>No accepted rider yet</Text>
            <Text style={styles.warningText}>
              Accept a rider request from Activity before starting this trip.
            </Text>
          </View>
        )}

        {rideCompleted && (
          <View style={styles.completedCard}>
            <Text style={styles.completedTitle}>Ride Completed</Text>
            <Text style={styles.completedText}>
              This trip is now stored in Past Trips. The rider will receive the completion state and review flow.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  mapContainer: {
    height: 330,
    position: "relative",
    backgroundColor: "#E5E7EB",
  },
  backButton: {
    position: "absolute",
    top: 18,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  backButtonText: {
    fontSize: 34,
    lineHeight: 36,
    color: Colors.driver,
    marginTop: -4,
  },
  mapStatusPill: {
    position: "absolute",
    top: 22,
    right: 18,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    elevation: 4,
  },
  mapStatusText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.driver,
  },
  panel: {
    flex: 1,
    marginTop: -22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#F7F7F7",
  },
  contentContainer: {
    paddingHorizontal: 22,
    paddingBottom: 42,
  },
  dragHandle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    marginTop: 10,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: "#777",
  },
  errorText: {
    fontSize: 18,
    color: "#777",
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#222",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
    marginBottom: 14,
  },
  detailRow: {
    marginBottom: 13,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: 5,
    marginTop: 10,
  },
  label: {
    fontSize: 12,
    color: "#888",
    marginBottom: 3,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  value: {
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
  },
  riderName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  phone: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  chatButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.driver,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  chatButtonText: {
    color: Colors.driver,
    fontSize: 16,
    fontWeight: "800",
  },
  startButton: {
    backgroundColor: Colors.driver,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  endButton: {
    backgroundColor: "#D9534F",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  warningCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  warningTitle: {
    color: "#9A3412",
    fontSize: 15,
    fontWeight: "800",
  },
  warningText: {
    color: "#9A3412",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  completedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#777",
    textAlign: "center",
  },
});
