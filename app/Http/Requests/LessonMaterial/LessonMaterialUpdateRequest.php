<?php

namespace App\Http\Requests\LessonMaterial;

use Illuminate\Foundation\Http\FormRequest;

class LessonMaterialUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:200'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
        ];
    }
}
