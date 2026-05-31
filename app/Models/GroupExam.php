<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupExam extends Model
{
    protected $table = 'group_exam';
    public $timestamps = false;
    protected $fillable = ['group_id', 'exam_id', 'granted_at', 'granted_by'];
    protected $casts = [
        'granted_at' => 'datetime',
    ];
    public function group(): BelongsTo {
        return $this->belongsTo(Group::class , 'group_id');
    }

    public function exam(): BelongsTo {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    protected static function booted()
    {
        static::created(function ($groupExam) {
            $group = $groupExam->group;
            $group->students->each(function ($student) use ($group, $groupExam) {
                StudentExam::firstOrCreate([
                    'student_id' => $student->id,
                    'exam_id' => $groupExam->exam_id,
                ], [
                    'organization_id' => $group->organization_id,
                    'granted_by' => $groupExam->granted_by ?? 'group',
                    'granted_at' => now(),
                ]);
            });
        });

        static::deleted(function ($groupExam) {
            $group = $groupExam->group;
            $group->students->each(function ($student) use ($groupExam) {
                $student->exams()->where('exam_id', $groupExam->exam_id)->delete();
            });
        });
    }
}
