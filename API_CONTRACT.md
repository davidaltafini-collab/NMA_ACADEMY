# API Contract - NMA Future Laravel Backend

This document describes the detailed API endpoints required for the Laravel backend. `VITE_API_URL` is used as the base URL.

## 1. Auth

### Register
- **Service Name:** `authService.register`
- **Method:** POST
- **Path:** `/api/auth/register`
- **Auth Required:** No
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** `{ "name": "John Doe", "email": "john@example.com", "password": "securepassword", "password_confirmation": "securepassword", "gdpr_consent": true }`
- **Response Example:** `{ "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "user" }, "token": "jwt..." }`
- **Possible Errors:** 422 Unprocessable Entity, 409 Conflict
- **Frontend Page/Component:** `/src/pages/auth/Register.tsx`
- **Related DB Tables:** `users`
- **Laravel Controller:** `AuthController@register`
- **Priority:** MVP

### Login
- **Service Name:** `authService.login`
- **Method:** POST
- **Path:** `/api/auth/login`
- **Auth Required:** No
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** `{ "email": "john@example.com", "password": "securepassword" }`
- **Response Example:** `{ "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "user" }, "token": "jwt..." }`
- **Possible Errors:** 401 Unauthorized
- **Frontend Page/Component:** `/src/pages/auth/Login.tsx`
- **Related DB Tables:** `users`
- **Laravel Controller:** `AuthController@login`
- **Priority:** MVP

### Logout
- **Service Name:** `authService.logout`
- **Method:** POST
- **Path:** `/api/auth/logout`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** None
- **Response Example:** `{ "message": "Logged out successfully" }`
- **Possible Errors:** 401 Unauthorized
- **Frontend Page/Component:** Sitewide Header / Sidebar
- **Related DB Tables:** `user_sessions`, `personal_access_tokens`
- **Laravel Controller:** `AuthController@logout`
- **Priority:** MVP

### Get Current User
- **Service Name:** `authService.getCurrentUser`
- **Method:** GET
- **Path:** `/api/auth/me`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** None
- **Response Example:** `{ "id": 1, "name": "John Doe", "email": "john@example.com", "role": "user", "status": "active" }`
- **Possible Errors:** 401 Unauthorized
- **Frontend Page/Component:** `AuthContext.tsx`
- **Related DB Tables:** `users`
- **Laravel Controller:** `AuthController@me`
- **Priority:** MVP

## 2. User/Profile

### Get Profile
- **Service Name:** `userService.getProfile`
- **Method:** GET
- **Path:** `/api/user/profile`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** None
- **Response Example:** `{ "user": { "name": "John", ... }, "billing_profile": { "billing_type": "personal", ... } }`
- **Possible Errors:** 401 Unauthorized
- **Frontend Page/Component:** `/src/pages/dashboard/Profile.tsx`
- **Related DB Tables:** `users`, `billing_profiles`
- **Laravel Controller:** `ProfileController@show`
- **Priority:** Phase 2

### Update Profile
- **Service Name:** `userService.updateProfile`
- **Method:** PUT
- **Path:** `/api/user/profile`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** `{ "name": "John Updated", "phone": "0744111222" }`
- **Response Example:** `{ "message": "Profile updated", "user": { ... } }`
- **Possible Errors:** 422 Unprocessable Entity
- **Frontend Page/Component:** `/src/pages/dashboard/Profile.tsx`
- **Related DB Tables:** `users`
- **Laravel Controller:** `ProfileController@update`
- **Priority:** Phase 2

## 3. Courses Public

### List Public Courses
- **Service Name:** `courseService.getPublicCourses`
- **Method:** GET
- **Path:** `/api/courses`
- **Auth Required:** No
- **Admin Only:** No
- **Request Params:** `?limit=10&page=1`
- **Request Body Example:** None
- **Response Example:** `[{ "id": 1, "slug": "nma-course", "title": "NMA Course", "price": 497, "thumbnail_url": "..." }]`
- **Possible Errors:** None
- **Frontend Page/Component:** `/src/pages/HomeSections/Courses.tsx`
- **Related DB Tables:** `courses` (where status = 'published')
- **Laravel Controller:** `CourseController@index`
- **Priority:** MVP

### Get Course Detail By Slug
- **Service Name:** `courseService.getCourseBySlug`
- **Method:** GET
- **Path:** `/api/courses/slug/{slug}`
- **Auth Required:** No
- **Admin Only:** No
- **Request Params:** `slug` (in path)
- **Request Body Example:** None
- **Response Example:** `{ "id": 1, "title": "NMA", "modules": [ { "id": 1, "title": "M1", "lessons": [...] } ] }`
- **Possible Errors:** 404 Not Found
- **Frontend Page/Component:** `/src/pages/CourseDetail.tsx`
- **Related DB Tables:** `courses`, `course_modules`, `lessons`
- **Laravel Controller:** `CourseController@show`
- **Priority:** MVP

