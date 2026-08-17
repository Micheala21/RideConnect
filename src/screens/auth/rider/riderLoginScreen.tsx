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
  "RiderLogin"
>;

export default function RiderLoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Remember Me:", rememberMe);

    navigation.navigate("RiderHome");
  };

  const handleRegister = () => {
    navigation.navigate("RiderRegister");
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Rider Login"
        subtitle="Welcome back! Sign in to continue."
        color={Colors.rider}
        icon="person"
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
              color={rememberMe ? Colors.rider : undefined}
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
            color={Colors.rider}
            onPress={handleLogin}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?
        </Text>

        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerText}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 container: {
    width: "92%",
    alignSelf: "center",
    marginTop: 70,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.primary,
  },

  input: {
    width: "100%",
    height: 58,
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.primary,
  },
  form: {
    marginTop: 10,
    width: "100%",
  },

  options: {
    width: "92%",
    alignSelf: "center",
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
    color: Colors.rider,
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
    marginTop: 30,
  },

  footerText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },

  registerText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.rider,
  },
});