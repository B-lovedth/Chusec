const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts 08181804434, 8181804434, +2348181804434 and 2348181804434. */
const NIGERIAN_PHONE_PATTERN = /^(?:\+?234|0)?[789]\d{9}$/;

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidNigerianPhone(value: string) {
  return NIGERIAN_PHONE_PATTERN.test(value.replace(/[\s-]/g, ""));
}

export type PasswordCheck = {
  valid: boolean;
  message?: string;
};

export function checkPassword(value: string): PasswordCheck {
  if (value.length < 8) return { valid: false, message: "Use at least 8 characters." };
  if (!/[A-Z]/.test(value)) return { valid: false, message: "Add at least one uppercase letter." };
  if (!/\d/.test(value)) return { valid: false, message: "Add at least one number." };
  if (!/[^A-Za-z0-9]/.test(value)) return { valid: false, message: "Add at least one symbol." };
  return { valid: true };
}
