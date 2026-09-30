import React, { useEffect, useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useNavigation } from "@react-navigation/native";

import ProfileAvatar from "../../components/ProfileAvatar";

import Colors from "../../constants/colors";

import { supabase } from "../../lib/supabaseClient";


type Rider = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};


export default function RiderProfileScreen() {

  const navigation = useNavigation();

  const [rider, setRider] =
    useState<Rider | null>(null);

  const [loading, setLoading] =
    useState(true);


  // ==================================================
  // LOAD RIDER PROFILE
  // ==================================================

  useEffect(() => {

    fetchRiderProfile();

  }, []);


  const fetchRiderProfile = async () => {

    try {

      // ==================================================
      // GET LOGGED-IN RIDER
      // ==================================================

      const {
        data: {
          user,
        },
        error: authError,
      } =
        await supabase.auth.getUser();


      if (authError) {

        console.error(
          "Error getting rider:",
          authError.message
        );

        return;
      }


      if (!user) {

        console.log(
          "No logged-in rider found."
        );

        return;
      }


      console.log(
        "Loading rider profile:",
        user.id
      );


      // ==================================================
      // GET RIDER PROFILE
      // ==================================================

      const {
        data: profile,
        error: profileError,
      } =
        await supabase
          .from("profiles")
          .select(
            "first_name, last_name, phone_number, role"
          )
          .eq(
            "id",
            user.id
          )
          .single();


      if (profileError) {

        console.error(
          "Failed to get rider profile:",
          profileError.message
        );

        return;
      }


      // ==================================================
      // SET RIDER
      // ==================================================

      setRider({

        firstName:
          profile.first_name,

        lastName:
          profile.last_name,

        email:
          user.email || "",

        phoneNumber:
          profile.phone_number,

      });


      console.log(
        "Rider profile loaded successfully."
      );


    } catch (error) {

      console.error(
        "Error fetching rider profile:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = async () => {

    try {

      const {
        error,
      } =
        await supabase.auth.signOut();


      if (error) {

        console.error(
          "Logout error:",
          error.message
        );

        return;
      }


      navigation.navigate(
        "RiderLogin" as never
      );


    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

  };


  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Profile Header */}

        <View style={styles.profileSection}>

          <ProfileAvatar />

          {loading ? (

            <ActivityIndicator
              size="small"
              color={Colors.rider}
              style={styles.loader}
            />

          ) : (

            <>

              <Text style={styles.name}>

                {rider
                  ? `${rider.firstName} ${rider.lastName}`
                  : "Rider"}

              </Text>


              <Text style={styles.email}>

                {rider?.email ||
                  "No email available"}

              </Text>

            </>

          )}

        </View>


        {/* E-Wallet */}

        <TouchableOpacity
          style={styles.walletCard}
          activeOpacity={0.8}
        >

          <View style={styles.walletIcon}>

            <MaterialCommunityIcons
              name="wallet-outline"
              size={28}
              color={Colors.rider}
            />

          </View>


          <View style={styles.walletContent}>

            <Text style={styles.walletTitle}>
              E-Wallet
            </Text>


            <Text style={styles.walletSubtitle}>
              Manage your RideConnect wallet
            </Text>

          </View>


          <MaterialCommunityIcons
            name="chevron-right"
            size={26}
            color={Colors.textSecondary}
          />

        </TouchableOpacity>


        {/* Account Options */}

        <Text style={styles.sectionTitle}>
          Account
        </Text>


        <View style={styles.card}>

          {/* Update Information */}

          <TouchableOpacity
            style={styles.option}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate(
                "RiderEditInformation" as never
              )
            }
          >

            <View style={styles.optionIcon}>

              <MaterialCommunityIcons
                name="account-edit-outline"
                size={23}
                color={Colors.rider}
              />

            </View>


            <View style={styles.optionContent}>

              <Text style={styles.optionTitle}>
                Update Information
              </Text>


              <Text style={styles.optionSubtitle}>
                Update your personal details
              </Text>

            </View>


            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={Colors.textSecondary}
            />

          </TouchableOpacity>



<TouchableOpacity
  style={styles.option}
  activeOpacity={0.7}
  onPress={() =>
    navigation.navigate(
      "RiderSettings" as never
    )
  }
>

  <View style={styles.optionIcon}>

    <MaterialCommunityIcons
      name="account-edit-outline"
      size={23}
      color={Colors.rider}
    />

  </View>


  <View style={styles.optionContent}>

    <Text style={styles.optionTitle}>
      Update Information
    </Text>


    <Text style={styles.optionSubtitle}>
      Update your personal details
    </Text>

  </View>


  <MaterialCommunityIcons
    name="chevron-right"
    size={24}
    color={Colors.textSecondary}
  />

</TouchableOpacity>


          <AccountOption
            icon="credit-card-outline"
            title="Payments"
            subtitle="Manage your payment methods"
          />


          <AccountOption
            icon="map-marker-outline"
            title="Saved Locations"
            subtitle="Manage your favourite pickup locations"
          />


          <AccountOption
            icon="alert-circle-outline"
            title="Report an Issue"
            subtitle="Let us know if something went wrong"
          />


          <AccountOption
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with RideConnect"
            showBorder={false}
          />

        </View>


        {/* Log Out */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >

          <MaterialCommunityIcons
            name="logout"
            size={23}
            color={Colors.danger}
          />


          <Text style={styles.logoutText}>
            Log Out
          </Text>

        </TouchableOpacity>


      </ScrollView>

    </SafeAreaView>

  );

}


interface AccountOptionProps {

  icon:
    keyof typeof MaterialCommunityIcons.glyphMap;

  title: string;

  subtitle: string;

  showBorder?: boolean;

}


function AccountOption({

  icon,

  title,

  subtitle,

  showBorder = true,

}: AccountOptionProps) {

  return (

    <TouchableOpacity
      style={[
        styles.option,
        !showBorder && styles.noBorder,
      ]}
      activeOpacity={0.7}
    >

      <View style={styles.optionIcon}>

        <MaterialCommunityIcons
          name={icon}
          size={23}
          color={Colors.rider}
        />

      </View>


      <View style={styles.optionContent}>

        <Text style={styles.optionTitle}>
          {title}
        </Text>


        <Text style={styles.optionSubtitle}>
          {subtitle}
        </Text>

      </View>


      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={Colors.textSecondary}
      />

    </TouchableOpacity>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },


  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },


  profileSection: {
    alignItems: "center",
    marginBottom: 25,
  },


  loader: {
    marginTop: 18,
  },


  name: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 15,
  },


  email: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 5,
  },


  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
    elevation: 4,
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },


  walletIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF5FB",
    justifyContent: "center",
    alignItems: "center",
  },


  walletContent: {
    flex: 1,
    marginLeft: 15,
  },


  walletTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },


  walletSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },


  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 12,
  },


  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    elevation: 4,
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },


  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },


  noBorder: {
    borderBottomWidth: 0,
  },


  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF5FB",
    justifyContent: "center",
    alignItems: "center",
  },


  optionContent: {
    flex: 1,
    marginLeft: 14,
  },


  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },


  optionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },


  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    height: 56,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#FECACA",
  },


  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.danger,
    marginLeft: 10,
  },

});
