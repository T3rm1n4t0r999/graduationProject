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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class LessonController extends Controller
{
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $lessons = $organization->lessons()->orderBy('order')->get();
        $lessons->loadCount('tasks');
        $lessons->loadCount('materials');
        $modules = $organization->modules()->get();
        return Inertia::render('Console/Lesson/List', [
            'organization' => new OrganizationResource($organization),
            'modules'       => ModuleResource::collection($modules),
            'lessons'      => LessonResource::collection($lessons),
        ]);
    }

    public function show(Organization $organization, Lesson $lesson)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($lesson->organization_id === $organization->id, 404);

        $lesson->load([
            'tasks' => fn($q) => $q->orderBy('order'),
            'materials' => fn($q) => $q->orderBy('order'),
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

        $lesson->delete();

        return Redirect::route('lesson.index', [
            'organization' => new OrganizationResource($organization),
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
