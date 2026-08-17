import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../constants/colors";


export default function ProfileAvatar(){

  return (

    <View style={styles.avatar}>

      <Ionicons
        name="person"
        size={60}
        color={Colors.primary}
      />

    </View>

  );

}


const styles = StyleSheet.create({

  avatar:{
    width:120,
    height:120,
    borderRadius:60,
    backgroundColor:Colors.white,
    justifyContent:"center",
    alignItems:"center",
    alignSelf:"center",
    elevation:4,
  },

});