<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    public static $wrap = false;

    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'is_active' => $this->is_active,
            'order' => $this->order,
            'description' => $this->description,
            'module_id' => $this->module_id,

            'tasks'        => LessonTaskResource::collection($this->whenLoaded('tasks')),
            'tasks_count'  => $this->whenCounted('tasks'),
            'materials'        => LessonMaterialResource::collection($this->whenLoaded('materials')),
            'materials_count'  => $this->whenCounted('materials'),
        ];
    }
}
