<?php

namespace App\Http\Controllers\Console;


use App\Http\Controllers\Controller;
use App\Http\Requests\Question\QuestionReorderRequest;
use App\Http\Requests\Question\QuestionStoreRequest;
use App\Http\Requests\Question\QuestionUpdateRequest;
use App\Http\Resources\ExamResource;
use App\Http\Resources\HomeworkResource;
use App\Http\Resources\LessonTaskResource;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\QuestionResource;
use App\Models\Exam;
use App\Models\Homework;
use App\Models\LessonTask;
use App\Models\Organization;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class QuestionController extends Controller
{

    // Вопросы практических заданий
    public function taskIndex(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'search'       => 'nullable|string|max:255',
            'task_id'      => 'nullable|integer|exists:lesson_task,id',
            'question_type'=> 'nullable|string|in:single_choice,multiple_choice,text,free_text',
            'is_active'    => 'nullable|boolean',
            'min_points'   => 'nullable|integer|min:0',
            'max_points'   => 'nullable|integer|min:0',
            'date_from'    => 'nullable|date',
            'date_to'      => 'nullable|date|after_or_equal:date_from',
            'sort'         => 'nullable|string|in:order,question,points,created_at',
            'direction'    => 'nullable|string|in:asc,desc',
        ]);

        $questions = $organization->questions()
            ->where('questionable_type', LessonTask::getMorphType())
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = strtolower($request->search);
                $q->where(function ($sub) use ($search) {
                    $sub->whereRaw('LOWER(question) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(explanation) LIKE ?', ["%{$search}%"]);
                });
            })
            ->when($request->filled('task_id'), function ($q) use ($request) {
                $q->where('questionable_id', $request->task_id);
            })
            ->when($request->filled('question_type'), function ($q) use ($request) {
                $q->where('question_type', $request->question_type);
            })
            ->when(isset($filters['is_active']), function ($q) use ($filters) {
                $q->where('is_active', $filters['is_active']);
            })
            ->when($request->filled('min_points'), function ($q) use ($request) {
                $q->where('points', '>=', $request->min_points);
            })
            ->when($request->filled('max_points'), function ($q) use ($request) {
                $q->where('points', '<=', $request->max_points);
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_to);
            })
            ->when($request->filled('sort'), function ($q) use ($request) {
                $direction = $request->direction ?? 'asc';
                $q->orderBy($request->sort, $direction);
            }, function ($q) {
                $q->orderBy('order');
            })
            ->with('questionable')
            ->paginate(15)
            ->withQueryString();

        $tasks = $organization->lessonTasks()->orderBy('title')->get();

        return Inertia::render('Console/Question/List', [
            'organization' => new OrganizationResource($organization),
            'questions'    => QuestionResource::collection($questions),
            'tasks'        => LessonTaskResource::collection($tasks),
            'context'      => 'task',
            'filters'      => $filters,
        ]);
    }

    // Вопросы домашних заданий
    public function homeworkIndex(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'search'        => 'nullable|string|max:255',
            'homework_id'   => 'nullable|integer|exists:homeworks,id',
            'question_type' => 'nullable|string|in:single_choice,multiple_choice,text,free_text',
            'is_active'     => 'nullable|boolean',
            'min_points'    => 'nullable|integer|min:0',
            'max_points'    => 'nullable|integer|min:0',
            'date_from'     => 'nullable|date',
            'date_to'       => 'nullable|date|after_or_equal:date_from',
            'sort'          => 'nullable|string|in:order,question,points,created_at',
            'direction'     => 'nullable|string|in:asc,desc',
        ]);

        $questions = $organization->questions()
            ->where('questionable_type', Homework::getMorphType())
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = strtolower($request->search);
                $q->where(function ($sub) use ($search) {
                    $sub->whereRaw('LOWER(question) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(explanation) LIKE ?', ["%{$search}%"]);
                });
            })
            ->when($request->filled('homework_id'), function ($q) use ($request) {
                $q->where('questionable_id', $request->homework_id);
            })
            ->when($request->filled('question_type'), function ($q) use ($request) {
                $q->where('question_type', $request->question_type);
            })
            ->when(isset($filters['is_active']), function ($q) use ($filters) {
                $q->where('is_active', $filters['is_active']);
            })
            ->when($request->filled('min_points'), function ($q) use ($request) {
                $q->where('points', '>=', $request->min_points);
            })
            ->when($request->filled('max_points'), function ($q) use ($request) {
                $q->where('points', '<=', $request->max_points);
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_to);
            })
            ->when($request->filled('sort'), function ($q) use ($request) {
                $direction = $request->direction ?? 'asc';
                $q->orderBy($request->sort, $direction);
            }, function ($q) {
                $q->orderBy('order');
            })
            ->with('questionable')
            ->paginate(15)
            ->withQueryString();

        $homeworks = $organization->homeworks()->orderBy('title')->get();

        return Inertia::render('Console/Question/List', [
            'organization' => new OrganizationResource($organization),
            'questions'    => QuestionResource::collection($questions),
            'homeworks'    => HomeworkResource::collection($homeworks),
            'context'      => 'homework',
            'filters'      => $filters,
        ]);
    }

    // Вопросы контрольных работ
    public function examIndex(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'search'        => 'nullable|string|max:255',
            'exam_id'       => 'nullable|integer|exists:exams,id',
            'question_type' => 'nullable|string|in:single_choice,multiple_choice,text,free_text',
            'is_active'     => 'nullable|boolean',
            'min_points'    => 'nullable|integer|min:0',
            'max_points'    => 'nullable|integer|min:0',
            'date_from'     => 'nullable|date',
            'date_to'       => 'nullable|date|after_or_equal:date_from',
            'sort'          => 'nullable|string|in:order,question,points,created_at',
            'direction'     => 'nullable|string|in:asc,desc',
        ]);

        $questions = $organization->questions()
            ->where('questionable_type', Exam::getMorphType())
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = strtolower($request->search);
                $q->where(function ($sub) use ($search) {
                    $sub->whereRaw('LOWER(question) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(explanation) LIKE ?', ["%{$search}%"]);
                });
            })
            ->when($request->filled('exam_id'), function ($q) use ($request) {
                $q->where('questionable_id', $request->exam_id);
            })
            ->when($request->filled('question_type'), function ($q) use ($request) {
                $q->where('question_type', $request->question_type);
            })
            ->when(isset($filters['is_active']), function ($q) use ($filters) {
                $q->where('is_active', $filters['is_active']);
            })
            ->when($request->filled('min_points'), function ($q) use ($request) {
                $q->where('points', '>=', $request->min_points);
            })
            ->when($request->filled('max_points'), function ($q) use ($request) {
                $q->where('points', '<=', $request->max_points);
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_to);
            })
            ->when($request->filled('sort'), function ($q) use ($request) {
                $direction = $request->direction ?? 'asc';
                $q->orderBy($request->sort, $direction);
            }, function ($q) {
                $q->orderBy('order');
            })
            ->with('questionable')
            ->paginate(15)
            ->withQueryString();

        $exams = $organization->exams()->orderBy('title')->get();

        return Inertia::render('Console/Question/List', [
            'organization' => new OrganizationResource($organization),
            'questions'    => QuestionResource::collection($questions),
            'exams'        => ExamResource::collection($exams),
            'context'      => 'exam',
            'filters'      => $filters,
        ]);
    }

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

        $question->load('questionable', 'files'); // ← добавили 'files'


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

        $question = Question::create($validated);

        // Сохранение изображения
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $path = $file->store('questions/images', 'public');
            $question->files()->create([
                'name'      => $file->getClientOriginalName(),
                'path'      => $path,
                'disk'      => 'public',
                'size'      => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension(),
            ]);
        }

        return back()->with('success', 'Вопрос успешно создан');
    }

    public function update(QuestionUpdateRequest $request, Organization $organization, Question $question)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($question->organization_id === $organization->id, 404);

        $validated = $request->validated();

        // Обработка изображения
        if ($request->hasFile('image')) {
            // Удаляем старое изображение (если было)
            $oldImage = $question->image;
            if ($oldImage) {
                Storage::disk($oldImage->disk)->delete($oldImage->path);
                $oldImage->delete();
            }

            $file = $request->file('image');
            $path = $file->store('questions/images', 'public');
            $question->files()->create([
                'name'      => $file->getClientOriginalName(),
                'path'      => $path,
                'disk'      => 'public',
                'size'      => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension(),
            ]);
        }

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

    public function reorder(QuestionReorderRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $validated = $request->validated();
        $params = $request->route()->parameters();

        // Из параметров маршрута извлекаем модель задания, домашней работы или экзамена
        $questionable = collect($params)->first(fn($v) =>
            $v instanceof LessonTask || $v instanceof Homework || $v instanceof Exam
        );

        abort_unless($questionable && $questionable->organization_id === $organization->id, 404);

        $questionableType = $questionable->getMorphClass();
        $questionableId = $questionable->id;

        foreach ($validated['items'] as $item) {
            Question::where('id', $item['id'])
                ->where('questionable_type', $questionableType)
                ->where('questionable_id', $questionableId)
                ->update(['order' => $item['order']]);
        }

        return back()->with('success', 'Порядок вопросов обновлен');
    }
}
