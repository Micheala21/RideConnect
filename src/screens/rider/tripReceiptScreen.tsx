import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import Colors from "../../constants/colors";
import { supabase } from "../../lib/supabaseClient";
import { RootStackParamList } from "../../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "TripReceipt">;

type ReceiptRide = {
  id: string;
  pickup_location: string;
  destination: string;
  fare: number;
  started_at: string | null;
  completed_at: string | null;
  driver_id: string;
  status: string;
};

export default function TripReceiptScreen({ navigation, route }: Props) {
  const { rideId } = route.params;
  const [ride, setRide] = useState<ReceiptRide | null>(null);
  const [driverName, setDriverName] = useState("Driver");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReceipt = async () => {
      try {
        const { data, error } = await supabase
          .from("rides")
          .select(
            "id, pickup_location, destination, fare, started_at, completed_at, driver_id, status",
          )
          .eq("id", rideId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setRide(data as ReceiptRide);

        if (data.driver_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", data.driver_id)
            .maybeSingle();

          const name = [profile?.first_name, profile?.last_name]
            .filter(Boolean)
            .join(" ");

          if (name) {
            setDriverName(name);
          }
        }
      } catch (error) {
        console.error("Receipt loading error:", error);
        Alert.alert(
          "Receipt Error",
          error instanceof Error ? error.message : "Could not load the trip receipt.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadReceipt();
  }, [rideId]);

  const formatDateTime = (value: string | null) => {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const downloadReceipt = async () => {
    if (!ride) {
      return;
    }

    try {
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 32px; color: #1f2937;">
            <h1 style="margin-bottom: 4px;">RideConnect</h1>
            <h2>Trip Receipt</h2>
            <p><strong>Driver:</strong> ${driverName}</p>
            <p><strong>Pickup:</strong> ${ride.pickup_location}</p>
            <p><strong>Destination:</strong> ${ride.destination}</p>
            <p><strong>Started:</strong> ${formatDateTime(ride.started_at)}</p>
            <p><strong>Completed:</strong> ${formatDateTime(ride.completed_at)}</p>
            <p><strong>Total Fare:</strong> R${Number(ride.fare).toFixed(2)}</p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "RideConnect Trip Receipt",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Receipt Created", `Receipt saved to ${uri}`);
      }
    } catch (error) {
      console.error("Receipt download error:", error);
      Alert.alert("Error", "Could not create the receipt PDF.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.rider} />
          <Text style={styles.loadingText}>Loading receipt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Receipt unavailable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.rider} />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={34} color={Colors.white} />
        </View>

        <Text style={styles.title}>Trip Receipt</Text>
        <Text style={styles.subtitle}>Your RideConnect trip has been completed.</Text>

        <View style={styles.card}>
          <ReceiptRow label="Driver" value={driverName} />
          <ReceiptRow label="Pickup" value={ride.pickup_location} />
          <ReceiptRow label="Destination" value={ride.destination} />
          <ReceiptRow label="Started" value={formatDateTime(ride.started_at)} />
          <ReceiptRow label="Completed" value={formatDateTime(ride.completed_at)} />

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Total Fare</Text>
            <Text style={styles.fareValue}>R{Number(ride.fare).toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("ReviewDriver", { rideId: ride.id })}
        >
          <Ionicons name="star" size={19} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Rate / Review Driver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={downloadReceipt}>
          <Ionicons name="download-outline" size={19} color={Colors.rider} />
          <Text style={styles.secondaryButtonText}>Save / Share Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("RiderHome", { screen: "Past Trips" })}
        >
          <Text style={styles.homeButtonText}>View Past Trips</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 22,
    paddingBottom: 42,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.rider,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 22,
    color: Colors.textSecondary,
    textAlign: "center",
    fontSize: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  fareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 18,
  },
  fareLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  fareValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.rider,
  },
  primaryButton: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.rider,
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.rider,
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.rider,
    fontSize: 15,
    fontWeight: "800",
  },
  homeButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  homeButtonText: {
    color: Colors.textSecondary,
    fontWeight: "700",
  },
});
