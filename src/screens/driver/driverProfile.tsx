import React from "react";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/colors";


export default function DriverProfileScreen(){


const driver = {

  name:"David Williams",

  email:"david@email.com",

  phone:"071 234 5678",

  vehicle:"Toyota Prius",

  registration:"CA 123-456",

  seats:"4",

  rating:"4.9",

  completedTrips:"120",

  earnings:"R8 500",

  joined:"January 2026",

};




return(

<SafeAreaView style={styles.container}>


<ScrollView

showsVerticalScrollIndicator={false}

contentContainerStyle={styles.content}

>


{/* Profile Header */}


<View style={styles.profileCircle}>

<Ionicons

name="person"

size={55}

color={Colors.primary}

/>

</View>



<Text style={styles.name}>

{driver.name}

</Text>



<Text style={styles.email}>

{driver.email}

</Text>





{/* Personal Information */}



<Text style={styles.sectionTitle}>

Personal Information

</Text>



<View style={styles.card}>


<ProfileRow

icon="call-outline"

title="Phone"

value={driver.phone}

/>



<ProfileRow

icon="mail-outline"

title="Email"

value={driver.email}

/>



</View>








{/* Vehicle Information */}



<Text style={styles.sectionTitle}>

Vehicle Information

</Text>



<View style={styles.card}>


<ProfileRow

icon="car-outline"

title="Vehicle"

value={driver.vehicle}

/>



<ProfileRow

icon="card-outline"

title="Registration"

value={driver.registration}

/>



<ProfileRow

icon="people-outline"

title="Available Seats"

value={driver.seats}

/>



</View>







{/* Driver Statistics */}



<Text style={styles.sectionTitle}>

Driver Statistics

</Text>



<View style={styles.card}>


<ProfileRow

icon="star-outline"

title="Rating"

value={driver.rating}

/>



<ProfileRow

icon="checkmark-circle-outline"

title="Completed Trips"

value={driver.completedTrips}

/>



<ProfileRow

icon="cash-outline"

title="Total Earnings"

value={driver.earnings}

/>



<ProfileRow

icon="calendar-outline"

title="Member Since"

value={driver.joined}

/>



</View>







<TouchableOpacity

style={styles.button}

>


<Text style={styles.buttonText}>

Edit Profile

</Text>


</TouchableOpacity>




</ScrollView>


</SafeAreaView>


);


}







interface ProfileRowProps{

icon:keyof typeof Ionicons.glyphMap;

title:string;

value:string;

}





function ProfileRow({

icon,

title,

value,

}:ProfileRowProps){


return(

<View style={styles.row}>


<View style={styles.left}>


<Ionicons

name={icon}

size={22}

color={Colors.driver}

/>



<Text style={styles.rowTitle}>

{title}

</Text>



</View>




<Text style={styles.value}>

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




profileCircle:{

width:120,

height:120,

borderRadius:60,

backgroundColor:Colors.white,

justifyContent:"center",

alignItems:"center",

alignSelf:"center",

marginTop:20,

},




name:{

fontSize:28,

fontWeight:"700",

color:Colors.primary,

textAlign:"center",

marginTop:15,

},




email:{

fontSize:16,

color:Colors.textSecondary,

textAlign:"center",

marginTop:5,

marginBottom:30,

},





sectionTitle:{

fontSize:20,

fontWeight:"700",

color:Colors.primary,

marginBottom:15,

marginTop:10,

},





card:{

backgroundColor:Colors.white,

borderRadius:20,

padding:20,

marginBottom:20,

elevation:4,

},





row:{

flexDirection:"row",

justifyContent:"space-between",

alignItems:"center",

paddingVertical:15,

borderBottomWidth:1,

borderBottomColor:"#ECECEC",

},




left:{

flexDirection:"row",

alignItems:"center",

},




rowTitle:{

marginLeft:12,

fontSize:16,

color:Colors.primary,

},




value:{

fontSize:15,

fontWeight:"600",

color:Colors.textSecondary,

maxWidth:"45%",

textAlign:"right",

},





button:{

height:58,

backgroundColor:Colors.driver,

borderRadius:15,

justifyContent:"center",

alignItems:"center",

marginTop:10,

},




buttonText:{

color:Colors.white,

fontSize:18,

fontWeight:"700",

},


});