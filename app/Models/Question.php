<?php
// app/Models/Question.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Log;

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
        'organization_id',
        'is_active',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answers' => 'array',
        'metadata' => 'array',
        'points' => 'integer',
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'points' => 1,
        'order' => 0,
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    public function imageFile(): MorphOne
    {
        return $this->morphOne(File::class, 'fileable')->where('mime_type', 'LIKE', 'image/%');
    }

    public function getImageAttribute(): ?File
    {
        return $this->imageFile()->first();
    }

// app/Models/Question.php
    public function files(): MorphMany
    {
        return $this->morphMany(File::class, 'fileable');
    }

    public function getMorphClass(): string
    {
        return 'Question';
    }

    public function questionable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Boot метод для обновления max_score у родительского задания при изменении вопроса
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Question $question) {
            if (empty($question->order)) {
                $question->order = static::where('questionable_type', $question->questionable_type)
                        ->where('questionable_id', $question->questionable_id)
                        ->max('order') + 1;
            }
        });

        static::created(function (Question $question) {
            static::updateParentMaxScore($question->questionable_type, $question->questionable_id);
        });

        static::deleted(function (Question $question) {
            static::where('questionable_type', $question->questionable_type)
                ->where('questionable_id', $question->questionable_id)
                ->where('order', '>', $question->order)
                ->decrement('order');
            static::updateParentMaxScore($question->questionable_type, $question->questionable_id);
        });

        static::updating(function (Question $question) {
            $question->order = static::where('questionable_type', $question->questionable_type)
                    ->where('questionable_id', $question->questionable_id)
                    ->max('order') + 1;
        });

        static::updated(function (Question $question) {
            $original = $question->getOriginal();
            $oldParentType = $original['questionable_type'] ?? null;
            $oldParentId   = $original['questionable_id'] ?? null;
            $newParentType = $question->questionable_type;
            $newParentId   = $question->questionable_id;

            // 1. Изменился родительский элемент
            if ($oldParentType !== $newParentType || $oldParentId !== $newParentId) {
                if ($oldParentType && $oldParentId) {
                    static::updateParentMaxScore($oldParentType, $oldParentId);
                }
                if ($newParentType && $newParentId) {
                    static::updateParentMaxScore($newParentType, $newParentId);
                }
            }
            // 2. Изменились баллы, но родитель остался тем же
            elseif ($question->isDirty('points')) {
                if ($newParentType && $newParentId) {
                    static::updateParentMaxScore($newParentType, $newParentId);
                }
            }
        });
    }

    /**
     * Обновление max_score у полиморфного родителя
     */
    protected static function updateParentMaxScore(string $type, int $id): void
    {
        $modelClass = Relation::getMorphedModel($type) ?: $type;
        $parent = $modelClass::find($id);
        if ($parent && method_exists($parent, 'recalculateMaxScore')) {
            $parent->recalculateMaxScore();
        }
    }

}
