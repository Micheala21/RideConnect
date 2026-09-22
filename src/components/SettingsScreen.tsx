import React, { useMemo, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../constants/colors";
import { supabase } from "../lib/supabaseClient";

export type SettingsRole = "rider" | "driver";

interface SettingsScreenProps {
  role: SettingsRole;
}

interface NotificationPreferences {
  primary: boolean;
  tripReminders: boolean;
  accountActivity: boolean;
  promotions: boolean;
}

const roleContent = {
  rider: {
    title: "Rider Settings",
    subtitle: "Manage your account and ride preferences",
    accent: Colors.rider,
    accentLight: Colors.riderLight,

    notifications: {
      primaryTitle: "Driver and booking updates",
      primaryDescription:
        "Get updates when a driver accepts or changes your ride",
      tripDescription:
        "Receive reminders before your booked ride",
      accountDescription:
        "Security alerts and important account activity",
    },

    preferenceTitle: "Preferred payment method",
    preferenceOptions: ["Cash", "Card", "Either"],
    defaultPreference: "Cash",
  },

  driver: {
    title: "Driver Settings",
    subtitle: "Manage your account and driving preferences",
    accent: Colors.driver,
    accentLight: Colors.driverLight,

    notifications: {
      primaryTitle: "New rider requests",
      primaryDescription:
        "Get notified when a rider requests your offered trip",
      tripDescription:
        "Receive reminders before your scheduled trip",
      accountDescription:
        "Security alerts, cancellations and account activity",
    },

    preferenceTitle: "Default available seats",
    preferenceOptions: ["1", "2", "3", "4"],
    defaultPreference: "4",
  },
} as const;

export default function SettingsScreen({
  role,
}: SettingsScreenProps) {

  const content = roleContent[role];

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] =
    useState(false);

  const [notifications, setNotifications] =
    useState<NotificationPreferences>({
      primary: true,
      tripReminders: true,
      accountActivity: true,
      promotions: false,
    });

  const [preference, setPreference] =
    useState<string>(
      content.defaultPreference
    );

  const [language, setLanguage] =
    useState("English");

  const [locationEnabled, setLocationEnabled] =
    useState(true);


  const updateNotification = (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {

    setNotifications((previous) => ({
      ...previous,
      [key]: value,
    }));

  };



const changePassword = async () => {

  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {

    Alert.alert(
      "Missing password",
      "Please complete all password fields."
    );

    return;
  }


  if (newPassword.length < 8) {

    Alert.alert(
      "Password too short",
      "Your new password must contain at least 8 characters."
    );

    return;
  }


  if (newPassword !== confirmPassword) {

    Alert.alert(
      "Passwords do not match",
      "Please confirm your new password."
    );

    return;
  }


  if (currentPassword === newPassword) {

    Alert.alert(
      "Invalid password",
      "Your new password must be different from your current password."
    );

    return;
  }


  try {

    // Get the currently logged-in user
    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser();


    if (userError || !user) {

      Alert.alert(
        "Session error",
        "Your session could not be found. Please log in again."
      );

      return;
    }


    if (!user.email) {

      Alert.alert(
        "Account error",
        "Your account email could not be found."
      );

      return;
    }


    // Verify the current password
    const {
      error: loginError,
    } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });


    if (loginError) {

      Alert.alert(
        "Incorrect password",
        "Your current password is incorrect."
      );

      return;
    }


    // Update the password in Supabase Auth
    const {
      error: updateError,
    } = await supabase.auth.updateUser({
      password: newPassword,
    });


    if (updateError) {

      console.error(
        "Password update error:",
        updateError.message
      );

      Alert.alert(
        "Password update failed",
        updateError.message
      );

      return;
    }


    // Clear password fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");


    Alert.alert(
      "Password changed",
      "Your password has been updated successfully."
    );

  } catch (error) {

    console.error(
      "Change password error:",
      error
    );

    Alert.alert(
      "Error",
      "Something went wrong while changing your password."
    );

  }

};




  return (

    <SafeAreaView style={styles.safeArea}>

      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >

          {/* ================= HEADER ================= */}

          <View style={styles.header}>

            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor:
                    content.accentLight,
                },
              ]}
            >

              <Ionicons
                name="settings-outline"
                size={30}
                color={content.accent}
              />

            </View>


            <View style={styles.headerText}>

              <Text style={styles.title}>
                {content.title}
              </Text>

              <Text style={styles.subtitle}>
                {content.subtitle}
              </Text>

            </View>

          </View>


          {/* ================= PASSWORD & SECURITY ================= */}

          <SectionHeader
            icon="shield-checkmark-outline"
            title="Password & Security"
            description="Keep your RideConnect account protected"
            color={content.accent}
          />


          <View style={styles.card}>

            <PasswordField
              label="Current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              visible={showCurrentPassword}
              onToggleVisibility={() =>
                setShowCurrentPassword(
                  (current) => !current
                )
              }
            />


            <PasswordField
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              visible={showNewPassword}
              onToggleVisibility={() =>
                setShowNewPassword(
                  (current) => !current
                )
              }
            />


            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              visible={showNewPassword}
              onToggleVisibility={() =>
                setShowNewPassword(
                  (current) => !current
                )
              }
            />


            <Text style={styles.passwordHint}>
              Use at least 8 characters with a mix of
              letters and numbers.
            </Text>


            <PrimaryButton
              title="Change password"
              icon="key-outline"
              color={content.accent}
              onPress={changePassword}
            />


            <View style={styles.divider} />


            <SwitchRow
              icon="phone-portrait-outline"
              title="Two-step verification"
              description="Add an extra layer of security when you sign in"
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              color={content.accent}
              lightColor={content.accentLight}
            />

          </View>


          {/* ================= NOTIFICATIONS ================= */}

          <SectionHeader
            icon="notifications-outline"
            title="Notifications"
            description="Choose which RideConnect alerts you receive"
            color={content.accent}
          />


          <View style={styles.card}>

            <SwitchRow
              icon={
                role === "rider"
                  ? "car-outline"
                  : "people-outline"
              }
              title={
                content.notifications.primaryTitle
              }
              description={
                content.notifications.primaryDescription
              }
              value={notifications.primary}
              onValueChange={(value) =>
                updateNotification(
                  "primary",
                  value
                )
              }
              color={content.accent}
              lightColor={content.accentLight}
            />


            <View style={styles.divider} />


            <SwitchRow
              icon="time-outline"
              title="Trip reminders"
              description={
                content.notifications.tripDescription
              }
              value={notifications.tripReminders}
              onValueChange={(value) =>
                updateNotification(
                  "tripReminders",
                  value
                )
              }
              color={content.accent}
              lightColor={content.accentLight}
            />


            <View style={styles.divider} />


            <SwitchRow
              icon="shield-outline"
              title="Account and safety alerts"
              description={
                content.notifications.accountDescription
              }
              value={notifications.accountActivity}
              onValueChange={(value) =>
                updateNotification(
                  "accountActivity",
                  value
                )
              }
              color={content.accent}
              lightColor={content.accentLight}
            />


            <View style={styles.divider} />


            <SwitchRow
              icon="megaphone-outline"
              title="Promotions and news"
              description="Occasional offers, updates and RideConnect news"
              value={notifications.promotions}
              onValueChange={(value) =>
                updateNotification(
                  "promotions",
                  value
                )
              }
              color={content.accent}
              lightColor={content.accentLight}
            />

          </View>


          {/* ================= PREFERENCES ================= */}

          <SectionHeader
            icon="options-outline"
            title="Preferences"
            description="Personalise your RideConnect experience"
            color={content.accent}
          />


          <View style={styles.card}>

            <Text style={styles.preferenceLabel}>
              {content.preferenceTitle}
            </Text>


            <View style={styles.pillRow}>

              {content.preferenceOptions.map(
                (option) => (

                  <OptionPill
                    key={option}
                    label={option}
                    selected={
                      preference === option
                    }
                    color={content.accent}
                    lightColor={
                      content.accentLight
                    }
                    onPress={() =>
                      setPreference(option)
                    }
                  />

                )
              )}

            </View>


            <Text
              style={[
                styles.preferenceLabel,
                styles.preferenceSpacing,
              ]}
            >
              App language
            </Text>


            <View style={styles.pillRow}>

              {[
                "English",
                "Afrikaans",
                "isiXhosa",
              ].map((option) => (

                <OptionPill
                  key={option}
                  label={option}
                  selected={
                    language === option
                  }
                  color={content.accent}
                  lightColor={
                    content.accentLight
                  }
                  onPress={() =>
                    setLanguage(option)
                  }
                />

              ))}

            </View>


            <View style={styles.divider} />


            <SwitchRow
              icon="location-outline"
              title="Location services"
              description={
                role === "rider"
                  ? "Use your location for nearby rides and live trip tracking"
                  : "Use your location for route matching and live trip tracking"
              }
              value={locationEnabled}
              onValueChange={
                setLocationEnabled
              }
              color={content.accent}
              lightColor={
                content.accentLight
              }
            />

          </View>


          <Text style={styles.footerText}>
            RideConnect · Settings for {role}s
          </Text>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>

  );
}


