<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LessonTaskResource extends JsonResource
{
    public static $wrap = false;
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'is_active' => $this->is_active,
            'order' => $this->order,
            'max_score' => $this->max_score,
            'lesson_id' => $this->lesson_id,
            'description' => $this->description,
            'max_attempts' => $this->max_attempts,

            'questions'        => QuestionResource::collection($this->whenLoaded('questions')),
            'questions_count'  => $this->whenCounted('questions'),
        ];
    }

}
