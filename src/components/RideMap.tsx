import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from "react-native";

import MapView, {
  Marker,
  Polyline,
} from "react-native-maps";


type RideMapProps = {

  pickup: string;

  destination: string;

  onDistanceCalculated?: (
    distanceKm: number
  ) => void;

};


type Coordinate = {

  latitude: number;

  longitude: number;

};


export default function RideMap({
  pickup,
  destination,
  onDistanceCalculated,
}: RideMapProps) {

  const mapRef =
    useRef<MapView>(null);


  const [pickupCoordinate, setPickupCoordinate] =
    useState<Coordinate | null>(null);

  const [destinationCoordinate, setDestinationCoordinate] =
    useState<Coordinate | null>(null);

  const [routeCoordinates, setRouteCoordinates] =
    useState<Coordinate[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==================================================
  // GOOGLE MAPS API KEY
  // ==================================================

  const GOOGLE_MAPS_API_KEY =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;


  // ==================================================
  // GEOCODE LOCATION
  // ==================================================

  const geocodeLocation = async (
    location: string
  ): Promise<Coordinate | null> => {

    try {

      const response =
        await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            location
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );


      const data =
        await response.json();


      if (
        data.status !== "OK" ||
        !data.results ||
        data.results.length === 0
      ) {

        return null;

      }


      const locationData =
        data.results[0]
          .geometry
          .location;


      return {

        latitude:
          locationData.lat,

        longitude:
          locationData.lng,

      };

    } catch (error) {

      console.error(
        "Geocoding error:",
        error
      );

      return null;

    }

  };


  // ==================================================
  // GET ROUTE
  // ==================================================

  const getRoute = async (
    origin: Coordinate,
    destination: Coordinate
  ) => {

    try {

      const response =
        await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`
        );


      const data =
        await response.json();


      if (
        data.status !== "OK" ||
        !data.routes ||
        data.routes.length === 0
      ) {

        return;

      }


      const route =
        data.routes[0];


      const leg =
        route.legs[0];


      // ==================================================
      // DISTANCE
      // ==================================================

      const distanceMeters =
        leg.distance.value;


      const distanceKm =
        distanceMeters / 1000;


      onDistanceCalculated?.(
        distanceKm
      );


      // ==================================================
      // DECODE ROUTE
      // ==================================================

      const points =
        decodePolyline(
          route.overview_polyline.points
        );


      setRouteCoordinates(
        points
      );


      // ==================================================
      // FIT MAP TO ROUTE
      // ==================================================

      setTimeout(() => {

        mapRef.current?.fitToCoordinates(
          [
            origin,
            destination,
            ...points,
          ],
          {
            edgePadding: {
              top: 80,
              right: 50,
              bottom: 80,
              left: 50,
            },

            animated: true,
          }
        );

      }, 300);

    } catch (error) {

      console.error(
        "Directions error:",
        error
      );

    }

  };


  // ==================================================
  // DECODE GOOGLE POLYLINE
  // ==================================================

  const decodePolyline = (
    encoded: string
  ): Coordinate[] => {

    const points: Coordinate[] = [];

    let index = 0;

    let lat = 0;

    let lng = 0;


    while (
      index <
      encoded.length
    ) {

      let shift = 0;

      let result = 0;

      let byte;


      do {

        byte =
          encoded.charCodeAt(
            index++
          ) -
          63;

        result |=
          (byte & 0x1f) <<
          shift;

        shift += 5;

      } while (
        byte >= 0x20
      );


      const deltaLat =
        result & 1
          ? ~(result >> 1)
          : result >> 1;


      lat += deltaLat;


      shift = 0;

      result = 0;


      do {

        byte =
          encoded.charCodeAt(
            index++
          ) -
          63;

        result |=
          (byte & 0x1f) <<
          shift;

        shift += 5;

      } while (
        byte >= 0x20
      );


      const deltaLng =
        result & 1
          ? ~(result >> 1)
          : result >> 1;


      lng += deltaLng;


      points.push({

        latitude:
          lat / 100000,

        longitude:
          lng / 100000,

      });

    }


    return points;

  };


  // ==================================================
  // LOAD ROUTE WHEN LOCATIONS CHANGE
  // ==================================================

  useEffect(() => {

    const loadRoute = async () => {

      if (
        !pickup.trim() ||
        !destination.trim()
      ) {

        setPickupCoordinate(null);

        setDestinationCoordinate(null);

        setRouteCoordinates([]);

        return;

      }


      if (!GOOGLE_MAPS_API_KEY) {

        setError(
          "Google Maps API key is missing."
        );

        return;

      }


      try {

        setLoading(true);

        setError("");


        // ================================================
        // GEOCODE PICKUP
        // ================================================

        const pickupLocation =
          await geocodeLocation(
            pickup
          );


        if (!pickupLocation) {

          setError(
            "Pickup location could not be found."
          );

          return;

        }


        // ================================================
        // GEOCODE DESTINATION
        // ================================================

        const destinationLocation =
          await geocodeLocation(
            destination
          );


        if (!destinationLocation) {

          setError(
            "Destination could not be found."
          );

          return;

        }


        setPickupCoordinate(
          pickupLocation
        );

        setDestinationCoordinate(
          destinationLocation
        );


        // ================================================
        // GET ROUTE
        // ================================================

        await getRoute(
          pickupLocation,
          destinationLocation
        );

      } catch (error) {

        console.error(
          "Map route error:",
          error
        );

        setError(
          "Unable to load the route."
        );

      } finally {

        setLoading(false);

      }

    };


    loadRoute();

  }, [
    pickup,
    destination,
  ]);


  return (

    <View
      style={styles.container}
    >

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: -33.9249,
          longitude: 18.4241,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >

        {/* ==================================================
            PICKUP MARKER
        ================================================== */}

        {pickupCoordinate && (

          <Marker
            coordinate={
              pickupCoordinate
            }
            title="Pickup"
            description={
              pickup
            }
          />

        )}


        {/* ==================================================
            DESTINATION MARKER
        ================================================== */}

        {destinationCoordinate && (

          <Marker
            coordinate={
              destinationCoordinate
            }
            title="Destination"
            description={
              destination
            }
          />

        )}


        {/* ==================================================
            ROUTE
        ================================================== */}

        {routeCoordinates.length > 0 && (

          <Polyline
            coordinates={
              routeCoordinates
            }
            strokeWidth={5}
            strokeColor={
              "#0B4F8C"
            }
          />

        )}

      </MapView>


      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (

        <View
          style={styles.loadingContainer}
        >

          <ActivityIndicator
            size="large"
            color="#0B4F8C"
          />

          <Text
            style={styles.loadingText}
          >
            Loading route...
          </Text>

        </View>

      )}


      {/* ==================================================
          ERROR
      ================================================== */}

      {!loading &&
        error !== "" && (

        <View
          style={styles.errorContainer}
        >

          <Text
            style={styles.errorText}
          >
            {error}
          </Text>

        </View>

      )}

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


  loadingContainer: {
    position: "absolute",

    top: 20,

    left: 20,

    right: 20,

    backgroundColor:
      "#FFFFFF",

    borderRadius: 12,

    padding: 12,

    alignItems:
      "center",

    elevation: 4,
  },


  loadingText: {
    marginTop: 5,

    color:
      "#002C5C",

    fontSize: 13,

    fontWeight: "600",
  },


  errorContainer: {
    position: "absolute",

    top: 20,

    left: 20,

    right: 20,

    backgroundColor:
      "#FFFFFF",

    borderRadius: 12,

    padding: 12,

    elevation: 4,
  },


  errorText: {
    color:
      "#EF4444",

    fontSize: 13,

    textAlign:
      "center",
  },

});

