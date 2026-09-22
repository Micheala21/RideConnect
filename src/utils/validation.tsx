// ==================================================
// EMAIL VALIDATION
// ==================================================

export const validateEmail = (
  email: string,
): string | undefined => {

  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return "Email address is required.";
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return "Please enter a valid email address.";
  }

  return undefined;
};


// ==================================================
// PASSWORD VALIDATION
// ==================================================

export const validatePassword = (
  password: string,
): string | undefined => {

  if (!password) {
    return "Password is required.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }

  return undefined;
};


// ==================================================
// PASSWORD CONFIRMATION
// ==================================================

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string,
): string | undefined => {

  if (!confirmPassword) {
    return "Please confirm your password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return undefined;
};


// ==================================================
// REQUIRED FIELD
// ==================================================

export const validateRequired = (
  value: string,
  fieldName: string,
): string | undefined => {

  if (!value.trim()) {
    return `${fieldName} is required.`;
  }

  return undefined;
};


// ==================================================
// PHONE NUMBER
// ==================================================

export const validatePhoneNumber = (
  phoneNumber: string,
): string | undefined => {

  const trimmedPhone =
    phoneNumber.trim();

  if (!trimmedPhone) {
    return "Phone number is required.";
  }

  const phoneRegex =
    /^[0-9+\s()-]{7,20}$/;

  if (!phoneRegex.test(trimmedPhone)) {
    return "Please enter a valid phone number.";
  }

  return undefined;
};