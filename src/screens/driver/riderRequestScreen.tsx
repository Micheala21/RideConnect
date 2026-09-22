
import React from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/AppNavigator";

import Colors from "../../constants/colors";


type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;


export default function RiderRequestsScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  const riders = [

    {
      name: "Sarah Williams",
      pickup: "CPUT Bellville Campus",
      destination: "Cape Town CBD",
      pickupTime: "08:30 AM",
      distance: "22 km",
      routeMatch: "95%",
      passengers: 2,
      gender: "Female",
      offer: "R120",
    },


    {
      name: "John Smith",
      pickup: "Bellville",
      destination: "Cape Town CBD",
      pickupTime: "09:00 AM",
      distance: "20 km",
      routeMatch: "90%",
      passengers: 1,
      gender: "Male",
      offer: "R100",
    },


    {
      name: "Emily Jacobs",
      pickup: "Tyger Valley",
      destination: "Cape Town CBD",
      pickupTime: "07:45 AM",
      distance: "25 km",
      routeMatch: "92%",
      passengers: 1,
      gender: "Female",
      offer: "R110",
    },


    {
      name: "Michael Adams",
      pickup: "Parow",
      destination: "Woodstock",
      pickupTime: "08:15 AM",
      distance: "18 km",
      routeMatch: "88%",
      passengers: 3,
      gender: "Male",
      offer: "R150",
    },


    {
      name: "Jessica Daniels",
      pickup: "Kraaifontein",
      destination: "Cape Town CBD",
      pickupTime: "07:30 AM",
      distance: "30 km",
      routeMatch: "85%",
      passengers: 2,
      gender: "Female",
      offer: "R140",
    },


    {
      name: "David Williams",
      pickup: "Century City",
      destination: "Cape Town CBD",
      pickupTime: "09:15 AM",
      distance: "15 km",
      routeMatch: "97%",
      passengers: 1,
      gender: "Male",
      offer: "R90",
    },


    {
      name: "Lerato Mokoena",
      pickup: "Maitland",
      destination: "Cape Town Station",
      pickupTime: "08:50 AM",
      distance: "12 km",
      routeMatch: "91%",
      passengers: 2,
      gender: "Female",
      offer: "R100",
    },

  ];


  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ================= BACK BUTTON ================= */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate("DriverHome")
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

        <Text style={styles.heading}>
          Rider Requests
        </Text>

        <Text style={styles.subtitle}>
          Passengers looking for available rides
        </Text>


        {/* ================= RIDER REQUESTS ================= */}

        {
          riders.map((rider, index) => (

            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() =>
                navigation.navigate(
                  "RiderRequestDetails",
                  {
                    rider: rider
                  }
                )
              }
            >

              <Text style={styles.name}>
                {rider.name}
              </Text>


              <Text style={styles.route}>
                📍 {rider.pickup}
              </Text>


              <Text style={styles.route}>
                🏁 {rider.destination}
              </Text>


              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  Pickup Time
                </Text>

                <Text style={styles.value}>
                  {rider.pickupTime}
                </Text>

              </View>


              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  Distance
                </Text>

                <Text style={styles.value}>
                  {rider.distance}
                </Text>

              </View>


              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  Passengers
                </Text>

                <Text style={styles.value}>
                  {rider.passengers}
                </Text>

              </View>


              <View style={styles.infoRow}>

                <Text style={styles.label}>
                  Route Match
                </Text>

                <Text style={styles.value}>
                  {rider.routeMatch}
                </Text>

              </View>


              <Text style={styles.offer}>
                {rider.offer}
              </Text>


              <View style={styles.button}>

                <Text style={styles.buttonText}>
                  View Request
                </Text>

              </View>


            </TouchableOpacity>

          ))
        }


      </ScrollView>

    </SafeAreaView>

  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
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
    color: Colors.textSecondary,
    marginTop: 5,
    marginBottom: 25,
    fontSize: 15,
  },


  /* ================= RIDER CARD ================= */

  card: {
    backgroundColor: Colors.white,
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
    color: Colors.textSecondary,
    marginBottom: 8,
  },


  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },


  label: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.driver,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },


  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

});
