<?php

namespace App\Policies;

use App\Models\Bot;
use App\Models\Organization;
use App\Models\User;

class BotPolicy
{

    public function view(User $user, Bot $bot): bool
    {
        $organization = $bot->organization;
        if (!$organization->isVerified()){
            return false;
        }
        return $user->id === $organization->owner->id;
    }
    public function edit(User $user, Bot $bot): bool
    {
        $organization = $bot->organization;
        if (!$organization->isVerified()){
            return false;
        }
        return $user->id === $organization->owner->id;
    }
    public function update(User $user, Bot $bot): bool
    {
        $organization = $bot->organization;
        if (!$organization->isVerified()){
            return false;
        }
        return $user->id === $organization->owner->id;
    }
}
