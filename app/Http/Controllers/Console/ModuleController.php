<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Http\Requests\Module\ModuleReorderRequest;
use App\Http\Requests\Module\ModuleStoreRequest;
use App\Http\Requests\Module\ModuleUpdateRequest;
use App\Http\Resources\CourseResource;

use App\Http\Resources\ModuleResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Course;
use App\Models\Module;
use App\Models\Organization;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    /**
     * @param Organization $organization
     * @return Response
     * @throws AuthorizationException
     */
    public function index(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'search'      => 'nullable|string|max:255',
            'course_id'   => 'nullable|integer|exists:courses,id',
            'is_active'   => 'nullable|boolean',
            'date_from'   => 'nullable|date',
            'date_to'     => 'nullable|date|after_or_equal:date_from',
            'min_lessons' => 'nullable|integer|min:0',
            'max_lessons' => 'nullable|integer|min:0',
            'sort'        => 'nullable|string|in:order,title,course_title,created_at,lessons_count',
            'direction'   => 'nullable|string|in:asc,desc',
        ]);

        $modules = $organization->modules()
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($sub) use ($search) {
                    // Убрали LOWER() и whereRaw, используем нативный LIKE
                    $sub->where('title', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            })
            ->when(!empty($filters['course_id']), fn($q) => $q->where('course_id', $filters['course_id']))
            ->when(isset($filters['is_active']), fn($q) => $q->where('is_active', $filters['is_active']))
            ->when(!empty($filters['date_from']), fn($q) => $q->whereDate('created_at', '>=', $filters['date_from']))
            ->when(!empty($filters['date_to']), fn($q) => $q->whereDate('created_at', '<=', $filters['date_to']))
            ->withCount('lessons')
            ->when(!empty($filters['min_lessons']), fn($q) => $q->has('lessons', '>=', $filters['min_lessons']))
            ->when(!empty($filters['max_lessons']), fn($q) => $q->has('lessons', '<=', $filters['max_lessons']))
            ->when(!empty($filters['sort']), function ($q) use ($filters) {
                $direction = $filters['direction'] ?? 'asc';
                if ($filters['sort'] === 'course_title') {
                    $q->join('courses', 'modules.course_id', '=', 'courses.id')
                        ->orderBy('courses.title', $direction)
                        ->select('modules.*');
                } else {
                    $q->orderBy($filters['sort'] === 'lessons_count' ? 'lessons_count' : $filters['sort'], $direction);
                }
            }, fn($q) => $q->orderBy('order'))
            ->paginate(20); // ✅ Пагинация вместо get()

        // ✅ pluck возвращает коллекцию [id => title], что идеально для <select> и экономит память
        $courses = $organization->courses()->orderBy('title')->pluck('title', 'id');

        return Inertia::render('Console/Module/List', [
            'organization' => new OrganizationResource($organization),
            'courses'      => $courses, // Передаем как массив/коллекцию, а не Resource
            'modules'      => ModuleResource::collection($modules),
            'filters'      => $filters,
        ]);
    }


    public function show(Organization $organization, Module $module)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($module->organization_id === $organization->id, 404);

        // ✅ Объединили загрузку связей в один запрос
        $module->load([
            'lessons' => fn($query) => $query->orderBy('order'),
            'exam'
        ]);

        $courses = $organization->courses()->pluck('title', 'id');

        return Inertia::render('Console/Module/Show', [
            'organization' => new OrganizationResource($organization),
            'module'       => new ModuleResource($module),
            'courses'      => $courses,
        ]);
    }


    public function store(ModuleStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;

        Module::create($validated);

        return back()->with('success', 'Модуль успешно создан');
    }


    public function update(ModuleUpdateRequest $request, Organization $organization, Module $module)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($module->organization_id === $organization->id, 404);

        $validated = $request->validated();
        $newCourseId = $validated['course_id'] ?? $module->course_id;

        // ✅ 1 запрос вместо 2 (findOrFail + ручная проверка organization_id)
        $course = Course::where('id', $newCourseId)
            ->where('organization_id', $organization->id)
            ->firstOrFail();

        // Если курс изменился, просто ставим в конец (без сдвига старых)
        if ($module->course_id !== $course->id) {
            $validated['order'] = (Module::where('course_id', $course->id)->max('order') ?? 0) + 1;
        }

        $module->update($validated);

        return back()->with('success', 'Модуль успешно обновлён');
    }

    public function destroy(Organization $organization, Module $module)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($module->organization_id === $organization->id, 404);

        $module->delete();

        return Redirect::route('module.index', [
            'organization' => new OrganizationResource($organization),
        ])->with('success', 'Модуль успешно удалён');
    }


    public function reorder(ModuleReorderRequest $request, Organization $organization, Course $course)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($course->organization_id === $organization->id, 404);

        $validated = $request->validated();

        // ✅ Один SQL-запрос вместо N запросов в цикле
        $updates = collect($validated['items'])->map(fn($item) => [
            'id'    => $item['id'],
            'order' => $item['order'],
        ])->toArray();

        Module::upsert($updates, ['id'], ['order']);

        return back()->with('success', 'Порядок модулей обновлён');
    }
}
