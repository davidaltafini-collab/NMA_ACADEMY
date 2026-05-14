<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\EmailLog;
use App\Models\User;
use App\Models\UserCourse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminDashboardController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        $role = $request->user()?->role;

        abort_unless(in_array($role, ['admin', 'superadmin'], true), 403, 'Admin access required.');
    }

    public function stats(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $courseStatusCounts = Course::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $revenue = UserCourse::query()
            ->where('access_status', 'active')
            ->join('courses', 'courses.id', '=', 'user_courses.course_id')
            ->sum('courses.price');

        $pendingValue = UserCourse::query()
            ->where('access_status', 'pending')
            ->join('courses', 'courses.id', '=', 'user_courses.course_id')
            ->sum('courses.price');

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'totalUsers'       => User::where('role', 'user')->count(),
                    'totalAdmins'      => User::whereIn('role', ['admin', 'superadmin'])->count(),
                    'totalLeads'       => User::where('marketing_consent', true)->count(),
                    'totalCourses'     => Course::count(),
                    'publishedCourses' => (int) ($courseStatusCounts['published'] ?? 0),
                    'draftCourses'     => (int) ($courseStatusCounts['draft'] ?? 0),
                    'archivedCourses'  => (int) ($courseStatusCounts['archived'] ?? 0),
                    'activeAccesses'   => UserCourse::where('access_status', 'active')->count(),
                    'pendingAccesses'  => UserCourse::where('access_status', 'pending')->count(),
                    'revenue'          => round((float) $revenue, 2),
                    'paymentPending'   => round((float) $pendingValue, 2),
                    'emailsSent'       => EmailLog::where('status', 'sent')->count(),
                    'emailsFailed'     => EmailLog::where('status', 'failed')->count(),
                    'recentActivity'   => $this->recentActivity(),
                ],
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $users = User::withCount([
                'userCourses as active_courses_count' => fn ($q) => $q->where('access_status', 'active'),
                'activeSessions as active_sessions_count',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $user) => $this->serializeUser($user));

        return response()->json([
            'success' => true,
            'data'    => ['users' => $users],
        ]);
    }

    public function user(Request $request, User $user): JsonResponse
    {
        $this->authorizeAdmin($request);

        $user->load([
            'userCourses.course',
            'sessions' => fn ($q) => $q->latest('last_active_at')->limit(10),
            'emailLogs' => fn ($q) => $q->latest('sent_at')->limit(10),
        ])->loadCount([
            'userCourses as active_courses_count' => fn ($q) => $q->where('access_status', 'active'),
            'activeSessions as active_sessions_count',
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'user' => array_merge($this->serializeUser($user), [
                    'courses' => $user->userCourses->map(fn (UserCourse $access) => [
                        'id'            => $access->id,
                        'course_id'     => $access->course_id,
                        'course_title'  => $access->course?->title,
                        'access_status' => $access->access_status,
                        'source'        => $access->source,
                        'purchased_at'  => $access->purchased_at?->toIso8601String(),
                        'created_at'    => $access->created_at?->toIso8601String(),
                    ]),
                    'sessions' => $user->sessions->map(fn ($session) => [
                        'id'             => $session->id,
                        'device_name'    => $session->device_info,
                        'browser'        => $session->user_agent,
                        'ip_address'     => $session->ip_address,
                        'last_active_at' => $session->last_active_at?->toIso8601String(),
                        'is_active'      => (bool) $session->is_active,
                    ]),
                    'emails' => $user->emailLogs->map(fn (EmailLog $email) => [
                        'id'        => $email->id,
                        'type'      => $email->email_type,
                        'subject'   => $email->subject,
                        'status'    => $email->status,
                        'sent_at'   => $email->sent_at?->toIso8601String(),
                    ]),
                ]),
            ],
        ]);
    }

    public function updateUserStatus(Request $request, User $user): JsonResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['unverified', 'active', 'suspended'])],
        ]);

        $user->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'data'    => ['user' => $this->serializeUser($user->fresh())],
        ]);
    }

    public function leads(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $leads = User::where('marketing_consent', true)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $user) => [
                'lead_id'    => (string) $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'source'     => 'registration_marketing_consent',
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'success' => true,
            'data'    => ['leads' => $leads],
        ]);
    }

    public function sendEmailCampaign(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body'    => ['nullable', 'string'],
            'segment' => ['nullable', Rule::in(['all', 'leads', 'active_buyers', 'non_buyers'])],
        ]);

        $segment = $validated['segment'] ?? 'all';
        $query = User::query()->where('role', 'user')->where('status', 'active');

        if ($segment === 'leads') {
            $query->where('marketing_consent', true);
        } elseif ($segment === 'active_buyers') {
            $query->whereHas('userCourses', fn ($q) => $q->where('access_status', 'active'));
        } elseif ($segment === 'non_buyers') {
            $query->whereDoesntHave('userCourses', fn ($q) => $q->where('access_status', 'active'));
        }

        $users = $query->get();

        foreach ($users as $user) {
            EmailLog::create([
                'user_id'         => $user->id,
                'email_type'      => 'admin_campaign',
                'recipient_email' => $user->email,
                'subject'         => $validated['subject'],
                'status'          => 'sent',
                'provider_id'     => null,
                'error_message'   => null,
                'sent_at'         => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Campania a fost inregistrata in email_logs.',
            'data'    => [
                'sent_count' => $users->count(),
                'segment'    => $segment,
            ],
        ]);
    }

    private function serializeUser(User $user): array
    {
        return [
            'user_id'               => (string) $user->id,
            'name'                  => $user->name,
            'email'                 => $user->email,
            'role'                  => $user->role === 'superadmin' ? 'admin' : $user->role,
            'raw_role'              => $user->role,
            'status'                => $user->status,
            'marketing_consent'     => (bool) $user->marketing_consent,
            'created_at'            => $user->created_at?->toIso8601String(),
            'last_login_at'         => $user->last_login_at?->toIso8601String(),
            'email_verified_at'     => $user->email_verified_at?->toIso8601String(),
            'active_courses_count'  => (int) ($user->active_courses_count ?? 0),
            'active_sessions_count' => (int) ($user->active_sessions_count ?? 0),
        ];
    }

    private function recentActivity(): array
    {
        $users = User::latest()
            ->limit(5)
            ->get()
            ->map(fn (User $user) => [
                'id'     => 'user-' . $user->id,
                'action' => 'Cont creat: ' . $user->email,
                'time'   => $user->created_at?->diffForHumans(),
                'at'     => $user->created_at?->timestamp ?? 0,
            ]);

        $accesses = UserCourse::with(['user', 'course'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (UserCourse $access) => [
                'id'     => 'access-' . $access->id,
                'action' => sprintf(
                    'Acces %s: %s',
                    $access->access_status,
                    $access->course?->title ?? 'curs sters',
                ),
                'time' => $access->created_at?->diffForHumans(),
                'at'   => $access->created_at?->timestamp ?? 0,
            ]);

        $emails = EmailLog::latest('sent_at')
            ->limit(5)
            ->get()
            ->map(fn (EmailLog $email) => [
                'id'     => 'email-' . $email->id,
                'action' => 'Email ' . $email->status . ': ' . $email->subject,
                'time'   => $email->sent_at?->diffForHumans(),
                'at'     => $email->sent_at?->timestamp ?? 0,
            ]);

        return $users
            ->concat($accesses)
            ->concat($emails)
            ->sortByDesc(fn ($item) => $item['at'] ?? 0)
            ->take(8)
            ->map(fn ($item) => [
                'id'     => $item['id'],
                'action' => $item['action'],
                'time'   => $item['time'],
            ])
            ->values()
            ->all();
    }
}
