import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const configuredKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

/**
 * createClient throws immediately when the URL is missing. The previous app
 * therefore crashed before any screen could render when a native build did
 * not receive its Expo environment variables. Keep the app bootable and make
 * the configuration problem explicit instead.
 */
export const isSupabaseConfigured = Boolean(configuredUrl && configuredKey);

if (!isSupabaseConfigured) {
  console.error(
    "RideConnect Supabase configuration is missing. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to the environment used by this build.",
  );
}

const supabaseUrl = configuredUrl || "https://invalid.rideconnect.local";
const supabasePublishableKey = configuredKey || "rideconnect-missing-key";

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
