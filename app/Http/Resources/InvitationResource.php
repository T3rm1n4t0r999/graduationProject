<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvitationResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'email' => $this->email,
            'expires_at' => new Carbon($this->expires_at)->format('Y-m-d'),
            'accepted_at' => $this->accepted_at ? new Carbon($this->accepted_at)->format('Y-m-d') : null,
            'created_at' => new Carbon($this->created_at)->format('Y-m-d'),
        ];
    }
}
