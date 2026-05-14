import { ApiError, apiGet, apiPost } from "../lib/apiClient";
import { User } from "../types";

// ─── Response types ───────────────────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: string;
    user: BackendUser;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: { email: string; requires_verification: boolean };
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

// Backend user shape (differs from frontend User type — mapped below)
interface BackendUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "user" | "admin" | "superadmin";
  status: string;
  email_verified_at: string | null;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function toFrontendUser(u: BackendUser): User {
  return {
    user_id:    String(u.id),
    name:       u.name,
    email:      u.email,
    role:       u.role === "superadmin" ? "admin" : u.role,
    created_at: u.email_verified_at ?? new Date().toISOString(),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {

  // POST /api/auth/register
  register: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<RegisterResponse> => {
    return apiPost<RegisterResponse>("/auth/register", data);
  },

  // POST /api/auth/login
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await apiPost<LoginResponse>("/auth/login", { email, password });
    return {
      token: res.data.token,
      user:  toFrontendUser(res.data.user),
    };
  },

  // POST /api/auth/logout
  logout: async (): Promise<void> => {
    // Best-effort — don't throw if token already gone
    try {
      await apiPost<ApiResponse>("/auth/logout");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      throw err;
    }
  },

  // GET /api/auth/me
  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem("nma_token");
    if (!token) return null;
    try {
      const res = await apiGet<{ success: boolean; data: { user: BackendUser } }>("/auth/me");
      return toFrontendUser(res.data.user);
    } catch (err) {
      // 401 = token expired or session revoked — clear it silently
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        localStorage.removeItem("nma_token");
        return null;
      }
      return null;
    }
  },

  // POST /api/auth/verify-email-code
  verifyEmailCode: async (data: { email: string; code: string }): Promise<ApiResponse> => {
    return apiPost<ApiResponse>("/auth/verify-email-code", data);
  },

  // POST /api/auth/resend-verification-code
  resendVerificationCode: async (data: { email: string }): Promise<ApiResponse> => {
    return apiPost<ApiResponse>("/auth/resend-verification-code", data);
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return apiPost<ApiResponse>("/auth/forgot-password", { email });
  },

  // POST /api/auth/reset-password
  resetPassword: async (data: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse> => {
    return apiPost<ApiResponse>("/auth/reset-password", data);
  },
};
