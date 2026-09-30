import React from "react";

import {
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

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import Colors from "../../constants/colors";


type Props = NativeStackScreenProps<
  RootStackParamList,
  "PasswordResetSent"
>;


const PasswordResetSentScreen = ({
  navigation,
  route,
}: Props) => {

  // Determine which login screen the user should return to
  const role = route.params?.role;

  const handleBackToLogin = () => {

    if (role === "driver") {

      navigation.navigate("DriverLogin");

    } else {

      navigation.navigate("RiderLogin");

    }

  };


  return (

    <SafeAreaView style={styles.container}>

      <View style={styles.content}>


        {/* ================= SUCCESS ICON ================= */}

        <View style={styles.iconCircle}>

          <Ionicons
            name="checkmark"
            size={42}
            color={Colors.rider}
          />

        </View>


        {/* ================= TITLE ================= */}

        <Text style={styles.title}>
          Check Your Email
        </Text>


        {/* ================= CARD ================= */}

        <View style={styles.card}>

          {/* Main Description */}

          <Text style={styles.description}>
            If an account exists with the email
            address you provided, we've sent you
            instructions to reset your password.
          </Text>


          {/* Divider */}

          <View style={styles.divider} />


          {/* Secondary Description */}

          <View style={styles.instructionRow}>

            <Ionicons
              name="mail-outline"
              size={22}
              color={Colors.rider}
            />

            <Text style={styles.secondaryDescription}>
              Open the email and follow the password
              reset link to create a new password.
            </Text>

          </View>

        </View>


        {/* ================= BACK TO LOGIN ================= */}

        <TouchableOpacity
          style={styles.button}
          onPress={handleBackToLogin}
          activeOpacity={0.8}
        >

          <Ionicons
            name="arrow-back"
            size={21}
            color={Colors.white}
          />

          <Text style={styles.buttonText}>
            Back to Login
          </Text>

        </TouchableOpacity>


      </View>

    </SafeAreaView>

  );

};


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

    justifyContent: "center",

    alignItems: "center",
  },


  // ===================================================
  // SUCCESS ICON
  // ===================================================

  iconCircle: {
    width: 92,
    height: 92,

    borderRadius: 46,

    backgroundColor: Colors.riderLight,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 22,
  },


  // ===================================================
  // TITLE
  // ===================================================

  title: {
    fontSize: 29,

    fontWeight: "700",

    color: Colors.primary,

    textAlign: "center",

    marginBottom: 22,
  },


  // ===================================================
  // CARD
  // ===================================================

  card: {
    width: "100%",

    backgroundColor: Colors.white,

    borderRadius: 20,

    padding: 22,

    elevation: 4,

    shadowOpacity: 0.05,

    shadowRadius: 7,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    marginBottom: 25,
  },


  // ===================================================
  // DESCRIPTION
  // ===================================================

  description: {
    fontSize: 15,

    lineHeight: 23,

    color: Colors.textSecondary,

    textAlign: "center",
  },


  // ===================================================
  // DIVIDER
  // ===================================================

  divider: {
    height: 1,

    backgroundColor: "#ECECEC",

    marginVertical: 20,
  },


  // ===================================================
  // INSTRUCTIONS
  // ===================================================

  instructionRow: {
    flexDirection: "row",

    alignItems: "flex-start",
  },

  secondaryDescription: {
    flex: 1,

    fontSize: 14,

    lineHeight: 21,

    color: Colors.textSecondary,

    marginLeft: 10,
  },


  // ===================================================
  // BUTTON
  // ===================================================

  button: {
    width: "100%",

    height: 56,

    borderRadius: 15,

    backgroundColor: Colors.rider,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    elevation: 2,
  },

  buttonText: {
    color: Colors.white,

    fontSize: 16,

    fontWeight: "700",

    marginLeft: 8,
  },

});

export default PasswordResetSentScreen;

