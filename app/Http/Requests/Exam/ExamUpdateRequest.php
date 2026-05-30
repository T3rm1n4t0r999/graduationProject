<?php

namespace App\Http\Requests\Exam;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExamUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'module_id'   => [
                'required',
                'integer',
                'exists:modules,id',
                Rule::unique('exams', 'module_id')
                    ->ignore($this->exam->id)
                    ->where(function ($query) {
                        return $query->where('organization_id', $this->route('organization')->id);
                    }),
            ],
            'max_attempts' => ['nullable', 'integer'],
            'is_active' => ['required', 'boolean'],
            'time_limit' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
