<?php
// app/Models/Question.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'question',
        'question_type',
        'options',
        'correct_answers',
        'points',
        'order',
        'questionable_id',
        'questionable_type',
        'metadata',
        'explanation',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answers' => 'array',
        'metadata' => 'array',
        'points' => 'integer',
        'order' => 'integer',
    ];

    protected $attributes = [
        'points' => 1,
        'order' => 0,
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    public function questionable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Boot метод для обновления max_score у родительского задания при изменении вопроса
     */
    protected static function boot()
    {
        parent::boot();

        // Обновляем max_score у LessonTask при сохранении вопроса
        static::saved(function ($question) {
            if ($question->questionable_type === 'App\\Models\\LessonTask' && $question->questionable_id) {
                $lessonTask = LessonTask::find($question->questionable_id);
                if ($lessonTask) {
                    $lessonTask->updateMaxScore();
                }
            }
        });

        // Обновляем max_score у LessonTask при удалении вопроса
        static::deleted(function ($question) {
            if ($question->questionable_type === 'App\\Models\\LessonTask' && $question->questionable_id) {
                $lessonTask = LessonTask::find($question->questionable_id);
                if ($lessonTask) {
                    $lessonTask->updateMaxScore();
                }
            }
        });
    }

}
