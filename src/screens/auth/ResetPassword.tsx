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

import AuthInput from "../../components/AuthInput";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import {
  resetPassword,
} from "../../services/authServices";

import {
  validatePassword,
  validatePasswordConfirmation,
} from "../../utils/validation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ResetPassword"
>;

const ResetPasswordScreen = ({
  navigation,
  route,
}: Props) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordError, setPasswordError] =
    useState<string | undefined>();

  const [
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState<string | undefined>();

  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setPasswordError(undefined);
    setConfirmPasswordError(undefined);

    // ================= CHECK TOKEN =================

    if (!route.params?.token) {
      Alert.alert(
        "Invalid Reset Link",
        "The password reset link is missing or invalid.",
      );

      return;
    }

    // ================= VALIDATE PASSWORD =================

    const newPasswordError =
      validatePassword(password);

    const confirmationError =
      validatePasswordConfirmation(
        password,
        confirmPassword,
      );

    if (newPasswordError) {
      setPasswordError(newPasswordError);
    }

    if (confirmationError) {
      setConfirmPasswordError(
        confirmationError,
      );
    }

    if (
      newPasswordError ||
      confirmationError
    ) {
      return;
    }

    // ================= RESET PASSWORD =================

    setLoading(true);

    try {
      const response = await resetPassword({
        token: route.params.token,
        password,
      });

      if (!response.success) {
        Alert.alert(
          "Reset Failed",
          response.message ||
            "Unable to reset your password.",
        );

        return;
      }

      // ================= SUCCESS =================

      Alert.alert(
        "Password Updated",
        "Your password has been successfully reset.",
        [
          {
            text: "Go to Login",
            onPress: () => {
              if (
                route.params?.role ===
                "driver"
              ) {
                navigation.navigate(
                  "DriverLogin",
                );
              } else {
                navigation.navigate(
                  "RiderLogin",
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Reset Failed",
        error instanceof Error
          ? error.message
          : "Unable to reset your password.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= BACK TO LOGIN =================

  const handleBackToLogin = () => {
    if (
      route.params?.role === "driver"
    ) {
      navigation.navigate(
        "DriverLogin",
      );
    } else {
      navigation.navigate(
        "RiderLogin",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* ================= TITLE ================= */}

        <Text style={styles.title}>
          Reset Password
        </Text>

        <Text style={styles.description}>
          Create a new password for your
          RideConnect account.
        </Text>

        {/* ================= NEW PASSWORD ================= */}

        <AuthInput
          label="New Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your new password"
          error={passwordError}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* ================= CONFIRM PASSWORD ================= */}

        <AuthInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your new password"
          error={confirmPasswordError}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* ================= RESET BUTTON ================= */}

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.buttonText}>
              Reset Password
            </Text>
          )}
        </TouchableOpacity>

        {/* ================= BACK TO LOGIN ================= */}

        <TouchableOpacity
          onPress={handleBackToLogin}
          disabled={loading}
        >
          <Text style={styles.backText}>
            Back to Login
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#6B7280",
    marginBottom: 25,
  },

  button: {
    height: 52,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  backText: {
    textAlign: "center",
    marginTop: 24,
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default ResetPasswordScreen;