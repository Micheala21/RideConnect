import React, { useState } from "react";

import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Checkbox from "expo-checkbox";

import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

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


// ==================================================
// NAVIGATION TYPE
// ==================================================

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "DriverLogin"
  >;


// ==================================================
// SCREEN
// ==================================================

export default function DriverLoginScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  // ==================================================
  // STATE
  // ==================================================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


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
          "Supabase driver login error:",
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
        "Driver logged in successfully:",
        data.user.id
      );


      // ==================================================
      // GO TO DRIVER HOME
      // ==================================================

      navigation.navigate(
        "DriverHome"
      );

    } catch (error) {

      console.error(
        "Driver Login error:",
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

    navigation.navigate(
      "DriverRegister"
    );

  };


  // ==================================================
  // FORGOT PASSWORD
  // ==================================================

  const handleForgotPassword = () => {

    navigation.navigate(
      "ForgotPassword",
      {
        role: "driver",
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
          navigation.navigate("RoleSelection")
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

      <ScreenHeader
        title="Driver Login"
        subtitle="Welcome back! Sign in to continue."
        color={Colors.driver}
        icon="car"
      />


      {/* ================= FORM ================= */}

      <View style={styles.form}>

        {/* ================= EMAIL ================= */}

        <CustomInput
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />


        {/* ================= PASSWORD ================= */}

        <PasswordInput
          label="Password"
          value={password}
          onChangeText={setPassword}
        />


        {/* ================= OPTIONS ================= */}

        <View
          style={styles.options}
        >

          {/* Remember Me */}

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
                  ? Colors.driver
                  : undefined
              }
            />

            <Text
              style={
                styles.optionText
              }
            >
              Remember Me
            </Text>

          </View>


          {/* Forgot Password */}

          <TouchableOpacity
            onPress={
              handleForgotPassword
            }
          >

            <Text
              style={
                styles.forgotText
              }
            >
              Forgot Password?
            </Text>

          </TouchableOpacity>

        </View>


        {/* ================= SIGN IN BUTTON ================= */}

        <View
          style={
            styles.buttonContainer
          }
        >

          <CustomButton
            title={
              loading
                ? "Signing In..."
                : "Sign In"
            }
            color={Colors.driver}
            onPress={handleLogin}
          />

        </View>

      </View>


      {/* ================= REGISTER ================= */}

      <View
        style={styles.footer}
      >

        <Text
          style={
            styles.footerText
          }
        >
          Don't have an account?
        </Text>


        <TouchableOpacity
          onPress={
            handleRegister
          }
        >

          <Text
            style={
              styles.registerText
            }
          >
            Register
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


  /* Back Button */

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


  form: {
    width: "100%",
    marginTop: 10,
  },


  options: {
    width: "92%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginTop: 20,
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
    color: Colors.driver,
    fontSize: 14,
    fontWeight: "600",
  },


  buttonContainer: {
    width: "92%",
    alignSelf: "center",
    marginTop: 35,
  },


  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
    color: Colors.driver,
  },

});
