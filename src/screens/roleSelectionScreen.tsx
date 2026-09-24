import React, { useState } from "react";

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import Checkbox from "expo-checkbox";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Colors from "../constants/colors";

import {
  RootStackParamList,
} from "../navigation/AppNavigator";

import CustomInput from "../components/CustomInput";
import PasswordInput from "../components/PasswordInput";
import CustomButton from "../components/CustomButton";

import { supabase } from "../lib/supabaseClient";

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type UserRole = "rider" | "driver";

export default function RoleSelectionScreen() {

  const navigation =
    useNavigation<NavigationProp>();

  // ==================================================
  // STATE
  // ==================================================

  const [role, setRole] =
    useState<UserRole>("rider");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  // ==================================================
  // ROLE SETTINGS
  // ==================================================

  const roleColor =
    role === "rider"
      ? Colors.rider
      : Colors.driver;

  const roleIcon =
    role === "rider"
      ? "person"
      : "car";


  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async () => {

    if (!email || !password) {

      Alert.alert(
        "Missing Information",
        "Please enter your email and password."
      );

      return;
    }

    try {

      setLoading(true);

      // ==================================================
      // SUPABASE LOGIN
      // ==================================================

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({

          email:
            email.trim(),

          password:
            password,

        });


      if (error) {

        console.error(
          "Supabase login error:",
          error.message
        );

        Alert.alert(
          "Login Failed",
          error.message
        );

        return;
      }


      if (!data.user) {

        Alert.alert(
          "Login Failed",
          "Unable to retrieve your account."
        );

        return;
      }


      console.log(
        "User logged in successfully:",
        data.user.id
      );


      // ==================================================
      // GO TO CORRECT DASHBOARD
      // ==================================================

      if (role === "rider") {

        navigation.navigate(
          "RiderHome"
        );

      } else {

        navigation.navigate(
          "DriverHome"
        );

      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      Alert.alert(
        "Login Error",
        "Something went wrong. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==================================================
  // REGISTER
  // ==================================================

  const handleRegister = () => {

    if (role === "rider") {

      navigation.navigate(
        "RiderRegister"
      );

    } else {

      navigation.navigate(
        "DriverRegister"
      );

    }
  };


  // ==================================================
  // FORGOT PASSWORD
  // ==================================================

  const handleForgotPassword = () => {

    navigation.navigate(
      "ForgotPassword",
      {
        role: role,
      }
    );

  };


  // ==================================================
  // UI
  // ==================================================

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* ================= BACK BUTTON ================= */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          navigation.goBack()
        }
        activeOpacity={0.7}
      >

        <Ionicons
          name="arrow-back"
          size={24}
          color={Colors.primary}
        />

      </TouchableOpacity>


      {/* ================= HEADER ================= */}

      <View
        style={styles.header}
      >

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                roleColor,
            },
          ]}
        >

          <Ionicons
            name={roleIcon as any}
            size={32}
            color={Colors.white}
          />

        </View>


        <Text
          style={styles.title}
        >
          Welcome to RideConnect
        </Text>


        <Text
          style={styles.subtitle}
        >
          Login or create an account to continue.
        </Text>

      </View>


      {/* ================= ROLE SELECTION ================= */}

      <View
        style={styles.roleSection}
      >

        <Text
          style={styles.roleLabel}
        >
          I am a...
        </Text>


        <View
          style={styles.roleButtons}
        >

          {/* ================= RIDER ================= */}

          <TouchableOpacity
            style={[
              styles.roleButton,
              {
                borderColor:
                  role === "rider"
                    ? Colors.rider
                    : Colors.border,
                backgroundColor:
                  role === "rider"
                    ? Colors.riderLight
                    : Colors.white,
              },
            ]}
            onPress={() =>
              setRole("rider")
            }
            activeOpacity={0.8}
          >

            <Ionicons
              name="person"
              size={24}
              color={Colors.rider}
            />

            <Text
              style={[
                styles.roleText,
                {
                  color:
                    role === "rider"
                      ? Colors.rider
                      : Colors.primary,
                },
              ]}
            >
              Rider
            </Text>

          </TouchableOpacity>


          {/* ================= DRIVER ================= */}

          <TouchableOpacity
            style={[
              styles.roleButton,
              {
                borderColor:
                  role === "driver"
                    ? Colors.driver
                    : Colors.border,
                backgroundColor:
                  role === "driver"
                    ? Colors.driverLight
                    : Colors.white,
              },
            ]}
            onPress={() =>
              setRole("driver")
            }
            activeOpacity={0.8}
          >

            <Ionicons
              name="car"
              size={24}
              color={Colors.driver}
            />

            <Text
              style={[
                styles.roleText,
                {
                  color:
                    role === "driver"
                      ? Colors.driver
                      : Colors.primary,
                },
              ]}
            >
              Driver
            </Text>

          </TouchableOpacity>

        </View>

      </View>


      {/* ================= FORM ================= */}

      <View
        style={styles.form}
      >

        {/* EMAIL */}

        <CustomInput
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />


        {/* PASSWORD */}

        <PasswordInput
          label="Password"
          value={password}
          onChangeText={setPassword}
        />


        {/* ================= OPTIONS ================= */}

        <View
          style={styles.options}
        >

          <View
            style={styles.checkboxRow}
          >

            <Checkbox
              value={rememberMe}
              onValueChange={
                setRememberMe
              }
              color={
                rememberMe
                  ? roleColor
                  : undefined
              }
            />

            <Text
              style={styles.optionText}
            >
              Remember Me
            </Text>

          </View>


          <TouchableOpacity
            onPress={
              handleForgotPassword
            }
          >

            <Text
              style={[
                styles.forgotText,
                {
                  color:
                    roleColor,
                },
              ]}
            >
              Forgot Password?
            </Text>

          </TouchableOpacity>

        </View>


        {/* ================= LOGIN BUTTON ================= */}

        <View
          style={styles.buttonContainer}
        >

          <CustomButton
            title={
              loading
                ? "Signing In..."
                : "Sign In"
            }
            color={roleColor}
            onPress={handleLogin}
          />

        </View>

      </View>


      {/* ================= REGISTER ================= */}

      <View
        style={styles.footer}
      >

        <Text
          style={styles.footerText}
        >
          Don't have an account?
        </Text>


        <TouchableOpacity
          onPress={() =>
    navigation.navigate("SignUp")
  }
        >

          <Text
            style={[
              styles.registerText,
              {
                color:
                  roleColor,
              },
            ]}
          >
            Sign Up
          </Text>

        </TouchableOpacity>

      </View>

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
    paddingHorizontal: 15,
    justifyContent:
      "space-evenly",
  },


  // ================= HEADER =================

  header: {
    alignItems: "center",
  },


  iconContainer: {
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },


  title: {
    fontSize: 27,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },


  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },


  // ================= BACK BUTTON =================

  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    zIndex: 10,
  },


  // ================= ROLE =================

  roleSection: {
    width: "92%",
    alignSelf: "center",
  },


  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 10,
  },


  roleButtons: {
    flexDirection: "row",
    gap: 12,
  },


  roleButton: {
    flex: 1,
    height: 58,
    borderWidth: 2,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },


  roleText: {
    fontSize: 16,
    fontWeight: "700",
  },


  // ================= FORM =================

  form: {
    width: "100%",
    marginTop: 5,
  },


  options: {
    width: "92%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginTop: 18,
  },


  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },


  optionText: {
    marginLeft: 8,
    fontSize: 14,
    color:
      Colors.textSecondary,
  },


  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },


  buttonContainer: {
    width: "92%",
    alignSelf: "center",
    marginTop: 30,
  },


  // ================= FOOTER =================

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },


  footerText: {
    fontSize: 15,
    color:
      Colors.textSecondary,
  },


  registerText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "700",
  },

});