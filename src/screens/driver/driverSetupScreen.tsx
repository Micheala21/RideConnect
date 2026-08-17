import React, { useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/colors";


export default function DriverSetupScreen(){

  const [fullName,setFullName] = useState("");
  const [phone,setPhone] = useState("");

  const [vehicleMake,setVehicleMake] = useState("");
  const [vehicleModel,setVehicleModel] = useState("");
  const [vehicleYear,setVehicleYear] = useState("");
  const [registration,setRegistration] = useState("");

  const [seats,setSeats] = useState("");


  const handleContinue = () => {

    console.log({
      fullName,
      phone,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      registration,
      seats,
    });

    // Navigate to driver dashboard later

  };


  return(

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >


        {/* Header */}

        <View style={styles.iconContainer}>

          <Ionicons
            name="car-sport"
            size={55}
            color={Colors.primary}
          />

        </View>


        <Text style={styles.heading}>
          Setup Driver Profile
        </Text>


        <Text style={styles.subtitle}>
          Add your vehicle details before offering rides.
        </Text>



        {/* Personal Information */}

        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>


        <TextInput
          placeholder="Full Name"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />


        <TextInput
          placeholder="Phone Number"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="phone-pad"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
        />




        {/* Vehicle Information */}

        <Text style={styles.sectionTitle}>
          Vehicle Information
        </Text>


        <TextInput
          placeholder="Vehicle Make (Toyota, VW...)"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={vehicleMake}
          onChangeText={setVehicleMake}
        />


        <TextInput
          placeholder="Vehicle Model"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={vehicleModel}
          onChangeText={setVehicleModel}
        />


        <TextInput
          placeholder="Vehicle Year"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
          style={styles.input}
          value={vehicleYear}
          onChangeText={setVehicleYear}
        />


        <TextInput
          placeholder="Registration Number"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={registration}
          onChangeText={setRegistration}
        />



        <TextInput
          placeholder="Available Seats"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
          style={styles.input}
          value={seats}
          onChangeText={setSeats}
        />



        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
        >

          <Text style={styles.buttonText}>
            Continue
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color={Colors.white}
          />

        </TouchableOpacity>


      </ScrollView>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

container:{
  flex:1,
  backgroundColor:Colors.background,
},


content:{
  padding:25,
  paddingBottom:40,
},


iconContainer:{
  width:110,
  height:110,
  borderRadius:55,
  backgroundColor:Colors.white,
  justifyContent:"center",
  alignItems:"center",
  alignSelf:"center",
  marginTop:20,
},


heading:{
  fontSize:30,
  fontWeight:"700",
  color:Colors.primary,
  textAlign:"center",
  marginTop:20,
},


subtitle:{
  textAlign:"center",
  color:Colors.textSecondary,
  marginTop:8,
  marginBottom:30,
},


sectionTitle:{
  fontSize:20,
  fontWeight:"700",
  color:Colors.primary,
  marginBottom:15,
  marginTop:10,
},


input:{
  height:58,
  backgroundColor:Colors.white,
  borderRadius:15,
  paddingHorizontal:18,
  marginBottom:15,
  borderWidth:1,
  borderColor:Colors.border,
  color:Colors.primary,
  fontSize:16,
},


button:{
  height:58,
  backgroundColor:Colors.driver,
  borderRadius:15,
  justifyContent:"center",
  alignItems:"center",
  flexDirection:"row",
  marginTop:20,
},


buttonText:{
  color:Colors.white,
  fontSize:18,
  fontWeight:"700",
  marginRight:8,
},


});