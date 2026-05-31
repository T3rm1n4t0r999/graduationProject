<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\CourseReorderRequest;
use App\Http\Requests\Course\CourseStoreRequest;
use App\Http\Requests\Course\CourseUpdateRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Course;
use App\Models\Organization;
use App\Models\StudentCourse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CourseController extends Controller
{

    public function index(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'search'      => 'nullable|string|max:255',
            'is_active'   => 'nullable|boolean',
            'date_from'   => 'nullable|date',
            'date_to'     => 'nullable|date|after_or_equal:date_from',
            'min_modules' => 'nullable|integer|min:0',
            'max_modules' => 'nullable|integer|min:0',
            'sort'        => 'nullable|string|in:order,title,created_at,modules_count',
            'direction'   => 'nullable|string|in:asc,desc',
        ]);

        $courses = $organization->courses()
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($sub) use ($search) {
                    // Убираем LOWER() и whereRaw, используем нативный LIKE
                    $sub->where('title', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            })
            ->when(isset($filters['is_active']), function ($q) use ($filters) {
                $q->where('is_active', $filters['is_active']);
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_to);
            })
            ->withCount('modules')
            ->when($request->filled('min_modules'), function ($q) use ($request) {
                $q->has('modules', '>=', $request->min_modules);
            })
            ->when($request->filled('max_modules'), function ($q) use ($request) {
                $q->has('modules', '<=', $request->max_modules);
            })
            ->when($request->filled('sort'), function ($q) use ($filters) {
                $direction = $filters['direction'] ?? 'asc';
                if ($filters['sort'] === 'modules_count') {
                    $q->orderBy('modules_count', $direction);
                } else {
                    $q->orderBy($filters['sort'], $direction);
                }
            }, function ($q) {
                $q->orderBy('order'); // по умолчанию
            })
            ->paginate(20);

        return Inertia::render('Console/Course/List', [
            'organization' => new OrganizationResource($organization),
            'courses'      => CourseResource::collection($courses),
            'filters'      => $filters,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CourseStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $validated = $request->validated();

        $course = $organization->courses()->create($validated);
        $this->syncAutoAssign($organization, $course);
        return redirect()
            ->route('course.index', new OrganizationResource($organization))
            ->with('success', 'Курс успешно создан.');
    }

    private function syncAutoAssign(Organization $organization, Course $course)
    {
        if (!$course->auto_assign) {
            return;
        }

        // 1. Загружаем только ID студентов (массив чисел), а не тяжелые Eloquent-модели
        $studentIds = $organization->students()->pluck('id');

        if ($studentIds->isEmpty()) {
            return;
        }

        $now = now();
        // 2. Формируем массив данных для пакетной вставки
        $data = $studentIds->map(fn($studentId) => [
            'student_id'      => $studentId,
            'course_id'       => $course->id,
            'organization_id' => $organization->id,
            'granted_by'      => 'auto',
            'granted_at'      => $now,
        ])->toArray();

        // 3. upsert делает массовый INSERT.
        // Если связь уже есть (уникальный ключ student_id + course_id), он обновит только granted_by и granted_at
        StudentCourse::upsert(
            $data,
            ['student_id', 'course_id'], // Уникальные колонки для проверки дубликатов
            ['granted_by', 'granted_at'] // Колонки для обновления при совпадении
        );
    }

    /**
     * Просмотр одного курса.
     */
    public function show(Organization $organization, Course $course)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($course->organization_id === $organization->id, 404);

        $course->load([
            'modules' => function ($query) {
                $query->orderBy('order');
            }
        ]);
        return Inertia::render('Console/Course/Show', [
            'organization' => new OrganizationResource($organization),
            'course' => new CourseResource($course),
        ]);
    }

    public function reorder(CourseReorderRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validated();

        $updates = collect($validated['items'])->map(fn($item) => [
            'id'    => $item['id'],
            'order' => $item['order'],
        ])->toArray();

        // ✅ Один SQL-запрос (INSERT ... ON DUPLICATE KEY UPDATE)
        Course::upsert($updates, ['id'], ['order']);

        return redirect()
            ->route('course.index', $organization) // Передаем модель, а не Resource
            ->with('success', 'Порядок курсов обновлён');
    }

    /**
     * Обновление курса.
     */
    public function update(CourseUpdateRequest $request, Organization $organization, Course $course)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($course->organization_id === $organization->id, 404);

        $validated = $request->validated();
        $course->update($validated);
        $this->syncAutoAssign($organization, $course);
        return redirect()->route('course.show', [
            'organization' => new OrganizationResource($organization),
            'course' => new CourseResource($course),
        ])->with('success', 'Курс обновлён');
    }

    /**
     * Удаление курса (по желанию).
     */
    public function destroy(Organization $organization, Course $course)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($course->organization_id === $organization->id, 404);

        $course->delete();

        return redirect()
            ->route('course.index', new OrganizationResource($organization))
            ->with('success', 'Курс удалён');
    }
}
