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
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = strtolower($request->search);
                $q->where(function ($sub) use ($search) {
                    $sub->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"]);
                });
            })
            ->when($request->filled('module_id'), function ($q) use ($request) {
                $q->where('module_id', $request->module_id);
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
            ->withCount('tasks', 'materials')
            ->when($request->filled('min_tasks'), function ($q) use ($request) {
                $q->has('tasks', '>=', $request->min_tasks);
            })
            ->when($request->filled('max_tasks'), function ($q) use ($request) {
                $q->has('tasks', '<=', $request->max_tasks);
            })
            ->when($request->filled('min_materials'), function ($q) use ($request) {
                $q->has('materials', '>=', $request->min_materials);
            })
            ->when($request->filled('max_materials'), function ($q) use ($request) {
                $q->has('materials', '<=', $request->max_materials);
            })
            ->when($request->filled('sort'), function ($q) use ($request) {
                $direction = $request->direction ?? 'asc';
                if ($request->sort === 'module_title') {
                    $q->join('modules', 'lessons.module_id', '=', 'modules.id')
                        ->orderBy('modules.title', $direction)
                        ->select('lessons.*');
                } elseif (in_array($request->sort, ['tasks_count', 'materials_count'])) {
                    $q->orderBy($request->sort, $direction);
                } else {
                    $q->orderBy($request->sort, $direction);
                }
            }, function ($q) {
                $q->orderBy('order');
            })
            ->get();

        $modules = $organization->modules()->orderBy('title')->get();

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
        $modules = $organization->modules()->get();

        return Inertia::render('Console/Lesson/Show', [
            'organization' => new OrganizationResource($organization),
            'lesson'       => new LessonResource($lesson),
            'modules'      => ModuleResource::collection($modules),
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
        $module = Module::findOrFail($newModuleId);
        if ($module->organization_id !== $organization->id) {
            abort(403, 'Модуль не принадлежит данной организации.');
        }
        DB::transaction(function () use ($lesson, $validated, $module) {
            $oldModuleId = $lesson->module_id;
            $oldOrder    = $lesson->order;
            $isModuleChanged = $oldModuleId != $module->id;

            if ($isModuleChanged) {
                // При переносе в другой курс ставим модуль в конец
                $maxOrder = Lesson::where('module_id', $module->id)->max('order') ?? 0;
                $validated['order'] = $maxOrder + 1;

                // Сдвигаем порядки в старом курсе (все, что > старого order, уменьшаем на 1)
                Lesson::where('module_id', $oldModuleId)
                    ->where('order', '>', $oldOrder)
                    ->decrement('order');
            }

            $lesson->update($validated);
        });
        return back()->with('success', 'Модуль успешно обновлён');
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

        DB::transaction(function () use ($validated, $module) {
            foreach ($validated['items'] as $item) {
                Lesson::where('id', $item['id'])
                    ->where('module_id', $module->id)
                    ->update(['order' => $item['order']]);
            }
        });

        return back()->with('success', 'Порядок уроков обновлён');
    }
}
