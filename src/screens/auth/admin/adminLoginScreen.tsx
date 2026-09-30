import React, { useState } from "react";
import {
  SafeAreaView,
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
  "AdminLogin"
>;

export default function AdminLoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    console.log("Admin Login");
    console.log(email);
    console.log(password);

    // Later:
    // navigation.navigate("AdminHome");
  };

  const handleRegister = () => {
    console.log("Navigate to Admin Register");
    // navigation.navigate("AdminRegister");
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Admin Login"
        subtitle="Sign in to manage the RideConnect platform."
        color={Colors.admin}
        icon="settings"
      />

      <View style={styles.form}>
        <CustomInput
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <PasswordInput
          label="Password"
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.options}>
          <View style={styles.checkboxRow}>
            <Checkbox
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? Colors.admin : undefined}
            />

            <Text style={styles.optionText}>
              Remember Me
            </Text>
          </View>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Sign In"
            color={Colors.admin}
            onPress={handleLogin}
          />
        </View>
      </View>

     
       
     
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 25,
    justifyContent: "space-evenly",
  },

  form: {
    marginTop: 10,
  },

  options: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    color: Colors.textSecondary,
  },

  forgotText: {
    color: Colors.admin,
    fontSize: 14,
    fontWeight: "600",
  },

  buttonContainer: {
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
    color: Colors.textSecondary,
  },

  registerText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.admin,
  },
});