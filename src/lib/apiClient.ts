export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8080/api';

/** Helper delay for mock usage only. */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Error thrown when the API returns a non-2xx status. Carries the parsed JSON body. */
export class ApiError extends Error {
  constructor(public readonly status: number, public readonly data: any) {
    super(data?.message ?? `API Error ${status}`);
  }
}

async function createHeaders(): Promise<HeadersInit> {
  const token = localStorage.getItem("nma_token");
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: await createHeaders(),
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: await createHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: await createHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(endpoint: string, data?: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: await createHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });
  return handleResponse<T>(res);
}
