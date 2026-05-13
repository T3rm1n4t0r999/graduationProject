<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LessonMaterialResource extends JsonResource
{
    public static $wrap = false;
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'is_active' => $this->is_active,
            'order' => $this->order,
            'lesson_id' => $this->lesson_id,
            'material_type' => $this->material_type,
            'content' => $this->material_type,

//            'lessonTasks'        => LessonTaskResource::collection($this->whenLoaded('lessonTasks')),
//            'lessonTasks_count'  => $this->whenCounted('lessonTasks'),
//            'lessonMaterials'        => LessonMaterialResource::collection($this->whenLoaded('lessonMaterials')),
//            'lessonMaterials_count'  => $this->whenCounted('lessonMaterials'),
        ];
    }
    public function showDetails(bool $show = true): static
    {
        $this->showDetails = $show;
        return $this;
    }
}
