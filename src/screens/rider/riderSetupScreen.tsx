import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import Colors from "../../constants/colors";
import { supabase } from "../../lib/supabaseClient";

export default function RiderSetupScreen() {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // These are currently frontend-only because they
  // are not fields in the Supabase profiles table yet.
  const [homeLocation, setHomeLocation] = useState("Bellville");
  const [emergencyContact, setEmergencyContact] =
    useState("082 999 4567");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRiderProfile();
  }, []);

  const fetchRiderProfile = async () => {
    try {
      const {
        data: {
          user,
        },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log(
          "No authenticated rider found:",
          userError?.message
        );

        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "first_name, last_name, phone_number, role"
        )
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.log(
          "Failed to get rider profile:",
          profileError.message
        );
      } else {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setPhone(profile.phone_number || "");
      }
    } catch (error) {
      console.error(
        "Error fetching rider profile:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const {
        data: {
          user,
        },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log(
          "No authenticated rider found:",
          userError?.message
        );

        return;
      }

      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phone.trim(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.log(
          "Failed to update rider information:",
          profileError.message
        );

        return;
      }

      console.log(
        "Rider information updated successfully"
      );

      navigation.navigate("RiderHome" as never);
    } catch (error) {
      console.error(
        "Error updating rider information:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Header */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.heading}>
              Update Information
            </Text>

            <Text style={styles.subHeading}>
              Update your personal details.
            </Text>
          </View>

        </View>


        {/* Profile Icon */}

        <View style={styles.profileContainer}>

          <View style={styles.profileIcon}>
            <Ionicons
              name="person-outline"
              size={42}
              color={Colors.rider}
            />
          </View>

          <Text style={styles.profileText}>
            Personal Information
          </Text>

        </View>


        {/* Loading */}

        {loading ? (

          <View style={styles.loadingContainer}>

            <ActivityIndicator
              size="large"
              color={Colors.rider}
            />

            <Text style={styles.loadingText}>
              Loading your information...
            </Text>

          </View>

        ) : (

          <>

            {/* Form */}

            <View style={styles.formCard}>

              <InputField
                label="First Name"
                icon="person-outline"
                value={firstName}
                onChangeText={setFirstName}
              />

              <InputField
                label="Last Name"
                icon="person-outline"
                value={lastName}
                onChangeText={setLastName}
              />

              <InputField
                label="Email"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={false}
              />

              <InputField
                label="Phone Number"
                icon="call-outline"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <InputField
                label="Home Location"
                icon="location-outline"
                value={homeLocation}
                onChangeText={setHomeLocation}
              />

              <InputField
                label="Emergency Contact"
                icon="alert-circle-outline"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                keyboardType="phone-pad"
                isLast
              />

            </View>


            {/* Save Button */}

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving && styles.disabledButton,
              ]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={saving}
            >

              {saving ? (

                <ActivityIndicator
                  size="small"
                  color={Colors.white}
                />

              ) : (

                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={23}
                    color={Colors.white}
                  />

                  <Text style={styles.saveButtonText}>
                    Save Changes
                  </Text>
                </>

              )}

            </TouchableOpacity>


            {/* Cancel */}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              disabled={saving}
            >

              <Text style={styles.cancelText}>
                Cancel
              </Text>

            </TouchableOpacity>

          </>

        )}

      </ScrollView>

    </SafeAreaView>
  );
}


interface InputFieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  isLast?: boolean;
  editable?: boolean;
}


function InputField({
  label,
  icon,
  value,
  onChangeText,
  keyboardType = "default",
  editable = true,
}: InputFieldProps) {

  return (
    <View style={styles.inputContainer}>

      <Text style={styles.label}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          !editable && styles.disabledInput,
        ]}
      >

        <Ionicons
          name={icon}
          size={20}
          color={Colors.rider}
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={Colors.textSecondary}
          editable={editable}
        />

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },


  /* Header */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 14,
  },

  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.primary,
  },

  subHeading: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },


  /* Profile */

  profileContainer: {
    alignItems: "center",
    marginBottom: 22,
  },

  profileIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EEF5FB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  profileText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },


  /* Loading */

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },


  /* Form */

  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  inputContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E6EAF0",
  },

  disabledInput: {
    backgroundColor: "#EEF1F5",
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.primary,
    marginLeft: 10,
  },


  /* Save */

  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 58,
    backgroundColor: Colors.rider,
    borderRadius: 16,
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 9,
  },


  /* Cancel */

  cancelButton: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

});
