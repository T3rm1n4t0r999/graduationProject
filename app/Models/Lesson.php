<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'module_id',
        'organization_id'
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(LessonMaterial::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(LessonTask::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsToThrough(Course::class, Module::class);
    }
}
