import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: -33.9249,
  lng: 18.4241,
};

export default function RideMap() {
  const [currentLocation, setCurrentLocation] =
    useState<{ lat: number; lng: number } | null>(null);

  const [destination, setDestination] =
    useState<{ lat: number; lng: number } | null>(null);

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey:
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.log(
          "Unable to get current location:",
          error
        );

        // Cape Town fallback
        setCurrentLocation(defaultCenter);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const calculateRoute = () => {
    if (!currentLocation || !destination) {
      return;
    }

    const directionsService =
      new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: currentLocation,
        destination: destination,
        travelMode:
          window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (
          status ===
            window.google.maps.DirectionsStatus.OK &&
          result
        ) {
          setDirections(result);
        } else {
          console.log(
            "Directions request failed:",
            status
          );
        }
      }
    );
  };

  if (loadError) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#DCEAF5",
          flexDirection: "column",
        }}
      >
        <h3>Google Maps could not load</h3>

        <p>
          Check your Google Maps API key.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#DCEAF5",
        }}
      >
        Loading Google Maps...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={
          currentLocation ||
          defaultCenter
        }
        zoom={14}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* CURRENT LOCATION */}

        {currentLocation && (
          <Marker
            position={currentLocation}
            title="Your location"
          />
        )}

        {/* DESTINATION */}

        {destination && (
          <Marker
            position={destination}
            title="Destination"
          />
        )}

        {/* ROUTE */}

        {directions && (
          <DirectionsRenderer
            directions={directions}
          />
        )}
      </GoogleMap>

      {/* TEST DESTINATION BUTTON */}

      <button
        onClick={() => {
          setDestination({
            lat: -33.9249,
            lng: 18.4241,
          });
        }}
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          padding: "12px 16px",
          borderRadius: 10,
          border: "none",
          backgroundColor: "#002C5C",
          color: "#FFFFFF",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Set Destination
      </button>

      {/* ROUTE BUTTON */}

      <button
        onClick={calculateRoute}
        disabled={
          !currentLocation ||
          !destination
        }
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          padding: "12px 16px",
          borderRadius: 10,
          border: "none",
          backgroundColor:
            currentLocation && destination
              ? "#2563EB"
              : "#999999",
          color: "#FFFFFF",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Get Route
      </button>
    </div>
  );
}