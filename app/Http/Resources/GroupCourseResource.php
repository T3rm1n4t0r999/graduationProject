<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GroupCourseResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'course_id'  => $this->course_id,
            'course'     => new CourseResource($this->whenLoaded('course')),
            'granted_by' => $this->granted_by,
            'granted_at' => $this->granted_at?->format('d.m.Y H:i'),
        ];
    }
}
