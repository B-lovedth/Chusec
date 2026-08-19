import { clearAccessToken, getAccessToken } from "@/lib/session";
import { syncServerClock } from "@/lib/server-clock";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://chusec.onrender.com";

const DEFAULT_BASE_URL = API_BASE_URL;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  params?: Record<string, string | number | boolean | null | undefined>;
  /** Plain object is JSON-encoded; FormData is sent as-is for uploads. */
  body?: unknown;
  /** Skip the Authorization header even when a token is stored. */
  anonymous?: boolean;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ValidationDetail = { loc?: (string | number)[]; msg?: string };

/**
 * FastAPI reports errors as `{ detail }`, where detail is either a string or
 * an array of validation objects.
 */
function readErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail: unknown }).detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      const messages = (detail as ValidationDetail[])
        .map((item) => {
          const field = item.loc?.filter((part) => part !== "body").join(".");
          return field ? `${field}: ${item.msg ?? "is invalid"}` : item.msg;
        })
        .filter(Boolean);

      if (messages.length) return messages.join("\n");
    }
  }

  return `Request failed with status ${status}`;
}

function buildUrl(path: string, params: ApiRequestOptions["params"]) {
  const base = path.startsWith("http")
    ? path
    : `${DEFAULT_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  if (!params) return base;

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `${base}?${queryString}` : base;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { params, body, anonymous, headers, ...rest } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !isFormData) requestHeaders.set("Content-Type", "application/json");

  if (!anonymous) {
    const token = getAccessToken();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, params), {
    ...rest,
    headers: requestHeaders,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Every response carries the server's clock; elapsed-time displays are
  // measured against it rather than the device's, which can be wrong.
  syncServerClock(response.headers.get("Date"));

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // A rejected token is worthless — drop it so the UI can prompt a re-login.
    if (response.status === 401) clearAccessToken();
    throw new ApiError(readErrorMessage(payload, response.status), response.status);
  }

  return (payload ?? ({} as T)) as T;
}
