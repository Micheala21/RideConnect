import React, { useEffect, useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/colors";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import { supabase } from "../../lib/supabaseClient";


export default function DriverSetupScreen() {

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();


  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [phone, setPhone] = useState("");

  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [registration, setRegistration] = useState("");
  const [seats, setSeats] = useState("");

  const [message, setMessage] = useState("");


  // ==================================================
  // LOAD DRIVER INFORMATION
  // ==================================================

  useEffect(() => {

    const loadDriver = async () => {

      try {

        setMessage("");


        // ==================================================
        // GET LOGGED-IN DRIVER
        // ==================================================

        const {
          data: {
            user,
          },
          error: authError,
        } =
          await supabase.auth.getUser();


        if (authError) {

          console.error(
            "Error getting driver:",
            authError.message
          );

          setMessage(
            "Unable to load your account."
          );

          return;
        }


        if (!user) {

          setMessage(
            "You are not logged in."
          );

          return;
        }


        // ==================================================
        // LOAD PERSONAL INFORMATION
        // ==================================================

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select(
              "first_name, last_name, phone_number"
            )
            .eq(
              "id",
              user.id
            )
            .single();


        if (profileError) {

          console.error(
            "Error loading driver profile:",
            profileError.message
          );

          setMessage(
            profileError.message
          );

          return;
        }


        // ==================================================
        // LOAD DRIVER INFORMATION
        // ==================================================

        const {
          data: driverProfile,
          error: driverProfileError,
        } =
          await supabase
            .from("driver_profiles")
            .select(
              "vehicle_make, vehicle_model, registration_number, available_seats"
            )
            .eq(
              "id",
              user.id
            )
            .single();


        if (driverProfileError) {

          console.error(
            "Error loading driver information:",
            driverProfileError.message
          );

          setMessage(
            driverProfileError.message
          );

          return;
        }


        // ==================================================
        // SET FORM VALUES
        // ==================================================

        setFirstName(
          profile.first_name || ""
        );

        setLastName(
          profile.last_name || ""
        );

        setPhone(
          profile.phone_number || ""
        );

        setVehicleMake(
          driverProfile.vehicle_make || ""
        );

        setVehicleModel(
          driverProfile.vehicle_model || ""
        );

        setRegistration(
          driverProfile.registration_number || ""
        );

        setSeats(
          driverProfile.available_seats !== null &&
          driverProfile.available_seats !== undefined
            ? String(driverProfile.available_seats)
            : ""
        );


      } catch (error) {

        console.error(
          "Error loading driver information:",
          error
        );

        setMessage(
          "Unable to load your information."
        );

      }

    };


    loadDriver();

  }, []);


  // ==================================================
  // SAVE CHANGES
  // ==================================================

  const handleSave = async () => {

    try {

      setMessage("");


      // ==================================================
      // GET LOGGED-IN DRIVER
      // ==================================================

      const {
        data: {
          user,
        },
        error: authError,
      } =
        await supabase.auth.getUser();


      if (authError) {

        console.error(
          "Authentication error:",
          authError.message
        );

        setMessage(
          "Unable to verify your account."
        );

        return;
      }


      if (!user) {

        setMessage(
          "You are not logged in."
        );

        return;
      }


      // ==================================================
      // UPDATE PERSONAL INFORMATION
      // ==================================================

      const {
        error: profileError,
      } =
        await supabase
          .from("profiles")
          .update({

            first_name:
              firstName.trim(),

            last_name:
              lastName.trim(),

            phone_number:
              phone.trim(),

          })
          .eq(
            "id",
            user.id
          );


      if (profileError) {

        console.error(
          "Error updating driver profile:",
          profileError.message
        );

        setMessage(
          profileError.message
        );

        return;
      }


      // ==================================================
      // UPDATE DRIVER INFORMATION
      // ==================================================

      const {
        error: driverProfileError,
      } =
        await supabase
          .from("driver_profiles")
          .update({

            vehicle_make:
              vehicleMake.trim(),

            vehicle_model:
              vehicleModel.trim(),

            registration_number:
              registration.trim(),

            available_seats:
              Number(seats),

          })
          .eq(
            "id",
            user.id
          );


      if (driverProfileError) {

        console.error(
          "Error updating driver information:",
          driverProfileError.message
        );

        setMessage(
          driverProfileError.message
        );

        return;
      }


      // ==================================================
      // SUCCESS
      // ==================================================

      console.log(
        "Driver information updated successfully."
      );


      navigation.navigate(
        "DriverHome"
      );


    } catch (error) {

      console.error(
        "Error updating driver information:",
        error
      );

      setMessage(
        "Unable to update your information."
      );

    }

  };


  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <View style={styles.iconContainer}>

          <Ionicons
            name="create-outline"
            size={50}
            color={Colors.driver}
          />

        </View>


        <Text style={styles.heading}>
          Edit Information
        </Text>


        <Text style={styles.subtitle}>
          Update your personal and vehicle information.
        </Text>


        {/* ================= PERSONAL ================= */}

        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>


        <TextInput
          placeholder="First Name"
          placeholderTextColor={
            Colors.textSecondary
          }
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />


        <TextInput
          placeholder="Last Name"
          placeholderTextColor={
            Colors.textSecondary
          }
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />


        <TextInput
          placeholder="Phone Number"
          placeholderTextColor={
            Colors.textSecondary
          }
          keyboardType="phone-pad"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
        />


        {/* ================= VEHICLE ================= */}

        <Text style={styles.sectionTitle}>
          Vehicle Information
        </Text>


        <TextInput
          placeholder="Vehicle Make"
          placeholderTextColor={
            Colors.textSecondary
          }
          style={styles.input}
          value={vehicleMake}
          onChangeText={setVehicleMake}
        />


        <TextInput
          placeholder="Vehicle Model"
          placeholderTextColor={
            Colors.textSecondary
          }
          style={styles.input}
          value={vehicleModel}
          onChangeText={setVehicleModel}
        />


        <TextInput
          placeholder="Registration Number"
          placeholderTextColor={
            Colors.textSecondary
          }
          style={styles.input}
          value={registration}
          onChangeText={setRegistration}
        />


        <TextInput
          placeholder="Available Seats"
          placeholderTextColor={
            Colors.textSecondary
          }
          keyboardType="numeric"
          style={styles.input}
          value={seats}
          onChangeText={setSeats}
        />


        {/* ================= ERROR MESSAGE ================= */}

        {message ? (

          <View style={styles.messageContainer}>

            <Ionicons
              name="alert-circle"
              size={21}
              color="#DC2626"
            />

            <Text style={styles.messageText}>
              {message}
            </Text>

          </View>

        ) : null}


        {/* ================= SAVE ================= */}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          activeOpacity={0.8}
        >

          <Ionicons
            name="save-outline"
            size={21}
            color={Colors.white}
          />

          <Text style={styles.buttonText}>
            Save Changes
          </Text>

        </TouchableOpacity>


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
    padding: 25,
    paddingBottom: 40,
  },

  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.driverLight,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 15,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginTop: 18,
  },

  subtitle: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 30,
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 15,
    marginTop: 10,
  },

  input: {
    height: 58,
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.primary,
    fontSize: 16,
  },

  messageContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
  },

  messageText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 14,
    marginLeft: 8,
  },

  button: {
    height: 58,
    backgroundColor: Colors.driver,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },

});

