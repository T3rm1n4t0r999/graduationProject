<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserStatus;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements HasTenants
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',

    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_verified_at',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function organizations(): BelongsToMany
    {
        return $this->BelongsToMany(Organization::class, 'organization_user')
                    ->using(OrganizationUser::class) // Кастомный Pivot
                    ->withPivot('role', 'is_active', 'joined_at')
                    ->withTimestamps();
    }

    public function getOrganizationById(int $organizationId)
    {
        return $this->organizations()
            ->where('organizations.id', $organizationId)
            ->whereIn('organization_user.role', ['owner', 'member'])
            ->wherePivot('is_active', true)
            ->first();
    }

    public function canAccessTenant(Model $tenant): bool
    {
        if (!$tenant instanceof Organization) {
            return false;
        }

        return $this->organizations()
            ->where('organizations.id', $tenant->id)
            ->whereIn('organization_user.role', ['owner', 'member'])
            ->wherePivot('is_active', true)
            ->exists();
    }

    public function getTenants(Panel $panel): Collection
    {
        return $this->organizations()
            ->whereIn('organization_user.role', ['owner', 'member'])
            ->wherePivot('is_active', true)
            ->get();
    }
}
