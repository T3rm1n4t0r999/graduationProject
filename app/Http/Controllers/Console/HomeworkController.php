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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class HomeworkController extends Controller
{
    public function index(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'search'        => 'nullable|string|max:255',
            'lesson_id'     => 'nullable|integer|exists:lessons,id',
            'is_active'     => 'nullable|boolean',
            'date_from'     => 'nullable|date',
            'date_to'       => 'nullable|date|after_or_equal:date_from',
            'min_questions' => 'nullable|integer|min:0',
            'max_questions' => 'nullable|integer|min:0',
            'sort'          => 'nullable|string|in:order,title,lesson_title,created_at,questions_count',
            'direction'     => 'nullable|string|in:asc,desc',
        ]);

        $homeworks = $organization->homeworks()
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
                    $q->join('lessons', 'homeworks.lesson_id', '=', 'lessons.id')
                        ->orderBy('lessons.title', $direction)
                        ->select('homeworks.*');
                } elseif ($request->sort === 'questions_count') {
                    $q->orderBy('questions_count', $direction);
                } else {
                    $q->orderBy($request->sort, $direction);
                }
            }, function ($q) {
                $q->orderByDesc('created_at'); // по умолчанию, как было изначально
            })
            ->with('lesson')
            ->paginate(12)
            ->withQueryString();

        // Для формы создания нужны только свободные уроки, как и раньше
        $occupiedLessonIds = $organization->homeworks()->pluck('lesson_id')->unique()->toArray();
        $freeLessons = $organization->lessons()
            ->whereNotIn('id', $occupiedLessonIds)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Console/Homework/List', [
            'organization' => new OrganizationResource($organization),
            'homeworks'    => HomeworkResource::collection($homeworks),
            'lessons'      => LessonResource::collection($freeLessons), // только свободные уроки для формы
            'filters'      => $filters,
            'allLessons'   => LessonResource::collection($organization->lessons()->orderBy('title')->get()),
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


        $occupiedLessonIds = Homework::where('organization_id', $organization->id)
            ->where('id', '!=', $homework->id)
            ->pluck('lesson_id')
            ->unique()
            ->toArray();

        $availableLessons = $organization->lessons()
            ->whereNotIn('id', $occupiedLessonIds)
            ->orWhere('id', $homework->lesson_id)   // всегда показываем текущий урок
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Console/Homework/Show', [
            'organization' => new OrganizationResource($organization),
            'homework'     => new HomeworkResource($homework),
            'lessons'     => LessonResource::collection($availableLessons),
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
