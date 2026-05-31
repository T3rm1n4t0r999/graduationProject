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
            // ✅ Убрали organization_id, он берется из URL (Route Model Binding)
            'type' => ['required', Rule::enum(OrganizationRole::class)],
            'email' => [
                'required',
                'string',
                Rule::email()->strict(),
                'max:255',
            ],
            'limited' => ['boolean', 'required'],
            'expires_at' => ['date', 'nullable', 'after:today'], // ✅ Исправлена опечатка (было expired_at)
        ]);

        // ✅ 1. Защита от спама: проверяем, нет ли уже активного приглашения на этот email
        $exists = Invitation::where('organization_id', $organization->id)
            ->where('email', $validated['email'])
            ->where('status', 'pending')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();

        if ($exists) {
            return back()->with('error', 'Активное приглашение на этот email уже существует.');
        }

        // ✅ 2. Создание приглашения
        $invitation = Invitation::create([
            'email'           => $validated['email'],
            'sender_id'       => Auth::id(),
            'organization_id' => $organization->id, // ✅ Передаем ID, а не объект модели
            'type'            => $validated['type'], // Enum автоматически скастится в string благодаря $casts в модели
            'group_id'        => $group->id,
            'status'          => 'pending',
            'token'           => Str::random(64), // ✅ Увеличиваем длину токена до 64 символов (защита от брутфорса)
            'expires_at'      => $validated['expires_at'] ?? now()->addDays(7), // ✅ Дефолтное значение 7 дней, если не передано
            'limited'         => $validated['limited'],
        ]);

        // 💡 Примечание: В отличие от основного InvitationController, здесь нет отправки письма через Mail::queue().
        // Если это инвайт-ссылка, которую админ копирует вручную — всё верно.
        // Если письмо должно уходить автоматически, добавьте:
        // $acceptUrl = route('invitation.accept', ['token' => $invitation->token]);
        // Mail::to($invitation->email)->queue(new InvitationMail($invitation, $acceptUrl));

        return back()->with('success', 'Приглашение создано. Токен: ' . $invitation->token);
    }
}
