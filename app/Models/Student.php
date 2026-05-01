<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $table = 'students';

    protected $fillable = [
        'telegram_id',
        'username',
        'firstname',
        'lastname',
        'role',
        'score',
        'rank',
    ];

    protected $casts = [
        'score' => 'integer',
    ];
}
