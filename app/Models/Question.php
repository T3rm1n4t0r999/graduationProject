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
        if ($this->relationLoaded('imageFile')) {
            return $this->getRelation('imageFile');
        }
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

    public static function normalizeMorphType(?string $type): ?string
    {
        if (!$type) return null;

        // Если передан полный класс — пытаемся получить алиас
        if (class_exists($type)) {
            $alias = array_search($type, Relation::morphMap(), true);
            return $alias ?: $type;
        }

        // Если передан алиас — возвращаем как есть
        return $type;
    }

    /**
     * ✅ Единый способ получить следующий order для родителя
     */
    public static function getNextOrder(string $questionableType, int $questionableId): int
    {
        $normalizedType = self::normalizeMorphType($questionableType);

        $max = static::where('questionable_type', $normalizedType)
            ->where('questionable_id', $questionableId)
            ->max('order');

        return ($max ?? 0) + 1;
    }


    /**
     * Boot метод для обновления max_score у родительского задания при изменении вопроса
     */
    protected static function boot(): void
    {
        parent::boot();

        // ✅ Нормализуем questionable_type перед сохранением
        static::saving(function (Question $question) {
            if ($question->questionable_type) {
                $question->questionable_type = self::normalizeMorphType($question->questionable_type);
            }
        });

        static::creating(function (Question $question) {
            if (empty($question->order)) {
                $question->order = self::getNextOrder(
                    $question->questionable_type,
                    $question->questionable_id
                );
            }
        });

        static::created(function (Question $question) {
            self::updateParentMaxScore($question->questionable_type, $question->questionable_id);
        });

        static::deleted(function (Question $question) {
            // ❌ Убран decrement('order') — он вызывал блокировки БД
            self::updateParentMaxScore($question->questionable_type, $question->questionable_id);
        });

        static::updated(function (Question $question) {
            $original = $question->getOriginal();
            $oldParentType = self::normalizeMorphType($original['questionable_type'] ?? null);
            $oldParentId   = $original['questionable_id'] ?? null;
            $newParentType = $question->questionable_type; // уже нормализован в saving
            $newParentId   = $question->questionable_id;

            if ($oldParentType !== $newParentType || $oldParentId !== $newParentId) {
                if ($oldParentType && $oldParentId) {
                    self::updateParentMaxScore($oldParentType, $oldParentId);
                }
                if ($newParentType && $newParentId) {
                    self::updateParentMaxScore($newParentType, $newParentId);
                }
            } elseif ($question->isDirty('points') || $question->isDirty('is_active')) {
                if ($newParentType && $newParentId) {
                    self::updateParentMaxScore($newParentType, $newParentId);
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
