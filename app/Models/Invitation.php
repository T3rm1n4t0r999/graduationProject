<?php

namespace App\Models;

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
        'limited',
        'accepted_at',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function organization() {
        return $this->belongsTo(Organization::class);
    }

    public function sender() {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
