<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public static $wrap = false;
    public function toArray(Request $request): array
    {
        return [
            'id'    => $this->id,
            'title' => $this->title,
            'is_active' => $this->is_active,
            'order' => $this->order,
            'description' => $this->description,
            'modules'       => ModuleResource::collection($this->whenLoaded('modules')),
            'modules_count' => $this->whenCounted('modules'),
        ];
    }

    public function showDetails(bool $show = true): static
    {
        $this->showDetails = $show;
        return $this;
    }
}

