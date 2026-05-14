import { apiDelete, apiGet } from "../lib/apiClient";

// Shape returned by GET /api/user/sessions
export interface ApiSession {
  id: number;
  device: string;
  ip_address: string;
  last_active_at: string | null;
  created_at: string;
  is_current_session: boolean;
}

interface SessionsResponse {
  success: boolean;
  message: string;
  data: { sessions: ApiSession[] };
}

interface RevokeResponse {
  success: boolean;
  message: string;
  data: { revoked_current_session: boolean };
}

export const deviceService = {
  // GET /api/user/sessions
  getSessions: async (): Promise<ApiSession[]> => {
    const res = await apiGet<SessionsResponse>("/user/sessions");
    return res.data.sessions;
  },

  // DELETE /api/user/sessions/{id}
  revokeSession: async (id: number): Promise<{ revokedCurrentSession: boolean }> => {
    const res = await apiDelete<RevokeResponse>(`/user/sessions/${id}`);
    return { revokedCurrentSession: res.data.revoked_current_session };
  },
};
