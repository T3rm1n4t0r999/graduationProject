<?php

namespace App\Http\Controllers\Console;


use App\Http\Controllers\Controller;
use App\Http\Requests\LessonTask\LessonTaskReorderRequest;
use App\Http\Requests\LessonTask\LessonTaskStoreRequest;
use App\Http\Requests\LessonTask\LessonTaskUpdateRequest;
use App\Http\Resources\LessonResource;
use App\Http\Resources\LessonTaskResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Lesson;
use App\Models\LessonTask;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class LessonTaskController extends Controller
{
    public function index(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'search'       => 'nullable|string|max:255',
            'lesson_id'    => 'nullable|integer|exists:lessons,id',
            'is_active'    => 'nullable|boolean',
            'date_from'    => 'nullable|date',
            'date_to'      => 'nullable|date|after_or_equal:date_from',
            'min_questions'=> 'nullable|integer|min:0',
            'max_questions'=> 'nullable|integer|min:0',
            'sort'         => 'nullable|string|in:order,title,lesson_title,created_at,questions_count',
            'direction'    => 'nullable|string|in:asc,desc',
        ]);

        $lessonTasks = $organization->lessonTasks()
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = strtolower($request->search);
                $q->where(function ($sub) use ($search) {
                    $sub->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"]);
                });
            })
            ->when($request->filled('lesson_id'), function ($q) use ($request) {
                $q->where('lesson_id', $request->lesson_id);
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
            ->withCount('questions')
            ->when($request->filled('min_questions'), function ($q) use ($request) {
                $q->has('questions', '>=', $request->min_questions);
            })
            ->when($request->filled('max_questions'), function ($q) use ($request) {
                $q->has('questions', '<=', $request->max_questions);
            })
            ->when($request->filled('sort'), function ($q) use ($request) {
                $direction = $request->direction ?? 'asc';
                if ($request->sort === 'lesson_title') {
                    $q->join('lessons', 'lesson_tasks.lesson_id', '=', 'lessons.id')
                        ->orderBy('lessons.title', $direction)
                        ->select('lesson_tasks.*');
                } elseif ($request->sort === 'questions_count') {
                    $q->orderBy('questions_count', $direction);
                } else {
                    $q->orderBy($request->sort, $direction);
                }
            }, function ($q) {
                $q->orderBy('order');
            })
            ->get();

        $lessons = $organization->lessons()->orderBy('title')->get();

        return Inertia::render('Console/LessonTask/List', [
            'organization' => new OrganizationResource($organization),
            'lessons'      => LessonResource::collection($lessons),
            'tasks'        => LessonTaskResource::collection($lessonTasks),
            'filters'      => $filters,
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

    public function reorder(LessonTaskReorderRequest $request, Organization $organization, Lesson $lesson)
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
