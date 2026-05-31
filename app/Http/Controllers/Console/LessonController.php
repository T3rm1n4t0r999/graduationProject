<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lesson\LessonReorderRequest;
use App\Http\Requests\Lesson\LessonStoreRequest;
use App\Http\Requests\Lesson\LessonUpdateRequest;
use App\Http\Resources\LessonResource;
use App\Http\Resources\ModuleResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class LessonController extends Controller
{

    public function index(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'search'        => 'nullable|string|max:255',
            'module_id'     => 'nullable|integer|exists:modules,id',
            'is_active'     => 'nullable|boolean',
            'date_from'     => 'nullable|date',
            'date_to'       => 'nullable|date|after_or_equal:date_from',
            'min_tasks'     => 'nullable|integer|min:0',
            'max_tasks'     => 'nullable|integer|min:0',
            'min_materials' => 'nullable|integer|min:0',
            'max_materials' => 'nullable|integer|min:0',
            'sort'          => 'nullable|string|in:order,title,module_title,created_at,tasks_count,materials_count',
            'direction'     => 'nullable|string|in:asc,desc',
        ]);

        $lessons = $organization->lessons()
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($sub) use ($search) {
                    // Нативный LIKE в MySQL (utf8mb4_unicode_ci) нечувствителен к регистру
                    $sub->where('title', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            })
            ->when(!empty($filters['module_id']), function ($q) use ($filters) {
                $q->where('module_id', $filters['module_id']);
            })
            ->when(isset($filters['is_active']), function ($q) use ($filters) {
                $q->where('is_active', $filters['is_active']);
            })
            ->when(!empty($filters['date_from']), function ($q) use ($filters) {
                $q->whereDate('created_at', '>=', $filters['date_from']);
            })
            ->when(!empty($filters['date_to']), function ($q) use ($filters) {
                $q->whereDate('created_at', '<=', $filters['date_to']);
            })
            ->withCount(['tasks', 'materials'])
            ->when(isset($filters['min_tasks']), function ($q) use ($filters) {
                $q->has('tasks', '>=', $filters['min_tasks']);
            })
            ->when(isset($filters['max_tasks']), function ($q) use ($filters) {
                $q->has('tasks', '<=', $filters['max_tasks']);
            })
            ->when(isset($filters['min_materials']), function ($q) use ($filters) {
                $q->has('materials', '>=', $filters['min_materials']);
            })
            ->when(isset($filters['max_materials']), function ($q) use ($filters) {
                $q->has('materials', '<=', $filters['max_materials']);
            })
            ->when(!empty($filters['sort']), function ($q) use ($filters) {
                $direction = $filters['direction'] ?? 'asc';
                if ($filters['sort'] === 'module_title') {
                    $q->join('modules', 'lessons.module_id', '=', 'modules.id')
                        ->orderBy('modules.title', $direction)
                        ->select('lessons.*');
                } else {
                    $q->orderBy($filters['sort'], $direction);
                }
            }, function ($q) {
                $q->orderBy('order');
            })
            ->paginate(20);

        // ✅ Загружаем только нужные поля (id, title) вместо всех (*).
        // Это экономит память, но сохраняет совместимость с ModuleResource.
        $modules = $organization->modules()
            ->select(['id', 'title', 'organization_id'])
            ->orderBy('title')
            ->get();

        return Inertia::render('Console/Lesson/List', [
            'organization' => new OrganizationResource($organization),
            'modules'      => ModuleResource::collection($modules),
            'lessons'      => LessonResource::collection($lessons),
            'filters'      => $filters,
        ]);
    }

    public function show(Organization $organization, Lesson $lesson)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($lesson->organization_id === $organization->id, 404);

        $lesson->load([
            'tasks' => fn($q) => $q->orderBy('order'),
            'materials' => fn($q) => $q->orderBy('order'),
            'homework'
        ]);

        $modules = $organization->modules()->pluck('title', 'id'); // ✅ pluck

        return Inertia::render('Console/Lesson/Show', [
            'organization' => new OrganizationResource($organization),
            'lesson'       => new LessonResource($lesson),
            'modules'      => $modules,
        ]);
    }

    public function store(LessonStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;
        Lesson::create($validated);

        return back()->with('success', 'Урок успешно создан');
    }


    public function update(LessonUpdateRequest $request, Organization $organization, Lesson $lesson)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($lesson->organization_id === $organization->id, 404);

        $validated = $request->validated();
        $newModuleId = $validated['module_id'] ?? $lesson->module_id;

        // ✅ 1 запрос вместо 2 (поиск + проверка принадлежности организации)
        $module = Module::where('id', $newModuleId)
            ->where('organization_id', $organization->id)
            ->firstOrFail();

        if ($lesson->module_id !== $module->id) {
            // При переносе в другой модуль ставим урок в конец (без сдвига старых)
            $validated['order'] = (Lesson::where('module_id', $module->id)->max('order') ?? 0) + 1;
        }

        $lesson->update($validated);

        return back()->with('success', 'Урок успешно обновлён');
    }


    public function destroy(Organization $organization, Lesson $lesson)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($lesson->organization_id === $organization->id, 404);
        $module_id = $lesson->module_id;
        $lesson->delete();

        return Redirect::route('module.show', [
            'organization' => $organization->id,
            'module' => $module_id,
        ])->with('success', 'Урок успешно удалён');
    }

    public function reorder(LessonReorderRequest $request, Organization $organization, Module $module)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($module->organization_id === $organization->id, 404);

        $validated = $request->validated();

        // ✅ Один SQL-запрос вместо N запросов в цикле
        $updates = collect($validated['items'])->map(fn($item) => [
            'id'    => $item['id'],
            'order' => $item['order'],
        ])->toArray();

        Lesson::upsert($updates, ['id'], ['order']);

        return back()->with('success', 'Порядок уроков обновлён');
    }
}
