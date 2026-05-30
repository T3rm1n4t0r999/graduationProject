<?php

namespace App\Http\Requests\Invitation;

use App\Enums\OrganizationRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InvitationStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'type' => ['required', Rule::enum(OrganizationRole::class)],
            'email' => [
                'required',
                'string',
                Rule::email()->strict(),
                'max:255',
            ],
            'limited' => ['boolean','required'],
            'expired_at' => ['date', 'nullable', 'after:today'],
        ];
    }
}
