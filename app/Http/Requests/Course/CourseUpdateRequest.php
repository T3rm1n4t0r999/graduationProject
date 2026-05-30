<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;

class CourseUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:200'],
            'is_active' => ['boolean', 'required'],
            'auto_assign' => ['boolean', 'required'],
        ];
    }

}
