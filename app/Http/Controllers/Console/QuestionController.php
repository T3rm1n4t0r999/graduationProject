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
use Illuminate\Database\Eloquent\Relations\Relation;
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
        [$questions, $filters] = $this->getFilteredQuestions($organization, $request, LessonTask::getMorphType(), 'task_id');

        $tasks = $organization->lessonTasks()->select(['id', 'title', 'organization_id', 'lesson_id'])->orderBy('title')->get();

        return Inertia::render('Console/Question/List', [
            'organization' => new OrganizationResource($organization),
            'questions'    => QuestionResource::collection($questions),
            'tasks'        => $tasks,
            'context'      => 'task',
            'filters'      => $filters,
        ]);
    }

    public function homeworkIndex(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);
        [$questions, $filters] = $this->getFilteredQuestions($organization, $request, Homework::getMorphType(), 'homework_id');

        $homeworks = $organization->homeworks()->select(['id', 'title', 'organization_id', 'lesson_id'])->orderBy('title')->get();

        return Inertia::render('Console/Question/List', [
            'organization' => new OrganizationResource($organization),
            'questions'    => QuestionResource::collection($questions),
            'homeworks'    => $homeworks,
            'context'      => 'homework',
            'filters'      => $filters,
        ]);
    }

    public function examIndex(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);
        [$questions, $filters] = $this->getFilteredQuestions($organization, $request, Exam::getMorphType(), 'exam_id');

        $exams = $organization->exams()->select(['id', 'title', 'organization_id', 'module_id'])->orderBy('title')->get();

        return Inertia::render('Console/Question/List', [
            'organization' => new OrganizationResource($organization),
            'questions'    => QuestionResource::collection($questions),
            'exams'        => $exams,
            'context'      => 'exam',
            'filters'      => $filters,
        ]);
    }

    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        // ✅ Пагинация вместо get() + предзагрузка imageFile для предотвращения N+1
        $questions = $organization->questions()
            ->with(['questionable', 'imageFile'])
            ->orderBy('order')
            ->paginate(20);

        $lessonTasks = $organization->lessonTasks()
            ->select(['id', 'title', 'organization_id', 'lesson_id'])
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

        // ✅ Предзагружаем файлы и картинку
        $question->load(['questionable', 'files', 'imageFile']);

        $currentParent = $question->questionable;
        $relatedItemsCollection = collect();

        // ✅ Оптимизированная загрузка родителей для выпадающего списка
        if ($currentParent instanceof LessonTask) {
            $relatedItemsCollection = LessonTaskResource::collection(
                $organization->lessonTasks()->select(['id', 'title', 'organization_id', 'lesson_id'])->get()
            );
        } elseif ($currentParent instanceof Homework) {
            $relatedItemsCollection = HomeworkResource::collection(
                $organization->homeworks()->select(['id', 'title', 'organization_id', 'lesson_id'])->get()
            );
        } elseif ($currentParent instanceof Exam) {
            $relatedItemsCollection = ExamResource::collection(
                $organization->exams()->select(['id', 'title', 'organization_id', 'module_id'])->get()
            );
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

        // ✅ Нормализуем questionable_type перед сохранением
        if (!empty($validated['questionable_type'])) {
            $validated['questionable_type'] = Question::normalizeMorphType($validated['questionable_type']);
        }

        // ✅ Защита от IDOR: проверяем, что родитель принадлежит организации
        $this->validateParentBelongsToOrganization($validated, $organization);

        $question = Question::create($validated);

        if ($request->hasFile('image')) {
            $this->handleFileUpload($question, $request->file('image'));
        }

        return back()->with('success', 'Вопрос успешно создан');
    }

    public function update(QuestionUpdateRequest $request, Organization $organization, Question $question)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($question->organization_id === $organization->id, 404);

        $validated = $request->validated();

        // ✅ Нормализуем questionable_type
        if (!empty($validated['questionable_type'])) {
            $validated['questionable_type'] = Question::normalizeMorphType($validated['questionable_type']);
        }

        // ✅ Защита от IDOR при смене родителя
        if (isset($validated['questionable_id']) && isset($validated['questionable_type'])) {
            $this->validateParentBelongsToOrganization($validated, $organization);
        }

        if ($request->hasFile('image')) {
            $this->deleteOldFiles($question);
            $this->handleFileUpload($question, $request->file('image'));
        }

        $question->update($validated);

        return back()->with('success', 'Вопрос успешно обновлен');
    }

    public function destroy(Organization $organization, Question $question)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($question->organization_id === $organization->id, 404);

        // ✅ Удаляем файлы с диска перед удалением из БД
        $this->deleteOldFiles($question);

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

    private function getFilteredQuestions(Organization $organization, Request $request, string $morphType, string $parentIdField): array
    {
        $filters = $request->validate([
            'search'        => 'nullable|string|max:255',
            $parentIdField  => "nullable|integer",
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
            ->where('questionable_type', $morphType)
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($sub) use ($search) {
                    // ✅ Нативный ILIKE вместо LOWER() + whereRaw
                    $sub->where('question', 'ILIKE', "%{$search}%")
                        ->orWhere('explanation', 'ILIKE', "%{$search}%");
                });
            })
            ->when(!empty($filters[$parentIdField]), fn($q) => $q->where('questionable_id', $filters[$parentIdField]))
            ->when(!empty($filters['question_type']), fn($q) => $q->where('question_type', $filters['question_type']))
            ->when(isset($filters['is_active']), fn($q) => $q->where('is_active', $filters['is_active']))
            ->when(isset($filters['min_points']), fn($q) => $q->where('points', '>=', $filters['min_points']))
            ->when(isset($filters['max_points']), fn($q) => $q->where('points', '<=', $filters['max_points']))
            ->when(!empty($filters['date_from']), fn($q) => $q->whereDate('created_at', '>=', $filters['date_from']))
            ->when(!empty($filters['date_to']), fn($q) => $q->whereDate('created_at', '<=', $filters['date_to']))
            ->when(!empty($filters['sort']), function ($q) use ($filters) {
                $q->orderBy($filters['sort'], $filters['direction'] ?? 'asc');
            }, fn($q) => $q->orderBy('order'))
            ->with(['questionable', 'imageFile']) // ✅ Предзагрузка для предотвращения N+1
            ->paginate(15)
            ->withQueryString();

        return [$questions, $filters];
    }

    private function validateParentBelongsToOrganization(array $validated, Organization $organization): void
    {
        $type = $validated['questionable_type'] ?? null;
        $id = $validated['questionable_id'] ?? null;

        if (!$type || !$id) return;

        $modelClass = Relation::getMorphedModel($type) ?: $type;

        if (!in_array($modelClass, [LessonTask::class, Homework::class, Exam::class])) {
            abort(400, 'Недопустимый тип родительского элемента.');
        }

        $modelClass::where('id', $id)
            ->where('organization_id', $organization->id)
            ->firstOrFail();
    }

    private function handleFileUpload(Question $question, $file): void
    {
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

    private function deleteOldFiles(Question $question): void
    {
        foreach ($question->files as $file) {
            try {
                Storage::disk($file->disk)->delete($file->path);
            } catch (\Exception $e) {
                logger()->error('Failed to delete question file: ' . $file->path);
            }
            $file->delete();
        }
    }
}
