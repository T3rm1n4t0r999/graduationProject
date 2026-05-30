<?php
// app/Models/Homework.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\Relation;

class Homework extends Model
{
    use HasFactory;

    protected $table = 'homeworks';

    protected $fillable = [
        'title',
        'description',
        'max_score',
        'lesson_id',
        'organization_id',
        'max_attempts',
        'is_active',
    ];

    protected $casts = [
        'max_score' => 'integer',
    ];

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }

    public function questions(): MorphMany
    {
        return $this->morphMany(Question::class, 'questionable');
    }

    public function studentProgress(): MorphMany
    {
        return $this->morphMany(StudentProgress::class, 'progressable');
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

//    protected static function boot()
//    {
//        parent::boot();
//
//        static::saved(function ($homework) {
//            $homework->updateMaxScore();
//        });
//    }
}
