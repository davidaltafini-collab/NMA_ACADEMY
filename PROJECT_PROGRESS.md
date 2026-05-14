# project_progress.md — NMA Academy

## Local setup

Project type: online course platform.

Frontend:
- React
- Runs locally on `http://localhost:3000`

Backend:
- Laravel + MySQL
- Backend folder: `/backend`
- Runs locally with:

```bash
php -S 127.0.0.1:8080 -t public

Backend URL:

http://127.0.0.1:8080

Frontend API base URL:

http://127.0.0.1:8080/api

Auth system:

Laravel Sanctum Bearer token authentication
MySQL local database via MySQL Workbench
Local email testing uses MAIL_MAILER=log
Emails can be checked in backend/storage/logs/laravel.log

Important:

Do not work on admin dashboard yet.
Do not implement admin auth yet.
Do not implement admin middleware yet.
Admin will be built much later in a separate phase.
Cloudflare Stream is not configured yet. The video player currently works in development placeholder mode.
Payments / Netopia are not implemented yet.
Completed phases
Phase 1 — Backend foundation

Implemented:

Laravel backend in /backend
MySQL config
Laravel Sanctum
CORS for frontend
API health route
.env / .env.example
Main auth-related models and migrations

Important tables:

users
personal_access_tokens
user_sessions
email_logs
password_reset_tokens
Phase 2 — Register + email verification

Implemented:

POST /api/auth/register
POST /api/auth/verify-email-code
POST /api/auth/resend-verification-code

Behavior:

User registers with name, email, password
Password is hashed
Account starts as unverified
A 6-character uppercase verification code is generated
Code contains letters and digits
Code expires in 1 hour
Email is sent through Laravel Mail
In local dev, code appears in storage/logs/laravel.log
After verification, user becomes active

Security:

Rate limiting
Temporary blocking after too many wrong code attempts
Password rule: minimum 8 characters, one uppercase letter, one digit
Phase 3 — Login, logout, Sanctum tokens, sessions

Implemented:

POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

Behavior:

Login works from frontend
Logout works from frontend
Sanctum Bearer token is created on login
Token is deleted on logout
user_sessions records active devices
Each user_session is linked to a Sanctum token with sanctum_token_id

Session limit:

Maximum 3 active sessions/devices per user
On 4th login, the oldest active session is revoked automatically
Revoked sessions get 401 on the next protected request
Phase 4 — User profile + active devices

Implemented:

GET /api/user/profile
PUT /api/user/profile
GET /api/user/sessions
DELETE /api/user/sessions/{id}

Behavior:

User can view profile
User can update name and phone
Email is visible but not editable in this phase
User can view active sessions/devices
User can revoke another active session
If user revokes current session, frontend logs out
Phase 5 — Forgot password / reset password

Implemented:

POST /api/auth/forgot-password
POST /api/auth/reset-password

Behavior:

Uses Laravel Password Broker
Reset token expires in 60 minutes
Reset link points to frontend:
http://localhost:3000/reset-password?email=...&token=...

After password reset:

all Sanctum tokens are deleted
all user sessions are revoked

Note:

When copying reset links from laravel.log, replace &amp; with & if needed.
Phase 6 — Change password from profile

Implemented:

POST /api/user/change-password

Behavior:

Authenticated user can change password
Requires current password
New password must follow same rules
Current session stays active
All other sessions/tokens are revoked
Phase 7 — Change email with re-verification

Implemented:

POST /api/user/request-email-change
POST /api/user/confirm-email-change
POST /api/user/cancel-email-change

Behavior:

User requests email change with new email + current password
Verification code is sent to the new email
Email is changed only after code confirmation
Current email remains active until new email is verified
Code expires in 1 hour
User can cancel pending email change
Phase 8 — Delete account

Implemented:

DELETE /api/user/account

Behavior:

Uses soft delete, not hard delete
Requires current password
Requires confirmation text: DELETE
On success:
user is soft deleted
all Sanctum tokens are deleted
all user sessions are revoked
frontend clears auth state and redirects user
Deleted user cannot log in again
Courses system
Updated course architecture

Current course structure:

course → categories → subcategories → one Cloudflare Stream video per subcategory

Business rules:

The platform may have one main large course or a small number of large courses.
Each course has categories.
Each category has subcategories.
Each subcategory has one video.
One category can be free preview.
Free preview can be viewed without buying the full course.
Paid categories require active course access.
Videos will use Cloudflare Stream later.
Cloudflare Stream is not configured yet.
Protected video player is mandatory.
Real DRM / anti-screen-recording is not implemented yet.
Current protection is basic anti-abuse, watermark, access control, session control and event logging.
Phase 9.1 — Courses database foundation

Implemented database tables and models:

courses
course_categories
course_subcategories
course_videos
user_courses
user_video_progress
video_watch_sessions
video_access_logs

Relationships added:

Course → categories, subcategories, videos, userCourses
Category → course, subcategories, videos
Subcategory → course, category, video
Video → course, category, subcategory, progress
UserCourse → user, course
UserVideoProgress → user, course, category, subcategory, video
VideoWatchSession → user, course, video, userSession
VideoAccessLog → user, course, video, userSession

Important rules:

One video per subcategory
Cloudflare video fields are prepared, but no Cloudflare API integration yet
Watch session table prepared for one-device-at-a-time video watching
Progress table prepared for resume/progress tracking
Phase 9.2 — Demo course seeder + public courses API

Implemented:

Demo course seeder
GET /api/courses
GET /api/courses/{slug}

Demo course:

NMA Academy - Curs Complet
Slug: nma-academy-curs-complet
3 categories/modules
8 subcategories/lessons
8 placeholder videos
First category is free preview
Other categories are paid/locked

Important fix:

Seeder originally created subcategories/videos as draft, so lessons did not appear on site.
Fixed by making demo categories, subcategories and videos published.

Public course API:

Returns published courses
Returns course detail with categories, subcategories and video metadata
Shows locked/free states
Does not expose protected playback URLs
Phase 9.3 — Authenticated course access

Implemented:

GET /api/user/courses
GET /api/user/courses/{slug}
POST /api/user/courses/{slug}/enroll-test

Behavior:

Authenticated user can see owned/enrolled courses
User with active access sees all categories unlocked
User without access gets 403 on protected user course detail
Public course detail endpoint became auth-aware:
without token: only free preview unlocked
with token + access: all lessons unlocked

Temporary testing:

enroll-test grants local test access until Netopia payments are implemented.

Important fix:

CourseAccessService::serializeCourse() had an array/Collection type mismatch causing 500 on GET /api/user/courses/{slug}.
Fixed and endpoint now works.
Phase 9.4 — Video progress tracking

Implemented:

POST /api/user/videos/{video}/progress
GET /api/user/videos/{video}/progress

Behavior:

Saves progress per user/video
Saves:
last_position_seconds
duration_seconds
watched_seconds
progress_percent
is_completed
completed_at
last_watched_at
Auto-complete when progress reaches 90% or higher
Progress is returned in:
GET /api/user/courses
GET /api/user/courses/{slug}
Category, subcategory and video progress are included in course tree

Important behavior:

Completed videos remain rewatchable.
Completion marks progress only. It must never block replay.
is_completed = true stays true even if user rewatches from start.
Phase 9.5 — One-device-at-a-time video watching

Implemented:

POST /api/user/videos/{video}/watch-session/start
POST /api/user/videos/{video}/watch-session/heartbeat
POST /api/user/videos/{video}/watch-session/end

Behavior:

User may be logged in on multiple devices, but can actively watch video on only one device/session at a time.
Starting a watch session checks for existing active watch sessions.
If another device is watching, backend returns 409.
Stale sessions older than ~60 seconds without heartbeat can be displaced.
Heartbeat updates last_heartbeat_at.
Ending session marks:
is_active = false
ended_at
ended_reason

Progress integration:

Heartbeat/end can update video progress when position is provided.
Phase 9.6 — Protected Cloudflare Stream playback access API

Implemented:

GET /api/videos/{video}/playback

Route decision:

Public route with optional Sanctum user detection
Free preview playback metadata can be requested without login
Paid videos require authentication and active course access

Behavior:

Free preview without auth returns playback metadata and progress = null
Free preview with auth returns playback metadata + user progress
Paid video without auth returns 401
Paid video with auth but no access returns 403
Paid video with access returns playback metadata

Cloudflare:

Cloudflare Stream is not configured yet.
Development mode is active.
playback.type = development
playback.url may be null
Cloudflare signing service structure exists for future use.
No Cloudflare upload or real API calls are implemented.

Env placeholders added:

CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_STREAM_SIGNING_KEY_ID
CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY
CLOUDFLARE_STREAM_SIGNED_URL_TTL_SECONDS
Phase 9.7 — Frontend Protected Video Player UI

Implemented:

ProtectedVideoPlayer
Player integrated into public course detail page
Player integrated into authenticated course player page
/course/:slug route
My Courses navigation to /course/{slug}
videoPlaybackService
watchService

Behavior:

Free preview lesson opens inline player
Paid locked lesson shows paywall
Paid unlocked lesson opens player
Development placeholder appears when Cloudflare playback URL is not available
Manual dev controls existed for:
start session
heartbeat
end session
save sample progress

Important:

Player does not crash when Cloudflare is not configured.
Video UID and development state are shown clearly.
Paid lessons are unlocked for users with access.
Phase 9.8 — Protected player behavior, watermark, auto progress

Implemented:

Automatic watch session lifecycle
Automatic heartbeat
Automatic progress saving
Dynamic watermark
Basic player protection events
Video event logging

New endpoint:

POST /api/user/videos/{video}/event

Logged events include:

play
pause
seek
complete
right_click_blocked
visibility_hidden
shortcut_blocked
error

Frontend behavior:

Click Redă starts watch session
Progress advances automatically in development mode
Heartbeat every ~30 seconds
Progress saves every ~12 seconds
Pause saves progress and ends session
Page exit / video change ends session
Complete marks video completed
Right click inside player is blocked and logged
Tab hidden pauses/ends playback and logs event
Shortcut blocking added for basic keys like F12 / Ctrl+S / Ctrl+U / Ctrl+Shift+I
Watermark shows authenticated user name/email, or NMA Academy Preview for unauthenticated preview

Important correction:

Completed videos must remain rewatchable.
Completed videos show a message like:
Video finalizat — îl poți revedea oricând.
Replay is allowed.
Phase 9.9 — Course frontend polish

Implemented frontend polish for:

public course page
authenticated course player page
My Courses dashboard page

Public course detail page:

Module headers show lesson count, duration, free/locked counts
Free preview badge added
Paid lessons show lock/paid badge
Free preview lessons open player
Locked paid lessons show paywall panel
CTA improved to Cumpără cursul
Mobile floating CTA added
Loading and error states improved

Authenticated course player page:

Sidebar shows modules and lessons clearly
All lessons are clickable when user has access
Completed lessons show green checkmark
Current selected lesson is highlighted
Progress header added
Resume position displayed
Completed lessons remain clickable and rewatchable
Bug fixed: paid lessons were incorrectly passed as locked even for users with access

My Courses page:

Real courses displayed from API
Purchased/enrolled courses separated from available courses
CTA changes based on progress:
Începe cursul
Continuă cursul
Revizionează cursul
Loading skeletons added
Error and empty states improved
Progress bars prepared for backend progress fields

Mobile:

Course detail and player pages improved for mobile responsiveness
CTA and lesson lists are usable on small screens
Small UX fix after Phase 9.9

Requested:

When an unauthenticated visitor opens a free preview lesson and tries to play, do not show only a generic auth error.
Show a clear message:
Ai nevoie de un cont pentru a viziona preview-urile gratuite.
Add buttons:
Autentifică-te
Creează cont gratuit
Free preview lessons remain visible publicly, but actual watch/play requires account.

Phase 10.1 â€” Admin course management connected to real backend

Problem found:

Admin course pages were still using frontend mock/localStorage data.
Public course pages were using the real Laravel/MySQL API.
This created two sources of truth:
admin could show two courses while the real database/public API showed only one.

Implemented:

Laravel admin course controller:
backend/app/Http/Controllers/Api/Admin/AdminCourseController.php

New protected admin endpoints:

GET /api/admin/courses
POST /api/admin/courses
GET /api/admin/courses/{course}
PUT /api/admin/courses/{course}
POST /api/admin/courses/{course}/duplicate
POST /api/admin/courses/{course}/archive

Behavior:

Admin course management now reads and writes the real MySQL courses tables.
Admin endpoints require Sanctum auth and user role admin/superadmin.
Course create/update syncs:
course core fields
features
target_audience
results_promised
categories/modules
subcategories/lessons
one video record per lesson/subcategory

Frontend changes:

AdminRoute now uses the real authenticated user role instead of nma_admin_token.
AdminCourses now loads from /api/admin/courses.
AdminCourseForm now saves to /api/admin/courses.
Login admin demo button now logs in with the real seeded admin account instead of creating a fake localStorage token.
Admin form now includes fields for:
currency
status
public card features
target audience
promised results

Seeded admin:

admin@example.com
password

DatabaseSeeder now creates/updates:
test@example.com as a normal user
admin@example.com as an admin user

Important behavior:

Admin and public course pages now share the same backend database source.
Courses created/edited in admin appear on the public courses section when status is published.
Archived/draft courses do not appear publicly.

Important limitation:

Separate admin auth is still not implemented; admin uses the same Sanctum login as normal users, gated by role.
Cloudflare upload integration is still not implemented.

Phase 10.2 — Real admin dashboard, real admin users/leads/stats, and course-card metadata fix

Problem found:

Admin dashboard, admin users, leads, and email campaigns were still frontend mock data.
Home course preview showed 0 minutes / 0 lesson information because the public course list endpoint did not return total duration and the frontend did not map count metadata.
Admin course form list fields were trimming/filtering on every keystroke, which made Enter/new lines and some spacing feel broken.
Admin layout had hardcoded "Admin User" and "Superadmin", so it looked like both admin and superadmin were shown regardless of the real account.

Implemented:

Laravel admin dashboard controller:
backend/app/Http/Controllers/Api/Admin/AdminDashboardController.php

New protected admin endpoints:

GET /api/admin/stats
GET /api/admin/users
GET /api/admin/users/{user}
PUT /api/admin/users/{user}/status
GET /api/admin/leads
POST /api/admin/email-campaigns

Behavior:

Admin stats now read real MySQL data from users, courses, user_courses, and email_logs.
Admin users list/detail now reads real users and real course access/session/email activity.
Admin leads currently come from real users with marketing_consent = true, because there is not yet a separate leads table.
Admin email campaigns now create real email_logs rows for the selected real user segment. They do not send provider emails yet.
Admin user status can be changed between active/suspended through the real backend.

Course metadata fix:

GET /api/courses now returns:
categories_count
subcategories_count
videos_count
total_duration_seconds

Frontend course mapping now stores:
total_duration_minutes
modules_count
lessons_count

Course preview opens immediately with list metadata and then refreshes from full detail by slug, so modules/lessons/duration are real.

Admin form fix:

Feature/target/result textareas preserve new lines and spaces while typing.
The final API payload trims and removes empty lines only when saving.
Course form now also exposes short_description for public cards.

Admin layout fix:

Admin header now displays the actual authenticated user name and a single normalized Admin label.
The hardcoded Superadmin label was removed.
Logout now uses the real AuthContext logout instead of only removing nma_admin_token.

SQL / database note:

No manual SQL changes were added in this phase.
No new migration was required.
Existing tables used: users, courses, course_videos, user_courses, user_sessions, email_logs.

Implemented endpoints
Public auth
POST /api/auth/register
POST /api/auth/verify-email-code
POST /api/auth/resend-verification-code
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
Protected auth
POST /api/auth/logout
GET /api/auth/me
Protected user/account
GET /api/user/profile
PUT /api/user/profile
POST /api/user/change-password
POST /api/user/request-email-change
POST /api/user/confirm-email-change
POST /api/user/cancel-email-change
GET /api/user/sessions
DELETE /api/user/sessions/{id}
DELETE /api/user/account
Public courses/video
GET /api/courses
GET /api/courses/{slug}
GET /api/videos/{video}/playback
Admin courses
GET /api/admin/courses
POST /api/admin/courses
GET /api/admin/courses/{course}
PUT /api/admin/courses/{course}
POST /api/admin/courses/{course}/duplicate
POST /api/admin/courses/{course}/archive
Admin dashboard/users/leads/email
GET /api/admin/stats
GET /api/admin/users
GET /api/admin/users/{user}
PUT /api/admin/users/{user}/status
GET /api/admin/leads
POST /api/admin/email-campaigns
Protected courses/video
GET /api/user/courses
GET /api/user/courses/{slug}
POST /api/user/courses/{slug}/enroll-test
POST /api/user/videos/{video}/progress
GET /api/user/videos/{video}/progress
POST /api/user/videos/{video}/watch-session/start
POST /api/user/videos/{video}/watch-session/heartbeat
POST /api/user/videos/{video}/watch-session/end
POST /api/user/videos/{video}/event
Important issues already solved
php artisan serve did not work on default ports, so local backend is started with:
php -S 127.0.0.1:8080 -t public
Frontend runs on port 3000, not 5173.
Frontend was initially calling localhost:8000, but correct API URL is:
http://127.0.0.1:8080/api
Logout button was fixed and now calls the real logout API.
Reset password link from logs may contain &amp;; browser needs &.
Course detail endpoint had a Collection vs array mismatch and was fixed.
Course lessons were not appearing because seeded subcategories/videos had status = draft. They now need status = published.
Completed videos were initially at risk of acting like blocked/finished-only content. Correct behavior is now:
completed videos remain rewatchable.
Not implemented yet

Do not assume these exist:

Separate admin authentication
Admin middleware class
Dedicated leads table and public lead capture API
Actual email provider campaign sending
Real Cloudflare Stream configured account
Real Cloudflare upload
Real Cloudflare playback with actual video files
HLS.js real playback
DRM / real anti-screen-recording
Payments
Netopia
Oblio
Checkout
Newsletter
Leads / data catcher
Discount codes
Certificates
Quizzes
Comments
Reviews
Notes system
Important note about screen recording protection

Current implemented protection is not real DRM.

Current protection includes:

dynamic watermark
backend access checks
one-device-at-a-time video watching
video event logs
right-click blocking
shortcut blocking
pause/end on tab hidden

Real screen-recording protection, such as black screen in OBS/Windows Game Bar/Loom, requires a DRM-capable solution such as Widevine/FairPlay/PlayReady or another provider-supported DRM system.

This should be implemented later as a separate DRM/security phase after Cloudflare/video provider decisions are finalized.

Recommended next phases
Next immediate phase — Course progress summary API cleanup

Goal:

Make sure GET /api/user/courses returns:
progress_percent
completed_videos_count
total_videos_count
last_watched_at
My Courses frontend is already prepared to consume these fields.
Later phase — Checkout foundation

Goal:

Prepare checkout structure before Netopia.
Later phase — Netopia payments

Goal:

Payment initiation
Netopia webhook
Unlock course after confirmed payment
Later phase — Real Cloudflare Stream playback

Goal:

Configure Cloudflare Stream
Use real video UIDs
Replace development placeholder with real playback
Much later phase — Admin dashboard

Goal:

Separate admin auth
Dedicated lead capture table/API
Upload/link Cloudflare videos
Sales/payment dashboard
