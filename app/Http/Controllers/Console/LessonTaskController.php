<?php

namespace App\Http\Controllers\Console;


use App\Http\Controllers\Controller;
use App\Http\Requests\LessonTask\LessonTaskSetActiveRequest;
use App\Http\Requests\LessonTask\LessonTaskStoreRequest;
use App\Http\Requests\LessonTask\LessonTaskUpdateRequest;
use App\Http\Requests\Module\ModuleReorderRequest;
use App\Http\Resources\LessonResource;
use App\Http\Resources\LessonTaskResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonTask;
use App\Models\Module;
use App\Models\Organization;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class LessonTaskController extends Controller
{
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $lessonTasks = $organization
            ->lessonTasks()
            ->withCount('questions')
            ->get();
        $lessons = $organization
            ->lessons()
            ->get();

        return Inertia::render('Console/LessonTask/List', [
            'organization' => new OrganizationResource($organization),
            'lessons'       => LessonResource::collection($lessons),
            'tasks'      => LessonTaskResource::collection($lessonTasks),
        ]);
    }

    public function show(Organization $organization, LessonTask $task)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($task->organization_id === $organization->id, 404);

        $task->load(['questions' => function ($query) {
            $query->orderBy('order');
        }]);

        $lessons = $organization->lessons()->get();

        return Inertia::render('Console/LessonTask/Show', [
            'organization' => new OrganizationResource($organization),
            'task' => new LessonTaskResource($task),
            'lessons' => LessonResource::collection($lessons),
        ]);
    }

    public function store(LessonTaskStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;
        $validated['max_score'] = 0;
        LessonTask::create($validated);

        return back()->with('success', 'Задание успешно создано');
    }


    public function update(LessonTaskUpdateRequest $request, Organization $organization, LessonTask $task)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($task->organization_id === $organization->id, 404);

        $validated = $request->validated();

        $task->update($validated);

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

    public function reorder(ModuleReorderRequest $request, Organization $organization, Lesson $lesson)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($lesson->organization_id === $organization->id, 404);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $lesson) {
            foreach ($validated['items'] as $item) {
                LessonTask::where('id', $item['id'])
                    ->where('lesson_id', $lesson->id)
                    ->update(['order' => $item['order']]);
            }
        });

        return back()->with('success', 'Порядок заданий обновлен');
    }

}