/* ================================================== */
/* SECTION HEADER */
/* ================================================== */

interface SectionHeaderProps {

  icon: keyof typeof Ionicons.glyphMap;

  title: string;

  description: string;

  color: string;

}


function SectionHeader({
  icon,
  title,
  description,
  color,
}: SectionHeaderProps) {

  return (

    <View style={styles.sectionHeader}>

      <Ionicons
        name={icon}
        size={22}
        color={color}
      />


      <View style={styles.sectionHeaderText}>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>


        <Text style={styles.sectionDescription}>
          {description}
        </Text>

      </View>

    </View>

  );

}


/* ================================================== */
/* PASSWORD FIELD */
/* ================================================== */

interface PasswordFieldProps {

  label: string;

  value: string;

  onChangeText: (value: string) => void;

  visible: boolean;

  onToggleVisibility: () => void;

}


function PasswordField({
  label,
  value,
  onChangeText,
  visible,
  onToggleVisibility,
}: PasswordFieldProps) {

  return (

    <View style={styles.fieldGroup}>

      <Text style={styles.inputLabel}>
        {label}
      </Text>


      <View style={styles.inputContainer}>

        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={Colors.textSecondary}
        />


        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter password"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!visible}
          autoCapitalize="none"
        />


        <TouchableOpacity
          onPress={onToggleVisibility}
          accessibilityRole="button"
          accessibilityLabel={
            visible
              ? "Hide password"
              : "Show password"
          }
        >

          <Ionicons
            name={
              visible
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={21}
            color={Colors.textSecondary}
          />

        </TouchableOpacity>

      </View>

    </View>

  );

}


/* ================================================== */
/* SWITCH ROW */
/* ================================================== */

interface SwitchRowProps {

  icon: keyof typeof Ionicons.glyphMap;

  title: string;

  description: string;

  value: boolean;

  onValueChange: (value: boolean) => void;

  color: string;

  lightColor: string;

}


function SwitchRow({
  icon,
  title,
  description,
  value,
  onValueChange,
  color,
  lightColor,
}: SwitchRowProps) {

  return (

    <View style={styles.switchRow}>

      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor:
              lightColor,
          },
        ]}
      >

        <Ionicons
          name={icon}
          size={20}
          color={color}
        />

      </View>


      <View style={styles.switchText}>

        <Text style={styles.rowTitle}>
          {title}
        </Text>


        <Text style={styles.rowDescription}>
          {description}
        </Text>

      </View>


      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#CBD5E1",
          true: lightColor,
        }}
        thumbColor={
          value
            ? color
            : "#F8FAFC"
        }
        ios_backgroundColor="#CBD5E1"
      />

    </View>

  );

}


