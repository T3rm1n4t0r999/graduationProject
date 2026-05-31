<?php

namespace App\Http\Controllers\Organization;

use App\Enums\OrganizationRole;
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
    public function show(Organization $organization)
    {
        // 1. Загружаем аутентифицированного пользователя ОДИН РАЗ (убирает дубль запроса №14)
        $user = Auth::user();

        // 2. Явная авторизация с переданным пользователем (предотвращает внутренний вызов Auth::user())
        $this->authorizeForUser($user, 'view', $organization);

        // 3. Eager loading связей (без изменений)
        $organization->load(['owner', 'bot']);

        // 4. ОДНИМ ЗАПРОСОМ получаем активное членство текущего пользователя в организации
        //    (заменяет 4 EXISTS-запроса политики)
        $membership = $organization->users()
            ->where('users.id', $user->id)
            ->wherePivot('is_active', true)
            ->first();

        $role = $membership?->pivot?->role;

        // 5. Вычисляем права на основе роли, дублируя логику политики
        //    (предполагается: manage и invite – для Manager/Owner, delete и verify – только Owner)
        $can = [
            'manage'  => in_array($role, [OrganizationRole::Manager->value, OrganizationRole::Owner->value], true),
            'delete'  => $role === OrganizationRole::Owner->value,
            'invite'  => in_array($role, [OrganizationRole::Manager->value, OrganizationRole::Owner->value, OrganizationRole::Teacher->value], true),
            'verify'  => in_array($role, [OrganizationRole::Manager->value, OrganizationRole::Owner->value], true),
        ];

        // 6. Пагинация пользователей (без изменений)
        $users = $organization->users()
            ->select(['users.id', 'users.name', 'users.email'])
            ->latest('organization_user.joined_at')
            ->paginate(5, ['users.id', 'users.name', 'users.email'], 'users_page')
            ->withQueryString();

        // 7. Приглашения (без изменений)
        $invitations = $organization->invitations()
            ->select(['id', 'email', 'status', 'group_id', 'created_at'])
            ->with('group:id,name')
            ->latest('created_at')
            ->limit(20)
            ->get();

        return Inertia::render('Organization/Show', [
            'organization' => new OrganizationResource($organization),
            'users'        => UserResource::collection($users),
            'bot'          => $organization->bot ? new BotResource($organization->bot) : null,
            'invitations'  => InvitationResource::collection($invitations),
            'isVerified'   => $organization->isVerified(),
            'can'          => $can,
        ]);
    }

    public function destroy(Organization $organization){
        $this->authorize('delete', $organization);

        // Оборачиваем в транзакцию для надежности, но лишние запросы убираем
        DB::transaction(function () use ($organization) {
            // БД сама удалит бота и записи в organization_user благодаря CASCADE
            $organization->delete();
        });

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
