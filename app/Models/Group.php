<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    protected $fillable = ['organization_id', 'name', 'description', 'specialty', 'code'];

    public function invitations(): HasMany{
        return $this->hasMany(Invitation::class);
    }

    public function organization(): BelongsTo {
        return $this->belongsTo(Organization::class);
    }

    public function students(): BelongsToMany {
        return $this->belongsToMany(Student::class);
    }

    public function courses(): HasMany
    {
        return $this->hasMany(GroupCourse::class, 'group_id');
    }

    public function homeworks(): HasMany
    {
        return $this->hasMany(GroupHomework::class, 'group_id');
    }

    public function exams(): HasMany
    {
        return $this->hasMany(GroupExam::class, 'group_id');
    }
}
