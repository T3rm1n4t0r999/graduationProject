<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

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

//    protected static function boot()
//    {
//        parent::boot();
//
//        static::saved(function ($homework) {
//            $homework->updateMaxScore();
//        });
//    }
}
