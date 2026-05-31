<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentHomework extends Model
{
    use HasFactory;

    protected $table = 'student_homeworks';

    protected $fillable = [
        'homework_id',
        'student_id',
        'organization_id',
        'granted_by',
        'granted_at',
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

    protected static function booted()
    {
        static::created(function ($groupHomework) {
            // ✅ 1 запрос: получаем только ID студентов, не загружая Eloquent-модели
            $studentIds = $groupHomework->group()->students()->pluck('id');
            if ($studentIds->isEmpty()) return;

            // ✅ Получаем organization_id без загрузки всей модели Group
            $organizationId = $groupHomework->group()->value('organization_id');

            $now = now();
            $grantedBy = $groupHomework->granted_by ?? 'group'; // ✅ Исправлена опечатка!

            // ✅ Формируем массив для пакетной вставки
            $data = $studentIds->map(fn($studentId) => [
                'student_id'      => $studentId,
                'homework_id'     => $groupHomework->homework_id,
                'organization_id' => $organizationId,
                'granted_by'      => $grantedBy,
                'granted_at'      => $now,
            ])->toArray();

            // ✅ 1 SQL-запрос вместо 200!
            StudentHomework::upsert(
                $data,
                ['student_id', 'homework_id'],
                ['granted_by', 'granted_at']
            );
        });

        static::deleted(function ($groupHomework) {
            $studentIds = $groupHomework->group()->students()->pluck('id');
            if ($studentIds->isEmpty()) return;

            // ✅ 1 SQL-запрос вместо N запросов в цикле
            StudentHomework::whereIn('student_id', $studentIds)
                ->where('homework_id', $groupHomework->homework_id)
                ->delete();
        });
    }
}
