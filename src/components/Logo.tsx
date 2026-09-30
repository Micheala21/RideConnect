import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LogoProps {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function Logo({ color, icon }: LogoProps) {
  return (
    <View style={[styles.circle, { backgroundColor: color }]}>
      <Ionicons
        name={icon}
        size={40}
        color="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
});