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
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CourseController extends Controller
{

    /**
     * Список курсов организации.
     */
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $courses = $organization->courses()
            ->orderBy('order')
            ->withCount('modules')
            ->get();

        return Inertia::render('Console/Course/List', [
            'organization' => new OrganizationResource($organization),
            'courses' => CourseResource::collection($courses),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CourseStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $validated = $request->validated();

        $organization->courses()->create($validated);

        return redirect()
            ->route('course.index', new OrganizationResource($organization))
            ->with('success', 'Курс успешно создан.');
    }

    /**
     * Просмотр одного курса.
     */
    public function show(Organization $organization, Course $course)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($course->organization_id === $organization->id, 404);

        $modules = $course->modules()->orderBy('order')->get();

        return Inertia::render('Console/Course/Show', [
            'organization' => new OrganizationResource($organization),
            'course' => new CourseResource($course),
            'modules' => ModuleResource::collection($modules),
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
