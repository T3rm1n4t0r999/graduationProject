<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\CourseReorderRequest;
use App\Http\Requests\Course\CourseStoreRequest;
use App\Http\Requests\Course\CourseUpdateRequest;
use App\Http\Resources\CourseResource;
use App\Http\Resources\ModuleResource;
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
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = strtolower($request->search);
                $q->where(function ($sub) use ($search) {
                    $sub->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"]);
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
            ->get();

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
        if ($course->auto_assign) {
            $students = $organization->students()->get();
            foreach ($students as $student) {
                StudentCourse::firstOrCreate([
                    'student_id' => $student->id,
                    'course_id' => $course->id,
                ], [
                    'organization_id' => $organization->id,
                    'granted_by' => 'auto',
                    'granted_at' => now(),
                ]);
            }
        }
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

        $request->validated();

        DB::transaction(function () use ($request, $organization) {
            foreach ($request->items as $item) {
                Course::where('id', $item['id'])
                    ->where('organization_id', $organization->id)
                    ->update(['order' => $item['order']]);
            }
        });

        return redirect()
            ->route('course.index', new OrganizationResource($organization))
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
