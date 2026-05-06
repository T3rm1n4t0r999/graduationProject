<?php

namespace App\Policies;

use App\Enums\OrganizationRole;
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

    public function view_admin(User $user, Organization $organization): bool
    {
        if (!$organization->isVerified()){
            return false;
        }

        if ($user->id === $organization->owner->id) {
            return true;
        }

        return $organization->users()
            ->where('user_id', $user->id)
            ->wherePivot('is_active', true)
            ->wherePivotIn('role', [OrganizationRole::Manager,OrganizationRole::Owner, OrganizationRole::Teacher])
            ->exists();
    }


    public function manage(User $user, Organization $organization): bool
    {
        return $organization->userIsManagerOrOwner($user);
    }

    public function delete(User $user, Organization $organization): bool
    {
        return $organization->userHasRole($user, [OrganizationRole::Owner->value]);
    }

    public function verify(User $user, Organization $organization): bool
    {
        return $organization->userIsManagerOrOwner($user);
    }

    public function invite(User $user, Organization $organization): bool
    {
        return $organization->userIsManagerOrOwner($user);
    }

}
