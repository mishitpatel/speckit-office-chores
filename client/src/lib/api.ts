import type { ApiError } from "@office-chores/shared";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown> | undefined;

  constructor(status: number, body: ApiError) {
    super(body.message);
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    throw new ApiClientError(res.status, {
      code: "non_json_response",
      message: `unexpected content-type: ${ct}`,
    });
  }
  const body = (await res.json()) as unknown;
  if (!res.ok) {
    throw new ApiClientError(res.status, body as ApiError);
  }
  return body as T;
}

export const api = {
  async get<T>(path: string, query?: Record<string, string | undefined>): Promise<T> {
    const url = buildUrl(path, query);
    return handle<T>(await fetch(url));
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return handle<T>(res);
  },
  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(path, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return handle<T>(res);
  },
  async del(path: string): Promise<void> {
    await handle<void>(await fetch(path, { method: "DELETE" }));
  },
};

function buildUrl(path: string, query?: Record<string, string | undefined>): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
