import { ENV } from '../config/env';

// ─── Token management (localStorage) ──────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem(ENV.TOKEN_STORAGE_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(ENV.TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(ENV.TOKEN_STORAGE_KEY);
  }
}

// ─── Error tipado ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
  statusCode: number;
  body?: unknown;

  constructor(
    statusCode: number,
    message: string,
    body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

// ─── Cliente base ─────────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${ENV.API_BASE_URL}${path}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(0, 'Sin conexión al servidor. Verificá que el backend esté corriendo.');
  }

  // Parsear respuesta
  let body: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    // Si es 401 y no estamos en login, redirigir
    if (response.status === 401 && window.location.pathname !== '/login') {
      setToken(null);
      window.location.href = '/login';
    }
    const msg =
      (body as { message?: string })?.message ??
      `Error ${response.status}`;
    throw new ApiError(response.status, msg, body);
  }

  return body as T;
}

// ─── Métodos HTTP ─────────────────────────────────────────────────────────────
export const apiClient = {
  get<T>(path: string) {
    return request<T>(path, { method: 'GET' });
  },

  post<T>(path: string, data?: unknown) {
    return request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  patch<T>(path: string, data?: unknown) {
    return request<T>(path, {
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' });
  },
};
