import { apiDelete, apiGet, apiPost, apiPut } from "../lib/apiClient";
import { UserCourse } from "../types";

// Profile shape returned by the backend
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  email_verified_at: string | null;
  created_at: string;
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: { user: UserProfile };
}

export const userService = {
  // GET /api/user/profile
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiGet<ProfileResponse>("/user/profile");
    return res.data.user;
  },

  // PUT /api/user/profile — only name and phone
  updateProfile: async (data: { name: string; phone?: string | null }): Promise<UserProfile> => {
    const res = await apiPut<ProfileResponse>("/user/profile", data);
    return res.data.user;
  },

  // POST /api/user/change-password
  changePassword: async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> => {
    await apiPost<{ success: boolean; message: string }>("/user/change-password", data);
  },

  // POST /api/user/request-email-change
  requestEmailChange: async (data: {
    new_email: string;
    current_password: string;
  }): Promise<void> => {
    await apiPost<{ success: boolean; message: string }>("/user/request-email-change", data);
  },

  // POST /api/user/confirm-email-change
  confirmEmailChange: async (code: string): Promise<UserProfile> => {
    const res = await apiPost<{ success: boolean; message: string; data: { user: UserProfile } }>(
      "/user/confirm-email-change",
      { code }
    );
    return res.data.user;
  },

  // POST /api/user/cancel-email-change
  cancelEmailChange: async (): Promise<void> => {
    await apiPost<{ success: boolean; message: string }>("/user/cancel-email-change");
  },

  // DELETE /api/user/account
  deleteAccount: async (data: { password: string; confirmation: string }): Promise<void> => {
    await apiDelete<{ success: boolean; message: string }>("/user/account", data);
  },

  // GET /api/user/courses
  getUserCourses: async (): Promise<UserCourse[]> => {
    interface ApiUserCourse {
      id: number;
      course_id: number;
      access_status: string;
      purchased_at: string | null;
    }
    const res = await apiGet<{ success: boolean; data: { courses: ApiUserCourse[] } }>("/user/courses");
    return res.data.courses.map((item) => ({
      user_course_id: String(item.id),
      user_id:        "",
      course_id:      String(item.course_id),
      // Backend returns "active" for accessible courses; map to "unlocked" for the frontend type
      access_status:  item.access_status === "active" ? ("unlocked" as const) : ("locked" as const),
      enrolled_at:    item.purchased_at ?? new Date().toISOString(),
    }));
  },
};
