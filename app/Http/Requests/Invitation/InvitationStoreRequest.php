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
            'sender_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['required', Rule::enum(OrganizationRole::class)],
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                Rule::email()->strict(),
                'max:255',
            ],
            'status' => 'nullable',
            'accepted_at' => 'nullable',
            'limited' => ['boolean','required'],
            'token' => ['string', 'required'],
            'expired_at' => ['date', 'nullable', 'after:today'],
        ];
    }
}
