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

// ─── Refresh de access token ───────────────────────────────────────────────────
// El access token dura 15 min y nada lo renovaba en segundo plano — cualquier
// request después de ese lapso tiraba un 401 y expulsaba a /login aunque el
// refresh token (cookie httpOnly, 30 días) siguiera válido. `refreshPromise`
// deduplica: si varios requests pisan un 401 al mismo tiempo, todos esperan
// el mismo intento de refresh en vez de disparar uno cada uno (el backend
// rota el refresh token en cada uso, así que refrescos en paralelo se
// pisarían entre sí).
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${ENV.API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) return false;
        const body = await res.json();
        setToken(body.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

// ─── Cliente base ─────────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const url = `${ENV.API_BASE_URL}${path}`;
  const token = getToken();

  // FormData (ej: subir comprobante de transferencia) fija su propio
  // Content-Type con boundary — no hay que forzar application/json ahí.
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
    // 401: intentar refrescar el access token una vez y reintentar el
    // request original antes de asumir que la sesión murió de verdad.
    if (response.status === 401 && path !== '/auth/refresh' && !isRetry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(path, options, true);
      }
    }

    // Si es 401 (y ya se agotó el intento de refresh) y no estamos en login, redirigir
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

  /** POST con FormData (ej: subir comprobante de transferencia como archivo). */
  postForm<T>(path: string, formData: FormData) {
    return request<T>(path, { method: 'POST', body: formData });
  },
};
