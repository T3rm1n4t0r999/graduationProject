<?php

namespace App\Http\Requests\LessonTask;

use Illuminate\Foundation\Http\FormRequest;

class LessonTaskStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:200'],
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
