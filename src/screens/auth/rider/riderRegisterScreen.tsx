import React, { useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import Checkbox from "expo-checkbox";

import { useNavigation } from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Colors from "../../../constants/colors";

import {
  RootStackParamList,
} from "../../../navigation/AppNavigator";

import ScreenHeader from "../../../components/ScreenHeader";
import CustomInput from "../../../components/CustomInput";
import PasswordInput from "../../../components/PasswordInput";
import CustomButton from "../../../components/CustomButton";

import { supabase } from "../../../lib/supabaseClient";

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "RiderRegister"
  >;

export default function RiderRegisterScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  // ================= PERSONAL INFORMATION =================

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  // ================= PASSWORD =================

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  // ================= TERMS =================

  const [acceptTerms, setAcceptTerms] =
    useState(false);

  // ==================================================
  // REGISTER
  // ==================================================

  const handleRegister = async () => {
    try {
      // ================= VALIDATION =================

      if (
        !firstName ||
        !lastName ||
        !email ||
        !phoneNumber ||
        !password ||
        !confirmPassword
      ) {
        console.log(
          "Please complete all fields."
        );
        return;
      }

      if (password !== confirmPassword) {
        console.log(
          "Passwords do not match."
        );
        return;
      }

      if (!acceptTerms) {
        console.log(
          "Please accept the Terms & Conditions."
        );
        return;
      }

      // ================= SUPABASE AUTH =================

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error(
          "Supabase registration error:",
          error.message
        );
        return;
      }

      if (!data.user) {
        console.error(
          "User was not created."
        );
        return;
      }

      // ================= CREATE PROFILE =================

      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phoneNumber.trim(),
          role: "rider",
        });

      if (profileError) {
        console.error(
          "Profile creation error:",
          profileError.message
        );
        return;
      }

      console.log(
        "Rider registered successfully!"
      );

      navigation.navigate("RiderHome");

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContainer
        }
      >
        {/* ================= HEADER ================= */}

        <ScreenHeader
          title="Rider Registration"
          subtitle="Create your RideConnect account"
          color={Colors.rider}
          icon="person-add"
        />

        {/* ================= PERSONAL INFORMATION ================= */}

        <CustomInput
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <CustomInput
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={setLastName}
        />

        <CustomInput
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <CustomInput
          label="Phone Number"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        {/* ================= PASSWORD ================= */}

        <PasswordInput
          label="Password"
          value={password}
          onChangeText={setPassword}
        />

        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* ================= TERMS ================= */}

        <View
          style={
            styles.checkboxContainer
          }
        >
          <Checkbox
            value={acceptTerms}
            onValueChange={
              setAcceptTerms
            }
            color={
              acceptTerms
                ? Colors.rider
                : undefined
            }
          />

          <Text
            style={
              styles.checkboxText
            }
          >
            I agree to the Terms & Conditions
          </Text>
        </View>

        {/* ================= REGISTER BUTTON ================= */}

        <View
          style={
            styles.buttonContainer
          }
        >
          <CustomButton
            title="Create Account"
            color={Colors.rider}
            onPress={
              handleRegister
            }
          />
        </View>

        {/* ================= LOGIN ================= */}

        <View style={styles.footer}>
          <Text
            style={
              styles.footerText
            }
          >
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "RiderLogin"
              )
            }
          >
            <Text
              style={
                styles.loginText
              }
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
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

  scrollContainer: {
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 40,
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
  },

  checkboxText: {
    marginLeft: 10,
    color:
      Colors.textSecondary,
    flex: 1,
    fontSize: 14,
  },

  buttonContainer: {
    marginTop: 30,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },

  footerText: {
    color:
      Colors.textSecondary,
    fontSize: 15,
  },

  loginText: {
    color: Colors.rider,
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },
});