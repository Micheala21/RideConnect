import React, { useState } from "react";

import {
  Alert,
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

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import ScreenHeader from "../../components/ScreenHeader";
import CustomInput from "../../components/CustomInput";
import PasswordInput from "../../components/PasswordInput";
import CustomButton from "../../components/CustomButton";

import { supabase } from "../../lib/supabaseClient";


// ==================================================
// NAVIGATION TYPE
// ==================================================

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "SignUp"
  >;


// ==================================================
// SCREEN
// ==================================================

export default function SignUpScreen() {

  const navigation =
    useNavigation<NavigationProp>();


  // ==================================================
  // ROLE
  // ==================================================

  const [role, setRole] =
    useState<"rider" | "driver">("rider");


  // ==================================================
  // PERSONAL INFORMATION
  // ==================================================

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");


  // ==================================================
  // DRIVER INFORMATION
  // ==================================================

  const [licenceNumber, setLicenceNumber] =
    useState("");

  const [vehicleMake, setVehicleMake] =
    useState("");

  const [vehicleModel, setVehicleModel] =
    useState("");

  const [registrationNumber, setRegistrationNumber] =
    useState("");

  const [availableSeats, setAvailableSeats] =
    useState("");


  // ==================================================
  // PASSWORD
  // ==================================================

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");


  // ==================================================
  // TERMS
  // ==================================================

  const [acceptTerms, setAcceptTerms] =
    useState(false);


  // ==================================================
  // LOADING
  // ==================================================

  const [loading, setLoading] =
    useState(false);


  // ==================================================
  // ROLE COLORS
  // ==================================================

  const roleColor =
    role === "rider"
      ? Colors.rider
      : Colors.driver;

  const roleIcon =
    role === "rider"
      ? "person-add"
      : "car";


  // ==================================================
  // REGISTER
  // ==================================================

  const handleRegister = async () => {

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword
    ) {

      Alert.alert(
        "Missing Information",
        "Please complete all required fields."
      );

      return;
    }


    // ==================================================
    // DRIVER VALIDATION
    // ==================================================

    if (
      role === "driver" &&
      (
        !licenceNumber ||
        !vehicleMake ||
        !vehicleModel ||
        !registrationNumber ||
        !availableSeats
      )
    ) {

      Alert.alert(
        "Missing Driver Information",
        "Please complete all driver and vehicle fields."
      );

      return;
    }


    // ==================================================
    // PASSWORD VALIDATION
    // ==================================================

    if (
      password !== confirmPassword
    ) {

      Alert.alert(
        "Password Error",
        "Passwords do not match."
      );

      return;
    }


    // ==================================================
    // TERMS VALIDATION
    // ==================================================

    if (!acceptTerms) {

      Alert.alert(
        "Terms & Conditions",
        "Please accept the Terms & Conditions to continue."
      );

      return;
    }


    try {

      setLoading(true);


      const cleanEmail =
        email.trim();

      const cleanPassword =
        password;


      // ==================================================
      // SUPABASE AUTH REGISTRATION
      // ==================================================

      const {
        data,
        error,
      } =
        await supabase.auth.signUp({

          email:
            cleanEmail,

          password:
            cleanPassword,

        });


      if (error) {

        console.error(
          "Supabase registration error:",
          error.message
        );

        Alert.alert(
          "Registration Failed",
          error.message
        );

        return;
      }


      if (!data.user) {

        Alert.alert(
          "Registration Failed",
          "Unable to create your account."
        );

        return;
      }


      console.log(
        "Auth account created:",
        data.user.id
      );


      // ==================================================
      // MAKE SURE WE HAVE AN ACTIVE SESSION
      // ==================================================

      let session =
        data.session;


      if (!session) {

        console.log(
          "No active session after registration. Signing in..."
        );


        const {
          data: loginData,
          error: loginError,
        } =
          await supabase.auth.signInWithPassword({

            email:
              cleanEmail,

            password:
              cleanPassword,

          });


        if (loginError) {

          console.error(
            "Automatic login error:",
            loginError.message
          );

          Alert.alert(
            "Registration Incomplete",
            "Your account was created, but we could not sign you in automatically. Please try logging in."
          );

          return;
        }


        session =
          loginData.session;


        if (!session) {

          Alert.alert(
            "Registration Incomplete",
            "Your account was created, but no active session was found."
          );

          return;
        }

      }


      console.log(
        "Session established successfully."
      );


      // ==================================================
      // CREATE PROFILE
      // ==================================================

      const {
        error: profileError,
      } =
        await supabase
          .from("profiles")
          .insert({

            id:
              data.user.id,

            first_name:
              firstName.trim(),

            last_name:
              lastName.trim(),

            phone_number:
              phoneNumber.trim(),

            role:
              role,

          });


      if (profileError) {

        console.error(
          "Profile creation error:",
          profileError.message
        );

        Alert.alert(
          "Registration Failed",
          profileError.message
        );

        return;
      }


      console.log(
        "Profile created successfully."
      );


      // ==================================================
      // CREATE DRIVER PROFILE
      // ==================================================

      if (role === "driver") {

        const {
          error: driverProfileError,
        } =
          await supabase
            .from("driver_profiles")
            .insert({

              id:
                data.user.id,

              licence_number:
                licenceNumber.trim(),

              vehicle_make:
                vehicleMake.trim(),

              vehicle_model:
                vehicleModel.trim(),

              registration_number:
                registrationNumber.trim(),

              available_seats:
                Number(availableSeats),

            });


        if (driverProfileError) {

          console.error(
            "Driver information creation error:",
            driverProfileError.message
          );

          Alert.alert(
            "Registration Failed",
            driverProfileError.message
          );

          return;
        }


        console.log(
          "Driver information created successfully."
        );

      }


      // ==================================================
      // SUCCESS
      // ==================================================

      console.log(
        `${role} registered successfully:`,
        data.user.id
      );


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
        "Registration error:",
        error
      );

      Alert.alert(
        "Registration Error",
        "Something went wrong. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // GO TO LOGIN
  // ==================================================

  const handleLogin = () => {

    navigation.navigate(
      "RoleSelection"
    );

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
          title="Create Account"
          subtitle="Create your RideConnect account"
          color={roleColor}
          icon={roleIcon as any}
        />


        {/* ================= ROLE SELECTION ================= */}

        <Text
          style={styles.roleTitle}
        >
          I am a...
        </Text>


        <View
          style={styles.roleContainer}
        >

          {/* ================= RIDER ================= */}

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "rider" &&
                {
                  borderColor:
                    Colors.rider,
                  backgroundColor:
                    Colors.riderLight,
                },
            ]}
            onPress={() =>
              setRole("rider")
            }
          >

            <Text
              style={[
                styles.roleButtonText,
                role === "rider" &&
                  {
                    color:
                      Colors.rider,
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
              role === "driver" &&
                {
                  borderColor:
                    Colors.driver,
                  backgroundColor:
                    Colors.driverLight,
                },
            ]}
            onPress={() =>
              setRole("driver")
            }
          >

            <Text
              style={[
                styles.roleButtonText,
                role === "driver" &&
                  {
                    color:
                      Colors.driver,
                  },
              ]}
            >
              Driver
            </Text>

          </TouchableOpacity>

        </View>


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


        {/* ==================================================
            DRIVER INFORMATION
        ================================================== */}

        {role === "driver" && (

          <View>

            <CustomInput
              label="Driver's Licence Number"
              placeholder="Enter licence number"
              value={licenceNumber}
              onChangeText={
                setLicenceNumber
              }
            />

            <CustomInput
              label="Vehicle Make"
              placeholder="Toyota"
              value={vehicleMake}
              onChangeText={
                setVehicleMake
              }
            />

            <CustomInput
              label="Vehicle Model"
              placeholder="Corolla"
              value={vehicleModel}
              onChangeText={
                setVehicleModel
              }
            />

            <CustomInput
              label="Vehicle Registration Number"
              placeholder="CA 123 456"
              value={registrationNumber}
              onChangeText={
                setRegistrationNumber
              }
            />

            <CustomInput
              label="Available Seats"
              placeholder="4"
              value={availableSeats}
              onChangeText={
                setAvailableSeats
              }
              keyboardType="number-pad"
            />

          </View>

        )}


        {/* ================= PASSWORD ================= */}

        <PasswordInput
          label="Password"
          value={password}
          onChangeText={setPassword}
        />

        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={
            setConfirmPassword
          }
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
                ? roleColor
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


        {/* ================= CREATE ACCOUNT ================= */}

        <View
          style={
            styles.buttonContainer
          }
        >

          <CustomButton
            title={
              loading
                ? "Creating Account..."
                : "Create Account"
            }
            color={roleColor}
            onPress={
              handleRegister
            }
          />

        </View>


        {/* ================= LOGIN ================= */}

        <View
          style={styles.footer}
        >

          <Text
            style={
              styles.footerText
            }
          >
            Already have an account?
          </Text>


          <TouchableOpacity
            onPress={handleLogin}
          >

            <Text
              style={[
                styles.loginText,
                {
                  color:
                    roleColor,
                },
              ]}
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


  roleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color:
      Colors.text,
    marginTop: 10,
    marginBottom: 12,
  },


  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },


  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor:
      Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },


  roleButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color:
      Colors.textSecondary,
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
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },

});