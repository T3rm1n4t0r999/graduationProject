<?php

namespace App\Http\Controllers\Console;

use App\Enums\QuestionableType;
use App\Http\Requests\LessonTask\LessonTaskSetActiveRequest;
use App\Http\Requests\LessonTask\LessonTaskStoreRequest;
use App\Http\Requests\LessonTask\LessonTaskUpdateRequest;
use App\Http\Requests\Module\QuestionStoreRequest;
use App\Http\Requests\Module\QuestionUpdateRequest;
use App\Http\Resources\LessonResource;
use App\Http\Resources\LessonTaskResource;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\QuestionResource;
use App\Models\Homework;
use App\Models\LessonTask;
use App\Models\Organization;
use App\Models\Question;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class QuestionController
{
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $questions = $organization
            ->questions()
            ->get();
        $lessonTasks = $organization
            ->lessonTasks()
            ->get();

        return Inertia::render('Console/Question/List', [
            'organization' => new OrganizationResource($organization),
            'questions'       => LessonResource::collection($questions)->showDetails(false),
            'tasks'      => LessonTaskResource::collection($lessonTasks)->showDetails(false),
        ]);
    }

    public function show(Organization $organization, Question $question)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($question->organization_id === $organization->id, 404);

        $currentParent = $question->questionable;
        $relatedItemsCollection = collect();
        if ($currentParent instanceof LessonTask) {
            $tasks = $organization->lessonTasks()->get();
            $relatedItemsCollection = LessonTaskResource::collection($tasks)->showDetails(false);
        }
//        elseif ($currentParent instanceof Homework) {
//            $homeworks = $organization->homeworks()->get();
//            $relatedItemsCollection = HomeworkResource::collection($homeworks)->showDetails(false);
//        }
//          elseif ($currentParent instanceof Exam) {
//          $exams = $organization->exams()->get();
//          $relatedItemsCollection = ExamResource::collection($exams)->showDetails(false);
//}

        return Inertia::render('Console/LessonTask/Show', [
            'organization' => new OrganizationResource($organization),
            'question' => new QuestionResource($question),
            'parents' => $relatedItemsCollection,
        ]);
    }

    public function store(QuestionStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;
        $validated['max_score'] = 0;
        LessonTask::create($validated);

        return back()->with('success', 'Задание успешно создано');
    }

//    public function switchActive(LessonTaskSetActiveRequest $request, Organization $organization, LessonTask $lessonTask)
//    {
//        $this->authorize('consoleAction', $organization);
//        $validated = $request->validated();
//        $lessonTask->update($validated);
//        return back()->with('success', 'Задание успешно обновлено');
//    }


    public function update(QuestionUpdateRequest $request, Organization $organization, LessonTask $lessonTask)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($lessonTask->organization_id === $organization->id, 404);

        $validated = $request->validated();

        $lessonTask->update($validated);

        return back()->with('success', 'Задание успешно обновлено');
    }

    public function destroy(Organization $organization, LessonTask $lessonTask)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($lessonTask->organization_id === $organization->id, 404);

        $lessonTask->delete();

        return Redirect::route('lessonTask.index', [
            'organization' => new OrganizationResource($organization),
        ])->with('success', 'Задание успешно создано');
    }
}
