<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupCourse extends Model
{
    protected $table = 'group_course';
    public $timestamps = false;
    protected $fillable = ['group_id', 'course_id', 'granted_at', 'granted_by'];
    protected $casts = [
        'granted_at' => 'datetime',
    ];
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    protected static function booted()
    {
        static::created(function ($groupCourse) {
            $group = $groupCourse->group;
            $group->students->each(function ($student) use ($group, $groupCourse) {
                StudentCourse::firstOrCreate([
                    'student_id' => $student->id,
                    'course_id' => $groupCourse->course_id,
                ], [
                    'organization_id' => $group->organization_id,
                    'granted_by' => $groupCourse->granted_by ?? 'group',
                    'granted_at' => now(),
                ]);
            });
        });

        static::deleted(function ($groupCourse) {
            $group = $groupCourse->group;
            $group->students->each(function ($student) use ($groupCourse) {
                $student->courses()->where('course_id', $groupCourse->course_id)->delete();
            });
        });
    }
}
