<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $table = 'students';

    protected $fillable = [
        'telegram_id',
        'username',
        'firstname',
        'lastname',
        'role',
        'score',
        'rank',
        'organization_id'
    ];

    protected $casts = [
        'score' => 'integer',
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    public function courses(): HasMany{
        return $this->hasMany(StudentCourse::class);
    }

    public function homeworks(): HasMany{
        return $this->hasMany(StudentHomework::class);
    }
}
