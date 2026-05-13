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
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $modules = $organization->modules()
            ->orderBy('order')
            ->withCount('lessons')
            ->get();

        $courses = $organization->courses()->get();

        $modules->loadCount('lessons');
        return Inertia::render('Console/Module/List', [
            'organization' => new OrganizationResource($organization),
            'courses'       => CourseResource::collection($courses),
            'modules'      => ModuleResource::collection($modules),
        ]);
    }

    public function show(Organization $organization, Module $module)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($module->organization_id === $organization->id, 404);

        $module->load(['lessons' => function ($query) {
            $query->orderBy('order');
        }]);

        $courses = $organization->courses()->get();
        return Inertia::render('Console/Module/Show', [
            'organization' => new OrganizationResource($organization),
            'module'       => new ModuleResource($module),
            'courses'      => CourseResource::collection($courses),
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
        $course = Course::findOrFail($newCourseId);
        if ($course->organization_id !== $organization->id) {
            abort(403, 'Курс не принадлежит данной организации.');
        }

        DB::transaction(function () use ($module, $validated, $course) {
            $oldCourseId = $module->course_id;
            $oldOrder    = $module->order;
            $isCourseChanged = $oldCourseId != $course->id;

            if ($isCourseChanged) {
                // При переносе в другой курс ставим модуль в конец
                $maxOrder = Module::where('course_id', $course->id)->max('order') ?? 0;
                $validated['order'] = $maxOrder + 1;

                // Сдвигаем порядки в старом курсе (все, что > старого order, уменьшаем на 1)
                Module::where('course_id', $oldCourseId)
                    ->where('order', '>', $oldOrder)
                    ->decrement('order');
            }

            $module->update($validated);
        });
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

        DB::transaction(function () use ($validated, $course) {
            foreach ($validated['items'] as $item) {
                Module::where('id', $item['id'])
                    ->where('course_id', $course->id)
                    ->update(['order' => $item['order']]);
            }
        });

        return back()->with('success', 'Порядок модулей обновлён');
    }
}
