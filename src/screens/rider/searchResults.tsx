import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  useNavigation,
} from "@react-navigation/native";

import FilterModal from "../../components/filterModal";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import {
  supabase,
} from "../../lib/supabaseClient";


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "RiderHome"
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
};


export default function SearchResultsScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  const [rides, setRides] =
    useState<Ride[]>([]);

  const [loading, setLoading] =
    useState(true);


  const [search, setSearch] =
    useState("");


  const [priceFilter, setPriceFilter] =
    useState("All");

  const [genderFilter, setGenderFilter] =
    useState("All");

  const [seatFilter, setSeatFilter] =
    useState("All");


  const [priceVisible, setPriceVisible] =
    useState(false);

  const [genderVisible, setGenderVisible] =
    useState(false);

  const [seatVisible, setSeatVisible] =
    useState(false);


  // ==================================================
  // LOAD RIDE OFFERS FROM SUPABASE
  // ==================================================

  useEffect(() => {

    const loadRides = async () => {

      try {

        setLoading(true);


        const {
          data,
          error,
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
          .eq("status", "requested")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );


        if (error) {

          console.error(
            "Error loading rides:",
            error.message
          );

          setRides([]);

          return;
        }


        if (!data || data.length === 0) {

          setRides([]);

          return;
        }


        // ============================================
        // GET DRIVER IDS
        // ============================================

        const driverIds =
          data.map(
            (ride) => ride.driver_id
          );


        // ============================================
        // GET DRIVER INFORMATION
        // ============================================

        const {
          data: driverProfiles,
          error: driverError,
        } = await supabase
          .from("driver_profiles")
          .select(`
            id,
            vehicle_make,
            vehicle_model
          `)
          .in(
            "id",
            driverIds
          );


        if (driverError) {

          console.error(
            "Error loading driver profiles:",
            driverError.message
          );

        }


        // ============================================
        // GET USER PROFILES
        // ============================================

        const {
          data: profiles,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name
          `)
          .in(
            "id",
            driverIds
          );


        if (profileError) {

          console.error(
            "Error loading profiles:",
            profileError.message
          );

        }


        // ============================================
        // COMBINE RIDE + DRIVER INFORMATION
        // ============================================

        const formattedRides: Ride[] =
          data.map((ride) => {

            const driverProfile =
              driverProfiles?.find(
                (driver) =>
                  driver.id === ride.driver_id
              );


            const profile =
              profiles?.find(
                (profile) =>
                  profile.id === ride.driver_id
              );


            const driverName =
              profile
                ? `${profile.first_name} ${profile.last_name}`
                : "Driver";


            const vehicle =
              driverProfile
                ? `${driverProfile.vehicle_make} ${driverProfile.vehicle_model}`
                : "Vehicle not available";


            return {

              id: ride.id,

              driver_id:
                ride.driver_id,

              pickup_location:
                ride.pickup_location,

              destination:
                ride.destination,

              ride_date:
                ride.ride_date,

              departure_time:
                ride.departure_time,

              available_seats:
                ride.available_seats,

              fare:
                ride.fare,

              notes:
                ride.notes,

              status:
                ride.status,

              driverName:
                driverName,

              vehicle:
                vehicle,

            };

          });


        setRides(
          formattedRides
        );


      } catch (error) {

        console.error(
          "Unexpected error loading rides:",
          error
        );

        setRides([]);

      } finally {

        setLoading(false);

      }

    };


    loadRides();

  }, []);


  // ==================================================
  // FILTER RIDES
  // ==================================================

  const filteredRides =
    useMemo(() => {

      return rides.filter(
        (ride) => {

          const searchText =
            search.toLowerCase();


          const searchMatch =
            ride.driverName
              .toLowerCase()
              .includes(searchText) ||

            ride.vehicle
              .toLowerCase()
              .includes(searchText) ||

            ride.pickup_location
              .toLowerCase()
              .includes(searchText) ||

            ride.destination
              .toLowerCase()
              .includes(searchText);


          let priceMatch = true;


          if (
            priceFilter ===
            "Under R100"
          ) {

            priceMatch =
              ride.fare <= 100;

          }


          if (
            priceFilter ===
            "Under R150"
          ) {

            priceMatch =
              ride.fare <= 150;

          }


          if (
            priceFilter ===
            "Under R200"
          ) {

            priceMatch =
              ride.fare <= 200;

          }


          let seatMatch = true;


          if (
            seatFilter === "1+"
          ) {

            seatMatch =
              ride.available_seats >= 1;

          }


          if (
            seatFilter === "2+"
          ) {

            seatMatch =
              ride.available_seats >= 2;

          }


          if (
            seatFilter === "3+"
          ) {

            seatMatch =
              ride.available_seats >= 3;

          }


          if (
            seatFilter === "4+"
          ) {

            seatMatch =
              ride.available_seats >= 4;

          }


          /*
           * Gender filtering is temporarily
           * not applied because gender is not
           * currently stored in the database.
           */


          return (
            searchMatch &&
            priceMatch &&
            seatMatch
          );

        }
      );

    }, [
      rides,
      search,
      priceFilter,
      genderFilter,
      seatFilter,
    ]);


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (
    date: string
  ) => {

    if (!date) {
      return "";
    }


    const parts =
      date.split("-");


    if (parts.length !== 3) {
      return date;
    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

  };


  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (
    time: string
  ) => {

    if (!time) {
      return "";
    }


    const parts =
      time.split(":");


    if (parts.length < 2) {
      return time;
    }


    let hour =
      Number(parts[0]);

    const minute =
      parts[1];


    const period =
      hour >= 12
        ? "PM"
        : "AM";


    hour =
      hour % 12 || 12;


    return `${hour}:${minute} ${period}`;

  };


  // ==================================================
  // RENDER RIDE
  // ==================================================

  const renderRide = ({
    item,
  }: {
    item: Ride;
  }) => (

    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate(
          "RideDetails"
        )
      }
    >

      <Image
        source={{
          uri:
            "https://placehold.co/100x100",
        }}
        style={styles.avatar}
      />


      <View style={styles.cardInfo}>

        {/* DRIVER */}

        <Text
          style={styles.driverName}
        >
          {item.driverName}
        </Text>


        {/* VEHICLE */}

        <View style={styles.detailRow}>

          <Ionicons
            name="car-outline"
            size={16}
            color={
              Colors.textSecondary
            }
          />

          <Text
            style={styles.detail}
          >
            {item.vehicle}
          </Text>

        </View>


        {/* PICKUP */}

        <View style={styles.detailRow}>

          <Ionicons
            name="location-outline"
            size={16}
            color={
              Colors.textSecondary
            }
          />

          <Text
            style={styles.detail}
            numberOfLines={1}
          >
            {item.pickup_location}
          </Text>

        </View>


        {/* DESTINATION */}

        <View style={styles.detailRow}>

          <Ionicons
            name="flag-outline"
            size={16}
            color={
              Colors.textSecondary
            }
          />

          <Text
            style={styles.detail}
            numberOfLines={1}
          >
            {item.destination}
          </Text>

        </View>


        {/* DATE */}

        <View style={styles.detailRow}>

          <Ionicons
            name="calendar-outline"
            size={16}
            color={
              Colors.textSecondary
            }
          />

          <Text
            style={styles.detail}
          >
            {formatDate(
              item.ride_date
            )}
          </Text>

        </View>


        {/* TIME */}

        <View style={styles.detailRow}>

          <Ionicons
            name="time-outline"
            size={16}
            color={
              Colors.textSecondary
            }
          />

          <Text
            style={styles.detail}
          >
            {formatTime(
              item.departure_time
            )}
          </Text>

        </View>


        {/* SEATS */}

        <View style={styles.detailRow}>

          <Ionicons
            name="people-outline"
            size={16}
            color={
              Colors.textSecondary
            }
          />

          <Text
            style={styles.detail}
          >
            {item.available_seats} Seats
          </Text>

        </View>


        {/* PRICE + BUTTON */}

        <View
          style={styles.bottomRow}
        >

          <Text
            style={styles.price}
          >
            R{item.fare}
          </Text>


          <TouchableOpacity
            style={styles.bookButton}
            onPress={(e) => {

              e.stopPropagation();

              navigation.navigate(
                "RideDetails"
              );

            }}
            activeOpacity={0.8}
          >

            <Text
              style={styles.bookButtonText}
            >
              View Ride
            </Text>


            <Ionicons
              name="arrow-forward"
              size={17}
              color={
                Colors.white
              }
            />

          </TouchableOpacity>

        </View>

      </View>

    </TouchableOpacity>

  );


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <SafeAreaView
        style={styles.container}
      >

        <View
          style={styles.loadingContainer}
        >

          <ActivityIndicator
            size="large"
            color={
              Colors.rider
            }
          />

          <Text
            style={styles.loadingText}
          >
            Loading available rides...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  // ==================================================
  // SCREEN
  // ==================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      <FlatList
        data={filteredRides}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={
          renderRide
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }

        ListHeaderComponent={
          <>

            {/* BACK BUTTON */}

            <TouchableOpacity
              style={
                styles.backButton
              }
              onPress={() =>
                navigation.goBack()
              }
              activeOpacity={0.7}
            >

              <Ionicons
                name="arrow-back"
                size={26}
                color={
                  Colors.primary
                }
              />

            </TouchableOpacity>


            {/* HEADER */}

            <View
              style={styles.header}
            >

              <Text
                style={styles.heading}
              >
                Search Results
              </Text>


              <Text
                style={styles.subHeading}
              >
                Find a ride that matches
                your trip.
              </Text>

            </View>


            {/* SEARCH */}

            <View
              style={
                styles.searchContainer
              }
            >

              <Ionicons
                name="search"
                size={21}
                color={
                  Colors.textSecondary
                }
              />


              <TextInput
                placeholder="Search driver or vehicle..."
                value={search}
                onChangeText={
                  setSearch
                }
                style={
                  styles.searchInput
                }
                placeholderTextColor="#999"
              />

            </View>


            {/* FILTERS */}

            <View
              style={styles.filterRow}
            >

              <TouchableOpacity
                style={
                  styles.filterButton
                }
                onPress={() =>
                  setPriceVisible(
                    true
                  )
                }
                activeOpacity={0.8}
              >

                <Ionicons
                  name="cash-outline"
                  size={17}
                  color={
                    Colors.primary
                  }
                />

                <Text
                  style={
                    styles.filterText
                  }
                >
                  {priceFilter}
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={
                  styles.filterButton
                }
                onPress={() =>
                  setGenderVisible(
                    true
                  )
                }
                activeOpacity={0.8}
              >

                <Ionicons
                  name="person-outline"
                  size={17}
                  color={
                    Colors.primary
                  }
                />

                <Text
                  style={
                    styles.filterText
                  }
                >
                  {genderFilter}
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={
                  styles.filterButton
                }
                onPress={() =>
                  setSeatVisible(
                    true
                  )
                }
                activeOpacity={0.8}
              >

                <Ionicons
                  name="people-outline"
                  size={17}
                  color={
                    Colors.primary
                  }
                />

                <Text
                  style={
                    styles.filterText
                  }
                >
                  {seatFilter}
                </Text>

              </TouchableOpacity>

            </View>


            {/* RESULTS COUNT */}

            <Text
              style={styles.results}
            >

              {filteredRides.length}{" "}

              {filteredRides.length === 1
                ? "Ride"
                : "Rides"}{" "}

              Found

            </Text>

          </>
        }

        ListEmptyComponent={

          <View
            style={
              styles.emptyContainer
            }
          >

            <Ionicons
              name="car-outline"
              size={50}
              color={
                Colors.textSecondary
              }
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No Rides Found
            </Text>


            <Text
              style={
                styles.emptyText
              }
            >
              There are currently no
              available ride offers
              matching your search.
            </Text>

          </View>

        }

      />


      {/* PRICE FILTER */}

      <FilterModal
        visible={
          priceVisible
        }
        title="Filter by Price"
        options={[
          "All",
          "Under R100",
          "Under R150",
          "Under R200",
        ]}
        selectedValue={
          priceFilter
        }
        onSelect={
          setPriceFilter
        }
        onClose={() =>
          setPriceVisible(
            false
          )
        }
      />


      {/* GENDER FILTER */}

      <FilterModal
        visible={
          genderVisible
        }
        title="Filter by Gender"
        options={[
          "All",
          "Male",
          "Female",
        ]}
        selectedValue={
          genderFilter
        }
        onSelect={
          setGenderFilter
        }
        onClose={() =>
          setGenderVisible(
            false
          )
        }
      />


      {/* SEAT FILTER */}

      <FilterModal
        visible={
          seatVisible
        }
        title="Filter by Seats"
        options={[
          "All",
          "1+",
          "2+",
          "3+",
          "4+",
        ]}
        selectedValue={
          seatFilter
        }
        onSelect={
          setSeatFilter
        }
        onClose={() =>
          setSeatVisible(
            false
          )
        }
      />

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


    listContent: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 30,
    },


    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },


    loadingText: {
      marginTop: 12,
      fontSize: 15,
      color:
        Colors.textSecondary,
    },


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
      marginBottom: 18,
      elevation: 3,
    },


    header: {
      marginBottom: 18,
    },


    heading: {
      fontSize: 30,
      fontWeight: "700",
      color:
        Colors.primary,
    },


    subHeading: {
      fontSize: 15,
      color:
        Colors.textSecondary,
      marginTop: 5,
    },


    searchContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        Colors.white,
      borderRadius: 15,
      minHeight: 58,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor:
        "#E6EAF0",
      marginBottom: 15,
    },


    searchInput: {
      flex: 1,
      height: 55,
      marginLeft: 10,
      color:
        Colors.textPrimary,
      fontSize: 15,
    },


    filterRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      marginBottom: 20,
      gap: 8,
    },


    filterButton: {
      flex: 1,
      minHeight: 44,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        Colors.white,
      paddingHorizontal: 8,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#E6EAF0",
      elevation: 2,
    },


    filterText: {
      color:
        Colors.primary,
      fontWeight:
        "600",
      fontSize: 13,
      marginLeft: 5,
    },


    results: {
      fontSize: 16,
      fontWeight:
        "600",
      color:
        Colors.textSecondary,
      marginBottom: 15,
    },


    card: {
      flexDirection:
        "row",
      backgroundColor:
        Colors.white,
      borderRadius: 20,
      padding: 15,
      marginBottom: 15,
      alignItems:
        "flex-start",
      shadowColor:
        Colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        0.12,
      shadowRadius: 5,
      elevation: 4,
    },


    avatar: {
      width: 75,
      height: 75,
      borderRadius: 38,
      backgroundColor:
        Colors.secondary,
    },


    cardInfo: {
      flex: 1,
      marginLeft: 14,
    },


    driverName: {
      fontSize: 19,
      fontWeight:
        "700",
      color:
        Colors.primary,
      marginBottom: 8,
    },


    detailRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 5,
    },


    detail: {
      flex: 1,
      fontSize: 14,
      color:
        Colors.textSecondary,
      marginLeft: 7,
    },


    bottomRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginTop: 10,
    },


    price: {
      fontSize: 21,
      fontWeight:
        "700",
      color:
        Colors.rider,
    },


    bookButton: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        Colors.rider,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 11,
    },


    bookButtonText: {
      color:
        Colors.white,
      fontSize: 14,
      fontWeight:
        "700",
      marginRight: 5,
    },


    emptyContainer: {
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingVertical: 60,
      paddingHorizontal: 30,
    },


    emptyTitle: {
      fontSize: 20,
      fontWeight:
        "700",
      color:
        Colors.primary,
      marginTop: 15,
    },


    emptyText: {
      fontSize: 14,
      color:
        Colors.textSecondary,
      textAlign:
        "center",
      lineHeight: 21,
      marginTop: 8,
    },

  });
