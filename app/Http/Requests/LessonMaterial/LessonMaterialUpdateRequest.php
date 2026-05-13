<?php

namespace App\Http\Requests\LessonMaterial;

use Illuminate\Foundation\Http\FormRequest;

class LessonMaterialUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:20'],
            'content' => ['nullable', 'string', 'max:200'],
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
            'material_type' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
