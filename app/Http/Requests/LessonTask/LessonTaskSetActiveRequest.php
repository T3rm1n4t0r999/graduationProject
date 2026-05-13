<?php

namespace App\Http\Requests\LessonTask;

use Illuminate\Foundation\Http\FormRequest;

class LessonTaskSetActiveRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
        ];
    }
}
