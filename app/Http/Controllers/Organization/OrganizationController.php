<?php

namespace App\Http\Controllers\Organization;

use App\Enums\OrganizationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\OrganizationStoreRequest;
use App\Http\Requests\Organization\OrganizationUpdateRequest;
use App\Http\Resources\BotResource;
use App\Http\Resources\InvitationResource;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\UserResource;
use App\Mail\OrganizationVerificationEmail;
use App\Models\Organization;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrganizationController extends Controller
{

    public function store(OrganizationStoreRequest $request)
    {
        $validated = $request->validated();
        $user = Auth::user();
        try {
            return DB::transaction(function () use ($validated, $user) {
                $orgEmail = $validated['email'] ?? null;
                $orgEmailLower = $orgEmail ? Str::lower($orgEmail) : null;
                $userEmailLower = Str::lower($user->email);
                $requiresVerification = $orgEmailLower && $orgEmailLower !== $userEmailLower;

                $organization = Organization::create([
                    'name'       => $validated['name'],
                    'email'      => $userEmailLower,
                    'owner_id'   => $user->id,
                    'status'     => $requiresVerification
                        ? OrganizationStatus::PendingVerification
                        : OrganizationStatus::Active,
                    'settings'   => [],
                    'plan'       => $validated['plan'] ?? 'free',
                ]);

                $organization->users()->attach($user->id, [
                    'role'       => 'owner',
                    'is_active'  => true,
                    'joined_at'  => now(),
                    'invited_at' => now(),
                ]);

                if ($requiresVerification) {
                    $token = $organization->generateEmailVerificationToken();
                    $verificationUrl = route('organization.verify', [
                        'token' => $token,
                        'hash'  => hash_hmac('sha256', $organization->email, config('app.key')),
                    ]);

                    Mail::to($organization->email)->queue(
                        new OrganizationVerificationEmail($organization, $verificationUrl)
                    );
                }

                return back()->with('success', 'Организация создана успешно.');
            });
        }catch(\Exception $e) {
            return back()->with('error', 'Ошибка при создании организации.');
        }


    }

    public function update(OrganizationUpdateRequest $request, Organization $organization){
        $this->authorize('manage', $organization);

        $validated = $request->validated();
        $organization->update($validated);

        return back()->with('success', 'Организация обновлена успешно.');
    }

    /**
     * @throws AuthorizationException
     */
    public function show(Organization $organization){
        $this->authorize('view', $organization);
        $organization->load(['owner']);

        $users = $organization->users()
            ->withPivot('role', 'is_active', 'joined_at')
            ->latest('pivot_joined_at')
            ->paginate(2, ['*'], 'users_page')
            ->withQueryString();

        $bot = $organization->bot;
        $invitations = $organization->invitations;
        $user = Auth::user();
        return Inertia::render('Organization/Show', [
            'organization' => new OrganizationResource($organization),
            'users' => UserResource::collection($users),
            'bot' => $bot ? new BotResource($bot) : null,
            'invitations' => InvitationResource::collection($invitations),
            'isVerified' => $organization->isVerified(),
            'can' => [
                'manage' => $user->can('manage', $organization),
                'delete' => $user->can('delete', $organization),
                'invite' => $user->can('invite', $organization),
                'verify' => $user->can('verify', $organization),
            ],
        ]);
    }

    public function destroy(Organization $organization){
        $this->authorize('delete', $organization);
        $organization->users()->detach();
        $organization->bot()->delete();
        $organization->delete();

        return redirect()->route('dashboard')
            ->with('success', 'Организация удалена');
    }

    public function verifyEmail(Request $request, string $token)
    {

        $organization = Organization::where('email_verification_token', $token)->first();

        if(!$organization){
            return redirect()->route('dashboard')
                ->with('error', 'Неверная ссылка подтверждения.');
        }

        $this->authorize('verify', $organization);

        if ($organization->isVerified()) {
            return redirect()->route('organization.show', $organization)
                ->with('success', 'Организация уже подтверждена.');
        }

        if (!hash_equals($organization->email_verification_token ?? '', $token)) {
            return redirect()->route('dashboard')
                ->with('error', 'Неверная ссылка подтверждения.');
        }

        $expectedHash = hash_hmac('sha256', $organization->email, config('app.key'));
        if (!hash_equals($expectedHash, $request->query('hash', ''))) {
            return redirect()->route('dashboard')
                ->with('error', 'Неверная ссылка подтверждения.');
        }

        $organization->markEmailAsVerified();

        return redirect()->route('organization.show', $organization)
            ->with('success', 'Организация подтверждена! Функционал разблокирован.');
    }

    public function resendVerification(Request $request, Organization $organization)
    {
        if ($organization->isVerified()) {
            return back()->with('success', 'Организация уже подтверждена.');
        }

        $token = $organization->generateEmailVerificationToken();
        $verificationUrl = route('organization.verify', [
            'token' => $token,
            'hash' => hash_hmac('sha256', $organization->email, config('app.key')),
        ]);

        Mail::to($organization->email)->queue(
            new OrganizationVerificationEmail($organization, $verificationUrl)
        );
        return back()->with('success', 'Письмо с подтверждением отправлено повторно.');
    }


}
