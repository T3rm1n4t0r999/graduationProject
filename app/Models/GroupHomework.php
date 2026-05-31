<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupHomework extends Model
{
    protected $table = 'group_homework';
    public $timestamps = false;
    protected $fillable = ['group_id', 'homework_id', 'granted_at', 'granted_by'];
    protected $casts = [
        'granted_at' => 'datetime',
    ];
    public function group(): BelongsTo {
        return $this->belongsTo(Group::class, 'group_id');
    }

    public function homework(): BelongsTo {
        return $this->belongsTo(Homework::class, 'homework_id');
    }

    protected static function booted()
    {
        static::created(function ($groupHomework) {
            $group = $groupHomework->group;
            $group->students->each(function ($student) use ($group, $groupHomework) {
                StudentHomework::firstOrCreate([
                    'student_id' => $student->id,
                    'homework_id' => $groupHomework->homework_id,
                ], [
                    'organization_id' => $group->organization_id,
                    'granted_by' => $groupHomewor->granted_by ?? 'group',
                    'granted_at' => now(),
                ]);
            });
        });

        static::deleted(function ($groupHomework) {
            $group = $groupHomework->group;
            $group->students->each(function ($student) use ($groupHomework) {
                $student->homeworks()->where('homework_id', $groupHomework->homework_id)->delete();
            });
        });
    }
}
