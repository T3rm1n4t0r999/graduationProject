<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Http\Requests\LessonMaterial\LessonMaterialReorderRequest;
use App\Http\Requests\LessonMaterial\LessonMaterialStoreRequest;
use App\Http\Requests\LessonMaterial\LessonMaterialUpdateRequest;
use App\Http\Requests\Module\ModuleReorderRequest;
use App\Http\Resources\LessonMaterialResource;
use App\Http\Resources\LessonResource;
use App\Http\Resources\LessonTaskResource;
use App\Http\Resources\OrganizationResource;
use App\Models\File;
use App\Models\Lesson;
use App\Models\LessonMaterial;
use App\Models\LessonTask;
use App\Models\Organization;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LessonMaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Organization $organization)
    {
        $this->authorize('consoleAction', $organization);

        // ✅ Пагинация вместо get() для предотвращения утечки памяти
        $lessonMaterials = $organization
            ->lessonMaterials() // ✅ Исправлен регистр (в модели HasMany)
            ->with('files') // Предотвращает N+1 при отображении превью
            ->orderBy('order')
            ->paginate(20);

        // ✅ select() для экономии памяти при передаче на фронтенд
        $lessons = $organization
            ->lessons()
            ->select(['id', 'title', 'organization_id', 'module_id'])
            ->orderBy('title')
            ->get();

        return Inertia::render('Console/LessonMaterial/List', [
            'organization' => new OrganizationResource($organization),
            'lessons'      => LessonResource::collection($lessons),
            'materials'    => LessonMaterialResource::collection($lessonMaterials),
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(LessonMaterialStoreRequest $request, Organization $organization)
    {
        $this->authorize('consoleAction', $organization);
        $validated = $request->validated();
        $validated['organization_id'] = $organization->id;

        if ($request->hasFile('image')) {
            $validated['video_url'] = null;
        }

        // ✅ Проверка принадлежности урока организации (Защита от IDOR)
        Lesson::where('id', $validated['lesson_id'])
            ->where('organization_id', $organization->id)
            ->firstOrFail();

        $material = LessonMaterial::create($validated);

        $this->handleFileUpload($material, $request);

        return back()->with('success', 'Материал успешно создан');
    }

    /**
     * Display the specified resource.
     */
    public function show(Organization $organization, LessonMaterial $material)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($material->organization_id === $organization->id, 404);

        $material->load('files');

        $lessons = $organization->lessons()
            ->select(['id', 'title', 'organization_id', 'module_id'])
            ->orderBy('title')
            ->get();

        return Inertia::render('Console/LessonMaterial/Show', [
            'organization' => new OrganizationResource($organization),
            'material'     => new LessonMaterialResource($material),
            'lessons'      => LessonResource::collection($lessons),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(LessonMaterialUpdateRequest $request, Organization $organization, LessonMaterial $material)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($material->organization_id === $organization->id, 404);

        $validated = $request->validated();

        // ✅ Проверка принадлежности урока организации (Защита от IDOR)
        if (isset($validated['lesson_id'])) {
            Lesson::where('id', $validated['lesson_id'])
                ->where('organization_id', $organization->id)
                ->firstOrFail();
        }

        // Логика эксклюзивности: файл имеет приоритет над video_url
        if ($request->hasFile('image') || $request->filled('video_url')) {
            $this->deleteOldFiles($material);
        }

        if ($request->hasFile('image')) {
            $validated['video_url'] = null;
            $this->handleFileUpload($material, $request);
        }

        $material->update($validated);

        return back()->with('success', 'Материал успешно обновлен');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Organization $organization, LessonMaterial $material)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($material->organization_id === $organization->id, 404);

        // ✅ Исправлен баг: используем связь files() вместо несуществующей image
        $this->deleteOldFiles($material);

        $material->delete();

        return Redirect::route('material.index', [
            'organization' => $organization,
        ])->with('success', 'Материал успешно удален');
    }

    public function reorder(LessonMaterialReorderRequest $request, Organization $organization, Lesson $lesson)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($lesson->organization_id === $organization->id, 404);

        $validated = $request->validated();

        // ✅ Один SQL-запрос вместо N запросов в цикле
        $updates = collect($validated['items'])->map(fn($item) => [
            'id'    => $item['id'],
            'order' => $item['order'],
        ])->toArray();

        LessonMaterial::upsert($updates, ['id'], ['order']);

        return back()->with('success', 'Порядок материалов обновлен');
    }

    private function handleFileUpload(LessonMaterial $material, $request): void
    {
        $file = $request->file('image');
        $mime = $file->getMimeType();
        $folder = str_starts_with($mime, 'image/') ? 'lesson_materials/images' : 'lesson_materials/videos';

        $path = $file->store($folder, 'public');

        $material->files()->create([
            'name'      => $file->getClientOriginalName(),
            'path'      => $path,
            'disk'      => 'public',
            'size'      => $file->getSize(),
            'mime_type' => $mime,
            'extension' => $file->getClientOriginalExtension(),
        ]);
    }

    private function deleteOldFiles(LessonMaterial $material): void
    {
        foreach ($material->files as $file) {
            try {
                Storage::disk($file->disk)->delete($file->path);
            } catch (\Exception $e) {
                // Логируем, но не прерываем выполнение
                logger()->error('Failed to delete file: ' . $file->path, ['error' => $e->getMessage()]);
            }
            $file->delete();
        }
    }
}
