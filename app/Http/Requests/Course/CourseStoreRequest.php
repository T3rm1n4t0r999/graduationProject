<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CourseStoreRequest extends FormRequest
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
