<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentHomework extends Model
{
    use HasFactory;

    protected $table = 'student_homework';

    protected $fillable = [
        'homework_id',
        'student_id',
        'organization_id'
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    // Отношение к домашнему заданию
    public function homework(): BelongsTo
    {
        return $this->belongsTo(Homework::class, 'homework_id');
    }

    // Отношение к студенту
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
