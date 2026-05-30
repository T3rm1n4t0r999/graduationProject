<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public static $wrap = false;

    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'firstname' => $this->firstname,
            'lastname' => $this->lastname,
            'telegram_id' => $this->telegram_id,
            'score' => $this->score,
            'rank' => $this->rank,
            'organization_id' => $this->organization_id,

            'courses' => $this->whenLoaded('courses'),
            'courses_count'  => $this->whenCounted('courses'),

            'homeworks' => $this->whenLoaded('homeworks'),
            'homeworks_count'  => $this->whenCounted('homeworks'),

            'exams' => $this->whenLoaded('exams'),
            'exams_count'  => $this->whenCounted('exams'),

            'groups' => $this->whenLoaded('groups', function () {
                return $this->groups->map(fn($g) => [
                    'id'   => $g->id,
                    'name' => $g->name,
                ]);
            }),
        ];
    }
}
