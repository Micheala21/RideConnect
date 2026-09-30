import {
  RegisterData,
  LoginData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
} from "../types/auth";
import { supabase } from "../lib/supabaseClient";

const success = (message: string): AuthResponse => ({
  success: true,
  message,
});

const failure = (message: string): AuthResponse => ({
  success: false,
  message,
});

// Kept for compatibility with the existing screens. RideConnect now uses the
// same Supabase auth provider everywhere instead of an unfinished placeholder
// REST backend ("YOUR_BACKEND_API_URL").
export const registerUser = async (
  data: RegisterData,
): Promise<AuthResponse> => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email.trim(),
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
      },
    },
  });

  if (error) {
    return failure(error.message);
  }

  return {
    ...success("Account created successfully."),
    user: authData.user
      ? {
          id: authData.user.id,
          fullName:
            (authData.user.user_metadata?.full_name as string | undefined) ||
            data.fullName,
          email: authData.user.email || data.email.trim(),
          emailVerified: Boolean(authData.user.email_confirmed_at),
        }
      : undefined,
  };
};

export const loginUser = async (
  data: LoginData,
): Promise<AuthResponse> => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email.trim(),
    password: data.password,
  });

  if (error) {
    return failure(error.message);
  }

  if (!authData.user) {
    return failure("Unable to retrieve your account.");
  }

  return {
    ...success("Signed in successfully."),
    user: {
      id: authData.user.id,
      fullName:
        (authData.user.user_metadata?.full_name as string | undefined) || "",
      email: authData.user.email || data.email.trim(),
      emailVerified: Boolean(authData.user.email_confirmed_at),
    },
  };
};

export const forgotPassword = async (
  data: ForgotPasswordData,
): Promise<AuthResponse> => {
  const { error } = await supabase.auth.resetPasswordForEmail(
    data.email.trim(),
  );

  if (error) {
    return failure(error.message);
  }

  return success("Password reset instructions have been sent.");
};

export const verifyEmail = async (
  token: string,
): Promise<AuthResponse> => {
  if (!token) {
    return failure("The verification link is missing its verification token.");
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "signup",
  });

  if (error) {
    return failure(error.message);
  }

  return success("Email verified successfully.");
};

export const resendVerificationEmail = async (
  email: string,
): Promise<AuthResponse> => {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
  });

  if (error) {
    return failure(error.message);
  }

  return success("A new verification email has been sent.");
};

export const resetPassword = async (
  data: ResetPasswordData,
): Promise<AuthResponse> => {
  // Supabase recovery links establish an authenticated recovery session. Once
  // that session exists, updateUser is the supported way to set the new
  // password. The legacy token property remains on ResetPasswordData only so
  // older navigation calls remain source-compatible.
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    return failure(
      "Your password recovery session is not active. Open the password-reset link from your email on this device, then try again.",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) {
    return failure(error.message);
  }

  return success("Your password has been updated.");
};
