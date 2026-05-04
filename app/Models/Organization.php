<?php

namespace App\Models;

use App\Enums\OrganizationStatus;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
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

    public function invitations(): HasMany{
        return $this->hasMany(Invitations::class);
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

        // Проверяем, есть ли у текущего пользователя доступ к этой организации
        // $this в данном контексте - это пользователь (User), так как метод вызывается на экземпляре User
        // Но так как этот метод определен в модели Organization, нам нужно получить текущего пользователя из auth
        $user = auth()->user();

        if (!$user instanceof User) {
            return false;
        }

        return $user->organizations()
            ->where('organizations.id', $tenant->id)
            ->whereIn('organization_user.role', ['owner', 'member'])
            ->wherePivot('is_active', true)
            ->exists();
    }

    public function getTenants(Panel $panel): array|Collection
    {
        $user = auth()->user();

        if (!$user instanceof User) {
            return collect();
        }

        return $user->organizations()
            ->whereIn('organization_user.role', ['owner', 'member'])
            ->wherePivot('is_active', true)
            ->get();
    }


}
