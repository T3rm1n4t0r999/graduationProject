<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\Relation;

class LessonTask extends Model
{
    use HasFactory;

    protected $table = 'lesson_task';

    protected $fillable = [
        'title',
        'description',
        'max_score',
        'lesson_id',
        'order',
        'is_active',
        'max_attempts',
        'organization_id'
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    protected $casts = [
        'max_score' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Связь с уроком
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /**
     * Полиморфная связь с вопросами
     */
    public function questions(): MorphMany
    {
        return $this->morphMany(Question::class, 'questionable');
    }


    public static function getMorphType(): string
    {
        return Relation::getMorphAlias(static::class);
    }

    /**
     * Полиморфная связь с прогрессом студентов
     */
    public function studentProgress(): MorphMany
    {
        return $this->morphMany(StudentProgress::class, 'progressable');
    }

    /**
     * Boot метод для автоматического обновления max_score
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function (LessonTask $lessonTask) {
            if (empty($lessonTask->order)) {
                $lessonTask->order = static::where('lesson_id', $lessonTask->lesson_id)
                        ->max('order') + 1;
            }
        });
    }

    public function recalculateMaxScore(): int
    {
        $totalPoints = $this->questions()
            ->where('is_active', true)
            ->sum('points');

        static::where('id', $this->id)->update(['max_score' => $totalPoints]);
        $this->max_score = $totalPoints;

        return $totalPoints;
    }
}
