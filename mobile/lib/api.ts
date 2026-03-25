import type {
  CalendarEvent,
  Chore,
  Family,
  ShoppingItem,
  ShoppingList,
  Todo,
  WeatherCurrent,
  WeatherData,
  WeatherDay,
} from '@flowki/shared';
import { storage } from './storage';

// Update this to your backend's base URL (set via env or config)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T | null> {
  const token = await storage.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));

    throw new ApiError(res.status, data?.message ?? res.statusText, data);
  }

  // 204 No Content
  if (res.status === 204) {
return null;
}

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
};

// Auth-specific helpers -------------------------------------------------------

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  profile_color?: string | null;
  family_id?: number | null;
  inbound_email_address?: string | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/mobile/login', { email, password }),

  register: (name: string, email: string, password: string, password_confirmation: string) =>
    api.post<LoginResponse>('/api/mobile/register', {
      name,
      email,
      password,
      password_confirmation,
    }),

  logout: () => api.post<void>('/api/mobile/logout'),

  me: () => api.get<AuthUser>('/api/mobile/user'),
};

// Family --------------------------------------------------------------------

export interface FamilyMember {
  id: number;
  name: string;
  email: string;
  profile_color?: string | null;
  role: string;
}

export type { Family };

export const familyApi = {
  get: () => api.get<Family>('/api/mobile/family'),
  create: (name: string) => api.post<Family>('/api/mobile/family', { name }),
  join: (invite_code: string) => api.post<Family>('/api/mobile/family/join', { invite_code }),
};

// Profile -------------------------------------------------------------------

export const profileApi = {
  update: (data: Partial<Pick<AuthUser, 'name' | 'email' | 'profile_color'>>) =>
    api.patch<AuthUser>('/api/mobile/profile', data),
  updatePassword: (
    currentPassword: string | undefined,
    password: string,
    password_confirmation: string,
  ) => {
    const payload: Record<string, string> = { password, password_confirmation };

    if (currentPassword) {
payload.current_password = currentPassword;
}

    return api.put<{ message: string }>('/api/mobile/profile/password', payload);
  },
};

// Weather -------------------------------------------------------------------

export type { WeatherCurrent, WeatherDay, WeatherData };

export const weatherApi = {
  get: () => api.get<WeatherData>('/api/mobile/weather'),
};

// Feature API helpers ----------------------------------------------------------

export const todosApi = {
  list: () => api.get<Todo[]>('/api/mobile/todos'),
  create: (data: Partial<Todo>) => api.post<Todo>('/api/mobile/todos', data),
  update: (id: number, data: Partial<Todo>) =>
    api.patch<Todo>(`/api/mobile/todos/${id}`, data),
  remove: (id: number) => api.delete(`/api/mobile/todos/${id}`),
};

export const choresApi = {
  list: () => api.get<Chore[]>('/api/mobile/chores'),
  create: (data: Partial<Chore>) => api.post<Chore>('/api/mobile/chores', data),
  update: (id: number, data: Partial<Chore>) =>
    api.patch<Chore>(`/api/mobile/chores/${id}`, data),
  complete: (id: number) =>
    api.post<Chore>(`/api/mobile/chores/${id}/complete`),
  remove: (id: number) => api.delete(`/api/mobile/chores/${id}`),
};

export const shoppingApi = {
  lists: () => api.get<ShoppingList[]>('/api/mobile/shopping'),
  createList: (name: string) =>
    api.post<ShoppingList>('/api/mobile/shopping', { name }),
  removeList: (id: number) => api.delete(`/api/mobile/shopping/${id}`),
  addItem: (listId: number, data: Partial<ShoppingItem>) =>
    api.post<ShoppingItem>(`/api/mobile/shopping/${listId}/items`, data),
  toggleItem: (listId: number, itemId: number) =>
    api.patch<ShoppingItem>(
      `/api/mobile/shopping/${listId}/items/${itemId}/toggle`,
    ),
  removeItem: (listId: number, itemId: number) =>
    api.delete(`/api/mobile/shopping/${listId}/items/${itemId}`),
};

export const calendarApi = {
  list: (start?: string, end?: string) =>
    api.get<CalendarEvent[]>(
      `/api/mobile/calendar${start ? `?start=${start}&end=${end ?? ''}` : ''}`,
    ),
  create: (data: Partial<CalendarEvent>) =>
    api.post<CalendarEvent>('/api/mobile/calendar', data),
  update: (id: number, data: Partial<CalendarEvent>) =>
    api.patch<CalendarEvent>(`/api/mobile/calendar/${id}`, data),
  remove: (id: number) => api.delete(`/api/mobile/calendar/${id}`),
};

export const fcmTokenApi = {
  register: (token: string, device_type: string = 'mobile') =>
    api.post<{ message: string }>('/api/mobile/fcm-tokens', { token, device_type }),
  unregister: (token: string) =>
    api.delete(`/api/mobile/fcm-tokens/${encodeURIComponent(token)}`),
};

export type { Todo, Chore, ShoppingItem, ShoppingList, CalendarEvent };

export { ApiError };
