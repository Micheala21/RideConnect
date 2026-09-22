
import React from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import { RootStackParamList } from "../../navigation/AppNavigator";


type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ViewMyRide"
>;


export default function ViewMyRideScreen() {

  const navigation = useNavigation<NavigationProp>();

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ================= BACK BUTTON ================= */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("DriverHome")}
          activeOpacity={0.7}
        >

          <Ionicons
            name="arrow-back"
            size={26}
            color={Colors.primary}
          />

        </TouchableOpacity>


        {/* ================= HEADER ================= */}

        <View style={styles.header}>

          <View style={styles.headerIcon}>

            <Ionicons
              name="time-outline"
              size={38}
              color={Colors.driver}
            />

          </View>

          <Text style={styles.heading}>
            Past Trips
          </Text>

          <Text style={styles.subtitle}>
            View your completed rides and trip history.
          </Text>

        </View>


        {/* ================= EMPTY STATE ================= */}

        <View style={styles.emptyCard}>

          <View style={styles.emptyIcon}>

            <Ionicons
              name="car-outline"
              size={42}
              color={Colors.driver}
            />

          </View>


          <Text style={styles.emptyTitle}>
            No Past Trips
          </Text>


          <Text style={styles.emptyText}>
            You haven't completed any rides yet.
            Your completed trips will appear here.
          </Text>

        </View>


        {/* ================= TRIP STATISTICS ================= */}

        <Text style={styles.sectionTitle}>
          Trip Statistics
        </Text>


        <View style={styles.statsContainer}>

          <View style={styles.statCard}>

            <Ionicons
              name="car-outline"
              size={28}
              color={Colors.driver}
            />

            <Text style={styles.statValue}>
              0
            </Text>

            <Text style={styles.statLabel}>
              Completed Trips
            </Text>

          </View>


          <View style={styles.statCard}>

            <Ionicons
              name="cash-outline"
              size={28}
              color={Colors.driver}
            />

            <Text style={styles.statValue}>
              R0
            </Text>

            <Text style={styles.statLabel}>
              Total Earnings
            </Text>

          </View>

        </View>


      </ScrollView>

    </SafeAreaView>

  );
}


const styles = StyleSheet.create({

  /* ================= CONTAINER ================= */

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    padding: 20,
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

  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 12,
  },

  subtitle: {
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
    fontSize: 15,
  },


  /* ================= EMPTY STATE ================= */

  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 3,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 18,
  },

  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 8,
  },


  /* ================= STATISTICS ================= */

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 28,
    marginBottom: 14,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    elevation: 3,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 10,
  },

  statLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
  },

});
