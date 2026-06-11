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

        // Используем saved вместо updated, чтобы корректно отрабатывало и при создании, и при обновлении
        static::saved(function (StudentProgress $progress) {
            if (!$progress->student_id) {
                return;
            }

            // 1. Находим лучший результат среди ВСЕХ проверенных попыток этого задания (включая текущую)
            $newMax = static::where('student_id', $progress->student_id)
                ->where('progressable_type', $progress->progressable_type)
                ->where('progressable_id', $progress->progressable_id)
                ->where('checked', true)
                ->max('points') ?? 0;

            // 2. Находим лучший результат среди ДРУГИХ проверенных попыток этого задания
            $otherMax = static::where('student_id', $progress->student_id)
                ->where('progressable_type', $progress->progressable_type)
                ->where('progressable_id', $progress->progressable_id)
                ->where('id', '!=', $progress->id) // Исключаем текущую запись
                ->where('checked', true)
                ->max('points') ?? 0;

            // 3. Вспоминаем, сколько давала ЭТА попытка до сохранения
            $thisAttemptOldPoints = (int) $progress->getOriginal('points');

            // 4. Старый максимум для этого задания = max(старые очки этой попытки, лучшие очки других попыток)
            $oldMax = max($thisAttemptOldPoints, $otherMax);

            // 5. Считаем разницу и обновляем общий рейтинг студента
            $diffPoints = (int) $newMax - (int) $oldMax;

            if ($diffPoints !== 0) {
                Student::where('id', $progress->student_id)->increment('score', $diffPoints);
            }
        });

        static::deleted(function (StudentProgress $progress) {
            if (!$progress->student_id) {
                return;
            }

            // При удалении "другие попытки" становятся "всеми оставшимися"
            $newMax = static::where('student_id', $progress->student_id)
                ->where('progressable_type', $progress->progressable_type)
                ->where('progressable_id', $progress->progressable_id)
                ->where('checked', true)
                ->max('points') ?? 0;

            $wasChecked = (bool) $progress->checked;
            $thisAttemptOldPoints = $wasChecked ? (int) $progress->points : 0;

            $oldMax = max($thisAttemptOldPoints, $newMax);

            $diffPoints = (int) $newMax - (int) $oldMax;

            if ($diffPoints !== 0) {
                Student::where('id', $progress->student_id)->increment('score', $diffPoints);
            }
        });
    }
}
