<?php
// app/Models/StudentProgress.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'progressable_id',
        'progressable_type',
        'student_id',
        'answers',
        'attached_files',
        'points',
        'max_points',
        'metadata',
        'attempt',
        'organization_id'
    ];

    protected $casts = [
        'answers' => 'array',
        'attached_files' => 'array',
        'metadata' => 'array',
        'points' => 'integer',
        'max_points' => 'integer',
        'attempt' => 'integer',
    ];

    protected $attributes = [
        'points' => 0,
        'max_points' => 0,
        'attempt' => 1,
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public static function getNextAttempt($studentId, $progressableType, $progressableId): int
    {
        $lastAttempt = static::where([
            'student_id' => $studentId,
            'progressable_type' => $progressableType,
            'progressable_id' => $progressableId,
        ])->max('attempt');

        return $lastAttempt ? $lastAttempt + 1 : 1;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Автоматически устанавливаем attempt при создании
            if (empty($model->attempt)) {
                $model->attempt = static::getNextAttempt(
                    $model->student_id,
                    $model->progressable_type,
                    $model->progressable_id
                );
            }
        });
    }
}
