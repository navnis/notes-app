export interface LoginFormErrors {
  email?: string;
  password?: string;
  /** Non-field error from the submit itself (e.g. bad credentials, server/network failure). */
  form?: string;
}

export function validateLoginForm(email: string, password: string): LoginFormErrors {
  const errors: LoginFormErrors = {};
  if (!email) errors.email = "Email is required.";
  if (!password) errors.password = "Password is required.";
  return errors;
}

export interface RegisterFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  /** Non-field error from the submit itself (e.g. email already taken, server/network failure). */
  form?: string;
}

export function validateRegisterForm(
  email: string,
  password: string,
  confirmPassword: string,
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!email) errors.email = "Email is required.";

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords don't match.";
  }

  return errors;
}
