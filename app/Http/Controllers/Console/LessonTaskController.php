<?php

namespace App\Http\Controllers\Console;


use App\Http\Controllers\Controller;
use App\Http\Requests\LessonTask\LessonTaskReorderRequest;
use App\Http\Requests\LessonTask\LessonTaskStoreRequest;
use App\Http\Requests\LessonTask\LessonTaskUpdateRequest;
use App\Http\Resources\LessonResource;
use App\Http\Resources\LessonTaskResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Lesson;
use App\Models\LessonTask;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class LessonTaskController extends Controller
{
    public function index(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'search'        => 'nullable|string|max:255',
            'lesson_id'     => 'nullable|integer|exists:lessons,id',
            'is_active'     => 'nullable|boolean',
            'date_from'     => 'nullable|date',
            'date_to'       => 'nullable|date|after_or_equal:date_from',
            'min_questions' => 'nullable|integer|min:0',
            'max_questions' => 'nullable|integer|min:0',
            'sort'          => 'nullable|string|in:order,title,lesson_title,created_at,questions_count',
            'direction'     => 'nullable|string|in:asc,desc',
        ]);

        $lessonTasks = $organization->lessonTasks()
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($sub) use ($search) {
                    // Нативный LIKE в MySQL (utf8mb4_unicode_ci) нечувствителен к регистру
                    $sub->where('title', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            })
            ->when(!empty($filters['lesson_id']), fn($q) => $q->where('lesson_id', $filters['lesson_id']))
            ->when(isset($filters['is_active']), fn($q) => $q->where('is_active', $filters['is_active']))
            ->when(!empty($filters['date_from']), fn($q) => $q->whereDate('created_at', '>=', $filters['date_from']))
            ->when(!empty($filters['date_to']), fn($q) => $q->whereDate('created_at', '<=', $filters['date_to']))
            ->withCount('questions')
            ->when(isset($filters['min_questions']), fn($q) => $q->has('questions', '>=', $filters['min_questions']))
            ->when(isset($filters['max_questions']), fn($q) => $q->has('questions', '<=', $filters['max_questions']))
            ->when(!empty($filters['sort']), function ($q) use ($filters) {
                $direction = $filters['direction'] ?? 'asc';
                if ($filters['sort'] === 'lesson_title') {
                    $q->join('lessons', 'lesson_task.lesson_id', '=', 'lessons.id')
                        ->orderBy('lessons.title', $direction)
                        ->select('lesson_task.*');
                } else {
                    $q->orderBy($filters['sort'], $direction);
                }
            }, fn($q) => $q->orderBy('order'))
            ->paginate(20); // ✅ Пагинация вместо get()

        // ✅ select() вместо get() — загружаем только нужные поля для <select>
        $lessons = $organization->lessons()
            ->select(['id', 'title', 'organization_id', 'module_id'])
            ->orderBy('title')
            ->get();

        return Inertia::render('Console/LessonTask/List', [
            'organization' => new OrganizationResource($organization),
            'lessons'      => LessonResource::collection($lessons),
            'tasks'        => LessonTaskResource::collection($lessonTasks),
            'filters'      => $filters,
        ]);
    }

    public function show(Organization $organization, LessonTask $task)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($task->organization_id === $organization->id, 404);

        $task->load(['questions' => fn($query) => $query->orderBy('order')]);

        // ✅ select() для экономии памяти
        $lessons = $organization->lessons()
            ->select(['id', 'title', 'organization_id', 'module_id'])
            ->orderBy('title')
            ->get();

        return Inertia::render('Console/LessonTask/Show', [
            'organization' => new OrganizationResource($organization),
            'task'         => new LessonTaskResource($task),
            'lessons'      => LessonResource::collection($lessons),
        ]);
    }


    public function store(LessonTaskStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;
        $validated['max_score'] = 0;
        $validated['max_attempts'] = $validated['max_attempts'] ? $validated['max_attempts'] : 0;
        LessonTask::create($validated);

        return back()->with('success', 'Задание успешно создано');
    }



    public function update(LessonTaskUpdateRequest $request, Organization $organization, LessonTask $task)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($task->organization_id === $organization->id, 404);

        $validated = $request->validated();

        // ✅ Проверка: если lesson_id меняется, проверяем принадлежность организации
        if (isset($validated['lesson_id']) && $validated['lesson_id'] !== $task->lesson_id) {
            $newLesson = Lesson::where('id', $validated['lesson_id'])
                ->where('organization_id', $organization->id)
                ->firstOrFail();

            // При переносе в другой урок ставим в конец (без сдвига старых)
            $validated['order'] = (LessonTask::where('lesson_id', $newLesson->id)->max('order') ?? 0) + 1;
        }

        $task->update($validated);

        // ✅ Автоматически пересчитываем max_score, если это необходимо
        $task->recalculateMaxScore();

        return back()->with('success', 'Задание успешно обновлено');
    }
    public function destroy(Organization $organization, LessonTask $task)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($task->organization_id === $organization->id, 404);

        $task->delete();

        return Redirect::route('task.index', [
            'organization' => new OrganizationResource($organization),
        ])->with('success', 'Задание успешно удалено');
    }

    public function reorder(LessonTaskReorderRequest $request, Organization $organization, Lesson $lesson)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($lesson->organization_id === $organization->id, 404);

        $validated = $request->validated();

        // ✅ Один SQL-запрос вместо N запросов в цикле
        $updates = collect($validated['items'])->map(fn($item) => [
            'id'    => $item['id'],
            'order' => $item['order'],
        ])->toArray();

        LessonTask::upsert($updates, ['id'], ['order']);

        return back()->with('success', 'Порядок заданий обновлен');
    }

}
