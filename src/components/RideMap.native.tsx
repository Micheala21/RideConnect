import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  StyleSheet,
  View,
} from "react-native";

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

import * as Location from "expo-location";

export default function RideMap() {
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [permissionGranted, setPermissionGranted] =
    useState(false);

  // ==================================================
  // REQUEST LOCATION PERMISSION
  // ==================================================

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      // Request foreground location permission
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setPermissionGranted(false);

        Alert.alert(
          "Location Permission Required",
          "RideConnect needs access to your location to show your position on the map."
        );

        return;
      }

      setPermissionGranted(true);

      // Get current location
      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.High,
        });

      setLocation(currentLocation);

      // Move map to current location
      mapRef.current?.animateToRegion(
        {
          latitude:
            currentLocation.coords.latitude,

          longitude:
            currentLocation.coords.longitude,

          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );

    } catch (error) {
      console.log(
        "Location permission error:",
        error
      );

      Alert.alert(
        "Location Error",
        "Unable to get your current location."
      );
    }
  };

  // ==================================================
  // CENTRE MAP ON USER
  // ==================================================

  const centreOnUser = async () => {
    try {
      let currentLocation = location;

      if (!currentLocation) {
        currentLocation =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.High,
          });

        setLocation(currentLocation);
      }

      mapRef.current?.animateToRegion(
        {
          latitude:
            currentLocation.coords.latitude,

          longitude:
            currentLocation.coords.longitude,

          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );

    } catch (error) {
      console.log(
        "Unable to centre on user:",
        error
      );
    }
  };

  // ==================================================
  // DEFAULT CAPE TOWN LOCATION
  // ==================================================

  const defaultRegion: Region = {
    latitude: -33.9249,
    longitude: 18.4241,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <View style={styles.container}>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}

        initialRegion={defaultRegion}

        showsUserLocation={
          permissionGranted
        }

        showsMyLocationButton={
          permissionGranted
        }

        showsCompass={true}

        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}

        onUserLocationChange={(event) => {
          const coordinate =
            event.nativeEvent.coordinate;

          if (coordinate) {
            setLocation({
              coords: {
                latitude:
                  coordinate.latitude,

                longitude:
                  coordinate.longitude,

                altitude: null,
                accuracy: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              },

              timestamp: Date.now(),
            });
          }
        }}
      >

        {/* ==========================================
            USER LOCATION MARKER
        ========================================== */}

        {location && (
          <Marker
            coordinate={{
              latitude:
                location.coords.latitude,

              longitude:
                location.coords.longitude,
            }}

            title="Your Location"

            description="You are here"
          />
        )}

      </MapView>

    </View>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  map: {
    width: "100%",
    height: "100%",
  },

});