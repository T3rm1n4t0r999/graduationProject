<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Http\Requests\Homework\HomeworkStoreRequest;
use App\Http\Requests\Homework\HomeworkUpdateRequest;
use App\Http\Resources\HomeworkResource;
use App\Http\Resources\LessonResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Homework;
use App\Models\Lesson;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class HomeworkController extends Controller
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

        $homeworks = $organization->homeworks()
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($sub) use ($search) {
                    // ✅ Нативный LIKE вместо LOWER() + whereRaw
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
                    $q->join('lessons', 'homeworks.lesson_id', '=', 'lessons.id')
                        ->orderBy('lessons.title', $direction)
                        ->select('homeworks.*');
                } else {
                    $q->orderBy($filters['sort'], $direction);
                }
            }, fn($q) => $q->orderByDesc('created_at'))
            ->with('lesson') // ✅ Предотвращает N+1 при рендеринге списка
            ->paginate(12)
            ->withQueryString();

        // ✅ 1 SQL-запрос вместо 2-х. БД сама находит уроки без ДЗ через NOT EXISTS.
        // PHP не загружает массив ID в память.
        $freeLessons = $organization->lessons()
            ->whereDoesntHave('homework')
            ->select(['id', 'title', 'organization_id', 'module_id'])
            ->orderByDesc('created_at')
            ->get();

        // ✅ select() для экономии памяти при передаче на фронтенд для фильтров
        $allLessons = $organization->lessons()
            ->select(['id', 'title', 'organization_id', 'module_id'])
            ->orderBy('title')
            ->get();

        return Inertia::render('Console/Homework/List', [
            'organization' => new OrganizationResource($organization),
            'homeworks'    => HomeworkResource::collection($homeworks),
            'lessons'      => LessonResource::collection($freeLessons),
            'filters'      => $filters,
            'allLessons'   => LessonResource::collection($allLessons),
        ]);
    }

    public function show(Organization $organization, Homework $homework)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($homework->organization_id === $organization->id, 404);

        $homework->load([
            'lesson',
            'questions' => fn($q) => $q->orderBy('order'),
        ]);

        // ✅ Получаем уроки, у которых НЕТ домашнего задания, ИЛИ оно принадлежит текущему homework
        $availableLessons = $organization->lessons()
            ->where(function ($q) use ($homework) {
                $q->whereDoesntHave('homework')
                    ->orWhereHas('homework', fn($hw) => $hw->where('id', $homework->id));
            })
            ->select(['id', 'title', 'organization_id', 'module_id'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Console/Homework/Show', [
            'organization' => new OrganizationResource($organization),
            'homework'     => new HomeworkResource($homework),
            'lessons'      => LessonResource::collection($availableLessons),
        ]);
    }

    public function store(HomeworkStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;
        $validated['max_attempts'] = $validated['max_attempts'] ?? 0;

        // ✅ 1 запрос вместо 2-х (Поиск + Проверка принадлежности)
        Lesson::where('id', $validated['lesson_id'])
            ->where('organization_id', $organization->id)
            ->firstOrFail();

        Homework::create($validated);

        return back()->with('success', 'Домашнее задание успешно создано');
    }


    public function update(HomeworkUpdateRequest $request, Organization $organization, Homework $homework)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($homework->organization_id === $organization->id, 404);

        $validated = $request->validated();

        // ✅ 1 запрос вместо 2-х
        Lesson::where('id', $validated['lesson_id'])
            ->where('organization_id', $organization->id)
            ->firstOrFail();

        $homework->update($validated);

        return back()->with('success', 'Домашнее задание успешно обновлено');
    }



    public function destroy(Organization $organization, Homework $homework)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($homework->organization_id === $organization->id, 404);

        $homework->delete();

        return Redirect::route('homework.index', [
            'organization' => $organization,
        ])->with('success', 'Домашнее задание успешно удалено');
    }
}
