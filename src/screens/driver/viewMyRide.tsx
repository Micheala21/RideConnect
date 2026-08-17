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

import {
  useNavigation,
} from "@react-navigation/native";

import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import Colors from "../../constants/colors";



type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ViewMyRide"
>;



export default function ViewMyRideScreen() {


  const navigation = useNavigation<NavigationProp>();



  const ride = {

    rider: "Sarah Williams",

    pickup: "CPUT Bellville Campus",

    destination: "Cape Town CBD",

    pickupTime: "08:30 AM",

    passengers: "2",

    earnings: "R120",

    status: "Confirmed",

  };



  return (


    <SafeAreaView style={styles.container}>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >



        {/* Header */}


        <View style={styles.header}>


          <Ionicons

            name="car-sport"

            size={55}

            color={Colors.driver}

          />


          <Text style={styles.heading}>
            My Ride
          </Text>


          <Text style={styles.subtitle}>
            Current ride details
          </Text>


        </View>






        {/* Status Card */}


        <View style={styles.statusCard}>


          <Ionicons

            name="checkmark-circle"

            size={30}

            color={Colors.success}

          />


          <View>

            <Text style={styles.statusTitle}>
              Ride Status
            </Text>


            <Text style={styles.status}>
              {ride.status}
            </Text>


          </View>


        </View>







        {/* Ride Details */}


        <View style={styles.card}>


          <Text style={styles.sectionTitle}>
            Rider Information
          </Text>



          <DetailRow

            icon="person-outline"

            title="Rider"

            value={ride.rider}

          />



          <DetailRow

            icon="people-outline"

            title="Passengers"

            value={ride.passengers}

          />



        </View>








        <View style={styles.card}>


          <Text style={styles.sectionTitle}>
            Trip Details
          </Text>




          <DetailRow

            icon="location-outline"

            title="Pickup"

            value={ride.pickup}

          />



          <DetailRow

            icon="flag-outline"

            title="Destination"

            value={ride.destination}

          />



          <DetailRow

            icon="time-outline"

            title="Pickup Time"

            value={ride.pickupTime}

          />



        </View>








        {/* Earnings */}


        <View style={styles.earningsCard}>


          <Text style={styles.earningsTitle}>
            Expected Earnings
          </Text>


          <Text style={styles.amount}>
            {ride.earnings}
          </Text>


        </View>







        {/* Start Trip */}


        <TouchableOpacity

          style={styles.primaryButton}

          onPress={() =>
            navigation.navigate("ActiveTrip")
          }

        >


          <Ionicons

            name="navigate"

            size={22}

            color={Colors.white}

          />


          <Text style={styles.primaryButtonText}>
            Start Trip
          </Text>


        </TouchableOpacity>







        {/* Back */}


        <TouchableOpacity

          style={styles.secondaryButton}

          onPress={() =>
            navigation.navigate("DriverHome")
          }

        >


          <Text style={styles.secondaryText}>
            Back to Home
          </Text>


        </TouchableOpacity>




      </ScrollView>


    </SafeAreaView>


  );

}









interface DetailProps {

  icon: keyof typeof Ionicons.glyphMap;

  title:string;

  value:string;

}







function DetailRow({

icon,

title,

value,

}:DetailProps){


return (

<View style={styles.row}>


<View style={styles.left}>


<Ionicons

name={icon}

size={22}

color={Colors.driver}

/>


<Text style={styles.label}>
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

padding:20,

paddingBottom:40,

},





header:{

alignItems:"center",

marginTop:20,

marginBottom:25,

},





heading:{

fontSize:30,

fontWeight:"700",

color:Colors.primary,

marginTop:10,

},





subtitle:{

color:Colors.textSecondary,

marginTop:5,

},





statusCard:{

backgroundColor:Colors.white,

borderRadius:20,

padding:20,

flexDirection:"row",

alignItems:"center",

gap:15,

marginBottom:20,

elevation:3,

},





statusTitle:{

fontSize:15,

color:Colors.textSecondary,

},





status:{

fontSize:20,

fontWeight:"700",

color:Colors.success,

},





card:{

backgroundColor:Colors.white,

borderRadius:20,

padding:20,

marginBottom:20,

elevation:3,

},





sectionTitle:{

fontSize:20,

fontWeight:"700",

color:Colors.primary,

marginBottom:15,

},





row:{

flexDirection:"row",

justifyContent:"space-between",

alignItems:"center",

paddingVertical:14,

borderBottomWidth:1,

borderBottomColor:"#ECECEC",

},





left:{

flexDirection:"row",

alignItems:"center",

},





label:{

marginLeft:12,

color:Colors.primary,

},





value:{

fontWeight:"600",

color:Colors.textSecondary,

maxWidth:"45%",

textAlign:"right",

},





earningsCard:{

backgroundColor:Colors.white,

borderRadius:20,

padding:20,

alignItems:"center",

marginBottom:20,

},





earningsTitle:{

fontSize:17,

color:Colors.primary,

},





amount:{

fontSize:30,

fontWeight:"700",

color:Colors.driver,

marginTop:5,

},





primaryButton:{

height:58,

backgroundColor:Colors.driver,

borderRadius:15,

justifyContent:"center",

alignItems:"center",

flexDirection:"row",

},





primaryButtonText:{

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

marginTop:15,

},





secondaryText:{

color:Colors.driver,

fontSize:18,

fontWeight:"700",

},



});