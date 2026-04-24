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
        'status',
        'organization_id'
    ];

    protected $hidden = [
        'token'
    ];

    protected $casts = [
        'status' => 'string',
        'token' => 'encrypted',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
