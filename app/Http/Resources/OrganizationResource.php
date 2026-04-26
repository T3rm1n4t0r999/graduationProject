<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class OrganizationResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isOwner = Auth::id() === $this->owner_id;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug ?? null,
            'status' => $this->status,
            'plan' => $this->plan,
            'owner_id' => $this->owner_id,
            'settings' => $this->settings,
            'users' => $this->whenLoaded('users', fn() => UserResource::collection($this->users)),
            'bot' => $this->whenLoaded('bot', fn() => BotResource::collection($this->bot)),
        ];
    }
}
