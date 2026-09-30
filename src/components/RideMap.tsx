import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Location from "expo-location";

import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
} from "@maplibre/maplibre-react-native";

export type RideMapCoordinate = {
  latitude: number;
  longitude: number;
};

type RideMapProps = {
  pickup: string;
  destination: string;
  onDistanceCalculated?: (distanceKm: number) => void;
  /**
   * Used by the rider tracking screen to show the driver's most recent
   * shared GPS position. The map still works when this value is absent.
   */
  trackedCoordinate?: RideMapCoordinate | null;
  /**
   * Driver/home screens normally show the current device position. The rider
   * tracking screen disables it so the rider's own phone is not mistaken for
   * the driver's location.
   */
  showCurrentLocation?: boolean;
};

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const DEFAULT_CENTER: [number, number] = [18.4241, -33.9249]; // Cape Town

export default function RideMap({
  pickup,
  destination,
  onDistanceCalculated,
  trackedCoordinate = null,
  showCurrentLocation = true,
}: RideMapProps) {
  const cameraRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const [currentLocation, setCurrentLocation] =
    useState<RideMapCoordinate | null>(null);
  const [pickupCoordinate, setPickupCoordinate] =
    useState<RideMapCoordinate | null>(null);
  const [destinationCoordinate, setDestinationCoordinate] =
    useState<RideMapCoordinate | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(showCurrentLocation);
  const [error, setError] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ======================================================
  // CURRENT DEVICE LOCATION
  // ======================================================

  useEffect(() => {
    if (!showCurrentLocation) {
      setLocationLoading(false);
      setCurrentLocation(null);
      return;
    }

    let cancelled = false;

    const getCurrentLocation = async () => {
      try {
        setLocationLoading(true);

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== Location.PermissionStatus.GRANTED) {
          if (!cancelled) {
            setError((current) =>
              current || "Location permission is off. You can still enter a route manually.",
            );
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (cancelled || !mountedRef.current) {
          return;
        }

        const coordinate: RideMapCoordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setCurrentLocation(coordinate);

        // MapLibre React Native v11 removed CameraRef.setCamera().
        // easeTo uses the v11 camera API and avoids the driver-home crash.
        setTimeout(() => {
          if (!mountedRef.current) {
            return;
          }

          cameraRef.current?.easeTo?.({
            center: [coordinate.longitude, coordinate.latitude],
            zoom: 14,
            duration: 700,
          });
        }, 300);
      } catch (locationError) {
        console.error("Location error:", locationError);

        if (!cancelled && mountedRef.current) {
          setError((current) =>
            current || "Your current location could not be loaded.",
          );
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setLocationLoading(false);
        }
      }
    };

    getCurrentLocation();

    return () => {
      cancelled = true;
    };
  }, [showCurrentLocation]);

  // ======================================================
  // GEOCODING
  // ======================================================

  const geocodeLocation = async (
    value: string,
  ): Promise<RideMapCoordinate | null> => {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=za&q=${encodeURIComponent(
          trimmed,
        )}`,
        {
          headers: {
            "User-Agent": "RideConnect/1.0",
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      const latitude = Number(data[0].lat);
      const longitude = Number(data[0].lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return { latitude, longitude };
    } catch (geocodingError) {
      console.error("Geocoding error:", geocodingError);
      return null;
    }
  };

  // ======================================================
  // DRIVING ROUTE
  // ======================================================

  const getRoute = async (
    origin: RideMapCoordinate,
    routeDestination: RideMapCoordinate,
  ) => {
    const coordinates =
      `${origin.longitude},${origin.latitude};` +
      `${routeDestination.longitude},${routeDestination.latitude}`;

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
    );

    if (!response.ok) {
      throw new Error("Unable to contact the routing service.");
    }

    const data = await response.json();

    if (data.code !== "Ok" || !Array.isArray(data.routes) || !data.routes[0]) {
      throw new Error("No driving route was found.");
    }

    const route = data.routes[0];
    const distanceKm = Number(route.distance) / 1000;
    const coordinatesFromRoute = route.geometry?.coordinates;

    if (!Array.isArray(coordinatesFromRoute) || coordinatesFromRoute.length === 0) {
      throw new Error("Route geometry was not returned.");
    }

    if (Number.isFinite(distanceKm)) {
      onDistanceCalculated?.(distanceKm);
    }

    if (!mountedRef.current) {
      return;
    }

    setRouteCoordinates(coordinatesFromRoute);

    const west = Math.min(origin.longitude, routeDestination.longitude);
    const east = Math.max(origin.longitude, routeDestination.longitude);
    const south = Math.min(origin.latitude, routeDestination.latitude);
    const north = Math.max(origin.latitude, routeDestination.latitude);

    setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }

      // v11 camera stop with bounds + padding. This avoids the removed
      // setCamera() API and keeps overlays/panels visible on Android.
      cameraRef.current?.setStop?.({
        bounds: [west, south, east, north],
        padding: {
          top: 70,
          right: 50,
          bottom: 120,
          left: 50,
        },
        duration: 700,
      });
    }, 250);
  };

  // ======================================================
  // LOAD ROUTE WHEN INPUTS CHANGE
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadRoute = async () => {
      if (!pickup.trim() || !destination.trim()) {
        setPickupCoordinate(null);
        setDestinationCoordinate(null);
        setRouteCoordinates([]);
        onDistanceCalculated?.(0);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const pickupLocation = await geocodeLocation(pickup);

        if (cancelled) {
          return;
        }

        if (!pickupLocation) {
          setError("Pickup location could not be found.");
          return;
        }

        // Nominatim's public endpoint should not be hammered by back-to-back
        // requests. The screen already debounces input; this small gap keeps
        // the two lookups polite and stable.
        await new Promise((resolve) => setTimeout(resolve, 1100));

        const destinationLocation = await geocodeLocation(destination);

        if (cancelled) {
          return;
        }

        if (!destinationLocation) {
          setError("Destination could not be found.");
          return;
        }

        setPickupCoordinate(pickupLocation);
        setDestinationCoordinate(destinationLocation);

        await getRoute(pickupLocation, destinationLocation);
      } catch (routeError) {
        console.error("Map route error:", routeError);

        if (!cancelled) {
          setError("Unable to load the route. Check your connection and try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(loadRoute, 700);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pickup, destination]);

  // Keep the camera aware of a tracked driver when no route bounds are being
  // recalculated. This is useful once the rider is on Track Driver.
  useEffect(() => {
    if (!trackedCoordinate || routeCoordinates.length > 0) {
      return;
    }

    cameraRef.current?.easeTo?.({
      center: [trackedCoordinate.longitude, trackedCoordinate.latitude],
      zoom: 14,
      duration: 500,
    });
  }, [trackedCoordinate, routeCoordinates.length]);

  const routeGeoJSON = {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: routeCoordinates,
    },
  };

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE}
        androidView="texture"
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: DEFAULT_CENTER,
            zoom: 11,
          }}
        />

        {showCurrentLocation && currentLocation && (
          <Marker
            lngLat={[
              currentLocation.longitude,
              currentLocation.latitude,
            ]}
          >
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        )}

        {trackedCoordinate && (
          <Marker
            lngLat={[
              trackedCoordinate.longitude,
              trackedCoordinate.latitude,
            ]}
          >
            <View style={styles.driverMarkerOuter}>
              <View style={styles.driverMarkerInner} />
            </View>
          </Marker>
        )}

        {pickupCoordinate && (
          <Marker
            lngLat={[
              pickupCoordinate.longitude,
              pickupCoordinate.latitude,
            ]}
          >
            <View style={styles.marker}>
              <View style={styles.pickupMarker} />
            </View>
          </Marker>
        )}

        {destinationCoordinate && (
          <Marker
            lngLat={[
              destinationCoordinate.longitude,
              destinationCoordinate.latitude,
            ]}
          >
            <View style={styles.marker}>
              <View style={styles.destinationMarker} />
            </View>
          </Marker>
        )}

        {routeCoordinates.length > 0 && (
          <GeoJSONSource id="ride-route" data={routeGeoJSON}>
            <Layer
              id="ride-route-line"
              type="line"
              source="ride-route"
              paint={{
                "line-color": "#0B4F8C",
                "line-width": 5,
                "line-opacity": 1,
              }}
            />
          </GeoJSONSource>
        )}
      </Map>

      {(loading || locationLoading) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0B4F8C" />
          <Text style={styles.loadingText}>
            {locationLoading ? "Finding your location..." : "Loading route..."}
          </Text>
        </View>
      )}

      {!loading && !locationLoading && error !== "" && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  pickupMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#16A34A",
  },
  destinationMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#DC2626",
  },
  currentLocationMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(11, 79, 140, 0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0B4F8C",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  driverMarkerOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(2, 132, 199, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  driverMarkerInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#0284C7",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  loadingContainer: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 3,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  errorContainer: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    elevation: 3,
  },
  errorText: {
    fontSize: 12,
    color: "#B91C1C",
    textAlign: "center",
    fontWeight: "600",
  },
});
