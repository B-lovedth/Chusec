const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jsonplaceholder.typicode.com";

export type ApiRequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | null | undefined>;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${DEFAULT_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const queryString = options.params
    ? new URLSearchParams(
        Object.entries(options.params).reduce<Record<string, string>>((accumulator, [key, value]) => {
          if (value !== undefined && value !== null) {
            accumulator[key] = String(value);
          }
          return accumulator;
        }, {}),
      ).toString()
    : "";

  const requestUrl = queryString ? `${url}?${queryString}` : url;

  const response = await fetch(requestUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: string }).message)
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return (payload ?? ({} as T)) as T;
}
