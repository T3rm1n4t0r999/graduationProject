<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,

            // Pivot-поля доступны только при загрузке через belongsToMany
            'role' => $this->when(isset($this->pivot), $this->pivot->role ?? null),
            'is_active' => $this->when(isset($this->pivot), (bool) $this->pivot->is_active),
            'joined_at' => (new Carbon($this->when(isset($this->pivot), $this->pivot->joined_at)))->format('Y-m-d'),
        ];
    }
}
