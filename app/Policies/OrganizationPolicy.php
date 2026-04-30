<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\User;

class OrganizationPolicy
{

    public function view(User $user, Organization $organization): bool
    {
        if ($user->id === $organization->owner->id) {
            return true;
        }

        return $organization->users()
            ->where('user_id', $user->id)
            ->wherePivot('is_active', true)
            ->exists();
    }
}
