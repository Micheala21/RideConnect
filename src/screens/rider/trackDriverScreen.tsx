
import React from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
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

// ================= MAP =================

import RideMap from "../../components/RideMap";

// ==================================================
// NAVIGATION
// ==================================================

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "TrackDriver"
  >;

// ==================================================
// SCREEN
// ==================================================

export default function TrackDriverScreen() {

  const navigation =
    useNavigation<NavigationProp>();

  // ==================================================
  // DRIVER INFORMATION
  // ==================================================

  const driver = {

    name: "Alice Johnson",

    vehicle: "Toyota Prius",

    registration: "CA 123-456",

    rating: 4.9,

    eta: "5 mins",

    pickup: "CPUT Bellville Campus",

    destination: "Cape Town CBD",

    avatar:
      "https://placehold.co/150x150",
  };

  // ==================================================
  // UI
  // ==================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      {/* ==================================================
          LIVE MAP
      ================================================== */}

      <View style={styles.mapContainer}>

        <RideMap />

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


        {/* Live Badge */}

        <View style={styles.liveBadge}>

          <View style={styles.liveDot} />

          <Text style={styles.liveText}>
            Live Trip
          </Text>

        </View>

      </View>


      {/* ==================================================
          DRIVER INFORMATION
      ================================================== */}

      <ScrollView
        style={styles.bottomCard}
        contentContainerStyle={styles.bottomContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Small Handle */}

        <View style={styles.handle} />


        {/* ================= DRIVER ================= */}

        <View
          style={styles.driverSection}
        >

          <View style={styles.avatarContainer}>

            <Image
              source={{
                uri: driver.avatar,
              }}
              style={styles.avatar}
            />

            <View style={styles.verifiedBadge}>

              <Ionicons
                name="checkmark"
                size={13}
                color={Colors.white}
              />

            </View>

          </View>


          <View style={styles.driverDetails}>

            <Text
              style={styles.driverName}
            >
              {driver.name}
            </Text>


            <View style={styles.driverInfoRow}>

              <Ionicons
                name="car-outline"
                size={16}
                color={Colors.textSecondary}
              />

              <Text
                style={styles.driverInfo}
              >
                {driver.vehicle}
              </Text>

            </View>


            <View style={styles.driverInfoRow}>

              <Ionicons
                name="star"
                size={16}
                color={Colors.rider}
              />

              <Text
                style={styles.driverInfo}
              >
                {driver.rating} Rating
              </Text>

            </View>

          </View>


          {/* CALL DRIVER */}

          <TouchableOpacity
            style={styles.callButton}
            activeOpacity={0.8}
          >

            <Ionicons
              name="call"
              size={22}
              color={Colors.white}
            />

          </TouchableOpacity>

        </View>


        {/* ==================================================
            TRIP STATUS
        ================================================== */}

        <View
          style={styles.statusCard}
        >

          <View style={styles.statusHeader}>

            <View style={styles.statusIcon}>

              <Ionicons
                name="navigate"
                size={20}
                color={Colors.rider}
              />

            </View>

            <View>

              <Text
                style={styles.statusTitle}
              >
                Driver Status
              </Text>

              <Text
                style={styles.statusSubtitle}
              >
                Your driver is on the way
              </Text>

            </View>

          </View>


          {/* ETA */}

          <View
            style={styles.statusRow}
          >

            <View style={styles.detailIcon}>

              <Ionicons
                name="time-outline"
                size={19}
                color={Colors.rider}
              />

            </View>

            <View style={styles.statusTextContainer}>

              <Text style={styles.statusLabel}>
                Estimated Arrival
              </Text>

              <Text style={styles.statusText}>
                {driver.eta}
              </Text>

            </View>

          </View>


          {/* PICKUP */}

          <View
            style={styles.statusRow}
          >

            <View style={styles.detailIcon}>

              <Ionicons
                name="location-outline"
                size={19}
                color={Colors.rider}
              />

            </View>

            <View style={styles.statusTextContainer}>

              <Text style={styles.statusLabel}>
                Pickup Location
              </Text>

              <Text style={styles.statusText}>
                {driver.pickup}
              </Text>

            </View>

          </View>


          {/* DESTINATION */}

          <View
            style={styles.statusRow}
          >

            <View style={styles.detailIcon}>

              <Ionicons
                name="flag-outline"
                size={19}
                color={Colors.rider}
              />

            </View>

            <View style={styles.statusTextContainer}>

              <Text style={styles.statusLabel}>
                Destination
              </Text>

              <Text style={styles.statusText}>
                {driver.destination}
              </Text>

            </View>

          </View>


          {/* VEHICLE REGISTRATION */}

          <View
            style={styles.statusRow}
          >

            <View style={styles.detailIcon}>

              <Ionicons
                name="car-sport-outline"
                size={19}
                color={Colors.rider}
              />

            </View>

            <View style={styles.statusTextContainer}>

              <Text style={styles.statusLabel}>
                Vehicle Registration
              </Text>

              <Text style={styles.statusText}>
                {driver.registration}
              </Text>

            </View>

          </View>

        </View>


        {/* ==================================================
            VIEW RECEIPT
        ================================================== */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate(
              "TripReceipt"
            )
          }
          activeOpacity={0.8}
        >

          <Ionicons
            name="receipt-outline"
            size={21}
            color={Colors.white}
          />

          <Text
            style={styles.primaryButtonText}
          >
            View Trip Receipt
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color={Colors.white}
            style={styles.buttonArrow}
          />

        </TouchableOpacity>


        {/* ==================================================
            CANCEL RIDE
        ================================================== */}

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
        >

          <Ionicons
            name="close-circle-outline"
            size={21}
            color={Colors.danger}
          />

          <Text
            style={styles.secondaryButtonText}
          >
            Cancel Ride
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },


  // ================= MAP =================

  mapContainer: {
    flex: 1.05,
    overflow: "hidden",
    position: "relative",
  },


  // ================= BACK BUTTON =================

  backButton: {
    position: "absolute",

    top: 15,
    left: 20,

    width: 45,
    height: 45,

    borderRadius: 23,

    backgroundColor:
      Colors.white,

    justifyContent:
      "center",

    alignItems:
      "center",

    elevation: 4,

    shadowOpacity: 0.15,

    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },


  // ================= LIVE BADGE =================

  liveBadge: {
    position: "absolute",

    top: 18,
    right: 20,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor:
      Colors.white,

    borderRadius: 20,

    paddingHorizontal: 13,
    paddingVertical: 8,

    elevation: 3,
  },


  liveDot: {
    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor:
      Colors.success,

    marginRight: 7,
  },


  liveText: {
    fontSize: 13,

    fontWeight: "700",

    color:
      Colors.primary,
  },


  // ================= BOTTOM CARD =================

  bottomCard: {
    flex: 0.95,

    backgroundColor:
      Colors.white,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    marginTop: -15,
  },


  bottomContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 35,
  },


  handle: {
    width: 45,
    height: 5,

    borderRadius: 3,

    backgroundColor:
      "#D9DEE5",

    alignSelf: "center",

    marginBottom: 20,
  },


  // ================= DRIVER =================

  driverSection: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 20,
  },


  avatarContainer: {
    position: "relative",

    marginRight: 14,
  },


  avatar: {
    width: 72,
    height: 72,

    borderRadius: 36,

    backgroundColor:
      Colors.secondary,

    borderWidth: 3,

    borderColor:
      Colors.background,
  },


  verifiedBadge: {
    position: "absolute",

    right: -2,
    bottom: -1,

    width: 25,
    height: 25,

    borderRadius: 13,

    backgroundColor:
      Colors.rider,

    borderWidth: 3,

    borderColor:
      Colors.white,

    justifyContent:
      "center",

    alignItems:
      "center",
  },


  driverDetails: {
    flex: 1,
  },


  driverName: {
    fontSize: 21,

    fontWeight: "700",

    color:
      Colors.primary,

    marginBottom: 5,
  },


  driverInfoRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 4,
  },


  driverInfo: {
    marginLeft: 6,

    color:
      Colors.textSecondary,

    fontSize: 14,
  },


  // ================= CALL =================

  callButton: {
    width: 50,
    height: 50,

    borderRadius: 25,

    backgroundColor:
      Colors.success,

    justifyContent:
      "center",

    alignItems:
      "center",

    elevation: 3,
  },


  // ================= STATUS =================

  statusCard: {
    backgroundColor:
      "#EEF5FB",

    borderRadius: 20,

    padding: 18,

    marginBottom: 20,
  },


  statusHeader: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 18,
  },


  statusIcon: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor:
      Colors.white,

    justifyContent:
      "center",

    alignItems:
      "center",

    marginRight: 11,
  },


  statusTitle: {
    fontSize: 18,

    fontWeight: "700",

    color:
      Colors.primary,
  },


  statusSubtitle: {
    fontSize: 13,

    color:
      Colors.textSecondary,

    marginTop: 2,
  },


  statusRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 13,
  },


  detailIcon: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor:
      Colors.white,

    justifyContent:
      "center",

    alignItems:
      "center",

    marginRight: 11,
  },


  statusTextContainer: {
    flex: 1,
  },


  statusLabel: {
    fontSize: 12,

    color:
      Colors.textSecondary,

    marginBottom: 2,
  },


  statusText: {
    color:
      Colors.primary,

    fontSize: 15,

    fontWeight: "600",
  },


  // ================= PRIMARY BUTTON =================

  primaryButton: {
    backgroundColor:
      Colors.rider,

    height: 58,

    borderRadius: 16,

    justifyContent:
      "center",

    alignItems:
      "center",

    flexDirection: "row",

    marginBottom: 13,

    elevation: 3,

    position: "relative",
  },


  primaryButtonText: {
    color:
      Colors.white,

    fontWeight: "700",

    fontSize: 17,

    marginLeft: 8,
  },


  buttonArrow: {
    position: "absolute",

    right: 18,
  },


  // ================= CANCEL =================

  secondaryButton: {
    height: 58,

    borderRadius: 16,

    borderWidth: 2,

    borderColor:
      Colors.danger,

    justifyContent:
      "center",

    alignItems:
      "center",

    flexDirection: "row",

    marginBottom: 10,
  },


  secondaryButtonText: {
    color:
      Colors.danger,

    fontWeight: "700",

    fontSize: 17,

    marginLeft: 8,
  },

});
