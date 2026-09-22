import {
  RegisterData,
  LoginData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
} from "../types/auth";


// ==================================================
// API URL
// ==================================================

const API_BASE_URL =
  "YOUR_BACKEND_API_URL";


// ==================================================
// GENERIC REQUEST FUNCTION
// ==================================================

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    },
  );


  // ================================================
  // READ SERVER RESPONSE
  // ================================================

  let data: T;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response.",
    );
  }


  // ================================================
  // HANDLE API ERRORS
  // ================================================

  if (!response.ok) {

    const errorData = data as {
      message?: string;
    };

    throw new Error(
      errorData.message ||
        "The request could not be completed.",
    );
  }


  return data;
};


// ==================================================
// REGISTER USER
// ==================================================

export const registerUser = (
  data: RegisterData,
): Promise<AuthResponse> => {

  return request<AuthResponse>(
    "/auth/register",
    {
      method: "POST",

      body: JSON.stringify(data),
    },
  );
};


// ==================================================
// LOGIN USER
// ==================================================

export const loginUser = (
  data: LoginData,
): Promise<AuthResponse> => {

  return request<AuthResponse>(
    "/auth/login",
    {
      method: "POST",

      body: JSON.stringify(data),
    },
  );
};


// ==================================================
// FORGOT PASSWORD
// ==================================================

export const forgotPassword = (
  data: ForgotPasswordData,
): Promise<AuthResponse> => {

  return request<AuthResponse>(
    "/auth/forgot-password",
    {
      method: "POST",

      body: JSON.stringify(data),
    },
  );
};


// ==================================================
// VERIFY EMAIL
// ==================================================

export const verifyEmail = (
  token: string,
): Promise<AuthResponse> => {

  return request<AuthResponse>(
    `/auth/verify-email?token=${encodeURIComponent(
      token,
    )}`,
    {
      method: "GET",
    },
  );
};


// ==================================================
// RESEND VERIFICATION EMAIL
// ==================================================

export const resendVerificationEmail = (
  email: string,
): Promise<AuthResponse> => {

  return request<AuthResponse>(
    "/auth/resend-verification",
    {
      method: "POST",

      body: JSON.stringify({
        email,
      }),
    },
  );
};


// ==================================================
// RESET PASSWORD
// ==================================================

export const resetPassword = (
  data: ResetPasswordData,
): Promise<AuthResponse> => {

  return request<AuthResponse>(
    "/auth/reset-password",
    {
      method: "POST",

      body: JSON.stringify(data),
    },
  );
};