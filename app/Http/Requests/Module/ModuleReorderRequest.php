<?php

namespace App\Http\Requests\Module;

use Illuminate\Foundation\Http\FormRequest;

class ModuleReorderRequest extends FormRequest
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
