<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

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
        'organization_id'
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    protected $casts = [
        'max_score' => 'integer',
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
            if (empty($module->order)) {
                $lessonTask->order = static::where('lesson_id', $lessonTask->lesson_id)
                        ->max('order') + 1;
            }
        });

        static::deleted(function (LessonTask $lessonTask) {
            LessonTask::where('lesson_id', $lessonTask->lesson_id)
                ->where('order', '>', $lessonTask->order)
                ->decrement('order');
        });
    }

    public function recalculateMaxScore(){
        $totalPoints = $this->questions()
            ->where('is_active', true)
            ->sum('points');

        // Обновляем поле max_score в самой модели
        $this->update(['max_score' => $totalPoints]);

        return $totalPoints;
    }
}
