<?php

namespace App\Http\Controllers\Console;


use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\StudentProgress;
use Inertia\Inertia;

class ConsoleController extends Controller
{
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        // Основные счётчики
        $stats = [
            'students'        => $organization->students()->count(),
            'groups'          => $organization->groups()->count(),
            'courses'         => $organization->courses()->count(),
            'modules'         => $organization->modules()->count(),
            'lessons'         => $organization->lessons()->count(),
            'tasks'           => $organization->lessonTasks()->count(),
            'homeworks'       => $organization->homeworks()->count(),
            'exams'           => $organization->exams()->count(),
            'questions'       => $organization->questions()->count(),
        ];

        // Непроверенные прогрессы (только checked = false)
        $uncheckedCount = StudentProgress::where('organization_id', $organization->id)
            ->where('checked', false)
            ->count();

        // Топ-5 студентов по баллам
        $topStudents = $organization->students()
            ->orderByDesc('score')
            ->take(5)
            ->get(['id', 'firstname', 'lastname', 'score']);

        $organizationId = $organization->id;

// Общее количество заданий каждого типа в организации
        $totalTasks = $organization->lessonTasks()->count();
        $totalHomeworks = $organization->homeworks()->count();
        $totalExams = $organization->exams()->count();

// Количество выполненных попыток (записей в student_progress) по типам
        $progressQuery = StudentProgress::where('organization_id', $organizationId)
            ->whereIn('progressable_type', ['lesson_task', 'homework', 'exam']);

        $attemptedTasks = (clone $progressQuery)->where('progressable_type', 'lesson_task')->count();
        $attemptedHomeworks = (clone $progressQuery)->where('progressable_type', 'homework')->count();
        $attemptedExams = (clone $progressQuery)->where('progressable_type', 'exam')->count();

// Средний балл по всем попыткам
        $avgPoints = (clone $progressQuery)->avg('points') ?? 0;

// Проверенные и непроверенные
        $checkedCount = (clone $progressQuery)->where('checked', true)->count();
        $uncheckedCount = (clone $progressQuery)->where('checked', false)->count();

        $progressStats = [
            'total' => [
                'tasks'     => $totalTasks,
                'homeworks' => $totalHomeworks,
                'exams'     => $totalExams,
            ],
            'attempted' => [
                'tasks'     => $attemptedTasks,
                'homeworks' => $attemptedHomeworks,
                'exams'     => $attemptedExams,
            ],
            'avgPoints'     => round($avgPoints, 1),
            'checkedCount'  => $checkedCount,
            'uncheckedCount'=> $uncheckedCount,
        ];

        return Inertia::render('Console/Index', [
            'organization'   => $organization,
            'stats'          => $stats,
            'uncheckedCount' => $uncheckedCount,
            'topStudents'    => $topStudents,
            'progressStats' => $progressStats,
        ]);
    }
}
