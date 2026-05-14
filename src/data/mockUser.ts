import { User, UserCourse, Payment } from "../types";

export const mockUser: User = {
  user_id: "usr_12345",
  name: "Alexandru Popescu",
  email: "alexandru@example.com",
  role: "user",
  created_at: new Date().toISOString(),
};

export const mockUserCourses: UserCourse[] = [
  {
    user_course_id: "uc_001",
    user_id: "usr_12345",
    course_id: "ecommerce",
    access_status: "unlocked",
    enrolled_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const mockPayments: Payment[] = [
  {
    payment_id: "pay_001",
    user_id: "usr_12345",
    course_id: "ecommerce",
    amount: 850,
    payment_status: "confirmed",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
];
