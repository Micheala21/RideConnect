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
  "RiderRegister"
>;

export default function RiderRegisterScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = () => {
    console.log({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      acceptTerms,
    });

    // TODO:
    // Validate fields
    // Register user with backend
    // Navigate to Rider Home
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ScreenHeader
          title="Rider Registration"
          subtitle="Create your RideConnect account"
          color={Colors.rider}
          icon="person-add"
        />

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

        <View style={styles.checkboxContainer}>
          <Checkbox
            value={acceptTerms}
            onValueChange={setAcceptTerms}
            color={acceptTerms ? Colors.rider : undefined}
          />

          <Text style={styles.checkboxText}>
            I agree to the Terms & Conditions
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Create Account"
            color={Colors.rider}
            onPress={handleRegister}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("RiderLogin")}
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
    marginTop:30,
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
    fontSize: 14,
    flex: 1,
  },

  buttonContainer: {
    marginTop: 30,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },

  footerText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },

  loginText: {
    color: Colors.rider,
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 6,
  },
});