<?php

namespace App\Http\Controllers\Console;

use App\Enums\OrganizationRole;
use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\Invitation;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GroupInvitationController extends Controller
{
    public function store(Request $request, Organization $organization, Group $group)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);

        $validated = $request->validate([
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
        ]);

        $invitation = Invitation::create([
            'email'           => $validated['email'],
            'sender_id'       => Auth::id(),
            'organization_id' => $organization,
            'type'            => $validated['type'],
            'group_id'        => $group->id,
            'status'          => 'pending',
            'token'           => Str::random(16),
            'expires_at'      => $validated['expires_at'],
            'limited'         => $validated['limited'] ?? false,
        ]);

        return back()->with('success', 'Приглашение создано. Токен: ' . $invitation->token);
    }
}