## 4. User Courses / Access

### Get My Courses
- **Service Name:** `userService.getUserCourses`
- **Method:** GET
- **Path:** `/api/user/courses`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** None
- **Response Example:** `[{ "course_id": 1, "course": { "title": "NMA" }, "access_status": "active", "progress_percent": 10 }]`
- **Possible Errors:** 401 Unauthorized
- **Frontend Page/Component:** `/src/pages/dashboard/MyCourses.tsx`
- **Related DB Tables:** `user_courses`, `courses`
- **Laravel Controller:** `UserCourseController@index`
- **Priority:** MVP

### Mark Lesson Completed
- **Service Name:** `courseService.markLessonComplete`
- **Method:** POST
- **Path:** `/api/user/courses/{courseId}/lessons/{lessonId}/complete`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** `courseId`, `lessonId` (in path)
- **Request Body Example:** None
- **Response Example:** `{ "success": true, "progress_percent": 50 }`
- **Possible Errors:** 403 Forbidden (not enrolled)
- **Frontend Page/Component:** `/src/pages/dashboard/CoursePlayer.tsx`
- **Related DB Tables:** `lesson_progress`, `user_courses`
- **Laravel Controller:** `LessonProgressController@complete`
- **Priority:** MVP

## 5. Checkout / Payments / Netopia

### Create Checkout
- **Service Name:** `paymentService.createCheckoutSession`
- **Method:** POST
- **Path:** `/api/payments/checkout`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** `{ "course_slug": "nma-course", "discount_code": "PROMO20" }`
- **Response Example:** `{ "checkout_id": "chk_abc", "amount": 397 }`
- **Possible Errors:** 404 Not Found, 422 Unprocessable
- **Frontend Page/Component:** `/src/pages/checkout/CheckoutPage.tsx`
- **Related DB Tables:** `checkouts`, `discount_codes`, `courses`
- **Laravel Controller:** `CheckoutController@store`
- **Priority:** MVP

### Validate Discount
- **Service Name:** `paymentService.validateDiscount`
- **Method:** POST
- **Path:** `/api/payments/validate-discount`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** `{ "code": "PROMO20", "course_id": 1 }`
- **Response Example:** `{ "valid": true, "percentage": 20 }`
- **Possible Errors:** 404 Not Found, 400 Bad Request
- **Frontend Page/Component:** `/src/pages/checkout/CheckoutPage.tsx`
- **Related DB Tables:** `discount_codes`
- **Laravel Controller:** `DiscountController@validate`
- **Priority:** MVP

### Create Netopia Payment Session
- **Service Name:** `paymentService.createNetopiaSession` (internal to previous)
- **Method:** POST
- **Path:** `/api/payments/netopia/session`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** `{ "checkout_id": "chk_abc" }`
- **Response Example:** `{ "url": "https://secure.netopia...", "env_key": "...", "data": "..." }`
- **Possible Errors:** 400 Bad Request
- **Frontend Page/Component:** `/src/pages/checkout/CheckoutPage.tsx`
- **Related DB Tables:** `payments`, `checkouts`
- **Laravel Controller:** `NetopiaController@createSession`
- **Priority:** MVP

### Netopia Webhook (ITN)
- **Service Name:** N/A (Server-to-Server)
- **Method:** POST
- **Path:** `/api/webhooks/netopia` (or `/api/payments/netopia/itn`)
- **Auth Required:** No (Verifies Netopia signature)
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** Form URL Encoded (`env_key`, `data`)
- **Response Example:** Standard Netopia XML Ack
- **Description:** Only the webhook confirms the payment. Sets `payment.status = paid`, unlocks the course (`user_courses.access_status = active`), triggers Oblio invoice issue. Frontend success page does NOT unlock courses.
- **Related DB Tables:** `payments`, `user_courses`, `invoices`
- **Laravel Controller:** `NetopiaWebhookController@handle`
- **Priority:** MVP

### Payment Return Success / Failed
- **Service Name:** N/A (Redirect endpoints / Frontend)
- **Description:** Typically just frontend routes (e.g., `/payment/success`). The frontend will poll backend for the real status.
- **Frontend Page/Component:** `/src/pages/checkout/PaymentSuccess.tsx`, `/src/pages/checkout/PaymentFailed.tsx`
- **Priority:** MVP

