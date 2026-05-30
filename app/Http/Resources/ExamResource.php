<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
{
    public static $wrap = false;

    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'max_score' => $this->max_score,
            'module_id' => $this->module_id,
            'is_active' => $this->is_active,
            'time_limit' => $this->time_limit,
            'max_attempts' => $this->max_attempts,
            'questions' => QuestionResource::collection($this->whenLoaded('questions')),
            'questions_count' => $this->whenCounted('questions'),
            'module' => new ModuleResource($this->whenLoaded('module')),
        ];
    }
}
