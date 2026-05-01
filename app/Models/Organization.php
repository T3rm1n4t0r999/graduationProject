<?php

namespace App\Models;

use App\Enums\OrganizationStatus;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

class Organization extends Model implements HasTenants
{
    use HasFactory;
    protected $fillable = [
        'name',
        'owner_id',
        'email',
        'status',
        'settings',
        'plan',
    ];

    protected $casts = [
        'status' => OrganizationStatus::class,
        'settings' => 'array',
    ];


    public function users(): belongsToMany {
        return $this->belongsToMany(User::class, 'organization_user')
                    ->using(OrganizationUser::class)
                    ->withPivot('role', 'is_active', 'joined_at')
                    ->withTimestamps();
    }
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function bot(){
        return $this->hasOne(Bot::class);
    }

    /**
     * Get the tenants that the user can access.
     */
    public function getTenantsForUser(Model $user): Collection
    {
        if (!$user instanceof User) {
            return collect();
        }

        return $user->organizations()
            ->whereIn('organization_user.role', ['owner', 'member'])
            ->wherePivot('is_active', true)
            ->get();
    }

    public function canAccessTenant(Model $tenant): bool
    {
        if (!$tenant instanceof Organization) {
            return false;
        }

        return $this->id === $tenant->user_id || $tenant->users()->where('user_id', $this->id)->exists();
    }

    public function getTenants(Panel $panel): array|Collection
    {
        return $this->organizations()->get();
    }


}
