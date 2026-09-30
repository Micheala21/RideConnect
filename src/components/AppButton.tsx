import React from "react";

import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import Colors from "../constants/colors";


interface Props{

  title:string;

  onPress:()=>void;

}


export default function AppButton({
  title,
  onPress,
}:Props){


return (

<TouchableOpacity
style={styles.button}
onPress={onPress}
>

<Text style={styles.text}>
{title}
</Text>


</TouchableOpacity>

);


}



const styles = StyleSheet.create({

button:{

height:58,

backgroundColor:Colors.primary,

borderRadius:15,

justifyContent:"center",

alignItems:"center",

marginTop:10,

},


text:{

color:Colors.white,

fontSize:18,

fontWeight:"700",

},


});