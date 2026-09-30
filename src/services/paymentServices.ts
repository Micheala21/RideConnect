import { supabase } from "../lib/supabaseClient";


export type PaymentRideDetails = {
  id: string;
  fare: number;
  pickupLocation: string;
  destination: string;
  status: string | null;
  riderId: string | null;
  driverId: string | null;
  driverName: string;
  availableSeats: number;
};


export async function getPaymentRideDetails(
  rideId: string,
): Promise<PaymentRideDetails> {

  const {
    data: ride,
    error: rideError,
  } =
    await supabase
      .from("rides")
      .select(
        "id, fare, pickup_location, destination, status, rider_id, driver_id, available_seats",
      )
      .eq(
        "id",
        rideId,
      )
      .single();


  if (rideError) {

    throw new Error(
      rideError.message,
    );

  }


  let driverName =
    "Driver";


  if (ride.driver_id) {

    const {
      data: profile,
    } =
      await supabase
        .from("profiles")
        .select(
          "first_name, last_name",
        )
        .eq(
          "id",
          ride.driver_id,
        )
        .maybeSingle();


    if (profile) {

      driverName = [
        profile.first_name,
        profile.last_name,
      ]
        .filter(Boolean)
        .join(" ");


      if (!driverName) {

        driverName =
          "Driver";

      }

    }

  }


  return {

    id:
      ride.id,

    fare:
      Number(
        ride.fare ?? 0,
      ),

    pickupLocation:
      ride.pickup_location ??
      "—",

    destination:
      ride.destination ??
      "—",

    status:
      ride.status ??
      null,

    riderId:
      ride.rider_id ??
      null,

    driverId:
      ride.driver_id ??
      null,

    driverName,

    availableSeats:
      Number(
        ride.available_seats ??
        0,
      ),

  };

}