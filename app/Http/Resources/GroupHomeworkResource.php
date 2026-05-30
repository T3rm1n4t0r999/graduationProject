<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GroupHomeworkResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'homework_id' => $this->homework_id,
            'homework'    => new HomeworkResource($this->whenLoaded('homework')),
            'granted_by'  => $this->granted_by,
            'granted_at'  => $this->granted_at?->format('d.m.Y H:i'),
        ];
    }
}
