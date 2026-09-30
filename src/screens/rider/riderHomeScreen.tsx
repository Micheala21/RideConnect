import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Animated,
  Pressable,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  useNavigation,
} from "@react-navigation/native";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import {
  supabase,
} from "../../lib/supabaseClient";

import RideMap from "../../components/RideMap";


// ======================================================
// NAVIGATION TYPE
// ======================================================

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "RiderHome"
  >;


// ======================================================
// SCREEN
// ======================================================

export default function RiderHomeScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  // ====================================================
  // USER
  // ====================================================

  const [
    userName,
    setUserName,
  ] =
    useState("Rider");


  // ====================================================
  // SEARCH DETAILS
  // ====================================================

  const [
    pickup,
    setPickup,
  ] =
    useState("");

  const [
    destination,
    setDestination,
  ] =
    useState("");

  const [
    date,
    setDate,
  ] =
    useState("");

  const [
    time,
    setTime,
  ] =
    useState("");

  const [
    passengers,
    setPassengers,
  ] =
    useState("1");


  // ====================================================
  // RIDER MENU
  // ====================================================

  const [
    menuVisible,
    setMenuVisible,
  ] =
    useState(false);

  const menuAnimation =
    useRef(
      new Animated.Value(-320)
    ).current;


  const openMenu = () => {

    setMenuVisible(true);

    Animated.timing(
      menuAnimation,
      {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }
    ).start();
  };


  const closeMenu = () => {

    Animated.timing(
      menuAnimation,
      {
        toValue: -320,
        duration: 250,
        useNativeDriver: true,
      }
    ).start(() => {

      setMenuVisible(false);

    });
  };


  // ====================================================
  // LOAD RIDER PROFILE
  // ====================================================

  useEffect(() => {

    const loadProfile =
      async () => {

        try {

          const {
            data: {
              user,
            },
          } =
            await supabase.auth.getUser();


          if (!user) {
            return;
          }


          const {
            data: profile,
            error,
          } =
            await supabase
              .from("profiles")
              .select(
                "first_name, last_name"
              )
              .eq(
                "id",
                user.id
              )
              .maybeSingle();


          if (error) {

            console.error(
              "Profile loading error:",
              error.message
            );

            return;
          }


          if (profile) {

            const name =
              [
                profile.first_name,
                profile.last_name,
              ]
                .filter(Boolean)
                .join(" ");


            if (name) {

              setUserName(
                name
              );

            }

          }

        } catch (error) {

          console.error(
            "Profile error:",
            error
          );

        }

      };


    loadProfile();

  }, []);


  // ====================================================
  // SEARCH FOR RIDES
  // ====================================================

  const handleSearchRide =
    () => {

      if (!pickup.trim()) {

        Alert.alert(
          "Pickup Required",
          "Please enter your pickup location."
        );

        return;
      }


      if (!destination.trim()) {

        Alert.alert(
          "Destination Required",
          "Please enter your destination."
        );

        return;
      }


      if (!date.trim()) {

        Alert.alert(
          "Date Required",
          "Please enter your travel date."
        );

        return;
      }


      if (!time.trim()) {

        Alert.alert(
          "Time Required",
          "Please enter your preferred time."
        );

        return;
      }


      const passengerCount =
        Number(passengers);


      if (
        !Number.isFinite(
          passengerCount
        ) ||
        passengerCount <= 0
      ) {

        Alert.alert(
          "Invalid Passengers",
          "Please enter a valid number of passengers."
        );

        return;
      }


      navigation.navigate(
        "SearchResults",
        {
          pickup:
            pickup.trim(),

          destination:
            destination.trim(),

          date:
            date.trim(),

          time:
            time.trim(),

          passengers:
            String(
              passengerCount
            ),
        }
      );

    };


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <View
      style={
        styles.container
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
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

          <TouchableOpacity
            style={
              styles.menuButton
            }
            onPress={
              openMenu
            }
          >

            <Ionicons
              name="menu-outline"
              size={27}
              color={Colors.white}
            />

          </TouchableOpacity>


          <View
            style={
              styles.headerText
            }
          >

            <Text
              style={
                styles.greeting
              }
            >
              Welcome back,
            </Text>

            <Text
              style={
                styles.userName
              }
            >
              {userName}
            </Text>

          </View>

        </View>


        {/* ==================================================
            MAP / JOURNEY AREA
        ================================================== */}

        <View
          style={
            styles.mapContainer
          }
        >

          <RideMap
            pickup={
              pickup
            }
            destination={
              destination
            }
          />


          {!pickup.trim() &&
            !destination.trim() && (

            <View
              pointerEvents="none"
              style={
                styles.mapPrompt
              }
            >

              <View
                style={
                  styles.mapIconContainer
                }
              >

                <Ionicons
                  name="navigate-outline"
                  size={25}
                  color={Colors.rider}
                />

              </View>


              <Text
                style={
                  styles.mapTitle
                }
              >
                Plan your journey
              </Text>


              <Text
                style={
                  styles.mapSubtitle
                }
              >
                Enter your pickup and destination to preview the route
              </Text>

            </View>

          )}

        </View>


        {/* ==================================================
            SEARCH CARD
        ================================================== */}

        <View
          style={
            styles.searchCard
          }
        >

          <Text
            style={
              styles.searchTitle
            }
          >
            Find a Ride
          </Text>


          <Text
            style={
              styles.searchSubtitle
            }
          >
            Where would you like to go?
          </Text>


          {/* ================================================
              PICKUP
          ================================================ */}

          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="radio-button-on-outline"
              size={20}
              color={Colors.success}
              style={
                styles.inputIcon
              }
            />


            <TextInput
              style={
                styles.input
              }
              placeholder="Pickup location"
              placeholderTextColor="#888888"
              value={
                pickup
              }
              onChangeText={
                setPickup
              }
            />

          </View>


          {/* ================================================
              DESTINATION
          ================================================ */}

          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="location-outline"
              size={20}
              color={Colors.danger}
              style={
                styles.inputIcon
              }
            />


            <TextInput
              style={
                styles.input
              }
              placeholder="Where are you going?"
              placeholderTextColor="#888888"
              value={
                destination
              }
              onChangeText={
                setDestination
              }
            />

          </View>


          {/* ================================================
              DATE + TIME
          ================================================ */}

          <View
            style={
              styles.row
            }
          >

            <View
              style={[
                styles.inputContainer,
                styles.halfInput,
              ]}
            >

              <Ionicons
                name="calendar-outline"
                size={19}
                color={Colors.rider}
                style={
                  styles.inputIcon
                }
              />


              <TextInput
                style={
                  styles.input
                }
                placeholder="Date"
                placeholderTextColor="#888888"
                value={
                  date
                }
                onChangeText={
                  setDate
                }
              />

            </View>


            <View
              style={[
                styles.inputContainer,
                styles.halfInput,
              ]}
            >

              <Ionicons
                name="time-outline"
                size={19}
                color={Colors.rider}
                style={
                  styles.inputIcon
                }
              />


              <TextInput
                style={
                  styles.input
                }
                placeholder="Time"
                placeholderTextColor="#888888"
                value={
                  time
                }
                onChangeText={
                  setTime
                }
              />

            </View>

          </View>


          {/* ================================================
              PASSENGERS
          ================================================ */}

          <View
            style={
              styles.inputContainer
            }
          >

            <Ionicons
              name="people-outline"
              size={20}
              color={Colors.rider}
              style={
                styles.inputIcon
              }
            />


            <TextInput
              style={
                styles.input
              }
              placeholder="Number of passengers"
              placeholderTextColor="#888888"
              keyboardType="numeric"
              value={
                passengers
              }
              onChangeText={
                setPassengers
              }
            />

          </View>


          {/* ================================================
              SEARCH BUTTON
          ================================================ */}

          <TouchableOpacity
            style={
              styles.searchButton
            }
            onPress={
              handleSearchRide
            }
          >

            <Ionicons
              name="search-outline"
              size={21}
              color={Colors.white}
            />


            <Text
              style={
                styles.searchButtonText
              }
            >
              Search for Rides
            </Text>

          </TouchableOpacity>

        </View>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <View
          style={
            styles.quickActions
          }
        >

          <TouchableOpacity
            style={
              styles.quickAction
            }
            onPress={() =>
              navigation.navigate(
                "RiderSettings"
              )
            }
          >

            <View
              style={
                styles.quickIcon
              }
            >

              <Ionicons
                name="settings-outline"
                size={21}
                color={Colors.rider}
              />

            </View>


            <Text
              style={
                styles.quickText
              }
            >
              Settings
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>


      {/* ==================================================
          RIDER HAMBURGER MENU
      ================================================== */}

      {menuVisible && (

        <View
          style={
            styles.menuOverlay
          }
        >

          {/* BACKDROP */}

          <Pressable
            style={
              styles.menuBackdrop
            }
            onPress={
              closeMenu
            }
          />


          {/* MENU */}

          <Animated.View
            style={[
              styles.sideMenu,
              {
                transform: [
                  {
                    translateX:
                      menuAnimation,
                  },
                ],
              },
            ]}
          >

            {/* MENU HEADER */}

            <View
              style={
                styles.menuHeader
              }
            >

              <Text
                style={
                  styles.menuTitle
                }
              >
                Rider Menu
              </Text>


              <TouchableOpacity
                onPress={
                  closeMenu
                }
              >

                <Ionicons
                  name="close-outline"
                  size={28}
                  color={Colors.rider}
                />

              </TouchableOpacity>

            </View>


            {/* MENU OPTIONS */}

            <View
              style={
                styles.menuOptions
              }
            >

              <TouchableOpacity
                style={
                  styles.menuItem
                }
                onPress={() => {

                  closeMenu();

                  navigation.navigate(
                    "RiderProfile"
                  );

                }}
              >

                <View
                  style={
                    styles.menuIcon
                  }
                >

                  <Ionicons
                    name="person-outline"
                    size={21}
                    color={Colors.rider}
                  />

                </View>

                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  My Profile
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={
                  styles.menuItem
                }
                onPress={() => {

                  closeMenu();

                  navigation.navigate(
                    "RiderHome",
                    {
                      screen:
                        "Active Trips",
                    },
                  );

                }}
              >

                <View
                  style={
                    styles.menuIcon
                  }
                >

                  <Ionicons
                    name="navigate-outline"
                    size={21}
                    color={Colors.rider}
                  />

                </View>

                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  Active Trips
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={
                  styles.menuItem
                }
                onPress={() => {

                  closeMenu();

                  navigation.navigate(
                    "RiderHome",
                    {
                      screen:
                        "Past Trips",
                    },
                  );

                }}
              >

                <View
                  style={
                    styles.menuIcon
                  }
                >

                  <Ionicons
                    name="time-outline"
                    size={21}
                    color={Colors.rider}
                  />

                </View>

                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  Past Trips
                </Text>

              </TouchableOpacity>


              {/* MY PROFILE */}

              {/* 
              <TouchableOpacity
                style={
                  styles.menuItem
                }
                onPress={() => {

                  closeMenu();

                  navigation.navigate(
                    "RiderProfile"
                  );

                }}
              >

                <View
                  style={
                    styles.menuIcon
                  }
                >

                  <Ionicons
                    name="person-outline"
                    size={21}
                    color={Colors.rider}
                  />

                </View>


                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  My Profile
                </Text>

              </TouchableOpacity>
              */}


              {/* MY SCHEDULES */}

              {/* 
              <TouchableOpacity
                style={
                  styles.menuItem
                }
                onPress={() => {

                  closeMenu();

                  navigation.navigate(
                    "RiderSchedules"
                  );

                }}
              >

                <View
                  style={
                    styles.menuIcon
                  }
                >

                  <Ionicons
                    name="calendar-outline"
                    size={21}
                    color={Colors.rider}
                  />

                </View>


                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  My Schedules
                </Text>

              </TouchableOpacity>
              */}


              {/* ABOUT RIDECONNECT */}

              {/* 
              <TouchableOpacity
                style={
                  styles.menuItem
                }
                onPress={() => {

                  closeMenu();

                  navigation.navigate(
                    "RiderAbout"
                  );

                }}
              >

                <View
                  style={
                    styles.menuIcon
                  }
                >

                  <Ionicons
                    name="information-circle-outline"
                    size={21}
                    color={Colors.rider}
                  />

                </View>


                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  About RideConnect
                </Text>

              </TouchableOpacity>
              */}


              {/* HELP & SUPPORT */}

              {/* 
              <TouchableOpacity
                style={
                  styles.menuItem
                }
                onPress={() => {

                  closeMenu();

                  navigation.navigate(
                    "RiderHelp"
                  );

                }}
              >

                <View
                  style={
                    styles.menuIcon
                  }
                >

                  <Ionicons
                    name="help-circle-outline"
                    size={21}
                    color={Colors.rider}
                  />

                </View>


                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  Help & Support
                </Text>

              </TouchableOpacity>
              */}


              {/* SETTINGS */}

              <TouchableOpacity
                style={
                  styles.menuItem
                }
                onPress={() => {

                  closeMenu();

                  navigation.navigate(
                    "RiderSettings"
                  );

                }}
              >

                <View
                  style={
                    styles.menuIcon
                  }
                >

                  <Ionicons
                    name="settings-outline"
                    size={21}
                    color={Colors.rider}
                  />

                </View>


                <Text
                  style={
                    styles.menuItemText
                  }
                >
                  Settings
                </Text>

              </TouchableOpacity>

            </View>


            {/* BOTTOM ACTIONS */}

            <View
              style={
                styles.menuBottom
              }
            >

              {/* SWITCH TO DRIVER */}

              <TouchableOpacity
                style={
                  styles.bottomMenuButton
                }
                onPress={async () => {

                  closeMenu();

                  const { error } =
                    await supabase.auth.signOut();

                  if (error) {
                    Alert.alert(
                      "Unable to Switch Roles",
                      error.message,
                    );
                    return;
                  }

                  navigation.reset({
                    index: 0,
                    routes: [{ name: "DriverLogin" }],
                  });

                }}
              >

                <View
                  style={
                    styles.bottomMenuIcon
                  }
                >

                  <Ionicons
                    name="car-outline"
                    size={22}
                    color={Colors.rider}
                  />

                </View>


                <Text
                  style={
                    styles.bottomMenuText
                  }
                >
                  Driver{"\n"}Login
                </Text>

              </TouchableOpacity>


              {/* LOGOUT */}

              <TouchableOpacity
                style={
                  styles.bottomMenuButton
                }
                onPress={
                  async () => {

                    const { error } =
                      await supabase.auth.signOut();

                    closeMenu();

                    if (error) {
                      Alert.alert(
                        "Logout Failed",
                        error.message,
                      );
                      return;
                    }

                    navigation.reset({
                      index: 0,
                      routes: [{ name: "RoleSelection" }],
                    });

                  }
                }
              >

                <View
                  style={
                    styles.bottomMenuIcon
                  }
                >

                  <Ionicons
                    name="log-out-outline"
                    size={22}
                    color="#DC2626"
                  />

                </View>


                <Text
                  style={[
                    styles.bottomMenuText,
                    {
                      color:
                        "#DC2626",
                    },
                  ]}
                >
                  Logout
                </Text>

              </TouchableOpacity>

            </View>

          </Animated.View>

        </View>

      )}

    </View>
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
    },


    scrollContent: {
      paddingBottom:
        30,
    },


    // ==================================================
    // HEADER
    // ==================================================

    header: {
      paddingHorizontal:
        20,
      paddingTop:
        15,
      paddingBottom:
        12,
      flexDirection:
        "row",
      alignItems:
        "center",
    },


    menuButton: {
      width:
        44,
      height:
        44,
      borderRadius:
        22,
      backgroundColor:
        Colors.rider,
      justifyContent:
        "center",
      alignItems:
        "center",
    },


    headerText: {
      flex: 1,
      marginLeft:
        12,
    },


    greeting: {
      fontSize:
        14,
      color:
        "#777777",
    },


    userName: {
      fontSize:
        22,
      fontWeight:
        "700",
      color:
        Colors.rider,
      marginTop:
        2,
    },


    // ==================================================
    // MAP
    // ==================================================

    mapContainer: {
      height:
        270,
      marginHorizontal:
        20,
      borderRadius:
        22,
      overflow:
        "hidden",
      marginBottom:
        18,
    },


    mapBackground: {
      flex: 1,
      backgroundColor:
        "#E8EEF3",
      position:
        "relative",
      overflow:
        "hidden",
    },


    mapLineOne: {
      position:
        "absolute",
      width:
        "150%",
      height:
        3,
      backgroundColor:
        "#FFFFFF",
      transform: [
        {
          rotate:
            "25deg",
        },
      ],
      top:
        80,
      left:
        -80,
    },


    mapLineTwo: {
      position:
        "absolute",
      width:
        "150%",
      height:
        3,
      backgroundColor:
        "#FFFFFF",
      transform: [
        {
          rotate:
            "-18deg",
        },
      ],
      top:
        145,
      left:
        -60,
    },


    mapLineThree: {
      position:
        "absolute",
      width:
        "130%",
      height:
        3,
      backgroundColor:
        "#FFFFFF",
      transform: [
        {
          rotate:
            "65deg",
        },
      ],
      top:
        30,
      left:
        120,
    },


    mapCircleOne: {
      position:
        "absolute",
      width:
        12,
      height:
        12,
      borderRadius:
        6,
      backgroundColor:
        Colors.success,
      top:
        65,
      left:
        80,
      borderWidth:
        3,
      borderColor:
        "#FFFFFF",
    },


    mapCircleTwo: {
      position:
        "absolute",
      width:
        12,
      height:
        12,
      borderRadius:
        6,
      backgroundColor:
        Colors.danger,
      bottom:
        70,
      right:
        75,
      borderWidth:
        3,
      borderColor:
        "#FFFFFF",
    },


    mapCircleThree: {
      position:
        "absolute",
      width:
        9,
      height:
        9,
      borderRadius:
        5,
      backgroundColor:
        Colors.rider,
      top:
        120,
      right:
        100,
    },


    mapPrompt: {
      position:
        "absolute",
      left:
        18,
      right:
        18,
      bottom:
        18,
      borderRadius:
        16,
      paddingVertical:
        12,
      paddingHorizontal:
        16,
      alignItems:
        "center",
      backgroundColor:
        "rgba(255,255,255,0.92)",
    },


    mapOverlay: {
      position:
        "absolute",
      left:
        0,
      right:
        0,
      top:
        0,
      bottom:
        0,
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        "rgba(255,255,255,0.20)",
    },


    mapIconContainer: {
      width:
        52,
      height:
        52,
      borderRadius:
        26,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom:
        10,
      elevation:
        3,
    },


    mapTitle: {
      fontSize:
        19,
      fontWeight:
        "700",
      color:
        Colors.rider,
    },


    mapSubtitle: {
      fontSize:
        13,
      color:
        "#555555",
      marginTop:
        5,
      textAlign:
        "center",
    },


    // ==================================================
    // SEARCH CARD
    // ==================================================

    searchCard: {
      backgroundColor:
        "#FFFFFF",
      marginHorizontal:
        20,
      borderRadius:
        22,
      padding:
        18,
      elevation:
        4,
      shadowColor:
        "#000000",
      shadowOpacity:
        0.08,
      shadowRadius:
        8,
      shadowOffset: {
        width:
          0,
        height:
          3,
      },
    },


    searchTitle: {
      fontSize:
        21,
      fontWeight:
        "700",
      color:
        Colors.rider,
    },


    searchSubtitle: {
      fontSize:
        13,
      color:
        "#777777",
      marginTop:
        4,
      marginBottom:
        15,
    },


    // ==================================================
    // INPUTS
    // ==================================================

    inputContainer: {
      height:
        50,
      borderWidth:
        1,
      borderColor:
        "#E0E0E0",
      borderRadius:
        12,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal:
        12,
      marginBottom:
        10,
      backgroundColor:
        "#FFFFFF",
    },


    inputIcon: {
      marginRight:
        9,
    },


    input: {
      flex: 1,
      fontSize:
        14,
      color:
        "#222222",
      paddingVertical:
        0,
    },


    row: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      gap:
        10,
    },


    halfInput: {
      flex: 1,
    },


    // ==================================================
    // SEARCH BUTTON
    // ==================================================

    searchButton: {
      height:
        52,
      borderRadius:
        14,
      backgroundColor:
        Colors.rider,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        8,
      marginTop:
        4,
    },


    searchButtonText: {
      color:
        Colors.white,
      fontSize:
        16,
      fontWeight:
        "700",
    },


    // ==================================================
    // QUICK ACTIONS
    // ==================================================

    quickActions: {
      flexDirection:
        "row",
      marginHorizontal:
        20,
      marginTop:
        15,
      gap:
        12,
    },


    quickAction: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
      borderRadius:
        16,
      padding:
        14,
      alignItems:
        "center",
      elevation:
        2,
    },


    quickIcon: {
      width:
        42,
      height:
        42,
      borderRadius:
        21,
      backgroundColor:
        Colors.riderLight,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom:
        7,
    },


    quickText: {
      fontSize:
        13,
      fontWeight:
        "600",
      color:
        Colors.rider,
    },


    // ==================================================
    // HAMBURGER MENU
    // ==================================================

    menuOverlay: {
      position:
        "absolute",
      top:
        0,
      left:
        0,
      right:
        0,
      bottom:
        0,
      zIndex:
        100,
    },


    menuBackdrop: {
      position:
        "absolute",
      top:
        0,
      left:
        0,
      right:
        0,
      bottom:
        0,
      backgroundColor:
        "rgba(0, 0, 0, 0.35)",
    },


    sideMenu: {
      position:
        "absolute",
      top:
        0,
      bottom:
        0,
      left:
        0,
      width:
        320,
      backgroundColor:
        "#FFFFFF",
      borderTopRightRadius:
        24,
      borderBottomRightRadius:
        24,
      elevation:
        10,
      shadowColor:
        "#000000",
      shadowOpacity:
        0.2,
      shadowRadius:
        10,
      shadowOffset: {
        width:
          3,
        height:
          0,
      },
      paddingTop:
        55,
    },


    menuHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      paddingHorizontal:
        22,
      paddingBottom:
        20,
      borderBottomWidth:
        1,
      borderBottomColor:
        "#E5E7EB",
    },


    menuTitle: {
      fontSize:
        21,
      fontWeight:
        "700",
      color:
        Colors.rider,
    },


    menuOptions: {
      paddingTop:
        12,
      paddingHorizontal:
        14,
    },


    menuItem: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingVertical:
        14,
      paddingHorizontal:
        8,
      borderRadius:
        12,
    },


    menuIcon: {
      width:
        42,
      height:
        42,
      borderRadius:
        21,
      backgroundColor:
        Colors.riderLight,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight:
        13,
    },


    menuItemText: {
      fontSize:
        15,
      fontWeight:
        "600",
      color:
        Colors.rider,
    },


    // ==================================================
    // BOTTOM MENU ACTIONS
    // ==================================================

    menuBottom: {
      marginTop:
        "auto",
      flexDirection:
        "row",
      borderTopWidth:
        1,
      borderTopColor:
        "#E5E7EB",
      paddingHorizontal:
        14,
      paddingTop:
        18,
      paddingBottom:
        25,
      gap:
        10,
    },


    bottomMenuButton: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingVertical:
        10,
      borderRadius:
        14,
      backgroundColor:
        "#F8FAFC",
    },


    bottomMenuIcon: {
      width:
        42,
      height:
        42,
      borderRadius:
        21,
      backgroundColor:
        Colors.riderLight,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom:
        6,
    },


    bottomMenuText: {
      fontSize:
        12,
      fontWeight:
        "600",
      color:
        Colors.rider,
      textAlign:
        "center",
      lineHeight:
        17,
    },

  });