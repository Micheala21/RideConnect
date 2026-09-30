import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { RootStackParamList } from "../navigation/AppNavigator";

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Welcome"
>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1200&auto=format&fit=crop",
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="car-sport"
                size={50}
                color="#002C5C"
              />
            </View>

            <Text style={styles.title}>RideConnect</Text>

            <Text style={styles.subtitle}>
              Ride Smarter. Travel Together.
            </Text>

            <Text style={styles.description}>
              Find trusted drivers and passengers near you for affordable,
              safe and reliable journeys.
            </Text>
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("RoleSelection")}
            >
              <Text style={styles.primaryButtonText}>
                Get Started
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#002C5C"
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.75)",
  },

  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  logoContainer: {
    marginTop: 90,
    alignItems: "center",
  },

  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "700",
  },

  subtitle: {
    color: "#99ABBE",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
  },

  description: {
    color: "#FFFFFF",
    opacity: 0.9,
    fontSize: 17,
    textAlign: "center",
    marginTop: 25,
    lineHeight: 28,
    paddingHorizontal: 15,
  },

 bottomContainer: {
  marginBottom: 30,
  alignItems: "center",
},

primaryButton: {
  backgroundColor: "#FFFFFF",
  height: 58,
  width: "92%",
  borderRadius: 16,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
},

  primaryButtonText: {
    color: "#002C5C",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
});