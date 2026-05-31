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
        'organization_id',
        'checked',
        'checked_by'
    ];

    protected $casts = [
        'answers' => 'array',
        'attached_files' => 'array',
        'metadata' => 'array',
        'points' => 'integer',
        'max_points' => 'integer',
        'attempt' => 'integer',
        'checked' => 'boolean',
    ];

    protected $attributes = [
        'points' => 0,
        'max_points' => 0,
        'attempt' => 1,
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    public function progressable(): MorphTo
    {
        return $this->morphTo();
    }

    public function checkedBy(): BelongsTo{
        return $this->belongsTo(User::class, 'checked_by');
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
            if (empty($model->attempt)) {
                $model->attempt = static::getNextAttempt(
                    $model->student_id,
                    $model->progressable_type,
                    $model->progressable_id
                );
            }
        });

        static::updated(function (StudentProgress $progress) {
            $wasChecked = (bool) $progress->getOriginal('checked');
            $isChecked = (bool) $progress->checked;

            // ✅ Баллы учитываются в рейтинге ТОЛЬКО если работа проверена
            $oldPoints = $wasChecked ? (int) $progress->getOriginal('points') : 0;
            $newPoints = $isChecked ? (int) $progress->points : 0;

            $diffPoints = $newPoints - $oldPoints;

            // ✅ Прямой запрос к БД избегает загрузки модели Student и рекурсии событий
            if ($diffPoints !== 0 && $progress->student_id) {
                Student::where('id', $progress->student_id)->increment('score', $diffPoints);
            }
        });

        static::deleted(function (StudentProgress $progress) {
            // ✅ Если удаляется проверенная работа, баллы должны списаться
            if ($progress->checked && $progress->student_id) {
                Student::where('id', $progress->student_id)->decrement('score', $progress->points);
            }
        });
    }
}
