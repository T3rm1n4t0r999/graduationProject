<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GroupResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'description'   => $this->description,
            'specialty'     => $this->specialty,
            'code'          => $this->code,
            'students_count'=> $this->whenCounted('students'),
            'students'      => StudentResource::collection($this->whenLoaded('students')),
            'courses'       => GroupCourseResource::collection($this->whenLoaded('courses')),
            'homeworks'     => GroupHomeworkResource::collection($this->whenLoaded('homeworks')),
            'exams'         => GroupExamResource::collection($this->whenLoaded('exams')),
        ];
    }
}
