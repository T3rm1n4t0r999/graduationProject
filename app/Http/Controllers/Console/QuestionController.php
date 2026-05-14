<?php

namespace App\Http\Controllers\Console;


use App\Http\Controllers\Controller;
use App\Http\Requests\Question\QuestionReorderRequest;
use App\Http\Requests\Question\QuestionStoreRequest;
use App\Http\Requests\Question\QuestionUpdateRequest;
use App\Http\Resources\LessonTaskResource;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\QuestionResource;
use App\Models\LessonTask;
use App\Models\Organization;
use App\Models\Question;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class QuestionController extends Controller
{
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $questions = $organization
            ->questions()
            ->with('questionable')
            ->orderBy('order')
            ->get();

        $lessonTasks = $organization
            ->lessonTasks()
            ->get();

        return Inertia::render('Console/Question/List', [
            'organization' => new OrganizationResource($organization),
            'questions'    => QuestionResource::collection($questions),
            'tasks'        => LessonTaskResource::collection($lessonTasks),
        ]);
    }

    public function show(Organization $organization, Question $question)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($question->organization_id === $organization->id, 404);

        $question->load('questionable');

        $currentParent = $question->questionable;
        $relatedItemsCollection = collect();
        if ($currentParent instanceof LessonTask) {
            $tasks = $organization->lessonTasks()->get();
            $relatedItemsCollection = LessonTaskResource::collection($tasks);
        }

        return Inertia::render('Console/Question/Show', [
            'organization' => new OrganizationResource($organization),
            'question'     => new QuestionResource($question),
            'parents'      => $relatedItemsCollection,
        ]);
    }

    public function store(QuestionStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;
        Question::create($validated);

        return back()->with('success', 'Вопрос успешно создан');
    }

    public function update(QuestionUpdateRequest $request, Organization $organization, Question $question)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($question->organization_id === $organization->id, 404);

        $validated = $request->validated();

        $question->update($validated);

        return back()->with('success', 'Вопрос успешно обновлен');
    }

    public function destroy(Organization $organization, Question $question)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($question->organization_id === $organization->id, 404);

        $question->delete();

        return Redirect::route('question.index', [
            'organization' => $organization->id,
        ])->with('success', 'Вопрос успешно удален');
    }

    public function reorder(QuestionReorderRequest $request, Organization $organization, LessonTask $task)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($task->organization_id === $organization->id, 404);

        $validated = $request->validated();

        foreach ($validated['items'] as $item) {
            Question::where('id', $item['id'])
                ->where('questionable_type', LessonTask::class)
                ->where('questionable_id', $task->id)
                ->update(['order' => $item['order']]);
        }

        return back()->with('success', 'Порядок вопросов обновлен');
    }
}
