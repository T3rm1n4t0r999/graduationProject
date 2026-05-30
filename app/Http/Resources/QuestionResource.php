<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    public static $wrap = false;
    public function toArray($request): array
    {
        $image = $this->image;
        return [
            'id' => $this->id,
            'question' => $this->question,
            'is_active' => $this->is_active,
            'order' =>  $this->order,
            'questionable_type' => $this->questionable_type,
            'questionable_id' => $this->questionable_id,
            'question_type' => $this->question_type,
            'options' => $this->options,
            'correct_answers' => $this->correct_answers,
            'points' => $this->points,
            'explanation' => $this->explanation,
            'image' => $image ? [
                'id'         => $image->id,
                'url'        => $image->url,
                'name'       => $image->name,
                'human_size' => $image->human_size,
                'is_image'   => $image->is_image,
            ] : null,
            'questionable' => $this->whenLoaded('questionable')
        ];
    }
}

