import { apiRequest } from "./api";
import { setAccessToken } from "@/lib/session";
import { isValidEmail } from "@/lib/validation";
import type {
  ProfileUpdateRequest,
  RegisterRequest,
  TokenResponse,
  UserResponse,
} from "./types";

export type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type LoginPayload = {
  /** Email address or phone number — see `loginUser` for how it is sent. */
  identifier: string;
  password: string;
};

export async function registerUser(payload: SignupPayload): Promise<UserResponse> {
  const body: RegisterRequest = {
    // The API stores a single display name; the form collects it in two parts.
    name: `${payload.firstName} ${payload.lastName}`.trim(),
    email: payload.email.trim(),
    password: payload.password,
    phone: payload.phoneNumber.trim() || null,
    role: "citizen",
  };

  return apiRequest<UserResponse>("/api/auth/register", {
    method: "POST",
    body,
    anonymous: true,
  });
}

export async function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  const identifier = payload.identifier.trim();
  const looksLikeEmail = isValidEmail(identifier);

  // The API currently only matches on `email`. A phone number is sent in both
  // keys so this keeps working unchanged once the backend also looks up by
  // phone — extra keys are ignored today.
  const token = await apiRequest<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: looksLikeEmail
      ? { email: identifier, password: payload.password }
      : { email: identifier, phone: identifier, password: payload.password },
    anonymous: true,
  });

  setAccessToken(token.access_token);
  return token;
}

/** Endpoint the emailed verification link points at. */
export async function verifyEmailToken(token: string): Promise<void> {
  await apiRequest<unknown>("/api/auth/verify-email", {
    method: "GET",
    params: { token },
    anonymous: true,
  });
}

export async function resendVerificationEmail(email: string): Promise<void> {
  await apiRequest<unknown>("/api/auth/resend-verification", {
    method: "POST",
    body: { email },
    anonymous: true,
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest<unknown>("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
    anonymous: true,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiRequest<unknown>("/api/auth/reset-password", {
    method: "POST",
    body: { token, new_password: newPassword },
    anonymous: true,
  });
}

export async function verifyOtp(email: string, code: string): Promise<void> {
  await apiRequest<unknown>("/api/auth/verify-otp", {
    method: "POST",
    body: { email, code },
    anonymous: true,
  });
}

/** Returns the signed-in user; throws 401 when the token is missing or stale. */
export async function getCurrentUser(): Promise<UserResponse> {
  return apiRequest<UserResponse>("/api/auth/verify");
}

export async function updateProfile(payload: ProfileUpdateRequest): Promise<UserResponse> {
  return apiRequest<UserResponse>("/api/auth/profile", {
    method: "PUT",
    body: payload,
  });
}

export async function uploadAvatar(file: File): Promise<UserResponse> {
  const form = new FormData();
  form.append("file", file);

  return apiRequest<UserResponse>("/api/auth/profile/avatar", {
    method: "POST",
    body: form,
  });
}
