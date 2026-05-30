<?php

namespace App\Http\Requests\Lesson;

use Illuminate\Foundation\Http\FormRequest;

class LessonUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:200'],
            'module_id' => ['required', 'integer', 'exists:modules,id'],
            'is_active' => ['boolean', 'required'],
        ];
    }
}
