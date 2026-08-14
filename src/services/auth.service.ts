import { apiRequest } from "./api";

export type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type LoginPayload = {
  phoneNumber: string;
  password: string;
};

export type AuthResponse = {
  id: number;
  name: string;
  email: string;
  phone: string;
  token: string;
};

export async function registerUser(payload: SignupPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/users", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      createdAt: new Date().toISOString(),
      role: "community_member",
    }),
  });
}

export async function loginUser(payload: LoginPayload): Promise<{ user: AuthResponse; token: string }> {
  const response = await apiRequest<{ id: number; name: string; email: string; phone: string }>(`/users/${payload.phoneNumber ? 1 : 1}`, {
    method: "GET",
  });

  return {
    token: "placeholder-token",
    user: {
      ...response,
      token: "placeholder-token",
    },
  };
}
