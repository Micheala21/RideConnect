import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import ProfileAvatar from "../../components/ProfileAvatar";
import AppButton from "../../components/AppButton";

import Colors from "../../constants/colors";


const rider = {
  fullName: "John Smith",
  email: "johnsmith@gmail.com",
  phone: "082 555 1234",

  homeLocation: "Bellville",
  emergencyContact: "082 999 4567",

  riderId: "RC10245",
  paymentMethod: "Cash",

  completedTrips: 24,
  cancelledTrips: 2,

  rating: "4.8",
  memberSince: "January 2026",
};


export default function RiderProfileScreen() {

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Profile Header */}

        <ProfileAvatar />


        <Text style={styles.name}>
          {rider.fullName}
        </Text>


        <Text style={styles.email}>
          {rider.email}
        </Text>



        {/* Personal Information */}

        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>


        <View style={styles.card}>


          <ProfileRow
            icon="phone"
            title="Phone Number"
            value={rider.phone}
          />


          <ProfileRow
            icon="email-outline"
            title="Email"
            value={rider.email}
          />


          <ProfileRow
            icon="home-outline"
            title="Home Location"
            value={rider.homeLocation}
          />


          <ProfileRow
            icon="account-alert-outline"
            title="Emergency Contact"
            value={rider.emergencyContact}
          />


        </View>




        {/* Rider Information */}


        <Text style={styles.sectionTitle}>
          Rider Information
        </Text>


        <View style={styles.card}>


          <ProfileRow
            icon="card-account-details-outline"
            title="Rider ID"
            value={rider.riderId}
          />


          <ProfileRow
            icon="cash"
            title="Payment Method"
            value={rider.paymentMethod}
          />


          <ProfileRow
            icon="star"
            title="Rider Rating"
            value={rider.rating}
          />


        </View>





        {/* Statistics */}


        <Text style={styles.sectionTitle}>
          Statistics
        </Text>


        <View style={styles.card}>


          <ProfileRow
            icon="car-multiple"
            title="Completed Trips"
            value={
              rider.completedTrips.toString()
            }
          />


          <ProfileRow
            icon="close-circle-outline"
            title="Cancelled Trips"
            value={
              rider.cancelledTrips.toString()
            }
          />


          <ProfileRow
            icon="calendar"
            title="Member Since"
            value={rider.memberSince}
          />


        </View>




        <AppButton
          title="Edit Profile"
          onPress={() => {}}
        />


      </ScrollView>


    </SafeAreaView>

  );

}





interface ProfileRowProps {

  icon: keyof typeof MaterialCommunityIcons.glyphMap;

  title:string;

  value:string;

}



function ProfileRow({
  icon,
  title,
  value,
}:ProfileRowProps){


return (

<View style={styles.row}>


<View style={styles.leftSide}>


<MaterialCommunityIcons

name={icon}

size={24}

color={Colors.primary}

/>


<Text style={styles.rowTitle}>
{title}
</Text>


</View>



<Text style={styles.rowValue}>
{value}
</Text>


</View>


);


}




const styles = StyleSheet.create({

container:{

flex:1,

backgroundColor:Colors.background,

},


content:{

padding:22,

paddingBottom:40,

},



name:{

marginTop:20,

fontSize:30,

fontWeight:"700",

textAlign:"center",

color:Colors.primary,

},



email:{

marginTop:6,

fontSize:16,

textAlign:"center",

color:Colors.textSecondary,

marginBottom:30,

},



sectionTitle:{

fontSize:20,

fontWeight:"700",

color:Colors.primary,

marginBottom:14,

marginTop:10,

},



card:{

backgroundColor:Colors.white,

borderRadius:20,

padding:20,

marginBottom:24,

elevation:5,

},



row:{

flexDirection:"row",

justifyContent:"space-between",

alignItems:"center",

paddingVertical:16,

borderBottomWidth:1,

borderBottomColor:"#ECECEC",

},



leftSide:{

flexDirection:"row",

alignItems:"center",

},



rowTitle:{

marginLeft:14,

fontSize:16,

color:Colors.primary,

},



rowValue:{

fontSize:15,

fontWeight:"600",

color:Colors.textSecondary,

maxWidth:"45%",

textAlign:"right",

},


});