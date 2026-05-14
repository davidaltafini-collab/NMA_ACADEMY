export type PaymentStatus = "pending" | "confirmed" | "failed";
export type AccessStatus = "locked" | "unlocked";

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  created_at: string;
}

export interface UserSession {
  session_id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string;
  browser: string;
  ip_address: string;
  last_active_at: string;
  is_current_session: boolean;
  status: "active" | "revoked";
}

export interface Course {
  course_id: string;
  slug: string;
  title: string;
  description: string;
  short_description?: string;
  price: number;
  currency?: string;
  thumbnail: string;
  status?: "draft" | "published" | "archived";
  features: string[];
  total_duration_minutes?: number;
  modules_count?: number;
  lessons_count?: number;
  target_audience?: string[];
  results_promised?: string[];
  modules?: CourseModule[];
}

export interface CourseModule {
  module_id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  is_free_preview?: boolean;
  lessons: Lesson[];
}

export interface Lesson {
  lesson_id: string;
  module_id: string;
  title: string;
  description?: string;
  video_url: string;
  video_id?: number;        // backend CourseVideo.id — required by ProtectedVideoPlayer
  duration_minutes: number;
  order: number;
  is_free_preview?: boolean;
}

export interface LessonResource {
  resource_id: string;
  lesson_id: string;
  title: string;
  url: string;
  type: string;
}

export interface UserCourse {
  user_course_id: string;
  user_id: string;
  course_id: string;
  access_status: AccessStatus;
  enrolled_at: string;
}

export interface Payment {
  payment_id: string;
  user_id: string;
  course_id: string;
  amount: number;
  payment_status: PaymentStatus;
  created_at: string;
  checkout_id?: string;
}

export interface Checkout {
  checkout_id: string;
  user_id: string;
  course_id: string;
  total_amount: number;
  discount_code_id?: string;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface Invoice {
  invoice_id: string;
  payment_id: string;
  user_id: string;
  invoice_number: string;
  file_url: string;
  issued_at: string;
}

export interface Lead {
  lead_id: string;
  email: string;
  name?: string;
  source?: string;
  created_at: string;
}

export interface DiscountCode {
  discount_code_id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
}

export interface LessonProgress {
  progress_id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  viewed_seconds: number;
  updated_at: string;
}

export interface VideoAccessLog {
  log_id: string;
  user_id: string;
  lesson_id: string;
  device_fingerprint: string;
  accessed_at: string;
}

export interface NewsletterSubscriber {
  subscriber_id: string;
  email: string;
  subscribed_at: string;
}

export interface EmailCampaign {
  campaign_id: string;
  name: string;
  subject: string;
  body: string;
  segment?: string;
  sent_at?: string;
  status: "draft" | "sent";
}

export interface EmailLog {
  log_id: string;
  campaign_id: string;
  user_email: string;
  status: "sent" | "failed";
  sent_at: string;
}

export interface AdminUser {
  admin_id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
}

export interface AdminAuditLog {
  log_id: string;
  admin_id: string;
  action: string;
  details: string;
  created_at: string;
}
