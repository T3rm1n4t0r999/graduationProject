<?php

namespace App\Http\Controllers\Console;


use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\StudentProgress;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
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

        // Тренды за последние 7 дней
        $weekAgo = Carbon::now()->subDays(7);
        $twoWeeksAgo = Carbon::now()->subDays(14);

        // Студенты за последние 7 дней
        $newStudentsThisWeek = $organization->students()->where('created_at', '>=', $weekAgo)->count();
        // Попытки за последние 7 дней
        $attemptsThisWeek = StudentProgress::where('organization_id', $organization->id)
            ->where('created_at', '>=', $weekAgo)->count();
        // Проверено за последние 7 дней
        $checkedThisWeek = StudentProgress::where('organization_id', $organization->id)
            ->where('checked', true)
            ->where('updated_at', '>=', $weekAgo)->count();

        // Данные для линейного графика (попытки по дням за последние 14 дней)
        $dailyAttempts = StudentProgress::where('organization_id', $organization->id)
            ->where('created_at', '>=', $twoWeeksAgo)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => ['date' => $item->date, 'count' => $item->count])
            ->values();

        // Топ активных студентов (по количеству попыток за 7 дней)
        $activeStudents = $organization->students()
            ->withCount(['progresses' => function ($q) use ($weekAgo, $organization) {
                $q->where('organization_id', $organization->id)
                    ->where('created_at', '>=', $weekAgo);
            }])
            ->orderByDesc('progresses_count')
            ->take(5)
            ->get(['id', 'firstname', 'lastname'])
            ->map(fn($s) => ['id' => $s->id, 'name' => $s->lastname.' '.$s->firstname, 'attempts' => $s->progresses_count]);

        // Доля проверенных от всех (для прогресс-бара)
        $totalItems = ($progressStats['total']['tasks'] ?? 0)
            + ($progressStats['total']['homeworks'] ?? 0)
            + ($progressStats['total']['exams'] ?? 0);

        $checkedPercent = ($totalItems > 0) ? round(($checkedCount / $totalItems) * 100) : 0;

        // Free text / file_upload ожидают проверки (вопросы с такими типами)
        $baseConditions = function ($query) use ($organization) {
            $query->where('organization_id', $organization->id)
                ->where('checked', false);
        };

        // Максимальные баллы для непроверенных попыток, по которым нет проверенной
        $maxPointsSub = StudentProgress::query()
            ->where($baseConditions)
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('student_progress as sp_checked')
                    ->whereColumn('sp_checked.student_id', 'student_progress.student_id')
                    ->whereColumn('sp_checked.progressable_type', 'student_progress.progressable_type')
                    ->whereColumn('sp_checked.progressable_id', 'student_progress.progressable_id')
                    ->where('sp_checked.checked', true);
            })
            ->groupBy('student_id', 'progressable_type', 'progressable_id')
            ->selectRaw('student_id, progressable_type, progressable_id, MAX(points) as max_points');

        // ID лучших попыток (при равных баллах – последняя по id)
        $bestIdSub = StudentProgress::query()
            ->joinSub($maxPointsSub, 'max_points_table', function ($join) {
                $join->on('student_progress.student_id', '=', 'max_points_table.student_id')
                    ->on('student_progress.progressable_type', '=', 'max_points_table.progressable_type')
                    ->on('student_progress.progressable_id', '=', 'max_points_table.progressable_id')
                    ->on('student_progress.points', '=', 'max_points_table.max_points');
            })
            ->where($baseConditions)
            ->groupBy('student_progress.student_id', 'student_progress.progressable_type', 'student_progress.progressable_id')
            ->selectRaw('MAX(student_progress.id) as best_id');

        $bestIds = $bestIdSub->pluck('best_id')->toArray();

        // Количество заданий, требующих проверки
        $uncheckedCount = count($bestIds);

        // Количество вопросов free_text в этих заданиях (можно добавить file_upload)
        $progressables = StudentProgress::whereIn('id', $bestIds)
            ->get(['progressable_type', 'progressable_id'])
            ->groupBy('progressable_type')
            ->map(fn($items) => $items->pluck('progressable_id')->unique()->toArray());

        $questionsAwaitingCheck = 0;
        foreach ($progressables as $type => $ids) {
            $modelClass = match ($type) {
                'lesson_task' => \App\Models\LessonTask::class,
                'homework'    => \App\Models\Homework::class,
                'exam'        => \App\Models\Exam::class,
                default       => null,
            };
            if ($modelClass) {
                $questionsAwaitingCheck += \App\Models\Question::where('questionable_type', $type)
                    ->whereIn('questionable_id', $ids)
                    ->whereIn('question_type', ['free_text'])  // добавить 'file_upload' при необходимости
                    ->count();
            }
        }


        return Inertia::render('Console/Index', [
            'organization'   => $organization,
            'stats'          => $stats,
            'uncheckedCount' => $uncheckedCount,
            'topStudents'    => $topStudents,
            'progressStats' => $progressStats,
            'trends' => [
                'new_students'       => $newStudentsThisWeek,
                'attempts'           => $attemptsThisWeek,
                'checked'            => $checkedThisWeek,
            ],
            'dailyAttempts'      => $dailyAttempts,
            'activeStudents'     => $activeStudents,
            'checkedPercent'     => $checkedPercent,
            'questionsAwaitingCheck' => $questionsAwaitingCheck,
        ]);
    }
}
