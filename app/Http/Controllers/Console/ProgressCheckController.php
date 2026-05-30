<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\StudentResource;
use App\Models\Organization;
use App\Models\StudentProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProgressCheckController extends Controller
{

    public function index(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'student_id' => 'nullable|integer|exists:students,id',
            'type'       => 'nullable|string|in:lesson_task,homework,exam',
            'date_from'  => 'nullable|date',
            'date_to'    => 'nullable|date|after_or_equal:date_from',
        ]);

        // Базовые условия для непроверенных попыток
        $baseConditions = function ($query) use ($organization, $filters) {
            $query->where('organization_id', $organization->id)
                ->where('checked', false)
                ->when(!empty($filters['student_id']), fn($q) => $q->where('student_id', $filters['student_id']))
                ->when(!empty($filters['type']), fn($q) => $q->where('progressable_type', $filters['type']))
                ->when(!empty($filters['date_from']), fn($q) => $q->whereDate('created_at', '>=', $filters['date_from']))
                ->when(!empty($filters['date_to']), fn($q) => $q->whereDate('created_at', '<=', $filters['date_to']));
        };

        // Лучшие баллы только для тех заданий, где у студента ещё нет проверенной попытки
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

        // ID лучших попыток
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

        $bestIds = $bestIdSub->pluck('best_id');

        // Основной запрос
        $progresses = StudentProgress::whereIn('id', $bestIds)
            ->with(['student', 'progressable'])
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString()
            ->through(fn($p) => [
                'id'               => $p->id,
                'student_name'     => $p->student?->lastname . ' ' . $p->student?->firstname,
                'title'            => $p->progressable?->title ?? 'Без названия',
                'type'             => $p->progressable_type,
                'points'           => $p->points,
                'max_points'       => $p->max_points,
                'attempt'          => $p->attempt,
                'created_at'       => $p->created_at?->format('d.m.Y H:i'),
            ]);

        $students = $organization->students()
            ->select('id', 'lastname', 'firstname')
            ->get()
            ->map(fn($s) => [
                'id'   => $s->id,
                'name' => $s->lastname . ' ' . $s->firstname,
            ]);

        return Inertia::render('Console/Progress/Check/List', [
            'organization'   => new OrganizationResource($organization),
            'progresses'     => $progresses,
            'students'       => $students,
            'filters'        => $filters,
            'availableTypes' => [
                'lesson_task' => 'Задание урока',
                'homework'    => 'Домашнее задание',
                'exam'        => 'Контрольная работа',
            ],
        ]);
    }

    // Страница проверки одного прогресса
    public function show(Organization $organization, StudentProgress $progress)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($progress->organization_id === $organization->id, 404);

        $progress->load([
            'student',
            'progressable.questions' => fn($q) => $q->orderBy('order'),
        ]);

        $answers = collect($progress->answers ?? []);
        $questions = $progress->progressable->questions->map(function ($question) use ($answers) {
            $studentAnswer = $answers->firstWhere('question_id', $question->id);
            return [
                'id'              => $question->id,
                'question'        => $question->question,
                'question_type'   => $question->question_type,
                'options'         => $question->options,
                'correct_answers' => $question->correct_answers,
                'points'          => $question->points,   // максимальный балл
                'explanation'     => $question->explanation,
                'order'           => $question->order,
                'student_answer'  => $studentAnswer['answer'] ?? null,
            ];
        });

        return Inertia::render('Console/Progress/Check/Show', [
            'organization' => new OrganizationResource($organization),
            'progress'     => [
                'id'               => $progress->id,
                'student_id'       => $progress->student_id,
                'student_name'     => $progress->student?->lastname . ' ' . $progress->student?->firstname,
                'title'            => $progress->progressable?->title ?? 'Без названия',
                'type'             => $progress->progressable_type,
                'points'           => $progress->points,
                'max_points'       => $progress->max_points,
                'attempt'          => $progress->attempt,
                'checked'          => $progress->checked,
                'created_at'       => $progress->created_at?->format('d.m.Y H:i'),
                'free_text_explanations' => data_get($progress->metadata, 'free_text_explanations', []),
            ],
            'questions'    => $questions,
        ]);
    }

    // Сохранение проверки
    public function update(Request $request, Organization $organization, StudentProgress $progress)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($progress->organization_id === $organization->id, 404);

        // 1. Собираем все вопросы задания
        $taskQuestions = $progress->progressable->questions;
        $maxPointsByQuestion = $taskQuestions->pluck('points', 'id');

        // 2. Валидируем входящие баллы
        $validated = $request->validate([
            'question_explanations'  => 'nullable|array',
            'question_explanations.*'=> 'nullable|string|max:500',
            'question_points'          => 'required|array',
            'question_points.*'        => 'required|integer|min:0',
            'checked'                  => 'required|boolean',
        ]);

        $questionPoints = $validated['question_points'];
        $questionExplanations = $validated['question_explanations'] ?? [];

        // 3. Проверяем, что каждый балл не превышает максимум вопроса
        foreach ($questionPoints as $questionId => $points) {
            $max = $maxPointsByQuestion[$questionId] ?? 0;
            if ($points < 0 || $points > $max) {
                return back()->withErrors(['question_points.' . $questionId => "Балл должен быть от 0 до {$max}"]);
            }
        }

        // 4. Вычисляем итоговый балл
        $totalPoints = array_sum($questionPoints);

        // 5. Сохраняем
        $progress->update([
            'points'     => array_sum($questionPoints),
            'checked'    => $validated['checked'],
            'checked_by' => $validated['checked'] ? auth()->id() : null,
            'metadata'   => array_merge($progress->metadata ?? [], [
                'manual_scores'            => $questionPoints,
                'free_text_explanations'   => $questionExplanations,
            ]),
        ]);

        return back()->with('success', 'Прогресс успешно проверен.');
    }
}
