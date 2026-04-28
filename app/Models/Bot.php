<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bot extends Model
{
    use HasFactory;
    protected $table = 'bots';
    protected $fillable = [
        'name',
        'token',
        'is_active',
        'organization_id'
    ];

    protected $hidden = [
        'token'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'token' => 'encrypted',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
