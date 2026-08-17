import React from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  Ionicons,
} from "@expo/vector-icons";


import Colors from "../constants/colors";


// Rider Screens

import RiderHomeScreen 
from "../screens/rider/riderHomeScreen";


import TrackDriverScreen 
from "../screens/rider/trackDriverScreen";


import TripReceiptScreen 
from "../screens/rider/tripReceiptScreen";


import RiderProfileScreen 
from "../screens/rider/riderProfileScreen";



const Tab = createBottomTabNavigator();



export default function RiderTabNavigator(){


return(


<Tab.Navigator


screenOptions={({route})=>({


headerShown:false,


tabBarActiveTintColor:Colors.rider,


tabBarInactiveTintColor:"#94A3B8",



tabBarStyle:{

height:70,

paddingBottom:10,

paddingTop:10,

backgroundColor:Colors.white,

},




tabBarIcon:({color,size})=>{


let iconName:keyof typeof Ionicons.glyphMap;



switch(route.name){



case "Home":

iconName="home";

break;




case "Track Driver":

iconName="navigate";

break;





case "Trips":

iconName="receipt";

break;





case "Profile":

iconName="person";

break;





default:

iconName="home";

}





return(

<Ionicons

name={iconName}

size={size}

color={color}

/>

);


}



})}




>





<Tab.Screen

name="Home"

component={RiderHomeScreen}

/>





<Tab.Screen

name="Track Driver"

component={TrackDriverScreen}

/>





<Tab.Screen

name="Trips"

component={TripReceiptScreen}

/>





<Tab.Screen

name="Profile"

component={RiderProfileScreen}

/>





</Tab.Navigator>


);


}