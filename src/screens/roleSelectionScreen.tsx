import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Colors from "../constants/colors";

import {
  RootStackParamList,
} from "../navigation/AppNavigator";

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export default function RoleSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>
        Choose Your Role
      </Text>

      <Text style={styles.subtitle}>
        Select how you would like to continue.
      </Text>

      {/* ================= RIDER ================= */}

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: Colors.riderLight,
          },
        ]}
        onPress={() =>
          navigation.navigate("RiderLogin")
        }
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: Colors.rider,
            },
          ]}
        >
          <Ionicons
            name="person"
            size={34}
            color={Colors.white}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>
            Rider
          </Text>

          <Text style={styles.cardDescription}>
            Find and book rides.
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={24}
          color={Colors.rider}
        />
      </TouchableOpacity>

      {/* ================= DRIVER ================= */}

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: Colors.driverLight,
          },
        ]}
        onPress={() =>
          navigation.navigate("DriverLogin")
        }
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: Colors.driver,
            },
          ]}
        >
          <Ionicons
            name="car"
            size={34}
            color={Colors.white}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>
            Driver
          </Text>

          <Text style={styles.cardDescription}>
            Offer rides to passengers.
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={24}
          color={Colors.driver}
        />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40,
  },

  card: {
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    elevation: 4,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    marginLeft: 16,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },

  cardDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});