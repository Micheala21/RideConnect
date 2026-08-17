import React from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";


type NavigationProp = NativeStackNavigationProp<
  RootStackParamList
>;


export default function DriverHomeScreen() {


const navigation = useNavigation<NavigationProp>();



const driver = {

  name:"Alice Johnson",

  vehicle:"Toyota Prius",

  registration:"CA 123-456",

  seats:3,

  rating:4.9,

  earningsToday:"R350",

  earningsWeek:"R2 150",

  completedTrips:18,

  passengers:42,

  upcomingRide:"09:45 AM",

};




return (


<SafeAreaView style={styles.container}>


<ScrollView

showsVerticalScrollIndicator={false}

contentContainerStyle={styles.content}

>



{/* Header */}


<Text style={styles.heading}>

Good Morning, {driver.name} 👋

</Text>


<Text style={styles.subtitle}>

Ready to start driving today?

</Text>





{/* Driver Status */}


<View style={styles.statusCard}>


<View style={styles.statusLeft}>


<View style={styles.onlineDot}/>


<View>


<Text style={styles.statusTitle}>

You're Online

</Text>


<Text style={styles.statusSubtitle}>

Available to receive ride requests

</Text>


</View>


</View>



<Ionicons

name="radio"

size={30}

color={Colors.driver}

/>


</View>







{/* Vehicle Information */}



<View style={styles.card}>


<Text style={styles.sectionTitle}>

Vehicle Information

</Text>



<View style={styles.vehicleHeader}>


<Ionicons

name="car-sport"

size={40}

color={Colors.driver}

/>



<View style={{marginLeft:15}}>


<Text style={styles.vehicleName}>

{driver.vehicle}

</Text>



<Text style={styles.vehicleText}>

Registration: {driver.registration}

</Text>



<Text style={styles.vehicleText}>

Seats Available: {driver.seats}

</Text>



<Text style={styles.vehicleText}>

⭐ {driver.rating}

</Text>


</View>


</View>


</View>







{/* Today's Ride */}


<View style={styles.card}>


<Text style={styles.sectionTitle}>

Today's Ride

</Text>




<View style={styles.locationRow}>


<Ionicons

name="location"

size={22}

color={Colors.driver}

/>


<Text style={styles.locationText}>

CPUT Bellville Campus

</Text>


</View>





<Ionicons

name="arrow-down"

size={22}

color={Colors.textSecondary}

style={{marginVertical:10}}

/>




<View style={styles.locationRow}>


<Ionicons

name="flag"

size={22}

color={Colors.driver}

/>



<Text style={styles.locationText}>

Cape Town CBD

</Text>


</View>





<View style={styles.tripInfo}>


<Text style={styles.infoText}>

🕘 08:30 AM

</Text>


<Text style={styles.infoText}>

👥 3 Riders

</Text>


<Text style={styles.infoText}>

💰 R120

</Text>


</View>



</View>

{/* Earnings */}


<View style={styles.card}>


<Text style={styles.sectionTitle}>

Earnings

</Text>




<View style={styles.earningRow}>


<Ionicons

name="wallet"

size={40}

color={Colors.driver}

/>



<View style={{marginLeft:15}}>


<Text style={styles.earningAmount}>

{driver.earningsToday}

</Text>



<Text style={styles.vehicleText}>

Today's Earnings

</Text>


</View>


</View>




<View style={styles.divider}/>





<View style={styles.statsRow}>


<View>


<Text style={styles.smallHeading}>

Trips

</Text>


<Text style={styles.smallValue}>

{driver.completedTrips}

</Text>


</View>





<View>


<Text style={styles.smallHeading}>

Weekly

</Text>


<Text style={styles.smallValue}>

{driver.earningsWeek}

</Text>


</View>



</View>



</View>








{/* Quick Statistics */}



<Text style={styles.sectionTitle}>

Quick Statistics

</Text>





<View style={styles.quickStats}>


<View style={styles.statCard}>


<Ionicons

name="star"

size={28}

color="#F59E0B"

/>



<Text style={styles.statValue}>

{driver.rating}

</Text>



<Text style={styles.statLabel}>

Rating

</Text>



</View>






<View style={styles.statCard}>


<Ionicons

name="car"

size={28}

color={Colors.driver}

/>



<Text style={styles.statValue}>

{driver.completedTrips}

</Text>



<Text style={styles.statLabel}>

Trips

</Text>



</View>







<View style={styles.statCard}>


<Ionicons

name="people"

size={28}

color={Colors.driver}

/>



<Text style={styles.statValue}>

{driver.passengers}

</Text>



<Text style={styles.statLabel}>

Riders

</Text>



</View>



</View>








{/* Upcoming Ride */}



<View style={styles.card}>


<Text style={styles.sectionTitle}>

Upcoming Ride

</Text>




<Text style={styles.upcomingTime}>

{driver.upcomingRide}

</Text>




<Text style={styles.vehicleText}>

Bellville

</Text>




<Ionicons

name="arrow-down"

size={20}

color={Colors.textSecondary}

/>





<Text style={styles.vehicleText}>

Cape Town CBD

</Text>



</View>









{/* Buttons */}



<TouchableOpacity

style={styles.primaryButton}

onPress={() => 
  navigation.navigate("RiderRequests")
}

>


<Ionicons

name="people"

size={22}

color={Colors.white}

/>



<Text style={styles.buttonText}>

View Rider Requests

</Text>


</TouchableOpacity>







<TouchableOpacity

style={styles.secondaryButton}

onPress={() => navigation.navigate("CreateRideOffer")}

>


<Ionicons

name="add-circle"

size={22}

color={Colors.driver}

/>



<Text style={styles.secondaryButtonText}>

Create Ride Offer

</Text>



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
  padding:22,
  paddingBottom:40,
},



heading:{
  fontSize:28,
  fontWeight:"700",
  color:Colors.primary,
  marginTop:10,
},



subtitle:{
  color:Colors.textSecondary,
  marginTop:5,
  marginBottom:25,
  fontSize:15,
},




/* ---------- Status ---------- */


statusCard:{

  backgroundColor:Colors.white,
  borderRadius:18,
  padding:18,
  marginBottom:22,
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  elevation:4,

},



statusLeft:{

  flexDirection:"row",
  alignItems:"center",

},



onlineDot:{

  width:14,
  height:14,
  borderRadius:7,
  backgroundColor:Colors.success,
  marginRight:15,

},



statusTitle:{

  fontSize:18,
  fontWeight:"700",
  color:Colors.primary,

},



statusSubtitle:{

  marginTop:4,
  color:Colors.textSecondary,
  fontSize:14,

},




/* ---------- Cards ---------- */


card:{

  backgroundColor:Colors.white,
  borderRadius:18,
  padding:20,
  marginBottom:22,
  elevation:4,

},



sectionTitle:{

  fontSize:20,
  fontWeight:"700",
  color:Colors.primary,
  marginBottom:16,

},




/* ---------- Vehicle ---------- */


vehicleHeader:{

  flexDirection:"row",
  alignItems:"center",

},



vehicleName:{

  fontSize:20,
  fontWeight:"700",
  color:Colors.primary,

},



vehicleText:{

  marginTop:5,
  color:Colors.textSecondary,
  fontSize:15,

},




/* ---------- Ride ---------- */


locationRow:{

  flexDirection:"row",
  alignItems:"center",

},



locationText:{

  marginLeft:12,
  color:Colors.primary,
  fontWeight:"600",
  fontSize:16,

},



tripInfo:{

  flexDirection:"row",
  justifyContent:"space-between",
  marginTop:20,

},



infoText:{

  color:Colors.textSecondary,
  fontSize:15,
  fontWeight:"600",

},





/* ---------- Earnings ---------- */


earningRow:{

  flexDirection:"row",
  alignItems:"center",

},



earningAmount:{

  fontSize:28,
  fontWeight:"700",
  color:Colors.driver,

},



divider:{

  height:1,
  backgroundColor:"#E5E7EB",
  marginVertical:18,

},



statsRow:{

  flexDirection:"row",
  justifyContent:"space-between",

},



smallHeading:{

  color:Colors.textSecondary,
  fontSize:14,

},



smallValue:{

  marginTop:6,
  fontSize:20,
  fontWeight:"700",
  color:Colors.primary,

},





/* ---------- Quick Stats ---------- */


quickStats:{

  flexDirection:"row",
  justifyContent:"space-between",
  marginBottom:25,

},



statCard:{

  backgroundColor:Colors.white,
  width:"31%",
  borderRadius:16,
  paddingVertical:18,
  alignItems:"center",
  elevation:4,

},



statValue:{

  fontSize:22,
  fontWeight:"700",
  color:Colors.primary,
  marginTop:10,

},



statLabel:{

  color:Colors.textSecondary,
  marginTop:6,
  fontSize:14,

},





/* ---------- Upcoming Ride ---------- */


upcomingTime:{

  fontSize:24,
  fontWeight:"700",
  color:Colors.driver,
  marginBottom:10,

},





/* ---------- Buttons ---------- */


primaryButton:{

  height:58,
  backgroundColor:Colors.driver,
  borderRadius:15,
  justifyContent:"center",
  alignItems:"center",
  flexDirection:"row",
  marginBottom:15,

},



buttonText:{

  color:Colors.white,
  fontSize:18,
  fontWeight:"700",
  marginLeft:10,

},



secondaryButton:{

  height:58,
  borderWidth:2,
  borderColor:Colors.driver,
  borderRadius:15,
  justifyContent:"center",
  alignItems:"center",
  flexDirection:"row",
  marginBottom:20,

},



secondaryButtonText:{

  color:Colors.driver,
  fontSize:18,
  fontWeight:"700",
  marginLeft:10,

},


});