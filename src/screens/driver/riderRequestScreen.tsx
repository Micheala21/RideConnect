import React, {
  useEffect,
  useState,
} from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import Colors from "../../constants/colors";

import {
  supabase,
} from "../../lib/supabaseClient";


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


type RiderRequest = {

  id: string;

  name: string;

  pickup: string;

  destination: string;

  pickupTime: string;

  distance: string;

  routeMatch: string;

  passengers: number;

  gender: string;

  offer: string;

};


export default function RiderRequestsScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  const [
    riders,
    setRiders,
  ] =
    useState<RiderRequest[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  // =====================================================
  // LOAD DRIVER BOOKINGS
  // =====================================================

  const loadBookings = async () => {

    try {

      setLoading(true);


      // ================================================
      // GET CURRENT DRIVER
      // ================================================

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();


      if (
        userError ||
        !user
      ) {

        console.error(
          "Unable to get driver:",
          userError?.message
        );

        setLoading(false);

        return;
      }


      // ================================================
      // GET PENDING BOOKINGS FOR THIS DRIVER
      // ================================================

      const {
        data: bookings,
        error: bookingError,
      } =
        await supabase
          .from("bookings")
          .select(`
            id,
            ride_id,
            rider_id,
            driver_id,
            seats_booked,
            amount,
            status
          `)
          .eq(
            "driver_id",
            user.id
          )
          .eq(
            "status",
            "pending"
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );


      if (bookingError) {

        console.error(
          "Booking loading error:",
          bookingError.message
        );

        Alert.alert(
          "Error",
          "Unable to load rider requests."
        );

        setLoading(false);

        return;
      }


      if (!bookings) {

        setRiders([]);

        setLoading(false);

        return;
      }


      // ================================================
      // GET RIDER + RIDE INFORMATION
      // ================================================

      const formattedRequests:
        RiderRequest[] = [];


      for (
        const booking of bookings
      ) {

        // ----------------------------------------------
        // GET RIDER PROFILE
        // ----------------------------------------------

        const {
          data: riderProfile,
        } =
          await supabase
            .from("profiles")
            .select(`
              first_name,
              last_name
            `)
            .eq(
              "id",
              booking.rider_id
            )
            .maybeSingle();


        // ----------------------------------------------
        // GET RIDE
        // ----------------------------------------------

        const {
          data: ride,
        } =
          await supabase
            .from("rides")
            .select(`
              pickup_location,
              destination,
              ride_date,
              departure_time,
              fare
            `)
            .eq(
              "id",
              booking.ride_id
            )
            .maybeSingle();


        const riderName =
          [
            riderProfile?.first_name,
            riderProfile?.last_name,
          ]
            .filter(Boolean)
            .join(" ") ||
          "Rider";


        formattedRequests.push({

          id:
            booking.id,

          name:
            riderName,

          pickup:
            ride?.pickup_location ||
            "Unknown pickup",

          destination:
            ride?.destination ||
            "Unknown destination",

          pickupTime:
            ride?.departure_time ||
            "Not specified",

          distance:
            "—",

          routeMatch:
            "—",

          passengers:
            Number(
              booking.seats_booked ||
              1
            ),

          gender:
            "—",

          offer:
            `R${Number(
              booking.amount || 0
            ).toFixed(0)}`,

        });

      }


      setRiders(
        formattedRequests
      );


    } catch (error) {

      console.error(
        "Load bookings error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // REALTIME BOOKING UPDATES
  // =====================================================

  useEffect(() => {

    let channel:
      ReturnType<
        typeof supabase.channel
      > | null = null;


    const setupRealtime =
      async () => {

        // ----------------------------------------------
        // GET CURRENT DRIVER
        // ----------------------------------------------

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();


        if (!user) {

          console.error(
            "No logged-in driver found."
          );

          setLoading(false);

          return;
        }


        // ----------------------------------------------
        // LOAD EXISTING PENDING BOOKINGS
        // ----------------------------------------------

        await loadBookings();


        // =================================================
        // CREATE REALTIME CHANNEL
        // =================================================

        channel =
          supabase
            .channel(
              `driver-bookings-${user.id}`
            )


            // =============================================
            // NEW BOOKING
            // =============================================

            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "bookings",
                filter:
                  `driver_id=eq.${user.id}`,
              },
              async (payload) => {

                console.log(
                  "NEW BOOKING RECEIVED:",
                  payload.new
                );


                const booking =
                  payload.new as {
                    id: string;
                    ride_id: string;
                    rider_id: string;
                    driver_id: string;
                    seats_booked: number;
                    amount: number;
                    status: string;
                  };


                // Only show pending bookings

                if (
                  booking.status !==
                  "pending"
                ) {

                  return;

                }


                // ----------------------------------------
                // GET RIDER PROFILE
                // ----------------------------------------

                const {
                  data: riderProfile,
                } =
                  await supabase
                    .from("profiles")
                    .select(`
                      first_name,
                      last_name
                    `)
                    .eq(
                      "id",
                      booking.rider_id
                    )
                    .maybeSingle();


                // ----------------------------------------
                // GET RIDE
                // ----------------------------------------

                const {
                  data: ride,
                } =
                  await supabase
                    .from("rides")
                    .select(`
                      pickup_location,
                      destination,
                      departure_time,
                      fare
                    `)
                    .eq(
                      "id",
                      booking.ride_id
                    )
                    .maybeSingle();


                const riderName =
                  [
                    riderProfile?.first_name,
                    riderProfile?.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  "Rider";


                const newRequest:
                  RiderRequest = {

                  id:
                    booking.id,

                  name:
                    riderName,

                  pickup:
                    ride?.pickup_location ||
                    "Unknown pickup",

                  destination:
                    ride?.destination ||
                    "Unknown destination",

                  pickupTime:
                    ride?.departure_time ||
                    "Not specified",

                  distance:
                    "—",

                  routeMatch:
                    "—",

                  passengers:
                    Number(
                      booking.seats_booked ||
                      1
                    ),

                  gender:
                    "—",

                  offer:
                    `R${Number(
                      booking.amount || 0
                    ).toFixed(0)}`,

                };


                // ----------------------------------------
                // ADD NEW REQUEST
                // ----------------------------------------

                setRiders(
                  current =>
                    [
                      newRequest,
                      ...current.filter(
                        rider =>
                          rider.id !==
                          newRequest.id
                      ),
                    ]
                );


                Alert.alert(
                  "New Rider Request",
                  `${riderName} has booked a ride.`
                );

              }
            )


            // =============================================
            // BOOKING STATUS CHANGED
            // =============================================

            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "bookings",
                filter:
                  `driver_id=eq.${user.id}`,
              },
              (payload) => {

                console.log(
                  "BOOKING STATUS UPDATED:",
                  payload.new
                );


                const updatedBooking =
                  payload.new as {
                    id: string;
                    status: string;
                  };


                // ----------------------------------------
                // REMOVE REQUEST WHEN NO LONGER PENDING
                // ----------------------------------------

                if (
                  updatedBooking.status !==
                  "pending"
                ) {

                  setRiders(
                    current =>
                      current.filter(
                        rider =>
                          rider.id !==
                          updatedBooking.id
                      )
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

      };


    setupRealtime();


    // ===================================================
    // CLEAN UP REALTIME CHANNEL
    // ===================================================

    return () => {

      if (channel) {

        supabase.removeChannel(
          channel
        );

      }

    };

  }, []);


  // =====================================================
  // SCREEN
  // =====================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* ================= BACK BUTTON ================= */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate(
              "DriverHome"
            )
          }
          activeOpacity={0.7}
        >

          <Ionicons
            name="arrow-back"
            size={28}
            color={Colors.primary}
          />

        </TouchableOpacity>


        {/* ================= HEADER ================= */}

        <Text
          style={styles.heading}
        >
          Rider Requests
        </Text>


        <Text
          style={styles.subtitle}
        >
          Passengers looking for available rides
        </Text>


        {/* ================= LOADING ================= */}

        {loading && (

          <Text
            style={styles.emptyText}
          >
            Loading rider requests...
          </Text>

        )}


        {/* ================= EMPTY ================= */}

        {!loading &&
          riders.length === 0 && (

            <Text
              style={styles.emptyText}
            >
              No rider requests yet.
            </Text>

          )}


        {/* ================= RIDER REQUESTS ================= */}

        {
          riders.map(
            rider => (

              <TouchableOpacity
                key={rider.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate(
                    "RiderRequestDetails",
                    {
                      rider: rider,
                    }
                  )
                }
              >

                <Text
                  style={styles.name}
                >
                  {rider.name}
                </Text>


                <Text
                  style={styles.route}
                >
                  📍 {rider.pickup}
                </Text>


                <Text
                  style={styles.route}
                >
                  🏁 {rider.destination}
                </Text>


                <View
                  style={styles.infoRow}
                >

                  <Text
                    style={styles.label}
                  >
                    Pickup Time
                  </Text>

                  <Text
                    style={styles.value}
                  >
                    {rider.pickupTime}
                  </Text>

                </View>


                <View
                  style={styles.infoRow}
                >

                  <Text
                    style={styles.label}
                  >
                    Distance
                  </Text>

                  <Text
                    style={styles.value}
                  >
                    {rider.distance}
                  </Text>

                </View>


                <View
                  style={styles.infoRow}
                >

                  <Text
                    style={styles.label}
                  >
                    Passengers
                  </Text>

                  <Text
                    style={styles.value}
                  >
                    {rider.passengers}
                  </Text>

                </View>


                <View
                  style={styles.infoRow}
                >

                  <Text
                    style={styles.label}
                  >
                    Route Match
                  </Text>

                  <Text
                    style={styles.value}
                  >
                    {rider.routeMatch}
                  </Text>

                </View>


                <Text
                  style={styles.offer}
                >
                  {rider.offer}
                </Text>


                <View
                  style={styles.button}
                >

                  <Text
                    style={styles.buttonText}
                  >
                    View Request
                  </Text>

                </View>


              </TouchableOpacity>

            )
          )
        }

      </ScrollView>

    </SafeAreaView>

  );

}


const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },


    content: {
      padding: 22,
      paddingBottom: 40,
    },


    /* ================= BACK BUTTON ================= */

    backButton: {
      width: 45,
      height: 45,
      borderRadius: 23,
      backgroundColor:
        Colors.white,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 10,
      elevation: 3,
    },


    /* ================= HEADER ================= */

    heading: {
      fontSize: 28,
      fontWeight: "700",
      color: Colors.primary,
      marginTop: 5,
    },


    subtitle: {
      color:
        Colors.textSecondary,
      marginTop: 5,
      marginBottom: 25,
      fontSize: 15,
    },


    /* ================= RIDER CARD ================= */

    card: {
      backgroundColor:
        Colors.white,
      borderRadius: 20,
      padding: 20,
      marginBottom: 18,
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },


    name: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors.primary,
      marginBottom: 10,
    },


    route: {
      fontSize: 15,
      color:
        Colors.textSecondary,
      marginBottom: 8,
    },


    infoRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 8,
    },


    label: {
      fontSize: 14,
      color:
        Colors.textSecondary,
    },


    value: {
      fontSize: 15,
      fontWeight: "600",
      color: Colors.primary,
    },


    offer: {
      fontSize: 22,
      fontWeight: "700",
      color: Colors.driver,
      marginTop: 15,
    },


    button: {
      height: 50,
      backgroundColor:
        Colors.driver,
      borderRadius: 14,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginTop: 15,
    },


    buttonText: {
      color: Colors.white,
      fontSize: 16,
      fontWeight: "700",
    },


    emptyText: {
      textAlign: "center",
      marginTop: 40,
      fontSize: 16,
      color:
        Colors.textSecondary,
    },

  });