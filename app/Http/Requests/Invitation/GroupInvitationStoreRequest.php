<?php

namespace App\Http\Requests\Invitation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GroupInvitationStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', Rule::email()->strict(), 'max:255'],
            'limited' => ['boolean', 'required'],
            'expires_at' => ['date', 'nullable', 'after:today'],
        ];
    }
}
