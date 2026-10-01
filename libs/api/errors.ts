export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body — fine, e.g. 204s or an HTML error page
  }

  if (!res.ok) {
    const message =
      (body as { message?: string } | null)?.message ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  return body as T;
}
