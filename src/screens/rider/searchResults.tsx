import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import { supabase } from "../../lib/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "SearchResults"
  >;

type SearchResultsRouteProp =
  RouteProp<
    RootStackParamList,
    "SearchResults"
  >;

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

  driverName: string;
  vehicle: string;

  similarity: number;
};

export default function SearchResultsScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const route =
    useRoute<SearchResultsRouteProp>();

  // ==========================================
  // GET SEARCH VALUES FROM RIDER HOME
  // ==========================================

  const {
    pickup,
    destination,
    date,
    time,
    passengers,
  } = route.params;

  console.log("SEARCH RESULTS RECEIVED:", {
    pickup,
    destination,
    date,
    time,
    passengers,
  });

  // ==========================================
  // STATE
  // ==========================================

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD RIDES FROM SUPABASE
  // ==========================================
useEffect(() => {
  loadRides();

  const channel = supabase
    .channel("rides-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rides",
      },
      (payload) => {
        console.log(
          "RIDE REALTIME UPDATE:",
          payload.eventType,
          payload
        );

        loadRides();
      }
    )
    .subscribe((status) => {
      console.log(
        "RIDE REALTIME STATUS:",
        status
      );
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const loadRides = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("LOADING RIDES FROM SUPABASE...");

      const {
        data,
        error: ridesError,
      } = await supabase
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
          status
        `)
        .order("created_at", {
          ascending: false,
        });

      if (ridesError) {
        console.log(
          "SUPABASE RIDE ERROR:",
          ridesError
        );

        setError(ridesError.message);
        return;
      }

      console.log(
        "RIDES FROM SUPABASE:",
        data
      );

      if (!data || data.length === 0) {
        console.log("NO RIDES FOUND");

        setRides([]);
        return;
      }

      // ==========================================
      // GET DRIVER NAMES
      // ==========================================

      const driverIds = [
        ...new Set(
          data.map(
            (ride) => ride.driver_id
          )
        ),
      ];

      const {
        data: profiles,
        error: profilesError,
      } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", driverIds);

      if (profilesError) {
        console.log(
          "PROFILE ERROR:",
          profilesError
        );
      }

      // ==========================================
      // FORMAT RIDES
      // ==========================================

      const formattedRides: Ride[] =
        data.map((ride) => {
          const driver =
            profiles?.find(
              (profile) =>
                profile.id ===
                ride.driver_id
            );

          const driverName =
            driver
              ? `${driver.first_name || ""} ${
                  driver.last_name || ""
                }`.trim()
              : "Driver";

          return {
            ...ride,

            available_seats:
              Number(
                ride.available_seats
              ),

            fare:
              Number(ride.fare),

            driverName,

            vehicle: "Vehicle",

            similarity: 0,
          };
        });

      console.log(
        "FORMATTED RIDES:",
        formattedRides
      );

      setRides(formattedRides);
    } catch (err) {
      console.log(
        "LOAD RIDES ERROR:",
        err
      );

      setError(
        "Something went wrong while loading rides."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // TEXT SIMILARITY
  // ==========================================

  const normaliseText = (
    value: string
  ) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "");
  };

  const calculateTextSimilarity = (
    searchValue: string,
    rideValue: string
  ) => {
    if (!searchValue.trim()) {
      return 0;
    }

    if (!rideValue.trim()) {
      return 0;
    }

    const search =
      normaliseText(searchValue);

    const ride =
      normaliseText(rideValue);

    // Exact match
    if (search === ride) {
      return 100;
    }

    // One contains the other
    if (
      ride.includes(search) ||
      search.includes(ride)
    ) {
      return 90;
    }

    const searchWords =
      search.split(/\s+/);

    const rideWords =
      ride.split(/\s+/);

    let matches = 0;

    searchWords.forEach(
      (searchWord) => {
        const found =
          rideWords.some(
            (rideWord) =>
              rideWord.includes(
                searchWord
              ) ||
              searchWord.includes(
                rideWord
              )
          );

        if (found) {
          matches++;
        }
      }
    );

    if (searchWords.length === 0) {
      return 0;
    }

    return Math.round(
      (matches /
        searchWords.length) *
        80
    );
  };

  // ==========================================
  // DATE SIMILARITY
  // ==========================================

  const calculateDateSimilarity = (
    searchDate: string,
    rideDate: string
  ) => {
    if (!searchDate.trim()) {
      return 0;
    }

    if (!rideDate) {
      return 0;
    }

    if (
      searchDate.trim() ===
      rideDate.trim()
    ) {
      return 100;
    }

    return 0;
  };

  // ==========================================
  // TIME SIMILARITY
  // ==========================================

  const calculateTimeSimilarity = (
    searchTime: string,
    rideTime: string
  ) => {
    if (!searchTime.trim()) {
      return 0;
    }

    if (!rideTime) {
      return 0;
    }

    if (
      searchTime.trim() ===
      rideTime.trim()
    ) {
      return 100;
    }

    return 0;
  };

  // ==========================================
  // PASSENGER SIMILARITY
  // ==========================================

  const calculatePassengerSimilarity = (
    searchPassengers: string,
    availableSeats: number
  ) => {
    if (!searchPassengers.trim()) {
      return 0;
    }

    const requested =
      Number(searchPassengers);

    if (
      !requested ||
      requested <= 0
    ) {
      return 0;
    }

    if (
      availableSeats >= requested
    ) {
      return 100;
    }

    return Math.max(
      0,
      Math.round(
        (availableSeats /
          requested) *
          100
      )
    );
  };

  // ==========================================
  // CALCULATE MATCH
  // ==========================================

  const calculateSimilarity = (
    ride: Ride
  ) => {
    const scores: {
      score: number;
      weight: number;
    }[] = [];

    if (pickup.trim()) {
      scores.push({
        score:
          calculateTextSimilarity(
            pickup,
            ride.pickup_location
          ),
        weight: 30,
      });
    }

    if (destination.trim()) {
      scores.push({
        score:
          calculateTextSimilarity(
            destination,
            ride.destination
          ),
        weight: 30,
      });
    }

    if (date.trim()) {
      scores.push({
        score:
          calculateDateSimilarity(
            date,
            ride.ride_date
          ),
        weight: 15,
      });
    }

    if (time.trim()) {
      scores.push({
        score:
          calculateTimeSimilarity(
            time,
            ride.departure_time
          ),
        weight: 15,
      });
    }

    if (passengers.trim()) {
      scores.push({
        score:
          calculatePassengerSimilarity(
            passengers,
            ride.available_seats
          ),
        weight: 10,
      });
    }

    if (scores.length === 0) {
      return 0;
    }

    const totalWeight =
      scores.reduce(
        (total, item) =>
          total + item.weight,
        0
      );

    const totalScore =
      scores.reduce(
        (total, item) =>
          total +
          item.score *
            item.weight,
        0
      );

    return Math.round(
      totalScore /
        totalWeight
    );
  };

  // ==========================================
  // APPLY MATCHING TO RIDES
  // ==========================================

  const matchedRides =
    useMemo(() => {
      return rides
        .map((ride) => ({
          ...ride,
          similarity:
            calculateSimilarity(
              ride
            ),
        }))
        .sort(
          (a, b) =>
            b.similarity -
            a.similarity
        );
    }, [
      rides,
      pickup,
      destination,
      date,
      time,
      passengers,
    ]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.center}
        >
          <ActivityIndicator
            size="large"
            color={Colors.rider}
          />

          <Text
            style={styles.loadingText}
          >
            Finding available rides...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.center}
        >
          <Text
            style={styles.errorText}
          >
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadRides}
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // DISPLAY RESULTS
  // ==========================================

  return (
   <SafeAreaView style={styles.container}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >

      {/* Back Button */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={26}
          color={Colors.primary}
        />
      </TouchableOpacity>
        
        <View style={styles.header}>
          <Text
            style={styles.heading}
          >
            Search Results
          </Text>

          <Text
            style={styles.subHeading}
          >
            Rides matching your search
          </Text>
        </View>

        {/* SEARCH VALUES */}

        <View
          style={styles.searchSummary}
        >
          <Text
            style={
              styles.searchSummaryTitle
            }
          >
            Your Search
          </Text>

          <Text
            style={styles.searchText}
          >
            Pickup: {pickup || "Any"}
          </Text>

          <Text
            style={styles.searchText}
          >
            Destination:{" "}
            {destination || "Any"}
          </Text>

          <Text
            style={styles.searchText}
          >
            Date: {date || "Any"}
          </Text>

          <Text
            style={styles.searchText}
          >
            Time: {time || "Any"}
          </Text>

          <Text
            style={styles.searchText}
          >
            Passengers:{" "}
            {passengers || "Any"}
          </Text>
        </View>

        {/* NO RIDES */}

        {matchedRides.length === 0 ? (
          <View
            style={styles.emptyContainer}
          >
            <Text
              style={styles.emptyTitle}
            >
              No rides available
            </Text>

            <Text
              style={styles.emptyText}
            >
              There are currently no
              rides available.
            </Text>
          </View>
        ) : (
          matchedRides.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              style={styles.rideCard}
              onPress={() =>
                navigation.navigate(
                  "RideDetails",
                  {
                    ride,
                  }
                )
              }
            >
              <View
                style={styles.matchContainer}
              >
                <Text
                  style={styles.matchText}
                >
                  {ride.similarity}%
                  Match
                </Text>
              </View>

              <Text
                style={styles.driverName}
              >
                {ride.driverName}
              </Text>

              <Text
                style={styles.route}
              >
                {ride.pickup_location}
              </Text>

              <Text
                style={styles.route}
              >
                → {ride.destination}
              </Text>

              <View
                style={styles.infoRow}
              >
                <Text
                  style={styles.infoText}
                >
                  Date:{" "}
                  {ride.ride_date}
                </Text>

                <Text
                  style={styles.infoText}
                >
                  Time:{" "}
                  {ride.departure_time}
                </Text>
              </View>

              <View
                style={styles.infoRow}
              >
                <Text
                  style={styles.infoText}
                >
                  Seats:{" "}
                  {ride.available_seats}
                </Text>

                <Text
                  style={styles.fare}
                >
                  R{ride.fare}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.textSecondary,
  },

  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: Colors.rider,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryButtonText: {
    color: Colors.white,
    fontWeight: "700",
  },

  header: {
    marginBottom: 15,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },

  subHeading: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 5,
  },

  searchSummary: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E6EAF0",
  },

  searchSummaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },

  searchText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  rideCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E6EAF0",
    elevation: 3,
  },

  matchContainer: {
    alignSelf: "flex-start",
    backgroundColor: Colors.rider,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },

  matchText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },

  driverName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 10,
  },

  route: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  fare: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.rider,
  },
  backButton: {
  width: 45,
  height: 45,
  borderRadius: 23,
  backgroundColor: Colors.white,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 15,
  elevation: 3,
},
});