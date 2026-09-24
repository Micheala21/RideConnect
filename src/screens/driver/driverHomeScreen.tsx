import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import { supabase } from "../../lib/supabaseClient";


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;


type DriverUser = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  licenceNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  registrationNumber?: string;
  availableSeats?: number;
};


/* ==================================================
   PANEL HEIGHTS
================================================== */

const SCREEN_HEIGHT =
  Dimensions.get("window").height;

const COLLAPSED_HEIGHT = 170;

// Clicking the up button opens to 60%
const EXPANDED_HEIGHT =
  SCREEN_HEIGHT * 0.60;

// Dragging upward can take it as high as 90%
const MAX_PANEL_HEIGHT =
  SCREEN_HEIGHT * 0.90;


export default function DriverHomeScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  const [user, setUser] =
    useState<DriverUser | null>(null);


  const [pickup, setPickup] =
    useState("");


  const [destination, setDestination] =
    useState("");


  const [rideDate, setRideDate] =
    useState("");


  const [departureTime, setDepartureTime] =
    useState("");


  const [availableSeats, setAvailableSeats] =
    useState("");


  const [estimatedFare, setEstimatedFare] =
    useState<number | null>(null);


  const [driverFare, setDriverFare] =
    useState("");


  const [fareAccepted, setFareAccepted] =
    useState(false);


  const [panelExpanded, setPanelExpanded] =
    useState(false);


  const [showGreeting, setShowGreeting] =
    useState(true);


  const [creatingRide, setCreatingRide] =
    useState(false);


  /* ==================================================
     PANEL ANIMATION
  ================================================== */

  const panelHeight =
    useRef(
      new Animated.Value(
        COLLAPSED_HEIGHT
      )
    ).current;


  const currentPanelHeight =
    useRef(
      COLLAPSED_HEIGHT
    );


  const dragStartHeight =
    useRef(
      COLLAPSED_HEIGHT
    );


  /* ==================================================
     GOOD MORNING MESSAGE
  ================================================== */

  useEffect(() => {

    const timer =
      setTimeout(() => {

        setShowGreeting(false);

      }, 5000);


    return () =>
      clearTimeout(timer);

  }, []);


  /* ==================================================
     DRAG PANEL
  ================================================== */

  const panResponder =
    useRef(

      PanResponder.create({

        onStartShouldSetPanResponder:
          () => true,


        onMoveShouldSetPanResponder: (
          _,
          gestureState
        ) => {

          return (
            Math.abs(
              gestureState.dy
            ) > 5
          );

        },


        onPanResponderGrant: () => {

          dragStartHeight.current =
            currentPanelHeight.current;

        },


        onPanResponderMove: (
          _,
          gestureState
        ) => {

          const newHeight =
            dragStartHeight.current -
            gestureState.dy;


          const clampedHeight =
            Math.min(

              Math.max(
                newHeight,
                COLLAPSED_HEIGHT
              ),

              MAX_PANEL_HEIGHT

            );


          currentPanelHeight.current =
            clampedHeight;


          panelHeight.setValue(
            clampedHeight
          );

        },


        onPanResponderRelease: (
          _,
          gestureState
        ) => {

          const draggedUp =
            gestureState.dy < -50;

          const draggedDown =
            gestureState.dy > 50;


          let targetHeight =
            currentPanelHeight.current;


          if (draggedDown) {

            targetHeight =
              COLLAPSED_HEIGHT;

            setPanelExpanded(
              false
            );

          }

          else if (draggedUp) {

            targetHeight =
              MAX_PANEL_HEIGHT;

            setPanelExpanded(
              true
            );

          }

          else {

            if (
              currentPanelHeight.current <
              (
                COLLAPSED_HEIGHT +
                EXPANDED_HEIGHT
              ) / 2
            ) {

              targetHeight =
                COLLAPSED_HEIGHT;

              setPanelExpanded(
                false
              );

            }

            else {

              targetHeight =
                EXPANDED_HEIGHT;

              setPanelExpanded(
                true
              );

            }

          }


          currentPanelHeight.current =
            targetHeight;


          Animated.spring(
            panelHeight,
            {
              toValue:
                targetHeight,

              useNativeDriver:
                false,

              tension:
                70,

              friction:
                10,
            }
          ).start();

        },


        onPanResponderTerminate:
          () => {

            const targetHeight =
              panelExpanded
                ? EXPANDED_HEIGHT
                : COLLAPSED_HEIGHT;


            currentPanelHeight.current =
              targetHeight;


            Animated.spring(
              panelHeight,
              {
                toValue:
                  targetHeight,

                useNativeDriver:
                  false,

                tension:
                  70,

                friction:
                  10,
              }
            ).start();

          },

      })

    ).current;


  /* ==================================================
     LOAD DRIVER
  ================================================== */

  useEffect(() => {

    const loadDriver =
      async () => {

        try {

          const {
            data: {
              user: authUser,
            },

            error:
              authError,

          } =
            await supabase.auth.getUser();


          if (authError) {

            console.error(
              "Error getting driver account:",
              authError.message
            );

            return;

          }


          if (!authUser) {

            console.error(
              "No logged-in driver found."
            );

            return;

          }


          const {
            data: profile,
            error:
              profileError,

          } =
            await supabase

              .from("profiles")

              .select(
                "first_name, last_name, phone_number, role"
              )

              .eq(
                "id",
                authUser.id
              )

              .single();


          if (profileError) {

            console.error(
              "Error loading driver profile:",
              profileError.message
            );

            return;

          }


          const {
            data:
              driverProfile,

            error:
              driverProfileError,

          } =
            await supabase

              .from("driver_profiles")

              .select(
                "licence_number, vehicle_make, vehicle_model, registration_number, available_seats"
              )

              .eq(
                "id",
                authUser.id
              )

              .single();


          if (
            driverProfileError
          ) {

            console.error(
              "Error loading driver information:",
              driverProfileError.message
            );

            return;

          }


          setUser({

            firstName:
              profile.first_name,

            lastName:
              profile.last_name,

            email:
              authUser.email || "",

            phoneNumber:
              profile.phone_number,

            role:
              profile.role,

            licenceNumber:
              driverProfile.licence_number,

            vehicleMake:
              driverProfile.vehicle_make,

            vehicleModel:
              driverProfile.vehicle_model,

            registrationNumber:
              driverProfile.registration_number,

            availableSeats:
              driverProfile.available_seats,

          });


          setAvailableSeats(

            String(
              driverProfile.available_seats || ""
            )

          );

        }

        catch (error) {

          console.error(
            "Error loading driver:",
            error
          );

        }

      };


    loadDriver();

  }, []);


  /* ==================================================
     SHOW ROUTE / ESTIMATE
  ================================================== */

  const createRoute =
    () => {

      if (
        !pickup.trim() ||
        !destination.trim()
      ) {

        Alert.alert(
          "Missing Route",
          "Please enter both a starting point and destination."
        );

        return;

      }


      const calculatedFare =
        35;


      setEstimatedFare(
        calculatedFare
      );


      setDriverFare(
        String(
          calculatedFare
        )
      );


      setFareAccepted(
        false
      );


      setPanelExpanded(
        true
      );


      currentPanelHeight.current =
        EXPANDED_HEIGHT;


      Animated.spring(
        panelHeight,
        {
          toValue:
            EXPANDED_HEIGHT,

          useNativeDriver:
            false,

          tension:
            70,

          friction:
            10,
        }
      ).start();

    };


  /* ==================================================
     ACCEPT ESTIMATED FARE
  ================================================== */

  const acceptEstimatedFare =
    () => {

      if (
        estimatedFare === null
      ) {

        return;

      }


      setDriverFare(
        String(
          estimatedFare
        )
      );


      setFareAccepted(
        true
      );

    };


  /* ==================================================
     CREATE RIDE OFFER
  ================================================== */

  const createRideOffer =
    async () => {

      if (
        !pickup.trim() ||
        !destination.trim()
      ) {

        Alert.alert(
          "Missing Information",
          "Please enter your pickup location and destination."
        );

        return;

      }


      if (
        !rideDate.trim() ||
        !departureTime.trim()
      ) {

        Alert.alert(
          "Missing Information",
          "Please enter the ride date and departure time."
        );

        return;

      }


      if (
        !availableSeats.trim()
      ) {

        Alert.alert(
          "Missing Information",
          "Please enter the number of available seats."
        );

        return;

      }


      const fare =
        Number(
          driverFare
        );


      if (
        !fare ||
        fare <= 0
      ) {

        Alert.alert(
          "Invalid Fare",
          "Please enter a valid fare per person."
        );

        return;

      }


      try {

        setCreatingRide(
          true
        );


        const {
          data: {
            user:
              authUser,
          },

        } =
          await supabase.auth.getUser();


        if (
          !authUser
        ) {

          Alert.alert(
            "Session Error",
            "You are not logged in."
          );

          return;

        }


        const {
          data,
          error,
        } =
          await supabase

            .from("rides")

            .insert({

              driver_id:
                authUser.id,

              pickup_location:
                pickup.trim(),

              destination:
                destination.trim(),

              fare:
                fare,

              status:
                "available",

              ride_date:
                rideDate.trim(),

              departure_time:
                departureTime.trim(),

              available_seats:
                Number(
                  availableSeats
                ),

              notes:
                null,

            })

            .select("id")

            .single();


        if (error) {

          console.error(
            "Ride creation error:",
            error.message
          );


          Alert.alert(
            "Error",
            error.message
          );

          return;

        }


        if (
          !data?.id
        ) {

          Alert.alert(
            "Error",
            "The ride was created but no ride ID was returned."
          );

          return;

        }


        console.log(
          "Created ride ID:",
          data.id
        );


        navigation.navigate(
          "RideConfirmation",
          {
            rideId:
              data.id,
          }
        );

      }

      catch (error) {

        console.error(
          "Create ride error:",
          error
        );


        Alert.alert(
          "Error",
          "Could not create the ride offer."
        );

      }

      finally {

        setCreatingRide(
          false
        );

      }

    };


  /* ==================================================
     COLLAPSE PANEL
  ================================================== */

  const collapsePanel =
    () => {

      setPanelExpanded(
        false
      );


      currentPanelHeight.current =
        COLLAPSED_HEIGHT;


      Animated.spring(
        panelHeight,
        {
          toValue:
            COLLAPSED_HEIGHT,

          useNativeDriver:
            false,

          tension:
            70,

          friction:
            10,
        }
      ).start();

    };


  /* ==================================================
     EXPAND PANEL
  ================================================== */

  const expandPanel =
    () => {

      setPanelExpanded(
        true
      );


      currentPanelHeight.current =
        EXPANDED_HEIGHT;


      Animated.spring(
        panelHeight,
        {
          toValue:
            EXPANDED_HEIGHT,

          useNativeDriver:
            false,

          tension:
            70,

          friction:
            10,
        }
      ).start();

    };


  return (

    <View
      style={
        styles.container
      }
    >

      {/* ==================================================
          MAP / MAIN HOME AREA
      ================================================== */}

      <View
        style={
          styles.mapArea
        }
      >

        <View
          style={
            styles.mapPlaceholder
          }
        >

          <Ionicons
            name="map-outline"
            size={70}
            color={
              Colors.driver
            }
          />


          <Text
            style={
              styles.mapTitle
            }
          >
            RideConnect Map
          </Text>


          <Text
            style={
              styles.mapSubtitle
            }
          >
            Your route will appear here
          </Text>

        </View>


        {/* ==================================================
            GREETING
        ================================================== */}

        {showGreeting &&
          user && (

            <View
              style={
                styles.greetingCard
              }
            >

              <Text
                style={
                  styles.greeting
                }
              >
                Good Morning,{" "}
                {user.firstName}!
              </Text>


              <Text
                style={
                  styles.greetingSubtext
                }
              >
                Ready to offer a ride today?
              </Text>

            </View>

          )}

      </View>


      {/* ==================================================
          BOTTOM PANEL
      ================================================== */}

      <Animated.View
        style={[
          styles.bottomPanel,
          {
            height:
              panelHeight,
          },
        ]}
      >

        {/* ==================================================
            DRAG HANDLE
        ================================================== */}

        <View
          {...panResponder.panHandlers}
          style={
            styles.dragHandleArea
          }
        >

          <View
            style={
              styles.dragHandle
            }
          />

        </View>


        {/* ==================================================
            PANEL HEADER
        ================================================== */}

        <View
          style={
            styles.panelHeader
          }
        >

          <View>

            <Text
              style={
                styles.panelTitle
              }
            >
              Create a Ride
            </Text>


            <Text
              style={
                styles.panelSubtitle
              }
            >
              Enter your trip details
            </Text>

          </View>


          <TouchableOpacity
            onPress={
              panelExpanded
                ? collapsePanel
                : expandPanel
            }
            activeOpacity={0.7}
            style={
              styles.expandButton
            }
          >

            <Ionicons
              name={
                panelExpanded
                  ? "chevron-down"
                  : "chevron-up"
              }
              size={25}
              color={
                Colors.primary
              }
            />

          </TouchableOpacity>

        </View>


        {/* ==================================================
            SCROLLABLE PANEL CONTENT
        ================================================== */}

        <ScrollView
          style={
            styles.panelScroll
          }
          contentContainerStyle={
            styles.panelContent
          }
          showsVerticalScrollIndicator={
            false
          }
          nestedScrollEnabled={
            true
          }
          keyboardShouldPersistTaps="handled"
        >

          {/* ==================================================
              PICKUP
          ================================================== */}

          <Text
            style={
              styles.inputLabel
            }
          >
            Pickup Location
          </Text>


          <View
            style={
              styles.inputWrapper
            }
          >

            <Ionicons
              name="location-outline"
              size={21}
              color={
                Colors.driver
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


          {/* ==================================================
              DESTINATION
          ================================================== */}

          <Text
            style={
              styles.inputLabel
            }
          >
            Destination
          </Text>


          <View
            style={
              styles.inputWrapper
            }
          >

            <Ionicons
              name="flag-outline"
              size={21}
              color={
                Colors.driver
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


          {/* ==================================================
              SHOW ROUTE
          ================================================== */}

          <TouchableOpacity
            style={
              styles.routeButton
            }
            onPress={
              createRoute
            }
            activeOpacity={0.8}
          >

            <Ionicons
              name="navigate-outline"
              size={21}
              color={
                Colors.white
              }
            />


            <Text
              style={
                styles.routeButtonText
              }
            >
              Show Route
            </Text>

          </TouchableOpacity>


          {/* ==================================================
              ESTIMATED FARE
          ================================================== */}

          {estimatedFare !== null && (

            <View
              style={
                styles.fareCard
              }
            >

              <View>

                <Text
                  style={
                    styles.fareTitle
                  }
                >
                  Estimated Fare
                </Text>


                <Text
                  style={
                    styles.fareAmount
                  }
                >
                  R{estimatedFare}
                </Text>

              </View>


              {!fareAccepted && (

                <TouchableOpacity
                  style={
                    styles.acceptButton
                  }
                  onPress={
                    acceptEstimatedFare
                  }
                  activeOpacity={0.8}
                >

                  <Text
                    style={
                      styles.acceptButtonText
                    }
                  >
                    Accept
                  </Text>

                </TouchableOpacity>

              )}


              {fareAccepted && (

                <View
                  style={
                    styles.acceptedBadge
                  }
                >

                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={
                      Colors.success
                    }
                  />


                  <Text
                    style={
                      styles.acceptedText
                    }
                  >
                    Accepted
                  </Text>

                </View>

              )}

            </View>

          )}


          {/* ==================================================
              DATE
          ================================================== */}

          <Text
            style={
              styles.inputLabel
            }
          >
            Ride Date
          </Text>


          <View
            style={
              styles.inputWrapper
            }
          >

            <Ionicons
              name="calendar-outline"
              size={21}
              color={
                Colors.driver
              }
            />


            <TextInput
              style={
                styles.input
              }
              placeholder="YYYY-MM-DD"
              placeholderTextColor={
                Colors.textSecondary
              }
              value={
                rideDate
              }
              onChangeText={
                setRideDate
              }
            />

          </View>


          {/* ==================================================
              TIME
          ================================================== */}

          <Text
            style={
              styles.inputLabel
            }
          >
            Departure Time
          </Text>


          <View
            style={
              styles.inputWrapper
            }
          >

            <Ionicons
              name="time-outline"
              size={21}
              color={
                Colors.driver
              }
            />


            <TextInput
              style={
                styles.input
              }
              placeholder="08:30 AM"
              placeholderTextColor={
                Colors.textSecondary
              }
              value={
                departureTime
              }
              onChangeText={
                setDepartureTime
              }
            />

          </View>


          {/* ==================================================
              AVAILABLE SEATS
          ================================================== */}

          <Text
            style={
              styles.inputLabel
            }
          >
            Available Seats
          </Text>


          <View
            style={
              styles.inputWrapper
            }
          >

            <Ionicons
              name="people-outline"
              size={21}
              color={
                Colors.driver
              }
            />


            <TextInput
              style={
                styles.input
              }
              placeholder="Number of seats"
              placeholderTextColor={
                Colors.textSecondary
              }
              value={
                availableSeats
              }
              onChangeText={
                setAvailableSeats
              }
              keyboardType="numeric"
            />

          </View>


          {/* ==================================================
              DRIVER FARE
          ================================================== */}

          <Text
            style={
              styles.inputLabel
            }
          >
            Fare Per Passenger
          </Text>


          <View
            style={
              styles.inputWrapper
            }
          >

            <Ionicons
              name="cash-outline"
              size={21}
              color={
                Colors.driver
              }
            />


            <TextInput
              style={
                styles.input
              }
              placeholder="Enter fare"
              placeholderTextColor={
                Colors.textSecondary
              }
              value={
                driverFare
              }
              onChangeText={
                setDriverFare
              }
              keyboardType="numeric"
            />

          </View>


          {/* ==================================================
              CREATE RIDE OFFER
          ================================================== */}

          <TouchableOpacity
            style={[
              styles.createButton,
              creatingRide &&
                styles.disabledButton,
            ]}
            onPress={
              createRideOffer
            }
            disabled={
              creatingRide
            }
            activeOpacity={0.8}
          >

            {creatingRide ? (

              <Text
                style={
                  styles.createButtonText
                }
              >
                Creating Ride...
              </Text>

            ) : (

              <>

                <Ionicons
                  name="car-outline"
                  size={22}
                  color={
                    Colors.white
                  }
                />


                <Text
                  style={
                    styles.createButtonText
                  }
                >
                  Create Ride Offer
                </Text>

              </>

            )}

          </TouchableOpacity>


          <View
            style={
              styles.bottomSpacing
            }
          />

        </ScrollView>

      </Animated.View>

    </View>

  );

}


/* ==================================================
   STYLES
================================================== */

const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        Colors.background,

    },


    /* ==================================================
       MAP
    ================================================== */

    mapArea: {

      flex: 1,

      backgroundColor:
        "#E9EEF3",

      justifyContent:
        "center",

      alignItems:
        "center",

    },


    mapPlaceholder: {

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    mapTitle: {

      fontSize:
        22,

      fontWeight:
        "700",

      color:
        Colors.primary,

      marginTop:
        12,

    },


    mapSubtitle: {

      fontSize:
        14,

      color:
        Colors.textSecondary,

      marginTop:
        5,

    },


    /* ==================================================
       GREETING
    ================================================== */

    greetingCard: {

      position:
        "absolute",

      top:
        35,

      left:
        20,

      right:
        20,

      backgroundColor:
        Colors.white,

      borderRadius:
        18,

      padding:
        18,

      elevation:
        5,

      shadowOpacity:
        0.12,

      shadowRadius:
        8,

      shadowOffset: {

        width:
          0,

        height:
          3,

      },

    },


    greeting: {

      fontSize:
        20,

      fontWeight:
        "700",

      color:
        Colors.primary,

    },


    greetingSubtext: {

      marginTop:
        5,

      fontSize:
        14,

      color:
        Colors.textSecondary,

    },


    /* ==================================================
       BOTTOM PANEL
    ================================================== */

    bottomPanel: {

      position:
        "absolute",

      left:
        0,

      right:
        0,

      bottom:
        0,

      backgroundColor:
        Colors.white,

      borderTopLeftRadius:
        28,

      borderTopRightRadius:
        28,

      elevation:
        12,

      shadowOpacity:
        0.15,

      shadowRadius:
        10,

      shadowOffset: {

        width:
          0,

        height:
          -4,

      },

      overflow:
        "hidden",

    },


    /* ==================================================
       DRAG HANDLE
    ================================================== */

    dragHandleArea: {

      height:
        38,

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    dragHandle: {

      width:
        50,

      height:
        5,

      borderRadius:
        3,

      backgroundColor:
        "#C7CCD2",

    },


    /* ==================================================
       HEADER
    ================================================== */

    panelHeader: {

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      paddingHorizontal:
        20,

      paddingBottom:
        15,

    },


    panelTitle: {

      fontSize:
        21,

      fontWeight:
        "700",

      color:
        Colors.primary,

    },


    panelSubtitle: {

      marginTop:
        3,

      fontSize:
        13,

      color:
        Colors.textSecondary,

    },


    expandButton: {

      width:
        42,

      height:
        42,

      borderRadius:
        21,

      backgroundColor:
        "#F2F4F7",

      alignItems:
        "center",

      justifyContent:
        "center",

    },


    /* ==================================================
       SCROLL
    ================================================== */

    panelScroll: {

      flex:
        1,

    },


    panelContent: {

      paddingHorizontal:
        20,

      paddingBottom:
        40,

    },


    /* ==================================================
       INPUTS
    ================================================== */

    inputLabel: {

      fontSize:
        14,

      fontWeight:
        "700",

      color:
        Colors.primary,

      marginBottom:
        7,

      marginTop:
        8,

    },


    inputWrapper: {

      height:
        53,

      backgroundColor:
        "#F7F9FC",

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        "#E6EAF0",

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        15,

      marginBottom:
        12,

    },


    input: {

      flex:
        1,

      marginLeft:
        10,

      color:
        Colors.primary,

      fontSize:
        15,

    },


    /* ==================================================
       ROUTE BUTTON
    ================================================== */

    routeButton: {

      height:
        54,

      backgroundColor:
        Colors.driver,

      borderRadius:
        15,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        5,

      marginBottom:
        15,

    },


    routeButtonText: {

      color:
        Colors.white,

      fontSize:
        16,

      fontWeight:
        "700",

      marginLeft:
        8,

    },


    /* ==================================================
       FARE
    ================================================== */

    fareCard: {

      backgroundColor:
        "#F7F9FC",

      borderRadius:
        16,

      padding:
        16,

      marginBottom:
        10,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E6EAF0",

    },


    fareTitle: {

      fontSize:
        13,

      color:
        Colors.textSecondary,

    },


    fareAmount: {

      fontSize:
        25,

      fontWeight:
        "700",

      color:
        Colors.driver,

      marginTop:
        2,

    },


    acceptButton: {

      backgroundColor:
        Colors.driver,

      paddingHorizontal:
        18,

      paddingVertical:
        10,

      borderRadius:
        10,

    },


    acceptButtonText: {

      color:
        Colors.white,

      fontWeight:
        "700",

    },


    acceptedBadge: {

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    acceptedText: {

      color:
        Colors.success,

      fontWeight:
        "700",

      marginLeft:
        5,

    },


    /* ==================================================
       CREATE BUTTON
    ================================================== */

    createButton: {

      height:
        58,

      backgroundColor:
        Colors.driver,

      borderRadius:
        16,

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginTop:
        12,

    },


    createButtonText: {

      color:
        Colors.white,

      fontSize:
        17,

      fontWeight:
        "700",

      marginLeft:
        8,

    },


    disabledButton: {

      opacity:
        0.6,

    },


    /* ==================================================
       REQUESTS
    ================================================== */

    requestsButton: {

      height:
        55,

      borderWidth:
        2,

      borderColor:
        Colors.driver,

      borderRadius:
        15,

      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginTop:
        12,

    },


    requestsButtonText: {

      color:
        Colors.driver,

      fontSize:
        16,

      fontWeight:
        "700",

      marginLeft:
        8,

    },


    bottomSpacing: {

      height:
        30,

    },

  });