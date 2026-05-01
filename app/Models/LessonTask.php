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
    ];

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

        // Обновляем max_score при сохранении LessonTask (если нужно)
        static::saved(function ($lessonTask) {
            // Можно убрать или оставить с осторожностью
            // $lessonTask->updateMaxScore();
        });

        // Обработка событий для связанных вопросов
        static::updated(function ($lessonTask) {
            // Если изменились связанные данные, которые влияют на max_score
            if ($lessonTask->isDirty('max_score')) {
                // Дополнительная логика если нужна
            }
        });
    }
}
