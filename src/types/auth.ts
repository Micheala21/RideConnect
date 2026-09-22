// ================= REGISTER =================

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}


// ================= LOGIN =================

export interface LoginData {
  email: string;
  password: string;
}


// ================= FORGOT PASSWORD =================

export interface ForgotPasswordData {
  email: string;
}


// ================= RESET PASSWORD =================

export interface ResetPasswordData {
  token: string;
  password: string;
}


// ================= USER =================

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  emailVerified?: boolean;
}


// ================= AUTH RESPONSE =================

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}


// ================= API ERROR =================

export interface ApiError {
  success: false;
  message: string;
}