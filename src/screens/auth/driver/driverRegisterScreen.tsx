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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../../constants/colors";
import { RootStackParamList } from "../../../navigation/AppNavigator";

import ScreenHeader from "../../../components/ScreenHeader";
import CustomInput from "../../../components/CustomInput";
import PasswordInput from "../../../components/PasswordInput";
import CustomButton from "../../../components/CustomButton";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "DriverRegister"
>;

export default function DriverRegisterScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [licenceNumber, setLicenceNumber] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [availableSeats, setAvailableSeats] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = () => {
    console.log({
      firstName,
      lastName,
      email,
      phoneNumber,
      licenceNumber,
      vehicleMake,
      vehicleModel,
      registrationNumber,
      availableSeats,
      password,
      confirmPassword,
      acceptTerms,
    });

    // Connect to backend later
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ScreenHeader
          title="Driver Registration"
          subtitle="Become a RideConnect Driver"
          color={Colors.driver}
          icon="car"
        />

        {/* Personal Information */}

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

        {/* Driver Information */}

        <CustomInput
          label="Driver's Licence Number"
          placeholder="Enter licence number"
          value={licenceNumber}
          onChangeText={setLicenceNumber}
        />

        <CustomInput
          label="Vehicle Make"
          placeholder="Toyota"
          value={vehicleMake}
          onChangeText={setVehicleMake}
        />

        <CustomInput
          label="Vehicle Model"
          placeholder="Corolla"
          value={vehicleModel}
          onChangeText={setVehicleModel}
        />

        <CustomInput
          label="Vehicle Registration Number"
          placeholder="CA 123 456"
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
        />

        <CustomInput
          label="Available Seats"
          placeholder="4"
          value={availableSeats}
          onChangeText={setAvailableSeats}
          keyboardType="number-pad"
        />

        {/* Password */}

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

        {/* Terms */}

        <View style={styles.checkboxContainer}>
          <Checkbox
            value={acceptTerms}
            onValueChange={setAcceptTerms}
            color={acceptTerms ? Colors.driver : undefined}
          />

          <Text style={styles.checkboxText}>
            I agree to the Terms & Conditions
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Create Driver Account"
            color={Colors.driver}
            onPress={handleRegister}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("DriverLogin")}
          >
            <Text style={styles.loginText}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.textSecondary,
    flex: 1,
    fontSize: 14,
  },

  buttonContainer: {
    marginTop: 30,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 20,
  },

  footerText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },

  loginText: {
    color: Colors.driver,
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },
});