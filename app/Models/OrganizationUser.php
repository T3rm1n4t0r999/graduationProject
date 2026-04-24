<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class OrganizationUser extends Pivot
{
    use HasFactory;
    protected $table = 'organization_user';

    protected $fillable = [
        'user_id',
        'organization_id',
        'role',
        'invited_at',
        'joined_at',
        'is_active',
    ];
}
