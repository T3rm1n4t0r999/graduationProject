<?php

namespace App\Http\Requests\Question;

use App\Models\Exam;
use App\Models\Homework;
use App\Models\LessonTask;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'min:5', 'max:2000'],
            'question_type' => ['required', 'string', Rule::in(['single_choice', 'multiple_choice', 'text', 'free_text'])],
            'points' => ['required', 'integer', 'min:1', 'max:100'],
            'explanation' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['required', 'boolean'],
            'questionable_type' => ['required', 'string', Rule::in([
                LessonTask::getMorphType(),
                Homework::getMorphType(),
                Exam::getMorphType()
            ])],
            'questionable_id' => [
                'required', 'integer',
                Rule::exists($this->getQuestionableTable(), 'id')
                    ->where('organization_id', $this->route('organization')->id)
            ],
            'options' => [
                Rule::requiredIf(!in_array($this->input('question_type'), ['free_text'])),
                'array',
            ],
            'options.*.text' => [
                Rule::requiredIf(!in_array($this->input('question_type'), ['free_text'])),
                'string', 'min:1'
            ],
            'correct_answers' => [
                Rule::requiredIf(!in_array($this->input('question_type'), ['free_text'])),
                'array',
            ],
            'correct_answers.*' => [
                'string',
            ],
            'image'              => ['nullable', 'image', 'max:2048'], // <-- добавить

        ];
    }

    private function getQuestionableTable(): string
    {
        return match ($this->input('questionable_type')) {
            'lesson_task' => 'lesson_task',
            'homework' => 'homeworks',
            'exam' => 'exams',
            default => 'lesson_task',
        };
    }
}
