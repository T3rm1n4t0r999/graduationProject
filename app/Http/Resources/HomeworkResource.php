<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class HomeworkResource extends JsonResource
{
    public static $wrap = false;

    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'max_score' => $this->max_score,
            'lesson_id' => $this->lesson_id,
            'is_active' => $this->is_active,

            'questions' => QuestionResource::collection($this->whenLoaded('questions')),
            'questions_count' => $this->whenCounted('questions'),
            'lesson' => new LessonResource($this->whenLoaded('lesson')),
        ];
    }
}
