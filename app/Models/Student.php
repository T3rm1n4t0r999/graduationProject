<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_student', 'student_id', 'group_id');
    }

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    public function courses(): HasMany{
        return $this->hasMany(StudentCourse::class);
    }

    public function homeworks(): HasMany{
        return $this->hasMany(StudentHomework::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(StudentExam::class);
    }

    public function progresses(): HasMany
    {
        return $this->hasMany(StudentProgress::class);
    }
}
