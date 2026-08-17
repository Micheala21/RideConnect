import React from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  Ionicons,
} from "@expo/vector-icons";


// Driver Screens

import DriverHomeScreen from "../screens/driver/driverHomeScreen";

import ActiveTripScreen from "../screens/driver/activeTrip";

import ViewMyRideScreen from "../screens/driver/viewMyRide";

import DriverProfileScreen from "../screens/driver/driverProfile";



import Colors from "../constants/colors";



const Tab = createBottomTabNavigator();




export default function DriverNavigationTab(){


return(


<Tab.Navigator


screenOptions={({route})=>({


headerShown:false,


tabBarActiveTintColor:Colors.driver,


tabBarInactiveTintColor:Colors.textSecondary,


tabBarStyle:{


height:65,

paddingBottom:8,

paddingTop:8,

backgroundColor:Colors.white,


},



tabBarIcon:({color,size})=>{


let iconName:keyof typeof Ionicons.glyphMap;



if(route.name==="Home"){

iconName="home";

}

else if(route.name==="Active Trip"){

iconName="car";

}

else if(route.name==="My Ride"){

iconName="map";

}

else{

iconName="person";

}



return(

<Ionicons

name={iconName}

size={size}

color={color}

/>

);


},



})}



>





<Tab.Screen

name="Home"

component={DriverHomeScreen}

/>





<Tab.Screen

name="Active Trip"

component={ActiveTripScreen}

/>





<Tab.Screen

name="My Ride"

component={ViewMyRideScreen}

/>




<Tab.Screen

name="Profile"

component={DriverProfileScreen}

/>





</Tab.Navigator>


);


}