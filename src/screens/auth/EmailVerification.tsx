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

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import {
  resendVerificationEmail,
  verifyEmail,
} from "../../services/authServices";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "EmailVerification"
>;

const EmailVerificationScreen = ({
  navigation,
  route,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const email = route.params?.email || "";

  // ================= GO TO CORRECT LOGIN =================

  const handleBackToLogin = () => {
    if (route.params?.role === "driver") {
      navigation.navigate("DriverLogin");
    } else {
      navigation.navigate("RiderLogin");
    }
  };

  // ================= VERIFY EMAIL =================

  const handleVerification = async () => {
    const token = route.params?.token;

    if (!token) {
      Alert.alert(
        "Check Your Email",
        "Please open the verification link sent to your email address. The verification link will complete the process.",
      );

      return;
    }

    setLoading(true);

    try {
      const response = await verifyEmail(token);

      if (!response.success) {
        Alert.alert(
          "Verification Failed",
          response.message ||
            "Unable to verify your email.",
        );

        return;
      }

      Alert.alert(
        "Email Verified",
        "Your email address has been successfully verified.",
        [
          {
            text: "Continue",
            onPress: handleBackToLogin,
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error instanceof Error
          ? error.message
          : "Unable to verify your email.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND EMAIL =================

  const handleResend = async () => {
    if (!email) {
      Alert.alert(
        "Email Required",
        "We need your email address to resend the verification email.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await resendVerificationEmail(email);

      if (!response.success) {
        Alert.alert(
          "Unable to Resend",
          response.message ||
            "Unable to resend the verification email.",
        );

        return;
      }

      Alert.alert(
        "Email Sent",
        "A new verification email has been sent.",
      );
    } catch (error) {
      Alert.alert(
        "Unable to Resend",
        error instanceof Error
          ? error.message
          : "Unable to resend the verification email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* ================= EMAIL ICON ================= */}

        <View style={styles.iconCircle}>
          <Text style={styles.icon}>
            ✉
          </Text>
        </View>

        {/* ================= TITLE ================= */}

        <Text style={styles.title}>
          Verify Your Email
        </Text>

        {/* ================= DESCRIPTION ================= */}

        <Text style={styles.description}>
          We've sent a verification link
          {" "}
          to your email address.
        </Text>

        {/* ================= EMAIL ================= */}

        {email ? (
          <Text style={styles.email}>
            {email}
          </Text>
        ) : null}

        {/* ================= SECONDARY TEXT ================= */}

        <Text style={styles.secondaryText}>
          Open the email and follow the
          verification link to activate
          your RideConnect account.
        </Text>

        {/* ================= CHECK VERIFICATION ================= */}

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.buttonText}>
              Check Verification
            </Text>
          )}
        </TouchableOpacity>

        {/* ================= RESEND ================= */}

        <TouchableOpacity
          onPress={handleResend}
          disabled={loading}
        >
          <Text style={styles.resendText}>
            Resend Verification Email
          </Text>
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
    alignItems: "center",
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },

  icon: {
    fontSize: 36,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#6B7280",
    textAlign: "center",
  },

  email: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
    marginBottom: 12,
    textAlign: "center",
  },

  secondaryText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 30,
  },

  button: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  resendText: {
    marginTop: 20,
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "600",
  },

  backText: {
    marginTop: 24,
    color: "#6B7280",
    fontSize: 15,
  },
});

export default EmailVerificationScreen;