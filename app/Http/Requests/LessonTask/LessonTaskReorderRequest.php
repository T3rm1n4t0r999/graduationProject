<?php

namespace App\Http\Requests\LessonTask;

use Illuminate\Foundation\Http\FormRequest;

class LessonTaskReorderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'items'              => ['required', 'array', 'min:1'],
            'items.*.id'         => ['required', 'integer', 'exists:lesson_task,id'],
            'items.*.order'      => ['required', 'integer', 'min:1'],
        ];
    }
}

