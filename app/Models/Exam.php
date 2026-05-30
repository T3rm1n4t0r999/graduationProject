<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\Relation;

class Exam extends Model
{
    use HasFactory;

    protected $table = 'exams';

    protected $fillable = [
        'title',
        'description',
        'max_score',
        'module_id',
        'organization_id',
        'is_active',
        'max_attempts',
        'time_limit',
    ];

    protected $casts = [
        'max_score' => 'integer',
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    public function questions(): MorphMany
    {
        return $this->morphMany(Question::class, 'questionable');
    }

    public function studentProgress(): MorphMany
    {
        return $this->morphMany(StudentProgress::class, 'progressable');
    }

    public function students(): HasMany
    {
        return $this->hasMany(StudentExam::class);
    }


    public static function getMorphType(): string
    {
        return Relation::getMorphAlias(static::class);
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