/* ================================================== */
/* OPTION PILL */
/* ================================================== */

interface OptionPillProps {

  label: string;

  selected: boolean;

  color: string;

  lightColor: string;

  onPress: () => void;

}


function OptionPill({
  label,
  selected,
  color,
  lightColor,
  onPress,
}: OptionPillProps) {

  return (

    <TouchableOpacity
      style={[
        styles.pill,
        selected && {
          backgroundColor:
            lightColor,
          borderColor:
            color,
        },
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{
        checked: selected,
      }}
    >

      {selected && (

        <Ionicons
          name="checkmark-circle"
          size={17}
          color={color}
        />

      )}


      <Text
        style={[
          styles.pillText,
          selected && {
            color,
            fontWeight: "700",
          },
        ]}
      >
        {label}
      </Text>

    </TouchableOpacity>

  );

}


/* ================================================== */
/* PRIMARY BUTTON */
/* ================================================== */

interface PrimaryButtonProps {

  title: string;

  icon: keyof typeof Ionicons.glyphMap;

  color: string;

  onPress: () => void;

}


function PrimaryButton({
  title,
  icon,
  color,
  onPress,
}: PrimaryButtonProps) {

  return (

    <TouchableOpacity
      style={[
        styles.primaryButton,
        {
          backgroundColor: color,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >

      <Ionicons
        name={icon}
        size={20}
        color={Colors.white}
      />


      <Text style={styles.primaryButtonText}>
        {title}
      </Text>

    </TouchableOpacity>

  );

}


/* ================================================== */
/* STYLES */
/* ================================================== */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 36,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: Colors.textPrimary,
    fontSize: 27,
    fontWeight: "800",
  },

  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 11,
    marginTop: 2,
  },

  sectionHeaderText: {
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },

  sectionDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 17,
    marginBottom: 27,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  fieldGroup: {
    marginBottom: 15,
  },

  inputLabel: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },

  inputContainer: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderColor: "#D7E0E9",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  passwordHint: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -3,
    marginBottom: 15,
  },

  primaryButton: {
    minHeight: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#E8EDF2",
    marginVertical: 17,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  switchText: {
    flex: 1,
    paddingRight: 10,
  },

  rowTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },

  rowDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  preferenceLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 11,
  },

  preferenceSpacing: {
    marginTop: 20,
  },

  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  pill: {
    minHeight: 39,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 20,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
  },

  pillText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  footerText: {
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 12,
    marginTop: 1,
  },

});
