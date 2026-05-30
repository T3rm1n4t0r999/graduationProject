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

        // Валидация фильтров
        $filters = $request->validate([
            'search'        => 'nullable|string|max:255',
            'modules_id'     => 'nullable|integer|exists:modules,id',
            'is_active'     => 'nullable|boolean',
            'date_from'     => 'nullable|date',
            'date_to'       => 'nullable|date|after_or_equal:date_from',
            'min_questions' => 'nullable|integer|min:0',
            'max_questions' => 'nullable|integer|min:0',
            'sort'          => 'nullable|string|in:order,title,created_at,questions_count',
            'direction'     => 'nullable|string|in:asc,desc',
        ]);

        // Запрос экзаменов с фильтрацией
        $exams = $organization->exams()
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = strtolower($request->search);
                $q->where(function ($sub) use ($search) {
                    $sub->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"]);
                });
            })
            ->when($request->filled('module_id'), function ($q) use ($request) {
                $q->where('module_id', $request->module_id);
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
                $q->orderBy($request->sort, $direction);
            }, function ($q) {
                $q->orderByDesc('created_at');
            })
            ->with('module')
            ->paginate(15)
            ->withQueryString();

        // Все модули для фильтра (можно выбрать любой)
        $allModules = $organization->modules()->orderBy('title')->get();

        // Занятые модули (уже есть экзамен) – для ограничения формы создания
        $occupiedModuleIds = $exams->pluck('module_id')->unique()->toArray();
        $freeModules = $organization->modules()
            ->whereNotIn('id', $occupiedModuleIds)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Console/Exam/List', [
            'organization'  => new OrganizationResource($organization),
            'exams'         => ExamResource::collection($exams),
            'modules'       => ModuleResource::collection($allModules),   // для фильтра
            'freeModules'   => ModuleResource::collection($freeModules),  // для формы создания
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

        $occupiedModuleIds = Exam::where('organization_id', $organization->id)
            ->where('id', '!=', $exam->id)
            ->pluck('module_id')
            ->unique()
            ->toArray();

        $availableModules = $organization->modules()
            ->whereNotIn('id', $occupiedModuleIds)
            ->orWhere('id', $exam->module_id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Console/Exam/Show', [
            'organization' => new OrganizationResource($organization),
            'exam'     => new ExamResource($exam),
            'modules'     => ModuleResource::collection($availableModules),
        ]);
    }

    public function store(ExamStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;

        $module = Module::findOrFail($validated['module_id']);
        if ($module->organization_id !== $organization->id) {
            abort(403, 'Модуль не принадлежит данной организации.');
        }

        Exam::create($validated);

        return back()->with('success', 'Экзамен успешно создан');
    }

    public function update(ExamUpdateRequest $request, Organization $organization, Exam $exam)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($exam->organization_id === $organization->id, 404);

        $validated = $request->validated();

        $module = Module::findOrFail($validated['module_id']);
        if ($module->organization_id !== $organization->id) {
            abort(403, 'Модуль не принадлежит данной организации.');
        }

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
