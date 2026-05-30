<?php

namespace App\Http\Requests\Homework;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HomeworkStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'lesson_id'   => [
                'required',
                'integer',
                'exists:lessons,id',
                Rule::unique('homeworks', 'lesson_id')->where(function ($query) {
                    return $query->where('organization_id', $this->route('organization')->id);
                }),
            ],
            'max_attempts' => ['nullable', 'integer'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
