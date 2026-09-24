import React from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import { supabase } from "../../lib/supabaseClient";

import Colors from "../../constants/colors";


type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "RideConfirmation"
  >;


export default function RideConfirmationScreen({
  navigation,
  route,
}: Props) {

  const {
    rideId,
  } = route.params;


  const cancelRide =
    async () => {

      Alert.alert(
        "Cancel Ride",
        "Are you sure you want to cancel this ride offer?",
        [
          {
            text: "No",
            style: "cancel",
          },

          {
            text: "Yes, Cancel",
            style: "destructive",

            onPress:
              async () => {

                try {

                  const {
                    error,
                  } =
                    await supabase
                      .from("rides")
                      .delete()
                      .eq(
                        "id",
                        rideId
                      );


                  if (error) {

                    console.error(
                      "Cancel ride error:",
                      error.message
                    );

                    Alert.alert(
                      "Error",
                      error.message
                    );

                    return;
                  }


                  navigation.navigate(
                    "DriverHome"
                  );

                }

                catch (error) {

                  console.error(
                    "Cancel ride error:",
                    error
                  );

                  Alert.alert(
                    "Error",
                    "Could not cancel the ride."
                  );

                }

              },
          },
        ]
      );

    };


  const startTrip =
    () => {

      navigation.navigate(
        "ActiveTrip"
      );

    };


  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      <View
        style={
          styles.header
        }
      >

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={
            styles.backButton
          }
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color={
              Colors.primary
            }
          />

        </TouchableOpacity>


        <Text
          style={
            styles.headerTitle
          }
        >
          Ride Confirmation
        </Text>


        <View
          style={
            styles.headerSpacer
          }
        />

      </View>


      <View
        style={
          styles.content
        }
      >

        <View
          style={
            styles.successCircle
          }
        >

          <Ionicons
            name="checkmark"
            size={45}
            color="#FFFFFF"
          />

        </View>


        <Text
          style={
            styles.title
          }
        >
          Ride Offer Created!
        </Text>


        <Text
          style={
            styles.subtitle
          }
        >
          Your ride offer has been successfully
          created and is now available for riders.
        </Text>


        <View
          style={
            styles.infoCard
          }
        >

          <View
            style={
              styles.infoRow
            }
          >

            <Ionicons
              name="location-outline"
              size={22}
              color={
                Colors.primary
              }
            />

            <View
              style={
                styles.infoText
              }
            >

              <Text
                style={
                  styles.infoLabel
                }
              >
                Ride ID
              </Text>

              <Text
                style={
                  styles.infoValue
                }
                numberOfLines={1}
              >
                {rideId}
              </Text>

            </View>

          </View>


          <View
            style={
              styles.divider
            }
          />


          <View
            style={
              styles.infoRow
            }
          >

            <Ionicons
              name="people-outline"
              size={22}
              color={
                Colors.primary
              }
            />

            <View
              style={
                styles.infoText
              }
            >

              <Text
                style={
                  styles.infoLabel
                }
              >
                Status
              </Text>

              <Text
                style={
                  styles.statusText
                }
              >
                Ride Available
              </Text>

            </View>

          </View>

        </View>


        <TouchableOpacity
          style={
            styles.startButton
          }
          onPress={
            startTrip
          }
          activeOpacity={0.8}
        >

          <Ionicons
            name="car-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.startButtonText
            }
          >
            View Ride Details
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={
            styles.cancelButton
          }
          onPress={
            cancelRide
          }
          activeOpacity={0.8}
        >

          <Ionicons
            name="close-circle-outline"
            size={22}
            color="#C0392B"
          />

          <Text
            style={
              styles.cancelButtonText
            }
          >
            Cancel Ride
          </Text>

        </TouchableOpacity>

      </View>

    </SafeAreaView>

  );
}


const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F7F7F7",
    },

    header: {
      height: 60,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      paddingHorizontal:
        18,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth:
        1,
      borderBottomColor:
        "#EEEEEE",
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    headerTitle: {
      fontSize: 19,
      fontWeight: "700",
      color:
        Colors.primary,
    },

    headerSpacer: {
      width: 40,
    },

    content: {
      flex: 1,
      paddingHorizontal:
        22,
      alignItems:
        "center",
      paddingTop:
        55,
    },

    successCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor:
        Colors.primary,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom:
        22,
    },

    title: {
      fontSize: 25,
      fontWeight: "800",
      color:
        "#222222",
      textAlign:
        "center",
    },

    subtitle: {
      fontSize: 15,
      color:
        "#666666",
      textAlign:
        "center",
      lineHeight:
        22,
      marginTop:
        10,
      maxWidth:
        330,
    },

    infoCard: {
      width: "100%",
      backgroundColor:
        "#FFFFFF",
      borderRadius:
        18,
      padding:
        18,
      marginTop:
        30,

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        0.08,

      shadowRadius:
        6,

      elevation: 3,
    },

    infoRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    infoText: {
      flex: 1,
      marginLeft:
        12,
    },

    infoLabel: {
      fontSize: 12,
      color:
        "#888888",
      marginBottom:
        3,
    },

    infoValue: {
      fontSize: 13,
      fontWeight:
        "600",
      color:
        "#333333",
    },

    statusText: {
      fontSize: 15,
      fontWeight:
        "700",
      color:
        Colors.primary,
    },

    divider: {
      height: 1,
      backgroundColor:
        "#EEEEEE",
      marginVertical:
        16,
    },

    startButton: {
      width: "100%",
      height: 55,
      borderRadius:
        14,
      backgroundColor:
        Colors.primary,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginTop:
        25,
    },

    startButtonText: {
      color:
        "#FFFFFF",
      fontSize: 16,
      fontWeight:
        "700",
      marginLeft:
        8,
    },

    cancelButton: {
      width: "100%",
      height: 52,
      borderRadius:
        14,
      backgroundColor:
        "#FFFFFF",
      borderWidth:
        1,
      borderColor:
        "#C0392B",
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginTop:
        12,
    },

    cancelButtonText: {
      color:
        "#C0392B",
      fontSize: 15,
      fontWeight:
        "700",
      marginLeft:
        8,
    },

  });