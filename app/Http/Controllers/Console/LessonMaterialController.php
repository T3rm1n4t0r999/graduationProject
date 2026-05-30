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

        $lessonMaterials = $organization
            ->LessonMaterials()
            ->get();

        $lessons = $organization
            ->lessons()
            ->get();

        return Inertia::render('Console/LessonMaterial/List', [
            'organization' => new OrganizationResource($organization),
            'lessons'       => LessonResource::collection($lessons),
            'materials'      => LessonMaterialResource::collection($lessonMaterials),
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

        $material = LessonMaterial::create($validated);

        // Сохраняем файл в полиморфной таблице
        if ($request->hasFile('image')) {
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

        return back()->with('success', 'Материал успешно создан');
    }

    /**
     * Display the specified resource.
     */
    public function show(Organization $organization, LessonMaterial $material)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($material->organization_id === $organization->id, 404);

        $lessons = $organization->lessons()->get();

        // Загружаем файлы для материала
        $material->load('files');

        return Inertia::render('Console/LessonMaterial/Show', [
            'organization' => new OrganizationResource($organization),
            'material' => new LessonMaterialResource($material),
            'lessons' => LessonResource::collection($lessons),
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

        // Логика эксклюзивности: файл имеет приоритет
        if ($request->hasFile('image')) {
            $validated['video_url'] = null;   // очищаем ссылку

            // Удаляем все старые файлы
            foreach ($material->files as $file) {
                Storage::disk($file->disk)->delete($file->path);
                $file->delete();
            }

            // Сохраняем новый файл
            $uploadedFile = $request->file('image');
            $mime = $uploadedFile->getMimeType();
            $folder = str_starts_with($mime, 'image/') ? 'lesson_materials/images' : 'lesson_materials/videos';
            $path = $uploadedFile->store($folder, 'public');

            $material->files()->create([
                'name'      => $uploadedFile->getClientOriginalName(),
                'path'      => $path,
                'disk'      => 'public',
                'size'      => $uploadedFile->getSize(),
                'mime_type' => $mime,
                'extension' => $uploadedFile->getClientOriginalExtension(),
            ]);
        } elseif ($request->filled('video_url')) {
            // Удаляем старые файлы, оставляем только ссылку
            foreach ($material->files as $file) {
                Storage::disk($file->disk)->delete($file->path);
                $file->delete();
            }
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

        // Удаляем изображение если оно есть через полиморфную связь
        $image = $material->image;
        if ($image) {
            try {
                Storage::disk($image->disk)->delete($image->path);
            } catch (\Exception $e) {
                // Игнорируем ошибки удаления
            }
            $image->delete();
        }

        $material->delete();

        return Redirect::route('material.index', [
            'organization' => new OrganizationResource($organization),
        ])->with('success', 'Материал успешно удален');
    }

    public function reorder(ModuleReorderRequest $request, Organization $organization, Lesson $lesson)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($lesson->organization_id === $organization->id, 404);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $lesson) {
            foreach ($validated['items'] as $item) {
                LessonMaterial::where('id', $item['id'])
                    ->where('lesson_id', $lesson->id)
                    ->update(['order' => $item['order']]);
            }
        });

        return back()->with('success', 'Порядок материалов обновлен');
    }
}
