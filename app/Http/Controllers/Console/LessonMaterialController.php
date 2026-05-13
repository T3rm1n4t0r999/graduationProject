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
use App\Models\Lesson;
use App\Models\LessonMaterial;
use App\Models\LessonTask;
use App\Models\Organization;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
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
        LessonMaterial::create($validated);

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
