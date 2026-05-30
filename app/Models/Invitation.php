<?php

namespace App\Models;

use App\Enums\OrganizationRole;
use Illuminate\Database\Eloquent\Model;

class Invitation extends Model
{
    protected $fillable = [
        'organization_id',
        'sender_id',
        'email',
        'type',
        'status',
        'token',
        'group_id',
        'limited',
        'accepted_at',
        'expires_at',
    ];

    protected $casts = [
        'type'       => OrganizationRole::class,
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function group() {
        return $this->belongsTo(Group::class);
    }

    public function organization() {
        return $this->belongsTo(Organization::class);
    }

    public function sender() {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
