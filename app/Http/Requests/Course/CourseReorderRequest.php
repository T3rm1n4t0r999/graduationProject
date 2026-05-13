<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;

class CourseReorderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'items'              => ['required', 'array', 'min:1'],
            'items.*.id'         => ['required', 'integer', 'exists:courses,id'],
            'items.*.order'      => ['required', 'integer', 'min:1'],
        ];
    }
}
