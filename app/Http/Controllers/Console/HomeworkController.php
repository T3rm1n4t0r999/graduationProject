<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Http\Requests\Homework\HomeworkStoreRequest;
use App\Http\Requests\Homework\HomeworkUpdateRequest;
use App\Http\Resources\HomeworkResource;
use App\Http\Resources\LessonResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Homework;
use App\Models\Lesson;
use App\Models\Organization;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class HomeworkController extends Controller
{
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $homeworks = $organization->homeworks()->orderByDesc('created_at')->get();
        $homeworks->loadCount('questions');
        $homeworks->load('lesson');
        $lessons = $organization->lessons()->orderByDesc('created_at')->get();
        return Inertia::render('Console/Homework/List', [
            'organization' => new OrganizationResource($organization),
            'homeworks'    => HomeworkResource::collection($homeworks),
            'lessons'     => LessonResource::collection($lessons),
        ]);
    }

    public function show(Organization $organization, Homework $homework)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($homework->organization_id === $organization->id, 404);

        $homework->load([
            'lesson',
            'questions' => fn($q) => $q->orderBy('order'),
        ]);
        $lessons = $organization->lessons()->orderByDesc('created_at')->get();
        return Inertia::render('Console/Homework/Show', [
            'organization' => new OrganizationResource($organization),
            'homework'     => new HomeworkResource($homework),
            'lessons'     => LessonResource::collection($lessons),
        ]);
    }

    public function store(HomeworkStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;

        $lesson = Lesson::findOrFail($validated['lesson_id']);
        if ($lesson->organization_id !== $organization->id) {
            abort(403, 'Урок не принадлежит данной организации.');
        }

        Homework::create($validated);

        return back()->with('success', 'Домашнее задание успешно создано');
    }

    public function update(HomeworkUpdateRequest $request, Organization $organization, Homework $homework)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($homework->organization_id === $organization->id, 404);

        $validated = $request->validated();

        $lesson = Lesson::findOrFail($validated['lesson_id']);
        if ($lesson->organization_id !== $organization->id) {
            abort(403, 'Урок не принадлежит данной организации.');
        }

        $homework->update($validated);

        return back()->with('success', 'Домашнее задание успешно обновлено');
    }

    public function destroy(Organization $organization, Homework $homework)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($homework->organization_id === $organization->id, 404);

        $homework->delete();

        return Redirect::route('homework.index', [
            'organization' => $organization,
        ])->with('success', 'Домашнее задание успешно удалено');
    }
}
