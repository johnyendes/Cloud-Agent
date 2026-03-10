import { env } from "@/lib/env";

export class HttpError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function http<TResponse>(
  path: string,
  opts: {
    method?: HttpMethod;
    token?: string | null;
    body?: unknown;
    signal?: AbortSignal;
    headers?: Record<string, string>;
  } = {}
): Promise<TResponse> {
  const url = `${env.NEXT_PUBLIC_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    ...(opts.headers ?? {})
  };

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in (data as any)
        ? String((data as any).message)
        : `HTTP ${res.status}`;
    throw new HttpError(msg, res.status, data);
  }

  return data as TResponse;
}
