<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentProgress;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        // Все организации пользователя (до 3-х)
        $organizations = $user->organizations()
            ->select(['organizations.id', 'organizations.name', 'organizations.status', 'organizations.plan'])
            ->with(['bot' => fn($q) => $q->select(['id', 'organization_id', 'is_active', 'name'])])
            ->withCount('users')
            ->withPivot('role')
            ->orderByDesc('pivot_joined_at')
            ->get();

        // Мини-статистика для всех организаций (для Overview карточек)
        $overviewStats = $this->dashboardService->getAllOrganizationsOverview($organizations);

        // Определяем выбранную организацию (по умолчанию первая)
        $selectedOrgId = $request->get('org', $organizations->first()?->id);
        $selectedOrg = $organizations->firstWhere('id', $selectedOrgId) ?? $organizations->first();

        // Детальная статистика для выбранной организации
        $stats = null;
        $activity = [];
        $studentData = null;

        if ($selectedOrg) {
            $role = $selectedOrg->pivot->role;

            // Для админов/менеджеров — полная статистика
            if (in_array($role, ['owner', 'manager', 'admin'])) {
                $stats = $this->dashboardService->getOrganizationStats($selectedOrg);
                $activity = $this->dashboardService->getRecentActivity($selectedOrg, 8);
            }

            // Для студентов — их личный прогресс
            if ($role === 'student') {
                $student = Student::where('organization_id', $selectedOrg->id)
                    ->where('telegram_id', $user->telegram_id ?? '')
                    ->first();

                if ($student) {
                    $studentData = [
                        'student' => $student,
                        'myProgress' => StudentProgress::where('student_id', $student->id)
                            ->where('checked', true)->count(),
                        'myPending' => StudentProgress::where('student_id', $student->id)
                            ->where('checked', false)->count(),
                        'myScore' => $student->score,
                        'myRank' => $student->rank,
                    ];
                }
            }
        }

        // Агрегированная статистика по всем организациям (для шапки)
        $totalOverview = [
            'organizations_count' => $organizations->count(),
            'total_students' => array_sum(array_column($overviewStats, 'students_count')),
            'total_pending' => array_sum(array_column($overviewStats, 'pending_checks')),
        ];

        return Inertia::render('Dashboard', [
            'organizations'   => $organizations,
            'selectedOrgId'   => $selectedOrg?->id,
            'selectedOrg'     => $selectedOrg,
            'overviewStats'   => $overviewStats,
            'totalOverview'   => $totalOverview,
            'stats'           => $stats,
            'activity'        => $activity,
            'studentData'     => $studentData,
        ]);
    }
}
