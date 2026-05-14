<?php

namespace App\Http\Requests\Question;

use App\Models\Homework;
use App\Models\LessonTask;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionUpdateRequest extends FormRequest
{

    public function rules(): array
    {
        // Базовые правила всегда
        return [
            'question' => ['required', 'string', 'min:5', 'max:2000'],
            'question_type' => ['required', 'string', Rule::in(['single_choice', 'multiple_choice', 'text'])],
            'points' => ['required', 'integer', 'min:1', 'max:100'],
            'explanation' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
            'questionable_type' => ['required', 'string', Rule::in([LessonTask::class, Homework::class])],
            'questionable_id' => [
                'required', 'integer',
                Rule::exists($this->getQuestionableTable(), 'id')
                    ->where('organization_id', $this->route('organization')->id)
            ],
            'options' => ['required', 'array', 'min:1'],
            'options.*.text' => ['required', 'string', 'min:1'],

            'correct_answers' => ['required', 'array', 'min:1'],
            'correct_answers.*' => ['required', 'string', 'min:1',],
        ];

    }

    private function getQuestionableTable(): string
    {
        return match ($this->input('questionable_type')) {
            LessonTask::class => 'lesson_task',
            Homework::class => 'homeworks',
            default => 'lesson_task',
        };
    }
}
