<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exam\ExamStoreRequest;
use App\Http\Requests\Exam\ExamUpdateRequest;
use App\Http\Resources\ExamResource;
use App\Http\Resources\ModuleResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Exam;
use App\Models\Module;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function index(Organization $organization, Request $request)
    {
        $this->authorize('consoleAction', $organization);

        $filters = $request->validate([
            'search'        => 'nullable|string|max:255',
            'module_id'     => 'nullable|integer|exists:modules,id',
            'is_active'     => 'nullable|boolean',
            'date_from'     => 'nullable|date',
            'date_to'       => 'nullable|date|after_or_equal:date_from',
            'min_questions' => 'nullable|integer|min:0',
            'max_questions' => 'nullable|integer|min:0',
            'sort'          => 'nullable|string|in:order,title,created_at,questions_count',
            'direction'     => 'nullable|string|in:asc,desc',
        ]);

        $exams = $organization->exams()
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($sub) use ($search) {
                    // ✅ Нативный ILIKE вместо LOWER() + whereRaw (игнорирует индексы)
                    $sub->where('title', 'ILIKE', "%{$search}%")
                        ->orWhere('description', 'ILIKE', "%{$search}%");
                });
            })
            ->when(!empty($filters['module_id']), fn($q) => $q->where('module_id', $filters['module_id']))
            ->when(isset($filters['is_active']), fn($q) => $q->where('is_active', $filters['is_active']))
            ->when(!empty($filters['date_from']), fn($q) => $q->whereDate('created_at', '>=', $filters['date_from']))
            ->when(!empty($filters['date_to']), fn($q) => $q->whereDate('created_at', '<=', $filters['date_to']))
            ->withCount('questions')
            ->when(isset($filters['min_questions']), fn($q) => $q->has('questions', '>=', $filters['min_questions']))
            ->when(isset($filters['max_questions']), fn($q) => $q->has('questions', '<=', $filters['max_questions']))
            ->when(!empty($filters['sort']), function ($q) use ($filters) {
                $direction = $filters['direction'] ?? 'asc';
                $q->orderBy($filters['sort'], $direction);
            }, fn($q) => $q->orderByDesc('created_at'))
            ->with('module') // ✅ Предотвращает N+1 при рендеринге
            ->paginate(15)
            ->withQueryString();

        // ✅ 1 SQL-запрос вместо 2-х. БД сама находит модули без экзаменов через NOT EXISTS.
        // PHP не загружает массив ID в память.
        $freeModules = $organization->modules()
            ->whereDoesntHave('exam')
            ->select(['id', 'title', 'organization_id', 'course_id'])
            ->orderByDesc('created_at')
            ->get();

        // ✅ select() для экономии памяти при передаче на фронтенд для фильтров
        $allModules = $organization->modules()
            ->select(['id', 'title', 'organization_id', 'course_id'])
            ->orderBy('title')
            ->get();

        return Inertia::render('Console/Exam/List', [
            'organization'  => new OrganizationResource($organization),
            'exams'         => ExamResource::collection($exams),
            'modules'       => $allModules,
            'freeModules'   => $freeModules,
            'filters'       => $filters,
        ]);
    }

    public function show(Organization $organization, Exam $exam)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($exam->organization_id === $organization->id, 404);

        $exam->load([
            'module',
            'questions' => fn($q) => $q->orderBy('order'),
        ]);

        // ✅ Получаем модули, у которых НЕТ экзамена, ИЛИ он принадлежит текущему exam
        $availableModules = $organization->modules()
            ->where(function ($q) use ($exam) {
                $q->whereDoesntHave('exam')
                    ->orWhereHas('exam', fn($e) => $e->where('id', $exam->id));
            })
            ->select(['id', 'title', 'organization_id', 'course_id'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Console/Exam/Show', [
            'organization' => new OrganizationResource($organization),
            'exam'         => new ExamResource($exam),
            'modules'      => $availableModules,
        ]);
    }

    public function store(ExamStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;
        $validated['max_attempts'] = $validated['max_attempts'] ?? 0;

        // ✅ 1 запрос вместо 2-х (Поиск + Проверка принадлежности)
        Module::where('id', $validated['module_id'])
            ->where('organization_id', $organization->id)
            ->firstOrFail();

        Exam::create($validated);

        return back()->with('success', 'Экзамен успешно создан');
    }

    public function update(ExamUpdateRequest $request, Organization $organization, Exam $exam)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($exam->organization_id === $organization->id, 404);

        $validated = $request->validated();

        // ✅ 1 запрос вместо 2-х
        Module::where('id', $validated['module_id'])
            ->where('organization_id', $organization->id)
            ->firstOrFail();

        $exam->update($validated);

        return back()->with('success', 'Экзамен успешно обновлен');
    }

    public function destroy(Organization $organization, Exam $exam)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($exam->organization_id === $organization->id, 404);

        $exam->delete();

        return Redirect::route('exam.index', [
            'organization' => $organization,
        ])->with('success', 'Экзамен успешно удален');
    }
}
