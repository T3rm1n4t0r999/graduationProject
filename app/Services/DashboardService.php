<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\Student;
use App\Models\StudentProgress;
use App\Models\StudentCourse;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Статистика для всех организаций пользователя (для Overview)
     */
    public function getAllOrganizationsOverview($organizations): array
    {
        $stats = [];
        foreach ($organizations as $org) {
            $stats[$org->id] = $this->getMiniStats($org);
        }
        return $stats;
    }

    /**
     * Мини-статистика для карточки организации
     */
    private function getMiniStats(Organization $org): array
    {
        return Cache::remember(
            "dashboard_mini_org_{$org->id}",
            now()->addMinutes(5),
            fn() => [
                'students_count' => Student::where('organization_id', $org->id)->count(),
                'pending_checks' => StudentProgress::where('organization_id', $org->id)
                    ->where('checked', false)->count(),
                'is_bot_active' => $org->bot?->is_active ?? false,
            ]
        );
    }

    /**
     * Полная статистика для детального просмотра
     */
    public function getOrganizationStats(Organization $organization): array
    {
        return Cache::remember(
            "dashboard_stats_org_{$organization->id}",
            now()->addMinutes(5),
            fn() => $this->buildStats($organization)
        );
    }

    public function invalidateCache(Organization $organization): void
    {
        Cache::forget("dashboard_stats_org_{$organization->id}");
        Cache::forget("dashboard_mini_org_{$organization->id}");
        Cache::forget("dashboard_activity_org_{$organization->id}");
    }

    private function buildStats(Organization $organization): array
    {
        $now = Carbon::now();
        $weekAgo = $now->copy()->subWeek();
        $monthAgo = $now->copy()->subMonth();

        $totalStudents = Student::where('organization_id', $organization->id)->count();
        $studentsLastWeek = Student::where('organization_id', $organization->id)
            ->where('created_at', '>=', $weekAgo)->count();
        $studentsPrevWeek = Student::where('organization_id', $organization->id)
            ->whereBetween('created_at', [$weekAgo->copy()->subWeek(), $weekAgo])->count();

        $averageScore = Student::where('organization_id', $organization->id)->avg('score') ?? 0;

        $completedProgress = StudentProgress::where('organization_id', $organization->id)
            ->where('checked', true)->count();

        $activeStudents = Student::where('organization_id', $organization->id)
            ->whereHas('progresses', fn($q) => $q->where('created_at', '>=', $monthAgo))
            ->count();

        $topStudents = Student::where('organization_id', $organization->id)
            ->select(['id', 'firstname', 'lastname', 'username', 'score', 'rank'])
            ->orderByDesc('score')
            ->limit(5)
            ->get()
            ->values()    // ✅ Сбрасывает ключи (0, 1, 2...)
            ->toArray();  // ✅ Явно преобразует в PHP-массив

        $pendingChecks = StudentProgress::where('organization_id', $organization->id)
            ->where('checked', false)->count();

        $studentsGrowth = $studentsPrevWeek > 0
            ? round((($studentsLastWeek - $studentsPrevWeek) / $studentsPrevWeek) * 100, 1)
            : ($studentsLastWeek > 0 ? 100 : 0);

        return [
            'totalStudents'      => $totalStudents,
            'activeStudents'     => $activeStudents,
            'studentsLastWeek'   => $studentsLastWeek,
            'studentsGrowth'     => $studentsGrowth,
            'averageScore'       => round($averageScore, 1),
            'completedProgress'  => $completedProgress,
            'topStudents'        => $topStudents,
            'pendingChecks'      => $pendingChecks,
        ];
    }

    public function getRecentActivity(Organization $organization, int $limit = 10): array
    {
        return Cache::remember(
            "dashboard_activity_org_{$organization->id}",
            now()->addMinutes(2),
            fn() => $this->buildActivity($organization, $limit)
        );
    }

    private function buildActivity(Organization $organization, int $limit): array
    {
        $activities = collect();

        $newStudents = Student::where('organization_id', $organization->id)
            ->select(['id', 'firstname', 'lastname', 'username', 'created_at'])
            ->latest('created_at')->limit($limit)->get()
            ->map(fn($s) => [
                'type' => 'student_joined', 'icon' => 'user-plus', 'color' => 'blue',
                'text' => "Новый студент: {$s->firstname} {$s->lastname}",
                'timestamp' => $s->created_at->timestamp,
            ]);

        $completedTasks = StudentProgress::where('organization_id', $organization->id)
            ->where('checked', true)
            ->with(['student:id,firstname,lastname', 'progressable'])
            ->latest('updated_at')->limit($limit)->get()
            ->map(fn($p) => [
                'type' => 'progress_completed', 'icon' => 'check-circle', 'color' => 'green',
                'text' => "{$p->student?->firstname} {$p->student?->lastname} завершил(а): " . ($p->progressable?->title ?? 'задание'),
                'timestamp' => $p->updated_at->timestamp,
            ]);

        $newCourses = StudentCourse::where('organization_id', $organization->id)
            ->with(['student:id,firstname,lastname', 'course:id,title'])
            ->latest('granted_at')->limit($limit)->get()
            ->map(fn($sc) => [
                'type' => 'course_assigned', 'icon' => 'book', 'color' => 'purple',
                'text' => "{$sc->student?->firstname} назначен курс: {$sc->course?->title}",
                'timestamp' => $sc->granted_at?->timestamp ?? 0,
            ]);

        return $activities->merge($newStudents)
            ->merge($completedTasks)
            ->merge($newCourses)
            ->sortByDesc('timestamp')
            ->take($limit)->values()
            ->map(function ($item) {
                $item['time_human'] = Carbon::createFromTimestamp($item['timestamp'])->diffForHumans();
                return $item;
            })->toArray();
    }
}
