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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import Colors from "../../constants/colors";


export default function RiderRequestDetailsScreen() {

 type NavigationProp = NativeStackNavigationProp<
  RootStackParamList
>;

const navigation = useNavigation<NavigationProp>();

  const route = useRoute();


  const { rider } = route.params as {
    rider: {
      name: string;
      pickup: string;
      destination: string;
      passengers: number;
      offer: string;
      distance: string;
      gender: string;
      pickupTime: string;
      routeMatch: string;
    };
  };


  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >


        {/* Rider Icon */}

        <View style={styles.avatar}>

          <Ionicons
            name="person"
            size={55}
            color={Colors.primary}
          />

        </View>



        <Text style={styles.name}>
          {rider.name}
        </Text>


        <Text style={styles.subtitle}>
          Rider Request Details
        </Text>





        {/* Trip Details */}


        <View style={styles.card}>


          <Text style={styles.sectionTitle}>
            Trip Details
          </Text>



          <DetailRow
            icon="location-outline"
            title="Pickup Location"
            value={rider.pickup}
          />



          <DetailRow
            icon="flag-outline"
            title="Destination"
            value={rider.destination}
          />



          <DetailRow
            icon="time-outline"
            title="Pickup Time"
            value={rider.pickupTime}
          />



          <DetailRow
            icon="navigate-outline"
            title="Distance"
            value={rider.distance}
          />



          <DetailRow
            icon="map-outline"
            title="Route Match"
            value={rider.routeMatch}
          />


        </View>





        {/* Rider Information */}


        <View style={styles.card}>


          <Text style={styles.sectionTitle}>
            Rider Information
          </Text>




          <DetailRow
            icon="people-outline"
            title="Passengers"
            value={rider.passengers.toString()}
          />



          <DetailRow
            icon="person-outline"
            title="Gender"
            value={rider.gender}
          />



          <DetailRow
            icon="cash-outline"
            title="Offer Price"
            value={rider.offer}
          />



        </View>






     {/* Accept Button */}

<TouchableOpacity
  style={styles.acceptButton}
  onPress={() => {
    console.log("Accept Rider clicked");
    navigation.navigate("RideConfirmation");
  }}
>

  <Ionicons
    name="checkmark-circle"
    size={22}
    color={Colors.white}
  />

  <Text style={styles.acceptText}>
    Accept Rider
  </Text>

</TouchableOpacity>





        {/* Decline Button */}


        <TouchableOpacity

          style={styles.declineButton}

          onPress={() => navigation.goBack()}

        >


          <Ionicons
            name="close-circle"
            size={22}
            color={Colors.driver}
          />


          <Text style={styles.declineText}>
            Decline Request
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



<Text style={styles.title}>
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


avatar:{

  width:110,
  height:110,
  borderRadius:55,
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



subtitle:{

  textAlign:"center",
  color:Colors.textSecondary,
  marginTop:5,
  marginBottom:25,

},



card:{

  backgroundColor:Colors.white,
  borderRadius:20,
  padding:20,
  marginBottom:20,
  elevation:4,

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



title:{

  marginLeft:12,
  fontSize:15,
  color:Colors.primary,

},



value:{

  fontSize:15,
  fontWeight:"600",
  color:Colors.textSecondary,
  maxWidth:"45%",
  textAlign:"right",

},



acceptButton:{

  height:58,
  backgroundColor:Colors.driver,
  borderRadius:15,
  justifyContent:"center",
  alignItems:"center",
  flexDirection:"row",

},



acceptText:{

  color:Colors.white,
  fontSize:18,
  fontWeight:"700",
  marginLeft:8,

},



declineButton:{

  height:58,
  borderWidth:2,
  borderColor:Colors.driver,
  borderRadius:15,
  justifyContent:"center",
  alignItems:"center",
  flexDirection:"row",
  marginTop:15,

},



declineText:{

  color:Colors.driver,
  fontSize:18,
  fontWeight:"700",
  marginLeft:8,

},


});