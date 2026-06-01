<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'organization_id',
        'order',
        'is_active',
        'auto_assign'
    ];

    protected $casts = [
        'auto_assign' => 'boolean',
    ];

    public function modules(): HasMany{
        return $this->hasMany(Module::class);
    }

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(StudentCourse::class);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_course', 'course_id', 'group_id')
            ->using(GroupCourse::class)
            ->withPivot('granted_at', 'granted_by')
            ->withTimestamps(false);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Course $course) {
            if (empty($course->order)) {
                $course->order = static::where('organization_id', $course->organization_id)->max('order') + 1;
            }
        });
    }
}
