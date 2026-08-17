import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Logo from "./Logo";
import Colors from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
  title: string;
  subtitle: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function ScreenHeader({
  title,
  subtitle,
  color,
  icon,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <Logo
        color={color}
        icon={icon}
      />

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.primary,
  },

  subtitle: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 16,
  },
});