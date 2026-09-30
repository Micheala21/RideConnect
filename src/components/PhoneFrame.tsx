import React from "react";
import {
  View,
  StyleSheet,
  Platform,
} from "react-native";

type PhoneFrameProps = {
  children: React.ReactNode;
};

export default function PhoneFrame({ children }: PhoneFrameProps) {
  // Only use the phone frame on the web.
  // Android and iOS remain full-screen.
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View style={styles.page}>
      <View style={styles.phone}>

        {/* Samsung-style front camera / U-notch */}
        <View style={styles.cameraNotch}>
          <View style={styles.cameraLens} />
        </View>

        {/* App display */}
        <View style={styles.screen}>
          {children}
        </View>

        {/* Bottom gesture indicator */}
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f2f2",
  },

  phone: {
    width: 390,
    height: 816,

    backgroundColor: "#111111",

    // Phone body
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "#242424",

    // Keep everything inside the phone
    overflow: "hidden",

    // Web shadow
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 18,

    elevation: 15,

    position: "relative",
  },

  screen: {
    flex: 1,

    backgroundColor: "#ffffff",

    borderRadius: 34,

    overflow: "hidden",
  },

  /*
   * Samsung Galaxy A24 uses a small
   * centered front-camera notch.
   */
  cameraNotch: {
    position: "absolute",

    top: 8,
    left: "50%",

    transform: [
      {
        translateX: -16,
      },
    ],

    width: 32,
    height: 10,

    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,

    backgroundColor: "#050505",

    zIndex: 20,

    alignItems: "center",
    justifyContent: "center",
  },

  cameraLens: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: "#202020",

    borderWidth: 1,
    borderColor: "#444444",
  },

  homeIndicator: {
    position: "absolute",

    bottom: 8,
    left: "50%",

    transform: [
      {
        translateX: -28,
      },
    ],

    width: 56,
    height: 4,

    borderRadius: 5,

    backgroundColor: "#FFFFFF",

    zIndex: 20,
  },
});