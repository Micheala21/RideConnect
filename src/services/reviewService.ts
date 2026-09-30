import { supabase } from "../lib/supabaseClient";

export type ExistingReview = {
  id: string;
  rating: number;
  review: string | null;
};

export type ReviewContext = {
  rideId: string;
  status: string | null;
  driverId: string | null;
  driverName: string;
  existingReview: ExistingReview | null;
};

export async function getReviewContext(
  rideId: string,
): Promise<ReviewContext> {
  const { data: ride, error: rideError } = await supabase
    .from("rides")
    .select("id, status, driver_id")
    .eq("id", rideId)
    .single();

  if (rideError) {
    throw new Error(rideError.message);
  }

  let driverName = "your driver";

  if (ride.driver_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", ride.driver_id)
      .maybeSingle();

    if (profile) {
      driverName = [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(" ");

      if (!driverName) {
        driverName = "your driver";
      }
    }
  }

  const { data: existingReview, error: reviewError } = await supabase
    .from("reviews")
    .select("id, rating, review")
    .eq("ride_id", rideId)
    .maybeSingle();

  if (reviewError) {
    throw new Error(reviewError.message);
  }

  return {
    rideId: ride.id,
    status: ride.status ?? null,
    driverId: ride.driver_id ?? null,
    driverName,
    existingReview: existingReview
      ? {
          id: existingReview.id,
          rating: existingReview.rating,
          review: existingReview.review,
        }
      : null,
  };
}

export async function submitRideReview(
  rideId: string,
  rating: number,
  reviewText: string,
): Promise<string> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to submit a review.");
  }

  const { data: ride, error: rideError } = await supabase
    .from("rides")
    .select("driver_id")
    .eq("id", rideId)
    .single();

  if (rideError) {
    throw new Error(rideError.message);
  }

  if (!ride.driver_id) {
    throw new Error("This ride does not have a driver.");
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      ride_id: rideId,
      rider_id: user.id,
      driver_id: ride.driver_id,
      rating,
      review: reviewText.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("You have already reviewed this ride.");
    }

    throw new Error(error.message);
  }

  return data.id;
}