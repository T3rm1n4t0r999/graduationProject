<?php

namespace App\Http\Requests\LessonMaterial;

use Illuminate\Foundation\Http\FormRequest;

class LessonMaterialReorderRequest extends FormRequest
{

    public function rules(): array
    {
        return [
            'items'              => ['required', 'array', 'min:1'],
            'items.*.id'         => ['required', 'integer', 'exists:lesson_materials,id'],
            'items.*.order'      => ['required', 'integer', 'min:1'],
        ];
    }
}
