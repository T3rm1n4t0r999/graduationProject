<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'course_id',
        'organization_id',
        'order',
        'is_active',
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    /**
     * Курс модуля
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lessons(): HasMany{
        return $this->hasMany(Lesson::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Module $module) {
            if (empty($module->order)) {
                $module->order = static::where('course_id', $module->course_id)
                        ->max('order') + 1;
            }
        });

        static::deleted(function (Module $module) {
            Module::where('course_id', $module->course_id)
                ->where('order', '>', $module->order)
                ->decrement('order');
        });
    }
}
