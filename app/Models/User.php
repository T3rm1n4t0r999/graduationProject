<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\OrganizationRole;
use App\Enums\UserStatus;
use App\Notifications\CustomVerifyEmail;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

class User extends Authenticatable implements HasTenants, FilamentUser, MustVerifyEmail
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

    public function getTenants(Panel $panel): Collection
    {
        return $this->organizations()
            ->wherePivot('is_active', true)
            ->wherePivotIn('role', [OrganizationRole::Manager,OrganizationRole::Owner, OrganizationRole::Teacher]) // 👈 добавлены нужные роли
            ->get();
    }

    public function canAccessTenant(Model $tenant): bool
    {
        if (!$tenant instanceof Organization) {
            return false;
        }

        return $this->organizations()
            ->where('organizations.id', $tenant->id)
            ->wherePivot('is_active', true)
            ->wherePivotIn('role', [OrganizationRole::Manager,OrganizationRole::Owner, OrganizationRole::Teacher])
            ->exists();
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->getTenants($panel)->isNotEmpty();
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new CustomVerifyEmail);
    }
}
