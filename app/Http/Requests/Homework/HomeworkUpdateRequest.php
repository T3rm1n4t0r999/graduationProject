<?php

namespace App\Http\Requests\Homework;

use Illuminate\Foundation\Http\FormRequest;

class HomeworkUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