### Get Payment Status
- **Service Name:** `paymentService.getPaymentStatus`
- **Method:** GET
- **Path:** `/api/payments/{checkoutId}/status`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** `checkoutId` (in path)
- **Request Body Example:** None
- **Response Example:** `{ "status": "paid", "course_unlocked": true }`
- **Possible Errors:** 404 Not Found
- **Frontend Page/Component:** `/src/pages/checkout/PaymentSuccess.tsx` (Polling)
- **Related DB Tables:** `payments`, `checkouts`
- **Laravel Controller:** `PaymentController@status`
- **Priority:** MVP

### List User Payments
- **Method:** GET
- **Path:** `/api/user/payments`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** None
- **Response Example:** `[{ "id": 1, "amount": 397, "status": "paid" }]`
- **Possible Errors:** 401 Unauthorized
- **Frontend Page/Component:** `/src/pages/dashboard/Profile.tsx` (Billing history)
- **Related DB Tables:** `payments`
- **Laravel Controller:** `PaymentController@index`
- **Priority:** Phase 2

## 6. Video / Protected Player

### Get Signed Video URL
- **Service Name:** `courseService.getSignedVideoUrl`
- **Method:** GET
- **Path:** `/api/videos/{lessonId}/signed-url`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** `lessonId`
- **Request Body Example:** None
- **Response Example:** `{ "hls_url": "https://cdn.bunny.net/...signed..." }`
- **Possible Errors:** 403 Forbidden (no course access / max devices reached)
- **Frontend Page/Component:** `/src/pages/dashboard/CoursePlayer.tsx`
- **Related DB Tables:** `lessons`, `user_courses`, `user_sessions`
- **Laravel Controller:** `VideoController@getSignedUrl`
- **Priority:** MVP 1.5

## 7. Devices / Sessions

### List Devices
- **Service Name:** `deviceService.getDevices`
- **Method:** GET
- **Path:** `/api/user/devices`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** None
- **Response Example:** `[{ "id": 1, "device_info": "Mac", "is_current": true }]`
- **Possible Errors:** 401 Unauthorized
- **Frontend Page/Component:** `/src/pages/dashboard/Settings.tsx`
- **Related DB Tables:** `user_sessions`
- **Laravel Controller:** `DeviceSessionController@index`
- **Priority:** MVP 1.5

### Revoke Device
- **Service Name:** `deviceService.revokeDevice`
- **Method:** DELETE
- **Path:** `/api/user/devices/{deviceId}`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** `deviceId`
- **Request Body Example:** None
- **Response Example:** `{ "success": true }`
- **Possible Errors:** 403 Forbidden
- **Frontend Page/Component:** `/src/pages/dashboard/Settings.tsx`
- **Related DB Tables:** `user_sessions`
- **Laravel Controller:** `DeviceSessionController@destroy`
- **Priority:** MVP 1.5

## 8. Leads / Newsletter

### Capture Lead
- **Method:** POST
- **Path:** `/api/leads`
- **Auth Required:** No
- **Admin Only:** No
- **Request Params:** None
- **Request Body Example:** `{ "email": "test@test.com", "gdpr_consent": true }`
- **Response Example:** `{ "success": true }`
- **Possible Errors:** 422 Unprocessable Entity
- **Frontend Page/Component:** Footer / Modal
- **Related DB Tables:** `leads`, `newsletter_subscribers`
- **Laravel Controller:** `LeadController@store`
- **Priority:** Phase 2

## 9. Admin Overview

### Admin Stats
- **Method:** GET
- **Path:** `/api/admin/stats`
- **Auth Required:** Yes
- **Admin Only:** Yes
- **Request Params:** None
- **Request Body Example:** None
- **Response Example:** `{ "users_count": 100, "revenue": 50000 }`
- **Possible Errors:** 403 Forbidden
- **Frontend Page/Component:** `/src/pages/admin/AdminOverview.tsx`
- **Related DB Tables:** `users`, `payments`
- **Laravel Controller:** `AdminDashboardController@stats`
- **Priority:** MVP

## 10. Admin Users

### List Users
- **Method:** GET
- **Path:** `/api/admin/users`
- **Auth Required:** Yes
- **Admin Only:** Yes
- **Request Params:** `?page=1&search=...`
- **Request Body Example:** None
- **Response Example:** `[{ "id": 1, "name": "John", "role": "user" }]`
- **Possible Errors:** 403 Forbidden
- **Frontend Page/Component:** `/src/pages/admin/AdminUsers.tsx`
- **Related DB Tables:** `users`
- **Laravel Controller:** `AdminUserController@index`
- **Priority:** MVP

