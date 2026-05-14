import { UserSession } from "../types";

export const mockUserSessions: UserSession[] = [
  {
    session_id: "dev_1",
    user_id: "usr_12345",
    device_fingerprint: "fg_ab123",
    device_name: "MacBook Pro M2",
    browser: "Chrome / macOS",
    ip_address: "86.126.xx.xx",
    last_active_at: new Date().toISOString(),
    is_current_session: true,
    status: "active",
  },
  {
    session_id: "dev_2",
    user_id: "usr_12345",
    device_fingerprint: "fg_cd456",
    device_name: "iPhone 14 Pro",
    browser: "Safari / iOS",
    ip_address: "82.76.xx.xx",
    last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_current_session: false,
    status: "active",
  },
];
