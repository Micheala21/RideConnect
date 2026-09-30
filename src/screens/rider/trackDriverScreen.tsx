import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  PanResponder,
  Share,
  Linking,
  Dimensions,
  ScrollView,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import Colors from "../../constants/colors";

import {
  RootStackParamList,
} from "../../navigation/AppNavigator";

import { supabase } from "../../lib/supabaseClient";

import RideMap from "../../components/RideMap";

import * as Print from "expo-print";

import * as Sharing from "expo-sharing";

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "TrackDriver"
  >;

type DriverInformation = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  registrationNumber: string;
};

type RideInformation = {
  id: string;
  driverId: string;
  pickup: string;
  destination: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  fare: number;
};

type DriverLocation = {
  latitude: number;
  longitude: number;
  updatedAt: string | null;
};

const SCREEN_HEIGHT =
  Dimensions.get("window").height;

const PANEL_HEIGHT =
  SCREEN_HEIGHT * 0.6;

const PANEL_CLOSED_POSITION =
  PANEL_HEIGHT - 80;

const PANEL_OPEN_POSITION = 0;

export default function TrackDriverScreen({
  navigation,
  route,
}: Props) {
  const { rideId } = route.params;

  const [driver, setDriver] =
    useState<DriverInformation | null>(
      null,
    );

  const [ride, setRide] =
    useState<RideInformation | null>(
      null,
    );

  const [
    driverLocation,
    setDriverLocation,
  ] =
    useState<DriverLocation | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [
    showCompletedModal,
    setShowCompletedModal,
  ] = useState(false);

  const [
    hasShownCompletedModal,
    setHasShownCompletedModal,
  ] = useState(false);

  const [
    isPanelOpen,
    setIsPanelOpen,
  ] = useState(false);

  const panelPosition =
    useRef(
      new Animated.Value(
        PANEL_CLOSED_POSITION,
      ),
    ).current;

  const currentPanelPosition =
    useRef(
      PANEL_CLOSED_POSITION,
    );

  const loadRideAndDriver =
    async () => {
      try {
        const {
          data: rideData,
          error: rideError,
        } = await supabase
          .from("rides")
          .select(
            `
              id,
              driver_id,
              pickup_location,
              destination,
              status,
              started_at,
              completed_at,
              fare
            `,
          )
          .eq("id", rideId)
          .single();

        if (rideError) {
          throw rideError;
        }

        if (!rideData) {
          throw new Error(
            "Ride not found.",
          );
        }

        setRide({
          id: rideData.id,

          driverId:
            rideData.driver_id || "",

          pickup:
            rideData.pickup_location,

          destination:
            rideData.destination,

          status:
            rideData.status,

          startedAt:
            rideData.started_at || null,

          completedAt:
            rideData.completed_at ||
            null,

          fare: Number(
            rideData.fare || 0,
          ),
        });

        if (rideData.driver_id) {
          const {
            data: profile,
          } = await supabase
            .from("profiles")
            .select(
              `
                id,
                first_name,
                last_name,
                phone_number
              `,
            )
            .eq(
              "id",
              rideData.driver_id,
            )
            .maybeSingle();

          const {
            data: vehicle,
          } = await supabase
            .from("driver_profiles")
            .select(
              `
                id,
                vehicle_make,
                vehicle_model,
                registration_number
              `,
            )
            .eq(
              "id",
              rideData.driver_id,
            )
            .maybeSingle();

          setDriver({
            id:
              rideData.driver_id,

            firstName:
              profile?.first_name ||
              "",

            lastName:
              profile?.last_name ||
              "",

            phoneNumber:
              profile?.phone_number ||
              "",

            vehicleMake:
              vehicle?.vehicle_make ||
              "",

            vehicleModel:
              vehicle?.vehicle_model ||
              "",

            registrationNumber:
              vehicle?.registration_number ||
              "",
          });
        }
      } catch (error) {
        console.error(
          "Load ride error:",
          error,
        );

        Alert.alert(
          "Error",
          "Could not load the ride details.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadRideAndDriver();

    // Keep a short polling fallback in case realtime is temporarily unavailable.
    const interval =
      setInterval(() => {
        loadRideAndDriver();
      }, 5000);

    // Realtime updates make the rider status change immediately when the
    // driver presses Start Ride, Arrived, Start Trip or End Trip.
    const rideChannel = supabase
      .channel(`track-driver-ride-${rideId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rides",
          filter: `id=eq.${rideId}`,
        },
        () => {
          loadRideAndDriver();
        },
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(rideChannel);
    };
  }, [rideId]);

  useEffect(() => {
    if (
      !ride ||
      ride.status !== "completed" ||
      hasShownCompletedModal
    ) {
      return;
    }

    // The group workflow calls for the completed receipt/review flow to
    // appear shortly after the driver ends the trip.
    const timer =
      setTimeout(() => {
        setHasShownCompletedModal(
          true,
        );

        setShowCompletedModal(
          true,
        );
      }, 5000);

    return () =>
      clearTimeout(
        timer,
      );
  }, [
    ride?.status,
    hasShownCompletedModal,
  ]);

  // =====================================================
  // LIVE DRIVER LOCATION
  // =====================================================
  // If the optional driver_locations table has been enabled with the
  // included SQL setup file, this listener moves the driver marker in
  // realtime. A missing table is handled quietly so status tracking and the
  // route map still work without crashing.

  useEffect(() => {
    let active = true;
    let locationChannel:
      ReturnType<typeof supabase.channel> | null =
        null;

    const loadDriverLocation =
      async () => {
        const {
          data,
          error,
        } =
          await supabase
            .from("driver_locations")
            .select(
              "latitude, longitude, updated_at",
            )
            .eq(
              "ride_id",
              rideId,
            )
            .maybeSingle();

        if (!active) {
          return;
        }

        if (error) {
          console.warn(
            "Live driver location unavailable:",
            error.message,
          );

          return;
        }

        if (
          data &&
          Number.isFinite(
            Number(data.latitude),
          ) &&
          Number.isFinite(
            Number(data.longitude),
          )
        ) {
          setDriverLocation({
            latitude:
              Number(
                data.latitude,
              ),
            longitude:
              Number(
                data.longitude,
              ),
            updatedAt:
              data.updated_at ||
              null,
          });
        }
      };

    void loadDriverLocation();

    locationChannel =
      supabase
        .channel(
          `driver-location-${rideId}`,
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "driver_locations",
            filter:
              `ride_id=eq.${rideId}`,
          },
          (payload) => {
            if (!active) {
              return;
            }

            if (
              payload.eventType ===
              "DELETE"
            ) {
              setDriverLocation(
                null,
              );
              return;
            }

            const updated =
              payload.new as {
                latitude?: number;
                longitude?: number;
                updated_at?: string;
              };

            if (
              Number.isFinite(
                Number(
                  updated.latitude,
                ),
              ) &&
              Number.isFinite(
                Number(
                  updated.longitude,
                ),
              )
            ) {
              setDriverLocation({
                latitude:
                  Number(
                    updated.latitude,
                  ),
                longitude:
                  Number(
                    updated.longitude,
                  ),
                updatedAt:
                  updated.updated_at ||
                  null,
              });
            }
          },
        )
        .subscribe();

    return () => {
      active = false;

      if (locationChannel) {
        supabase.removeChannel(
          locationChannel,
        );
      }
    };
  }, [rideId]);


  // =====================================================
  // RIDE STATUS
  // =====================================================

  const getRideStage = () => {
    const status =
      ride?.status?.toLowerCase() ||
      "confirmed";

    switch (status) {
      case "driver_on_way":
      case "driver_on_the_way":
      case "on_the_way":
      case "accepted":
      case "heading_to_pickup":
        return 1;

      case "driver_arrived":
      case "arrived":
        return 2;

      case "in_progress":
      case "started":
      case "trip_started":
        return 3;

      case "completed":
        return 4;

      case "cancelled":
        return -1;

      default:
        return 0;
    }
  };

  const rideStage =
    getRideStage();

  const getStatusTitle = () => {
    switch (rideStage) {
      case 1:
        return "Driver is on the way";

      case 2:
        return "Driver has arrived";

      case 3:
        return "Trip in progress";

      case 4:
        return "Completed";

      case -1:
        return "Ride Cancelled";

      default:
        return "Ride Confirmed";
    }
  };

  const getStatusDescription =
    () => {
      switch (rideStage) {
        case 1:
          return "Your driver is heading to your pickup location.";

        case 2:
          return "Your driver has arrived at the pickup location.";

        case 3:
          return "You are currently on your way to your destination.";

        case 4:
          return "Your trip has been completed.";

        case -1:
          return "This ride has been cancelled.";

        default:
          return "Your ride has been confirmed. Your driver will be on the way soon.";
      }
    };

  const getStageIcon = (
    stage: number,
  ) => {
    if (stage === 0) {
      return "checkmark-circle";
    }

    if (stage === 1) {
      return "car";
    }

    if (stage === 2) {
      return "location";
    }

    if (stage === 3) {
      return "navigate";
    }

    return "flag";
  };

  const togglePanel = () => {
    const isOpen =
      currentPanelPosition.current ===
      PANEL_OPEN_POSITION;

    const toValue = isOpen
      ? PANEL_CLOSED_POSITION
      : PANEL_OPEN_POSITION;

    currentPanelPosition.current =
      toValue;

    setIsPanelOpen(!isOpen);

    Animated.spring(
      panelPosition,
      {
        toValue,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      },
    ).start();
  };

  const panResponder =
    useRef(
      PanResponder.create({
        onStartShouldSetPanResponder:
          () => true,

        onMoveShouldSetPanResponder:
          () => true,

        onPanResponderMove: (
          _,
          gestureState,
        ) => {
          const nextPosition =
            currentPanelPosition.current +
            gestureState.dy;

          if (
            nextPosition >=
              PANEL_OPEN_POSITION &&
            nextPosition <=
              PANEL_CLOSED_POSITION
          ) {
            panelPosition.setValue(
              nextPosition,
            );
          }
        },

        onPanResponderRelease: (
          _,
          gestureState,
        ) => {
          const currentPosition =
            currentPanelPosition.current +
            gestureState.dy;

          const midpoint =
            PANEL_CLOSED_POSITION /
            2;

          const toValue =
            currentPosition <
            midpoint
              ? PANEL_OPEN_POSITION
              : PANEL_CLOSED_POSITION;

          currentPanelPosition.current =
            toValue;

          setIsPanelOpen(
            toValue ===
              PANEL_OPEN_POSITION,
          );

          Animated.spring(
            panelPosition,
            {
              toValue,
              useNativeDriver: true,
              tension: 65,
              friction: 11,
            },
          ).start();
        },
      }),
    ).current;

  const shareRideLink =
    async () => {
      if (!ride) {
        return;
      }

      const rideLink =
        `https://rideconnect.app/ride/${ride.id}`;

      try {
        await Share.share({
          message:
            `Track my RideConnect ride here: ${rideLink}`,

          title:
            "RideConnect Ride",
        });
      } catch (error) {
        console.error(
          "Share ride error:",
          error,
        );

        Alert.alert(
          "Error",
          "Could not share the ride link.",
        );
      }
    };

  const formatDateTime = (
    dateString:
      string | null,
  ) => {
    if (!dateString) {
      return "Not available";
    }

    return new Date(
      dateString,
    ).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getTripDuration = () => {
    if (
      !ride?.startedAt ||
      !ride?.completedAt
    ) {
      return "Not available";
    }

    const start =
      new Date(
        ride.startedAt,
      ).getTime();

    const end =
      new Date(
        ride.completedAt,
      ).getTime();

    const difference =
      Math.max(0, end - start);

    const minutes =
      Math.floor(
        difference /
          (1000 * 60),
      );

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours =
      Math.floor(minutes / 60);

    const remainingMinutes =
      minutes % 60;

    return `${hours}h ${remainingMinutes}min`;
  };

  // =====================================================
  // RECEIPT HTML
  // =====================================================

  const createReceiptHtml =
    () => {
      if (!ride) {
        return "";
      }

      const driverName =
        driver
          ? `${driver.firstName} ${driver.lastName}`.trim()
          : "Driver";

      return `
        <!DOCTYPE html>

        <html>

        <head>

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <style>

            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #332C27;
            }

            .header {
              text-align: center;
              margin-bottom: 30px;
            }

            .logo {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 8px;
            }

            .title {
              font-size: 22px;
              font-weight: bold;
            }

            .subtitle {
              color: #777;
              margin-top: 5px;
            }

            .section {
              margin-top: 22px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
            }

            .label {
              color: #777;
            }

            .value {
              font-weight: bold;
              text-align: right;
              max-width: 60%;
            }

            .fare {
              font-size: 22px;
              font-weight: bold;
            }

            .footer {
              margin-top: 35px;
              text-align: center;
              color: #777;
              font-size: 12px;
            }

          </style>

        </head>

        <body>

          <div class="header">

            <div class="logo">
              RideConnect
            </div>

            <div class="title">
              Trip Receipt
            </div>

            <div class="subtitle">
              Thank you for riding with RideConnect
            </div>

          </div>

          <div class="section">

            <div class="row">
              <span class="label">
                Ride ID
              </span>

              <span class="value">
                ${ride.id}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Driver
              </span>

              <span class="value">
                ${driverName}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Vehicle
              </span>

              <span class="value">
                ${
                  driver
                    ? `${driver.vehicleMake} ${driver.vehicleModel}`
                    : "Not available"
                }
              </span>
            </div>

            <div class="row">
              <span class="label">
                Registration
              </span>

              <span class="value">
                ${
                  driver?.registrationNumber ||
                  "Not available"
                }
              </span>
            </div>

          </div>

          <div class="section">

            <div class="row">
              <span class="label">
                Pickup
              </span>

              <span class="value">
                ${ride.pickup}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Destination
              </span>

              <span class="value">
                ${ride.destination}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Started
              </span>

              <span class="value">
                ${formatDateTime(
                  ride.startedAt,
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Completed
              </span>

              <span class="value">
                ${formatDateTime(
                  ride.completedAt,
                )}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Duration
              </span>

              <span class="value">
                ${getTripDuration()}
              </span>
            </div>

          </div>

          <div class="section">

            <div class="row">

              <span class="label">
                Total Fare
              </span>

              <span class="fare">
                R${ride.fare.toFixed(2)}
              </span>

            </div>

          </div>

          <div class="footer">
            RideConnect Trip Receipt
          </div>

        </body>

        </html>
      `;
    };

  // =====================================================
  // DOWNLOAD RECEIPT
  // =====================================================

  const downloadReceipt =
    async () => {
      if (!ride) {
        return;
      }

      try {
        const html =
          createReceiptHtml();

        const {
          uri,
        } =
          await Print.printToFileAsync({
            html,
          });

        if (
          await Sharing.isAvailableAsync()
        ) {
          await Sharing.shareAsync(
            uri,
            {
              mimeType:
                "application/pdf",

              dialogTitle:
                "Save RideConnect Receipt",

              UTI:
                "com.adobe.pdf",
            },
          );
        } else {
          Alert.alert(
            "Receipt Created",
            "Your receipt was created successfully.",
          );
        }
      } catch (error) {
        console.error(
          "Receipt download error:",
          error,
        );

        Alert.alert(
          "Error",
          "Could not create the receipt.",
        );
      }
    };

  // =====================================================
  // SEND RECEIPT TO GMAIL
  // =====================================================

  const sendReceiptToGmail =
    async () => {
      if (!ride) {
        return;
      }

      try {
        const driverName =
          driver
            ? `${driver.firstName} ${driver.lastName}`.trim()
            : "Driver";

        const subject =
          encodeURIComponent(
            "RideConnect Trip Receipt",
          );

        const body =
          encodeURIComponent(
            `Hello,

Here is my RideConnect trip receipt.

Ride ID: ${ride.id}

Driver: ${driverName}

Pickup: ${ride.pickup}

Destination: ${ride.destination}

Started: ${formatDateTime(
              ride.startedAt,
            )}

Completed: ${formatDateTime(
              ride.completedAt,
            )}

Duration: ${getTripDuration()}

Fare: R${ride.fare.toFixed(
              2,
            )}

Thank you,
RideConnect`,
          );

        const gmailUrl =
          `googlegmail://co?subject=${subject}&body=${body}`;

        const webGmailUrl =
          `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;

        const canOpenGmail =
          await Linking.canOpenURL(
            gmailUrl,
          );

        if (canOpenGmail) {
          await Linking.openURL(
            gmailUrl,
          );
        } else {
          await Linking.openURL(
            webGmailUrl,
          );
        }
      } catch (error) {
        console.error(
          "Gmail error:",
          error,
        );

        Alert.alert(
          "Could Not Open Gmail",
          "Please make sure Gmail is installed or try again.",
        );
      }
    };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text
          style={styles.loadingText}
        >
          Loading ride...
        </Text>
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <Text
          style={styles.errorText}
        >
          Ride information could not
          be found.
        </Text>
      </SafeAreaView>
    );
  }

  const driverName =
    driver
      ? `${driver.firstName} ${driver.lastName}`.trim()
      : "Driver";

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* MAP */}

      <RideMap
        pickup={ride.pickup}
        destination={
          ride.destination
        }
        showCurrentLocation={
          false
        }
        trackedCoordinate={
          driverLocation
            ? {
                latitude:
                  driverLocation.latitude,
                longitude:
                  driverLocation.longitude,
              }
            : null
        }
      />

      {/* HEADER */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          Track Driver
        </Text>

        <View
          style={styles.headerSpacer}
        />
      </View>

      {/* BOTTOM SHEET */}

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [
              {
                translateY:
                  panelPosition,
              },
            ],
          },
        ]}
      >

        {/* PANEL HANDLE */}

        <View
          {...panResponder.panHandlers}
          style={styles.dragArea}
        >
          <View
            style={styles.dragHandle}
          />

          <TouchableOpacity
            style={
              styles.panelToggleButton
            }
            onPress={
              togglePanel
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name={
                isPanelOpen
                  ? "chevron-down"
                  : "chevron-up"
              }
              size={20}
              color={
                Colors.primary
              }
            />
          </TouchableOpacity>
        </View>

        {/* PANEL CONTENT */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.panelContent
          }
        >

          {/* CURRENT STATUS */}

          <View
            style={
              styles.currentStatusCard
            }
          >
            <View
              style={
                styles.currentStatusIcon
              }
            >
              <Ionicons
                name={
                  getStageIcon(
                    rideStage,
                  ) as any
                }
                size={25}
                color={
                  Colors.white
                }
              />
            </View>

            <View
              style={
                styles.currentStatusInfo
              }
            >
              <Text
                style={
                  styles.currentStatusTitle
                }
              >
                {getStatusTitle()}
              </Text>

              <Text
                style={
                  styles.currentStatusDescription
                }
              >
                {getStatusDescription()}
              </Text>
            </View>
          </View>

          {/* STATUS PROGRESS */}

          {rideStage >= 0 && (
            <View
              style={
                styles.statusProgressContainer
              }
            >

              {/* CONFIRMED */}

              <View
                style={
                  styles.statusStep
                }
              >
                <View
                  style={[
                    styles.statusStepCircle,
                    rideStage >= 0 &&
                      styles.statusStepCircleActive,
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={
                      Colors.white
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.statusStepText,
                    rideStage >= 0 &&
                      styles.statusStepTextActive,
                  ]}
                >
                  Confirmed
                </Text>
              </View>

              <View
                style={[
                  styles.statusLine,
                  rideStage >= 1 &&
                    styles.statusLineActive,
                ]}
              />

              {/* DRIVER ON WAY */}

              <View
                style={
                  styles.statusStep
                }
              >
                <View
                  style={[
                    styles.statusStepCircle,
                    rideStage >= 1 &&
                      styles.statusStepCircleActive,
                  ]}
                >
                  <Ionicons
                    name="car"
                    size={14}
                    color={
                      rideStage >= 1
                        ? Colors.white
                        : "#999"
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.statusStepText,
                    rideStage >= 1 &&
                      styles.statusStepTextActive,
                  ]}
                >
                  On the way
                </Text>
              </View>

              <View
                style={[
                  styles.statusLine,
                  rideStage >= 2 &&
                    styles.statusLineActive,
                ]}
              />

              {/* ARRIVED */}

              <View
                style={
                  styles.statusStep
                }
              >
                <View
                  style={[
                    styles.statusStepCircle,
                    rideStage >= 2 &&
                      styles.statusStepCircleActive,
                  ]}
                >
                  <Ionicons
                    name="location"
                    size={14}
                    color={
                      rideStage >= 2
                        ? Colors.white
                        : "#999"
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.statusStepText,
                    rideStage >= 2 &&
                      styles.statusStepTextActive,
                  ]}
                >
                  Arrived
                </Text>
              </View>

              <View
                style={[
                  styles.statusLine,
                  rideStage >= 3 &&
                    styles.statusLineActive,
                ]}
              />

              {/* IN PROGRESS */}

              <View
                style={
                  styles.statusStep
                }
              >
                <View
                  style={[
                    styles.statusStepCircle,
                    rideStage >= 3 &&
                      styles.statusStepCircleActive,
                  ]}
                >
                  <Ionicons
                    name="navigate"
                    size={14}
                    color={
                      rideStage >= 3
                        ? Colors.white
                        : "#999"
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.statusStepText,
                    rideStage >= 3 &&
                      styles.statusStepTextActive,
                  ]}
                >
                  Trip
                </Text>
              </View>

              <View
                style={[
                  styles.statusLine,
                  rideStage >= 4 &&
                    styles.statusLineActive,
                ]}
              />

              {/* COMPLETED */}

              <View
                style={
                  styles.statusStep
                }
              >
                <View
                  style={[
                    styles.statusStepCircle,
                    rideStage >= 4 &&
                      styles.statusStepCircleActive,
                  ]}
                >
                  <Ionicons
                    name="flag"
                    size={14}
                    color={
                      rideStage >= 4
                        ? Colors.white
                        : "#999"
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.statusStepText,
                    rideStage >= 4 &&
                      styles.statusStepTextActive,
                  ]}
                >
                  Done
                </Text>
              </View>

            </View>
          )}

          {/* DRIVER */}

          <View
            style={
              styles.driverHeader
            }
          >
            <View
              style={
                styles.driverAvatar
              }
            >
              <Ionicons
                name="person"
                size={28}
                color={
                  Colors.primary
                }
              />
            </View>

            <View
              style={
                styles.driverInfo
              }
            >
              <Text
                style={
                  styles.driverName
                }
              >
                {driverName}
              </Text>

              <View
                style={
                  styles.statusRow
                }
              >
                <View
                  style={[
                    styles.statusDot,
                    rideStage === -1 &&
                      styles.statusDotCancelled,
                  ]}
                />

                <Text
                  style={
                    styles.statusText
                  }
                >
                  {getStatusTitle()}
                </Text>
              </View>
            </View>
          </View>

          {/* PHONE */}

          <View
            style={styles.detailRow}
          >
            <Ionicons
              name="call-outline"
              size={19}
              color={
                Colors.primary
              }
            />

            <Text
              style={
                styles.detailText
              }
            >
              {driver?.phoneNumber ||
                "Phone number not available"}
            </Text>
          </View>

          {/* VEHICLE */}

          <View
            style={styles.detailRow}
          >
            <Ionicons
              name="car-outline"
              size={19}
              color={
                Colors.primary
              }
            />

            <Text
              style={
                styles.detailText
              }
            >
              {driver
                ? `${driver.vehicleMake} ${driver.vehicleModel}`
                : "Vehicle information not available"}
            </Text>
          </View>

          {/* REGISTRATION */}

          <View
            style={styles.detailRow}
          >
            <Ionicons
              name="card-outline"
              size={19}
              color={
                Colors.primary
              }
            />

            <Text
              style={
                styles.detailText
              }
            >
              {driver?.registrationNumber ||
                "Registration not available"}
            </Text>
          </View>

          {/* ROUTE */}

          <View
            style={
              styles.routeContainer
            }
          >
            <View
              style={
                styles.routeIconContainer
              }
            >
              <Ionicons
                name="location"
                size={18}
                color={
                  Colors.primary
                }
              />

              <View
                style={
                  styles.routeLine
                }
              />

              <Ionicons
                name="location"
                size={18}
                color={
                  Colors.primary
                }
              />
            </View>

            <View
              style={
                styles.routeTextContainer
              }
            >
              <Text
                style={
                  styles.routeLabel
                }
              >
                Pickup
              </Text>

              <Text
                style={
                  styles.routeText
                }
                numberOfLines={1}
              >
                {ride.pickup}
              </Text>

              <Text
                style={
                  styles.routeLabel
                }
              >
                Destination
              </Text>

              <Text
                style={
                  styles.routeText
                }
                numberOfLines={1}
              >
                {ride.destination}
              </Text>
            </View>
          </View>

          {/* SHARE */}

          <TouchableOpacity
            style={
              styles.shareRideButton
            }
            onPress={
              shareRideLink
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={
                Colors.primary
              }
            />

            <Text
              style={
                styles.shareRideButtonText
              }
            >
              Share Ride Link
            </Text>
          </TouchableOpacity>

          {/* CHAT / CANCEL */}

          {ride.status !==
            "completed" &&
            ride.status !==
              "cancelled" && (
            <View
              style={
                styles.buttonRow
              }
            >

              <TouchableOpacity
                style={
                  styles.chatButton
                }
                onPress={() =>
                  navigation.navigate(
                    "ChatWithDriver",
                    {
                      rideId:
                        ride.id,
                    },
                  )
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={19}
                  color={
                    Colors.white
                  }
                />

                <Text
                  style={
                    styles.chatButtonText
                  }
                >
                  Chat
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                onPress={() =>
                  Alert.alert(
                    "Cancel Ride",
                    "Are you sure you want to cancel this ride?",
                    [
                      {
                        text: "No",
                        style:
                          "cancel",
                      },
                      {
                        text: "Yes",
                        style:
                          "destructive",

                        onPress:
                          async () => {
                            const {
                              error,
                            } =
                              await supabase
                                .from(
                                  "rides",
                                )
                                .update({
                                  status:
                                    "cancelled",
                                })
                                .eq(
                                  "id",
                                  ride.id,
                                );

                            if (
                              error
                            ) {
                              Alert.alert(
                                "Error",
                                error.message,
                              );
                              return;
                            }

                            Alert.alert(
                              "Ride Cancelled",
                              "Your ride has been cancelled.",
                            );

                            navigation.goBack();
                          },
                      },
                    ],
                  )
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={19}
                  color={
                    Colors.white
                  }
                />

                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>
              </TouchableOpacity>

            </View>
          )}

        </ScrollView>
      </Animated.View>

      {/* =================================================
          COMPLETED TRIP RECEIPT
      ================================================= */}

      {showCompletedModal && (
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.completedModal
            }
          >

            <View
              style={
                styles.completedIcon
              }
            >
              <Ionicons
                name="checkmark"
                size={32}
                color={
                  Colors.white
                }
              />
            </View>

            <Text
              style={
                styles.completedTitle
              }
            >
              Ride Completed
            </Text>

            <Text
              style={
                styles.completedSubtitle
              }
            >
              Your receipt is ready.
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              <View
                style={
                  styles.completedDetails
                }
              >

                <View
                  style={
                    styles.completedRow
                  }
                >
                  <Text
                    style={
                      styles.completedLabel
                    }
                  >
                    Driver
                  </Text>

                  <Text
                    style={
                      styles.completedValue
                    }
                  >
                    {driverName}
                  </Text>
                </View>

                <View
                  style={
                    styles.completedRow
                  }
                >
                  <Text
                    style={
                      styles.completedLabel
                    }
                  >
                    Pickup
                  </Text>

                  <Text
                    style={
                      styles.completedValue
                    }
                  >
                    {ride.pickup}
                  </Text>
                </View>

                <View
                  style={
                    styles.completedRow
                  }
                >
                  <Text
                    style={
                      styles.completedLabel
                    }
                  >
                    Destination
                  </Text>

                  <Text
                    style={
                      styles.completedValue
                    }
                  >
                    {ride.destination}
                  </Text>
                </View>

                <View
                  style={
                    styles.completedRow
                  }
                >
                  <Text
                    style={
                      styles.completedLabel
                    }
                  >
                    Started
                  </Text>

                  <Text
                    style={
                      styles.completedValue
                    }
                  >
                    {formatDateTime(
                      ride.startedAt,
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.completedRow
                  }
                >
                  <Text
                    style={
                      styles.completedLabel
                    }
                  >
                    Completed
                  </Text>

                  <Text
                    style={
                      styles.completedValue
                    }
                  >
                    {formatDateTime(
                      ride.completedAt,
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.completedRow
                  }
                >
                  <Text
                    style={
                      styles.completedLabel
                    }
                  >
                    Duration
                  </Text>

                  <Text
                    style={
                      styles.completedValue
                    }
                  >
                    {getTripDuration()}
                  </Text>
                </View>

                <View
                  style={
                    styles.completedFareRow
                  }
                >
                  <Text
                    style={
                      styles.completedFareLabel
                    }
                  >
                    Total Fare
                  </Text>

                  <Text
                    style={
                      styles.completedFareValue
                    }
                  >
                    R
                    {ride.fare.toFixed(
                      2,
                    )}
                  </Text>
                </View>

              </View>
            </ScrollView>

            {/* REVIEW */}

            <TouchableOpacity
              style={
                styles.reviewButton
              }
              onPress={() => {
                setShowCompletedModal(
                  false,
                );

                navigation.navigate(
                  "ReviewDriver",
                  {
                    rideId:
                      ride.id,
                  },
                );
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="star"
                size={19}
                color={
                  Colors.white
                }
              />

              <Text
                style={
                  styles.reviewButtonText
                }
              >
                Rate / Review Driver
              </Text>
            </TouchableOpacity>

            {/* DOWNLOAD */}

            <TouchableOpacity
              style={
                styles.downloadButton
              }
              onPress={
                downloadReceipt
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="download-outline"
                size={19}
                color={
                  Colors.primary
                }
              />

              <Text
                style={
                  styles.downloadButtonText
                }
              >
                Download Receipt
              </Text>
            </TouchableOpacity>

            {/* GMAIL */}

            <TouchableOpacity
              style={
                styles.emailButton
              }
              onPress={
                sendReceiptToGmail
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="mail-outline"
                size={19}
                color={
                  Colors.primary
                }
              />

              <Text
                style={
                  styles.emailButtonText
                }
              >
                Send Receipt to Gmail
              </Text>
            </TouchableOpacity>

            {/* CLOSE */}

            <TouchableOpacity
              style={
                styles.closeButton
              }
              onPress={() =>
                setShowCompletedModal(
                  false,
                )
              }
              activeOpacity={0.8}
            >
              <Text
                style={
                  styles.closeButtonText
                }
              >
                Close
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        Colors.white,
    },

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        Colors.white,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color:
        Colors.primary,
    },

    errorText: {
      fontSize: 16,
      color: "#B00020",
      textAlign: "center",
    },

    header: {
      position: "absolute",
      top: 15,
      left: 15,
      right: 15,
      flexDirection:
        "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      zIndex: 30,
    },

    backButton: {
      width: 45,
      height: 45,
      borderRadius: 23,
      backgroundColor:
        Colors.white,
      justifyContent:
        "center",
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color:
        Colors.primary,
      backgroundColor:
        Colors.white,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 20,
      elevation: 4,
    },

    headerSpacer: {
      width: 45,
    },

    bottomSheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height:
        PANEL_HEIGHT,
      backgroundColor:
        Colors.white,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      elevation: 15,
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: -4,
      },
      zIndex: 20,
    },

    dragArea: {
      height: 45,
      justifyContent:
        "center",
      alignItems: "center",
      position: "relative",
    },

    dragHandle: {
      width: 50,
      height: 5,
      borderRadius: 5,
      backgroundColor:
        "#C7C7C7",
    },

    panelToggleButton: {
      position: "absolute",
      right: 20,
      top: 7,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor:
        "#F3F3F3",
      justifyContent:
        "center",
      alignItems: "center",
    },

    panelContent: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },

    // ===================================================
    // STATUS
    // ===================================================

    currentStatusCard: {
      flexDirection:
        "row",
      alignItems: "center",
      backgroundColor:
        "#F4F6F2",
      borderRadius: 16,
      padding: 14,
      marginBottom: 15,
    },

    currentStatusIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        Colors.primary,
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 12,
    },

    currentStatusInfo: {
      flex: 1,
    },

    currentStatusTitle: {
      fontSize: 17,
      fontWeight: "800",
      color:
        Colors.primary,
    },

    currentStatusDescription: {
      fontSize: 12,
      color: "#666",
      lineHeight: 17,
      marginTop: 3,
    },

    statusProgressContainer: {
      flexDirection:
        "row",
      alignItems: "flex-start",
      justifyContent:
        "center",
      marginBottom: 18,
    },

    statusStep: {
      alignItems: "center",
      width: 45,
    },

    statusStepCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        "#E1E1E1",
      justifyContent:
        "center",
      alignItems: "center",
    },

    statusStepCircleActive: {
      backgroundColor:
        Colors.primary,
    },

    statusStepText: {
      fontSize: 8,
      color: "#999",
      textAlign: "center",
      marginTop: 5,
    },

    statusStepTextActive: {
      color:
        Colors.primary,
      fontWeight: "700",
    },

    statusLine: {
      flex: 1,
      height: 2,
      backgroundColor:
        "#E1E1E1",
      marginTop: 13,
      maxWidth: 28,
    },

    statusLineActive: {
      backgroundColor:
        Colors.primary,
    },

    // ===================================================
    // DRIVER
    // ===================================================

    driverHeader: {
      flexDirection:
        "row",
      alignItems: "center",
      marginBottom: 14,
    },

    driverAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor:
        "#EEF1EC",
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 12,
    },

    driverInfo: {
      flex: 1,
    },

    driverName: {
      fontSize: 18,
      fontWeight: "700",
      color:
        Colors.primary,
    },

    statusRow: {
      flexDirection:
        "row",
      alignItems: "center",
      marginTop: 4,
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        "#4CAF50",
      marginRight: 6,
    },

    statusDotCancelled: {
      backgroundColor:
        "#C62828",
    },

    statusText: {
      fontSize: 13,
      color: "#666",
    },

    detailRow: {
      flexDirection:
        "row",
      alignItems: "center",
      marginBottom: 9,
    },

    detailText: {
      fontSize: 14,
      color: "#444",
      marginLeft: 10,
      flex: 1,
    },

    routeContainer: {
      flexDirection:
        "row",
      marginTop: 4,
      marginBottom: 12,
    },

    routeIconContainer: {
      width: 25,
      alignItems: "center",
      paddingTop: 2,
    },

    routeLine: {
      width: 1,
      height: 20,
      backgroundColor:
        "#BDBDBD",
      marginVertical: 2,
    },

    routeTextContainer: {
      flex: 1,
      marginLeft: 8,
    },

    routeLabel: {
      fontSize: 11,
      color: "#888",
      marginBottom: 2,
    },

    routeText: {
      fontSize: 14,
      fontWeight: "600",
      color:
        Colors.primary,
      marginBottom: 7,
    },

    // ===================================================
    // BUTTONS
    // ===================================================

    shareRideButton: {
      height: 48,
      borderRadius: 13,
      backgroundColor:
        Colors.white,
      borderWidth: 1.5,
      borderColor:
        Colors.primary,
      flexDirection:
        "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 10,
    },

    shareRideButtonText: {
      color:
        Colors.primary,
      fontSize: 15,
      fontWeight: "700",
      marginLeft: 7,
    },

    buttonRow: {
      flexDirection:
        "row",
      gap: 10,
    },

    chatButton: {
      flex: 1,
      height: 48,
      borderRadius: 13,
      backgroundColor:
        Colors.primary,
      flexDirection:
        "row",
      alignItems: "center",
      justifyContent:
        "center",
    },

    chatButtonText: {
      color:
        Colors.white,
      fontSize: 15,
      fontWeight: "700",
      marginLeft: 7,
    },

    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: 13,
      backgroundColor:
        "#C62828",
      flexDirection:
        "row",
      alignItems: "center",
      justifyContent:
        "center",
    },

    cancelButtonText: {
      color:
        Colors.white,
      fontSize: 15,
      fontWeight: "700",
      marginLeft: 7,
    },

    // ===================================================
    // COMPLETED MODAL
    // ===================================================

    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor:
        "rgba(0,0,0,0.55)",
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 20,
      zIndex: 100,
    },

    completedModal: {
      width: "100%",
      maxWidth: 420,
      maxHeight: "90%",
      backgroundColor:
        Colors.white,
      borderRadius: 24,
      padding: 24,
    },

    completedIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor:
        "#4CAF50",
      alignSelf: "center",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 10,
    },

    completedTitle: {
      fontSize: 22,
      fontWeight: "800",
      color:
        Colors.primary,
      textAlign: "center",
    },

    completedSubtitle: {
      fontSize: 14,
      color: "#666",
      textAlign: "center",
      marginTop: 5,
      marginBottom: 14,
    },

    completedDetails: {
      backgroundColor:
        "#F7F7F7",
      borderRadius: 15,
      padding: 13,
      marginBottom: 14,
    },

    completedRow: {
      marginBottom: 8,
    },

    completedLabel: {
      fontSize: 10,
      color: "#888",
      marginBottom: 2,
    },

    completedValue: {
      fontSize: 13,
      fontWeight: "600",
      color:
        Colors.primary,
    },

    completedFareRow: {
      flexDirection:
        "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderTopWidth: 1,
      borderTopColor:
        "#DDDDDD",
      paddingTop: 10,
      marginTop: 3,
    },

    completedFareLabel: {
      fontSize: 15,
      fontWeight: "700",
      color:
        Colors.primary,
    },

    completedFareValue: {
      fontSize: 20,
      fontWeight: "800",
      color:
        Colors.primary,
    },

    reviewButton: {
      height: 48,
      borderRadius: 13,
      backgroundColor:
        Colors.primary,
      flexDirection:
        "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 8,
    },

    reviewButtonText: {
      color:
        Colors.white,
      fontSize: 14,
      fontWeight: "700",
      marginLeft: 7,
    },

    downloadButton: {
      height: 48,
      borderRadius: 13,
      backgroundColor:
        Colors.white,
      borderWidth: 1.5,
      borderColor:
        Colors.primary,
      flexDirection:
        "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 8,
    },

    downloadButtonText: {
      color:
        Colors.primary,
      fontSize: 14,
      fontWeight: "700",
      marginLeft: 7,
    },

    emailButton: {
      height: 48,
      borderRadius: 13,
      backgroundColor:
        "#F4F4F4",
      flexDirection:
        "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 8,
    },

    emailButtonText: {
      color:
        Colors.primary,
      fontSize: 14,
      fontWeight: "700",
      marginLeft: 7,
    },

    closeButton: {
      height: 44,
      borderRadius: 13,
      backgroundColor:
        "#EEEEEE",
      justifyContent:
        "center",
      alignItems: "center",
    },

    closeButtonText: {
      color:
        Colors.primary,
      fontSize: 14,
      fontWeight: "700",
    },
  });
