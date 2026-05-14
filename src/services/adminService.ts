import { apiGet, apiPost, apiPut } from "../lib/apiClient";
import { Lead, User } from "../types";

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalLeads: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  activeAccesses: number;
  pendingAccesses: number;
  revenue: number;
  paymentPending: number;
  emailsSent: number;
  emailsFailed: number;
  recentActivity: Array<{ id: string; action: string; time: string | null }>;
}

export interface AdminUserDetail extends User {
  raw_role?: "user" | "admin" | "superadmin";
  status?: "unverified" | "active" | "suspended";
  marketing_consent?: boolean;
  last_login_at?: string | null;
  email_verified_at?: string | null;
  active_courses_count?: number;
  active_sessions_count?: number;
  courses?: Array<{
    id: number;
    course_id: number;
    course_title: string | null;
    access_status: string;
    source: string | null;
    purchased_at: string | null;
    created_at: string | null;
  }>;
  sessions?: Array<{
    id: number;
    device_name: string | null;
    browser: string | null;
    ip_address: string | null;
    last_active_at: string | null;
    is_active: boolean;
  }>;
  emails?: Array<{
    id: number;
    type: string;
    subject: string;
    status: string;
    sent_at: string | null;
  }>;
}

export const adminService = {
  getAdminStats: async (): Promise<AdminStats> => {
    const res = await apiGet<{ success: boolean; data: { stats: AdminStats } }>("/admin/stats");
    return res.data.stats;
  },

  getUsers: async (): Promise<AdminUserDetail[]> => {
    const res = await apiGet<{ success: boolean; data: { users: AdminUserDetail[] } }>("/admin/users");
    return res.data.users;
  },

  getUserById: async (userId: string): Promise<AdminUserDetail | undefined> => {
    try {
      const res = await apiGet<{ success: boolean; data: { user: AdminUserDetail } }>(`/admin/users/${userId}`);
      return res.data.user;
    } catch {
      return undefined;
    }
  },

  updateUserStatus: async (
    userId: string,
    status: "unverified" | "active" | "suspended",
  ): Promise<AdminUserDetail> => {
    const res = await apiPut<{ success: boolean; data: { user: AdminUserDetail } }>(
      `/admin/users/${userId}/status`,
      { status },
    );
    return res.data.user;
  },

  getLeads: async (): Promise<Lead[]> => {
    const res = await apiGet<{ success: boolean; data: { leads: Lead[] } }>("/admin/leads");
    return res.data.leads;
  },

  sendEmailCampaign: async (payload: {
    subject: string;
    body?: string;
    segment?: "all" | "leads" | "active_buyers" | "non_buyers";
  }): Promise<{ sent_count: number; segment: string }> => {
    const res = await apiPost<{
      success: boolean;
      data: { sent_count: number; segment: string };
    }>("/admin/email-campaigns", payload);
    return res.data;
  },
};
