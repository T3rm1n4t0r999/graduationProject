<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'organization_id'
    ];

    public function modules(): HasMany{
        return $this->hasMany(Module::class);
    }

    public function organization(): BelongsTo{
        return $this->belongsTo(Organization::class);
    }
}
