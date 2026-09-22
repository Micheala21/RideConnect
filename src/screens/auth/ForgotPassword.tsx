import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import { Ionicons } from "@expo/vector-icons";

import AuthInput from "../../components/AuthInput";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import Colors from "../../constants/colors";

import { supabase } from "../../lib/supabaseClient";


// =====================================================
// PROPS
// =====================================================

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ForgotPassword"
>;


// =====================================================
// SCREEN
// =====================================================

const ForgotPasswordScreen = ({
  navigation,
  route,
}: Props) => {

  const [email, setEmail] = useState("");

  const [emailError, setEmailError] =
    useState<string | undefined>();

  const [loading, setLoading] =
    useState(false);


  // ===================================================
  // USER ROLE
  // ===================================================

  const role = route.params.role;

  const loginRoute =
    role === "driver"
      ? "DriverLogin"
      : "RiderLogin";


  // ===================================================
  // HANDLE FORGOT PASSWORD
  // ===================================================

  const handleForgotPassword = async () => {

    setEmailError(undefined);


    // -------------------------------------------------
    // CHECK EMPTY EMAIL
    // -------------------------------------------------

    if (!email.trim()) {

      setEmailError(
        "Please enter your email address."
      );

      return;
    }


    // -------------------------------------------------
    // CHECK EMAIL FORMAT
    // -------------------------------------------------

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        email.trim()
      )
    ) {

      setEmailError(
        "Please enter a valid email address."
      );

      return;
    }


    setLoading(true);


    try {

      // ------------------------------------------------
      // CLEAN EMAIL
      // ------------------------------------------------

      const cleanedEmail =
        email.trim().toLowerCase();


      // ------------------------------------------------
      // SEND SUPABASE PASSWORD RESET EMAIL
      // ------------------------------------------------

      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          cleanedEmail
        );


      // ------------------------------------------------
      // CHECK RESPONSE
      // ------------------------------------------------

      if (error) {

        console.error(
          "Supabase password reset error:",
          error.message
        );

        Alert.alert(
          "Request Failed",
          error.message
        );

        return;
      }


      // ------------------------------------------------
      // PASSWORD RESET EMAIL SENT
      // ------------------------------------------------

      console.log(
        "Password reset email sent successfully."
      );


      // ------------------------------------------------
      // GO TO PASSWORD RESET SENT
      // ------------------------------------------------

      navigation.navigate(
        "PasswordResetSent",
        {
          role: role,
          email: cleanedEmail,
        }
      );

    } catch (error) {

      console.error(
        "Forgot password error:",
        error
      );

      Alert.alert(
        "Request Failed",
        error instanceof Error
          ? error.message
          : "Unable to send the password reset email."
      );

    } finally {

      setLoading(false);

    }
  };


  // ===================================================
  // SCREEN
  // ===================================================

  return (

    <SafeAreaView style={styles.container}>

      <View style={styles.content}>


        {/* ================= BACK BUTTON ================= */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate(loginRoute)
          }
          activeOpacity={0.7}
          disabled={loading}
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.primary}
          />

        </TouchableOpacity>


        {/* ================= ICON ================= */}

        <View style={styles.iconContainer}>

          <Ionicons
            name="lock-closed-outline"
            size={42}
            color={Colors.rider}
          />

        </View>


        {/* ================= TITLE ================= */}

        <Text style={styles.title}>
          Forgot Password?
        </Text>


        {/* ================= DESCRIPTION ================= */}

        <Text style={styles.description}>
          Enter the email address associated
          with your RideConnect account and
          we'll send you a link to reset your
          password.
        </Text>


        {/* ================= FORM ================= */}

        <View style={styles.formCard}>

          <AuthInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
          />


          {/* ================= SEND BUTTON ================= */}

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.disabledButton,
            ]}
            onPress={handleForgotPassword}
            disabled={loading}
            activeOpacity={0.8}
          >

            {loading ? (

              <ActivityIndicator
                color={Colors.white}
              />

            ) : (

              <>

                <Ionicons
                  name="mail-outline"
                  size={21}
                  color={Colors.white}
                />

                <Text style={styles.buttonText}>
                  Send Reset Link
                </Text>

              </>

            )}

          </TouchableOpacity>

        </View>


        {/* ================= BACK TO LOGIN ================= */}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() =>
            navigation.navigate(loginRoute)
          }
          disabled={loading}
          activeOpacity={0.7}
        >

          <Text style={styles.backText}>
            Back to Login
          </Text>

        </TouchableOpacity>


      </View>

    </SafeAreaView>
  );
};


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  // ===================================================
  // CONTAINER
  // ===================================================

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "center",
  },


  // ===================================================
  // BACK BUTTON
  // ===================================================

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
  },


  // ===================================================
  // ICON
  // ===================================================

  iconContainer: {
    width: 90,
    height: 90,

    borderRadius: 45,

    backgroundColor: Colors.riderLight,

    justifyContent: "center",
    alignItems: "center",

    alignSelf: "center",

    marginBottom: 22,
  },


  // ===================================================
  // TITLE
  // ===================================================

  title: {
    fontSize: 30,
    fontWeight: "700",

    color: Colors.primary,

    textAlign: "center",

    marginBottom: 12,
  },

  description: {
    fontSize: 15,

    lineHeight: 23,

    color: Colors.textSecondary,

    textAlign: "center",

    marginHorizontal: 10,

    marginBottom: 25,
  },


  // ===================================================
  // FORM CARD
  // ===================================================

  formCard: {
    backgroundColor: Colors.white,

    borderRadius: 20,

    padding: 20,

    elevation: 4,

    shadowOpacity: 0.05,
    shadowRadius: 7,

    shadowOffset: {
      width: 0,
      height: 3,
    },
  },


  // ===================================================
  // BUTTON
  // ===================================================

  button: {
    height: 56,

    borderRadius: 15,

    backgroundColor: Colors.rider,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.7,
  },

  buttonText: {
    color: Colors.white,

    fontSize: 16,

    fontWeight: "700",

    marginLeft: 8,
  },


  // ===================================================
  // LOGIN
  // ===================================================

  loginButton: {
    alignItems: "center",

    marginTop: 18,

    paddingVertical: 12,
  },

  backText: {
    color: Colors.rider,

    fontSize: 15,

    fontWeight: "700",
  },

});

export default ForgotPasswordScreen;
