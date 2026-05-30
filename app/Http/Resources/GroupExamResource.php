<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GroupExamResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'       => $this->id,
            'exam_id'  => $this->exam_id,
            'exam'     => new ExamResource($this->whenLoaded('exam')),
            'granted_by' => $this->granted_by,
            'granted_at' => $this->granted_at?->format('d.m.Y H:i'),
        ];
    }
}
