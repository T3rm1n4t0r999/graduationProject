<?php

namespace App\Http\Controllers\Organization;

use App\Enums\OrganizationRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Invitation\GroupInvitationStoreRequest;
use App\Http\Requests\Invitation\InvitationStoreRequest;
use App\Mail\InvitationMail;
use App\Models\Group;
use App\Models\Invitation;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;


class InvitationController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(InvitationStoreRequest $request)
    {
        $validated = $request->validated();
        if (empty($validated['expires_at'])) {
            $validated['expires_at'] = now()->addDays(7);
        }
        try {
            return DB::transaction(function () use ($validated) {
                $invitation = Invitation::create([
                    'email'           => $validated['email'],
                    'sender_id'       => Auth::id(),
                    'organization_id' => $validated['organization_id'],
                    'type'            => $validated['type'],
                    'status'          => 'pending',
                    'token'           => Str::random(16),
                    'expires_at'      => $validated['expires_at'],
                    'limited'         => $validated['limited'] ?? false,
                ]);

                $acceptUrl = route('invitation.accept', ['token' => $invitation->token]);

                Mail::to($invitation->email)->queue(new InvitationMail($invitation, $acceptUrl));

                return back()->with('success', 'Приглашение отправлено на почту.');
            });
        } catch (\Exception $th) {
            return back()->with('error', 'Ошибка отправки приглашения.');
        }
    }

    public function storeForGroup(GroupInvitationStoreRequest $request, Organization $organization, Group $group)
    {
        $this->authorize('consoleAction', $organization);
        abort_unless($group->organization_id === $organization->id, 404);

        $validated = $request->validated();

        $invitation = Invitation::create([
            'organization_id' => $organization->id,
            'group_id'        => $group->id,
            'type'            => OrganizationRole::Student,
            'sender_id'       => auth()->id(),
            'token'           => Str::random(16),
            'limited'         => $validated['limited'],
            'expires_at'      => $validated['expires_at'] ?? now()->addDays(7),
            'email'           => $validated['email'],
            'status'          => 'pending',
        ]);

        return back()->with('success', 'Приглашение в группу создано. Токен: ' . $invitation->token);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invitation $invitation)
    {
        $invitation->delete();
    }

    public function accept(string $token)
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        if ($invitation->status !== 'pending') {
            return redirect()->route('dashboard')
                ->with('error', 'Приглашение уже использовано или отменено.');
        }

        if ($invitation->expires_at && $invitation->expires_at->isPast()) {
            return redirect()->route('dashboard')
                ->with('error', 'Срок действия приглашения истёк.');
        }

        if (auth()->check()) {
            $user = auth()->user();
            if ($user->email !== $invitation->email) {
                return redirect()->route('dashboard')
                    ->with('error', 'Это приглашение предназначено для другого email.');
            }

            // Присоединяем пользователя к организации
            $invitation->organization->users()->attach($user->id, [
                'role'      => $invitation->type,
                'is_active' => true,
                'joined_at' => now(),
            ]);

            $invitation->update(['status' => 'accepted', 'accepted_at' => now()]);

            return redirect()->route('organization.show', $invitation->organization)
                ->with('success', 'Вы присоединились к организации!');
        }

        return redirect()->route('register', ['invitation_token' => $token]);
    }
}
