<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class LessonMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'order',
        'material_type',
        'lesson_id'
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function files(): MorphMany
    {
        return $this->morphMany(File::class, 'fileable');
    }

    public function getMorphClass(): string
    {
        return 'LessonMaterial';
    }
}
