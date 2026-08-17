import React from "react";
import {
  SafeAreaView,
  View,
 Text,
 StyleSheet,
 FlatList,
 TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/colors";

type Trip = {
  id: string;
  driver: string;
  vehicle: string;
  date: string;
  pickup: string;
  destination: string;
  fare: string;
  status: "Completed" | "Cancelled";
};

const trips: Trip[] = [
  {
    id: "1",
    driver: "Alice Johnson",
    vehicle: "Toyota Prius",
    date: "12 Aug 2026",
    pickup: "CPUT Bellville",
    destination: "Cape Town CBD",
    fare: "R120",
    status: "Completed",
  },
  {
    id: "2",
    driver: "Ben Carter",
    vehicle: "Honda Civic",
    date: "10 Aug 2026",
    pickup: "Tygerberg",
    destination: "Parow",
    fare: "R95",
    status: "Completed",
  },
  {
    id: "3",
    driver: "Emily Rivera",
    vehicle: "Kia Soul",
    date: "07 Aug 2026",
    pickup: "Bellville",
    destination: "Century City",
    fare: "R135",
    status: "Cancelled",
  },
];

export default function TripHistoryScreen() {
  const renderTrip = ({ item }: { item: Trip }) => (
    <View style={styles.card}>

      <View style={styles.header}>
        <View>
          <Text style={styles.driver}>
            {item.driver}
          </Text>

          <Text style={styles.vehicle}>
            {item.vehicle}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.status === "Completed"
              ? styles.completed
              : styles.cancelled,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="calendar-outline"
          size={18}
          color={Colors.rider}
        />
        <Text style={styles.infoText}>
          {item.date}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="location-outline"
          size={18}
          color={Colors.rider}
        />
        <Text style={styles.infoText}>
          {item.pickup}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="flag-outline"
          size={18}
          color={Colors.rider}
        />
        <Text style={styles.infoText}>
          {item.destination}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>
          {item.fare}
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            View Receipt
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.heading}>
        Trip History
      </Text>

      <Text style={styles.subHeading}>
        View all your previous rides.
      </Text>

      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:Colors.background,
    padding:20,
  },

  heading:{
    fontSize:30,
    fontWeight:"700",
    color:Colors.primary,
    marginTop:10,
  },

  subHeading:{
    color:Colors.textSecondary,
    marginBottom:25,
    marginTop:5,
  },

  card:{
    backgroundColor:Colors.white,
    borderRadius:18,
    padding:18,
    marginBottom:18,
    elevation:3,
  },

  header:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:15,
  },

  driver:{
    fontSize:20,
    fontWeight:"700",
    color:Colors.primary,
  },

  vehicle:{
    color:Colors.textSecondary,
    marginTop:3,
  },

  statusBadge:{
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:20,
  },

  completed:{
    backgroundColor:"#DCFCE7",
  },

  cancelled:{
    backgroundColor:"#FEE2E2",
  },

  statusText:{
    fontWeight:"700",
    fontSize:13,
  },

  infoRow:{
    flexDirection:"row",
    alignItems:"center",
    marginBottom:10,
  },

  infoText:{
    marginLeft:10,
    color:Colors.textPrimary,
    flex:1,
  },

  footer:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginTop:15,
  },

  price:{
    fontSize:22,
    fontWeight:"700",
    color:Colors.rider,
  },

  button:{
    backgroundColor:Colors.rider,
    paddingHorizontal:18,
    paddingVertical:10,
    borderRadius:12,
  },

  buttonText:{
    color:Colors.white,
    fontWeight:"700",
  },

});