### User Detail & Update Status
- **Method:** GET, PUT
- **Path:** `/api/admin/users/{id}`, `/api/admin/users/{id}/status`
- **Auth Required:** Yes
- **Admin Only:** Yes
- **Request Params:** `id`
- **Request Body Example (PUT):** `{ "status": "suspended" }`
- **Response Example:** `{ "message": "User suspended" }`
- **Possible Errors:** 403 Forbidden, 404 Not Found
- **Frontend Page/Component:** `/src/pages/admin/AdminUserDetail.tsx` // if exists
- **Related DB Tables:** `users`
- **Laravel Controller:** `AdminUserController@show`, `AdminUserController@updateStatus`
- **Priority:** MVP

## 11. Admin Courses / Modules / Lessons / Resources

### Courses CRUD
- **Create:** `POST /api/admin/courses`
    - Body: `{ "title": "New", "price": 99 }`
- **Update:** `PUT /api/admin/courses/{id}`
    - Body: `{ "title": "Updated", "price": 99 }`
- **Archive:** `PUT /api/admin/courses/{id}/archive`
- **Publish:** `PUT /api/admin/courses/{id}/publish`
- **Duplicate:** `POST /api/admin/courses/{id}/duplicate`
- All Require **Auth: Yes, Admin: Yes**.
- Controllers: `AdminCourseController`
- **Priority:** MVP

### Modules CRUD
- **Create:** `POST /api/admin/courses/{courseId}/modules`
    - Body: `{ "title": "Intro" }`
- **Update:** `PUT /api/admin/modules/{moduleId}`
    - Body: `{ "title": "Introduction" }`
- **Delete:** `DELETE /api/admin/modules/{moduleId}`
- **Reorder:** `POST /api/admin/courses/{courseId}/modules/reorder`
    - Body: `{ "order": [2, 1, 3] }`
- All Require **Auth: Yes, Admin: Yes**.
- Controllers: `AdminModuleController`
- **Priority:** MVP

### Lessons CRUD
- **Create:** `POST /api/admin/modules/{moduleId}/lessons`
    - Body: `{ "title": "Welcome", "lesson_type": "video" }`
- **Update:** `PUT /api/admin/lessons/{lessonId}`
    - Body: `{ "title": "Welcome Updated", "video_url": "..." }`
- **Delete:** `DELETE /api/admin/lessons/{lessonId}`
- **Reorder:** `POST /api/admin/modules/{moduleId}/lessons/reorder`
    - Body: `{ "order": [1, 2] }`
- All Require **Auth: Yes, Admin: Yes**.
- Controllers: `AdminLessonController`
- **Priority:** MVP

### Lesson Resources CRUD
- **Create:** `POST /api/admin/lessons/{lessonId}/resources`
    - Body: `{ "title": "SlideDeck.pdf", "file_url": "..." }`
- **Update:** `PUT /api/admin/resources/{resourceId}`
    - Body: `{ "title": "SlideDeck v2.pdf" }`
- **Delete:** `DELETE /api/admin/resources/{resourceId}`
- All Require **Auth: Yes, Admin: Yes**.
- Controllers: `AdminResourceController`
- **Priority:** MVP

## 12. Admin Leads
- **Methods:** GET, PUT
- **Paths:** `/api/admin/leads`, `/api/admin/leads/{id}/status`
- **Auth Required:** Yes
- **Admin Only:** Yes
- **Controller:** `AdminLeadController`
- **Priority:** Phase 2

## 13. Admin Email Campaigns
- **Methods:** POST, GET
- **Paths:** `/api/admin/email-campaigns`, `/api/admin/email-campaigns/{id}/send`
- **Auth Required:** Yes
- **Admin Only:** Yes
- **Controller:** `AdminEmailCampaignController`
- **Priority:** Phase 3

## 14. Oblio / Invoices

### Issue Invoice
- **Method:** POST
- **Path:** `/api/invoices/issue` (Triggered internally after ITN, but can have a manual endpoint for admin)
- **Auth Required:** Server (internal logic) or Admin
- **Priority:** Phase 2

### Get Invoice Download Link
- **Method:** GET
- **Path:** `/api/user/invoices/{id}/download`
- **Auth Required:** Yes
- **Admin Only:** No
- **Request Params:** `id`
- **Request Body Example:** None
- **Response Example:** `{ "url": "https://oblio.eu/..." }`
- **Possible Errors:** 403 Forbidden, 404 Not Found
- **Frontend Page/Component:** `/src/pages/dashboard/Profile.tsx` (Billing)
- **Related DB Tables:** `invoices`
- **Laravel Controller:** `InvoiceController@download`
- **Priority:** Phase 2

### List User Invoices
- **Method:** GET
- **Path:** `/api/user/invoices`
- **Auth Required:** Yes
- **Admin Only:** No
- **Response Example:** `[{ "oblio_invoice_number": "123", "status": "issued" }]`
- **Frontend Page/Component:** `/src/pages/dashboard/Profile.tsx`
- **Laravel Controller:** `InvoiceController@index`
- **Priority:** Phase 2
