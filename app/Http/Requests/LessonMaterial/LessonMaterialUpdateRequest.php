<?php

namespace App\Http\Requests\LessonMaterial;

use Illuminate\Foundation\Http\FormRequest;

class LessonMaterialUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title'         => ['required', 'string', 'max:20'],
            'content'       => ['nullable', 'string', 'max:200'],
            'lesson_id'     => ['required', 'integer', 'exists:lessons,id'],
            'material_type' => ['nullable', 'string'],
            'is_active'     => ['nullable', 'boolean'],

            // Файл (изображение или видео)
            'image' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,gif,webp,mp4,avi,mov,mkv',
                'max:20480',
                function ($attribute, $value, $fail) {
                    if ($value && $this->filled('video_url')) {
                        $fail('Нельзя одновременно загружать файл и указывать ссылку на видео.');
                    }
                },
            ],

            // Ссылка на видео
            'video_url' => [
                'nullable',
                'url',
                'max:500',
                function ($attribute, $value, $fail) {
                    if ($value && $this->hasFile('image')) {
                        $fail('Нельзя одновременно загружать файл и указывать ссылку на видео.');
                    }
                },
            ],
        ];
    }
}
