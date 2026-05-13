<?php

namespace App\Models;

use App\Enums\OrganizationRole;
use App\Enums\OrganizationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Str;

class Organization extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'owner_id',
        'email',
        'status',
        'settings',
        'plan',
        'email_verified_at',
        'email_verification_token',
    ];

    protected $casts = [
        'status' => OrganizationStatus::class,
        'settings' => 'array',
    ];

    protected $hidden = [
        'email_verification_token',
    ];

    public function userIsManagerOrOwner(User $user): bool
    {
        return $this->userHasRole($user, [
            OrganizationRole::Manager->value,
            OrganizationRole::Owner->value
        ]);
    }

    public function userHasRole(User $user, array $roles): bool
    {
        return $this->users()
            ->where('users.id', $user->id)
            ->wherePivot('is_active', true)
            ->wherePivotIn('role', $roles)
            ->exists();
    }

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
        return $this->hasMany(Invitation::class);
    }

    public function courses(): HasMany{
        return $this->hasMany(Course::class);
    }

    public function modules(): HasMany{
        return $this->hasMany(Module::class);
    }

    public function lessons(): HasMany{
        return $this->hasMany(Lesson::class);
    }

    public function lessonTasks(): HasMany{
        return $this->hasMany(LessonTask::class);
    }

    public function questions(): HasMany{
        return $this->hasMany(Question::class);
    }

    public function homeworks(): HasMany{
        return $this->hasMany(Homework::class);
    }



    /**
     * Get the tenants that the user can access.
     */

    public function isVerified(): bool
    {
        return $this->status->isVerified();
    }

    public function isPendingVerification(): bool
    {
        return $this->status->isPending();
    }

    public function generateEmailVerificationToken(): string
    {
        $this->email_verification_token = hash_hmac('sha256', Str::random(40), config('app.key'));
        $this->save();
        return $this->email_verification_token;
    }

    public function markEmailAsVerified(): bool
    {
        if ($this->isVerified()) {
            return false;
        }

        $this->forceFill([
            'status' => OrganizationStatus::Active,
            'email_verified_at' => now(),
            'email_verification_token' => null,
        ])->save();

        return true;
    }

    public function scopeVerified($query)
    {
        return $query->where('status', OrganizationStatus::Active);
    }

}
