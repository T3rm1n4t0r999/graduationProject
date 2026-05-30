<?php

namespace App\Http\Requests\Module;

use Illuminate\Foundation\Http\FormRequest;

class ModuleUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:200'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'is_active' => ['boolean', 'required'],
        ];
    }
}
