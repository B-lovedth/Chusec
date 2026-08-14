import { apiRequest } from "./api";

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: {
    city: string;
    street: string;
  };
};

export async function getUserProfile(userId: number): Promise<UserProfile> {
  return apiRequest<UserProfile>(`/users/${userId}`);
}

export async function updateUserProfile(userId: number, payload: Partial<UserProfile>): Promise<UserProfile> {
  return apiRequest<UserProfile>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
