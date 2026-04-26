<?php

namespace App\Models;

use App\Enums\OrganizationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    public function bots(){
        return $this->hasOne(Bot::class);
    }
}
