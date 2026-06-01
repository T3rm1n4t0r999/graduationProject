<?php
// app/Models/Homework.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
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

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_homework', 'homework_id', 'group_id')
            ->using(GroupHomework::class)
            ->withPivot('granted_at', 'granted_by')
            ->withTimestamps(false);
    }

    public function students(): HasMany
    {
        return $this->hasMany(StudentHomework::class);
    }


    public static function getMorphType(): string
    {
        return Relation::getMorphAlias(static::class);
    }

    public function recalculateMaxScore(): int
    {
        $totalPoints = $this->questions()
            ->where('is_active', true)
            ->sum('points');

        static::where('id', $this->id)->update(['max_score' => $totalPoints]);
        $this->max_score = $totalPoints;

        return $totalPoints;
    }
}
