# Backend Handoff Document - NMA Academy

## A. Project Overview
- **What is NMA:** A premium course platform (NMA Academy).
- **Current frontend behavior:** Built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion. Uses mock data and `localStorage` to simulate API calls and persist local state across reloads.
- **Goal for backend:** Build a Laravel API that replaces the mock services without altering the React components or UI flow.
- **Frontend deploy:** Vercel
- **Backend deploy:** PHP/Laravel VPS
- **Communication:** CORS enabled, JSON payloads, Bearer Tokens (JWT or Sanctum).

## B. Current Frontend Behavior
- The `src/services/` folder handles all "API" interactions. Currently, they use `setTimeout` and `localStorage` to simulate backend delays and persistence.
- A `src/lib/apiClient.ts` has been scaffolded to handle real `fetch` wrappers (`apiGet`, `apiPost`, etc.), currently ready to point to `VITE_API_URL` (which defaults to `http://localhost:8000/api`).
- TypeScript definitions live in `src/types.ts`.
- Mock data lives in `src/data/mock*.ts`.

## C. Frontend Service Map
The frontend delegates operations to the following services:

1. **authService (`src/services/authService.ts`)**
   - login, register, resetPassword, logout, getCurrentUser.
   - Future: `/api/auth/*`

2. **userService (`src/services/userService.ts`)**
   - getProfile, updateProfile, getUserCourses.
   - Future: `/api/user/*`

3. **courseService (`src/services/courseService.ts`)**
   - getPublicCourses, getAllCoursesForAdmin, getCourseById, getCourseBySlug, createCourse, updateCourse, archiveCourse, duplicateCourse, markLessonComplete.
   - Future: `/api/courses` and `/api/admin/courses`

4. **paymentService (`src/services/paymentService.ts`)**
   - createCheckoutSession, validateDiscount.
   - Future: `/api/payments/checkout`, `/api/payments/validate-discount`

5. **adminService (`src/services/adminService.ts`)**
   - getAdminStats, getUsers, getUserById, updateUserStatus, getLeads, updateLeadStatus, sendEmailCampaign.
   - Future: `/api/admin/*`

6. **deviceService (`src/services/deviceService.ts`)**
   - getDevices, revokeDevice.
   - Future: `/api/user/devices`

7. **leadService (`src/services/leadService.ts`)**
   - createLead.
   - Future: `/api/leads`

## D. User Workflow

1. **Visitor:** Arrives at homepage, scrolls through courses, sees lead popup.
2. **Lead Capture:** User enters email in popup (`leadService.createLead`).
3. **Course Exploration:** User views course detail. If they want to buy, they click "Doresc Cursul".
4. **Auth Layer:** If not logged in, prompted to login/register.
5. **Checkout:** User lands on checkout. Clicks "Finalizeaza Comanda". This calls `paymentService.createCheckoutSession`.
6. **Payment Flow:** Frontend receives an URL to Netopia. Redirects user.
7. **Payment Processing:** 
    - Frontend success URL does **NOT** unlock the course. It only shows processing state.
    - Netopia ITN webhook (Server-to-Server) hits our Laravel backend `POST /api/webhooks/netopia`.
    - Only on confirmed ITN from Netopia, backend sets `payment.status = paid`, `user_courses.access_status = active`, and generates the Oblio invoice.
8. **Course Access:** User goes to "My Courses". Unlocked courses appear with progress bar.
9. **Player:** User watches lessons. Progress tracked via `courseService.markLessonComplete`.

## E. Admin Workflow
- **Demo Access:** Currently, "Intră ca admin demo" sets a dummy token and redirects to `/admin`.
- **Future Real Auth:** Backend returns a JWT with `role: admin` or `superadmin`. There is no separate `admin_users` table; it's handled via `users.role`.
- **Course CRUD:** Complex course management (modules, lessons, resources) mapped out in full detail in `API_CONTRACT.md`.
- **User Management:** View paid users, suspend, manual enroll.
- **Reporting:** Stats on revenue, recent activity, list of leads.

## F. Business Rules
- **Course Visibility:** `draft` and `archived` courses do not show up on public endpoints `/api/courses`.
- **Checkout Security:** Purchasing a course creates a `user_courses` record with `access_status: "pending"`.
- **Payment Confirmation:** Only when Netopia ITN webhook fires with success should `access_status` turn to `"active"`.
- **Devices:** Users are limited to 3 concurrent active sessions. Backend must validate this.
- **Video Security:** Signed URLs to ensure HLS videos aren't embedded elsewhere. Custom watermark over the player.
- **Invoices:** Generates an Oblio invoice only after a successful payment.
- **Leads:** Newsletter/lead capture requires explicit GDPR consent tracking.

## G. Security Notes
- Store Netopia, Oblio, and SMTP API keys **only in backend `.env`**.
- All variables starting with `VITE_` in frontend are public.
- Admin endpoints must be protected by backend middleware checking `users.role`.
- Implement rate limiting on login and lead capture.
- Proper CORS configuration needed allowing the Vercel app to make requests.

## H. Environment Variables

**Frontend (`.env`):**
- `VITE_API_URL`
- `VITE_APP_NAME`
- `VITE_APP_ENV`
- `VITE_DEFAULT_CURRENCY`
- `VITE_MAX_DEVICE_SESSIONS`

**Backend Future (Laravel `.env`):**
- `APP_URL`
- `FRONTEND_URL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_DATABASE`
- `JWT_SECRET`
- `NETOPIA_API_KEY` / `NETOPIA_SIGNATURE`
- `OBLIO_EMAIL` / `OBLIO_SECRET`
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`

## I. MVP Backend Priority

**MVP:**
- Auth (Register, Login, JWT, using `users.role` for admin)
- Public Courses (Listing, Detail)
- Admin Course CRUD (Basic course, module, lesson creation)
- Checkout
- Netopia Session creation
- Netopia ITN / Webhook processing
- Payment status check (polling frontend)
- Course unlock (`user_courses.access_status` update)
- My courses (listing purchased courses)
- Basic lesson progress tracking

**MVP 1.5:**
- Signed video URL generation for protected player
- Device / session limiting (max 3)

**Phase 2:**
- Oblio Invoice Generation via API
- Leads capture / Newsletter endpoints
- Transactional Email confirmations (welcome, receipt)

**Phase 3:**
- Advanced email campaigns management
- Advanced admin audit logs (`admin_audit_logs` tracking)
- Analytics endpoints
