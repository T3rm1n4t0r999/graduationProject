<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ModuleResource extends JsonResource
{
    public static $wrap = false;

    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'is_active' => $this->is_active,
            'order'       => $this->order,
            'description' => $this->description,
            'course_id' => $this->course_id,
            'lessons'        => LessonResource::collection($this->whenLoaded('lessons')),
            'lessons_count'  => $this->whenCounted('lessons'),
        ];
    }

}
