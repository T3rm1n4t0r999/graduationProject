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
        'organization_id',
        'order',
        'is_active',
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
        return $this->belongsTo(Course::class, Module::class);
    }

    public function homework(): HasOne{
        return $this->hasOne(Homework::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Lesson $lesson) {
            if (empty($lesson->order)) {
                $lesson->order = static::where('organization_id', $lesson->organization_id)
                        ->where('module_id', $lesson->module_id)
                        ->max('order') + 1;
            }
        });

    }
}
