/**
 * Mock auth layer. Every function returns the shape the real endpoints are
 * expected to return, so swapping the bodies for `apiRequest(...)` calls is
 * the only change needed once the API is live.
 */

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

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emailVerified: boolean;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
};

const MOCK_LATENCY_MS = 650;

function delay(ms = MOCK_LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function registerUser(
  payload: SignupPayload,
): Promise<{ user: AuthUser; verificationEmailSentTo: string }> {
  await delay();

  return {
    user: {
      id: "usr_mock_1",
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      emailVerified: false,
    },
    verificationEmailSentTo: payload.email,
  };
}

export async function loginUser(payload: LoginPayload): Promise<AuthSession> {
  await delay();

  return {
    token: "mock.jwt.token",
    user: {
      id: "usr_mock_1",
      firstName: "Jack",
      lastName: "Doe",
      email: "jack.doe@gmail.com",
      phoneNumber: payload.phoneNumber,
      emailVerified: true,
    },
  };
}

export async function resendVerificationEmail(email: string): Promise<{ sentTo: string }> {
  await delay(450);
  return { sentTo: email };
}

/**
 * Stands in for the endpoint the emailed link hits. Returns whether the
 * address has been confirmed yet.
 */
export async function confirmEmailVerification(token?: string): Promise<{ verified: boolean }> {
  await delay(900);
  return { verified: token !== "expired" };
}
