<?php

namespace App\Http\Requests\Question;

use Illuminate\Foundation\Http\FormRequest;

class QuestionReorderRequest extends FormRequest
{

    public function rules(): array
    {
        return [
            'items'              => ['required', 'array', 'min:1'],
            'items.*.id'         => ['required', 'integer', 'exists:modules,id'],
            'items.*.order'      => ['required', 'integer', 'min:1'],
        ];
    }
}
