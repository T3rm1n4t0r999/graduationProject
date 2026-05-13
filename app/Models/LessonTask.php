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

        // Обновляем max_score при сохранении LessonTask
        static::saved(function ($lessonTask) {
            $lessonTask->updateMaxScore();
        });

        // Обновляем max_score при удалении LessonTask
        static::deleted(function ($lessonTask) {
            // Логика при удалении если нужна
        });
    }

    /**
     * Обновить max_score на основе суммы баллов всех вопросов
     */
    public function updateMaxScore(): void
    {
        $totalScore = $this->questions()->sum('points');

        if ($this->max_score !== $totalScore) {
            $this->update(['max_score' => $totalScore]);
        }
    }
}
