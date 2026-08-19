export type Severity = "Critical" | "High" | "Medium" | "Low";

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emergencyContact: string;
  nin: string;
  location: string;
  avatar: string;
  /** False until NIN and emergency contact are both on file. */
  isProfileComplete: boolean;
};

export type IncidentItem = {
  id: number;
  title: string;
  distance: string;
  time: string;
  severity: Severity;
};

export type TransitCorridor = {
  id: number;
  /** Pre-formatted for display, e.g. `Warri → Asaba (A232)`. */
  name: string;
  description: string;
  distance: string;
  severity: Severity;
};

/**
 * Not mock user data — these are the defaults for the two profile fields the
 * API does not carry (`location` and `avatar`). Everything else on the profile
 * comes from `GET /api/auth/verify`. See `toUserProfile`.
 */
export const profileDefaults: UserProfile = {
  firstName: "Jack",
  lastName: "Doe",
  email: "jack.doe@gmail.com",
  phoneNumber: "+2348181804434",
  emergencyContact: "+2348181804434",
  nin: "12345678901",
  location: "",
  avatar: "/avatar-placeholder.svg",
  // Defaults must never trigger the "finish your profile" prompt on their own.
  isProfileComplete: true,
};


