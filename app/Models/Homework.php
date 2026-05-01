<?php
// app/Models/Homework.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Homework extends Model
{
    use HasFactory;

    protected $table = 'homeworks';

    protected $fillable = [
        'title',
        'description',
        'max_score',
        'task_id',
    ];

    protected $casts = [
        'max_score' => 'integer',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(LessonTask::class, 'task_id');
    }

    public function questions(): MorphMany
    {
        return $this->morphMany(Question::class, 'questionable');
    }

    public function studentProgress(): MorphMany
    {
        return $this->morphMany(StudentProgress::class, 'progressable');
    }

    protected static function boot()
    {
        parent::boot();

        static::saved(function ($homework) {
            $homework->updateMaxScore();
        });
    }
}
