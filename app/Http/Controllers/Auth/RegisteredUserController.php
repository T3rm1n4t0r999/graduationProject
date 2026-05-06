<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request)
    {
        $invitationData = null;

        if ($request->has('invitation_token')) {
            $invitation = Invitation::where('token', $request->input('invitation_token'))->first();

            if ($invitation && $invitation->status === 'pending' && !$invitation->expires_at->isPast()) {
                $invitationData = [
                    'email' => $invitation->email,
                    'organizationName' => $invitation->organization->name,
                    'token' => $invitation->token,
                ];
            }
        }

        return Inertia::render('Auth/Register', [
            'invitation' => $invitationData,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|confirmed|min:8',
            'invitation_token' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Если пользователь регистрируется по приглашению — сразу верифицируем email
        if ($request->invitation_token) {
            $invitation = Invitation::where('token', $request->invitation_token)->first();

            if ($invitation &&
                $invitation->status === 'pending' &&
                $invitation->email === $user->email &&
                !$invitation->expires_at->isPast()
            ) {
                // Помечаем email как подтверждённый (без отправки письма)
                $user->markEmailAsVerified();

                // Вызываем Registered уже после markEmailAsVerified –
                // слушатель не отправит письмо, т.к. email уже верифицирован
                event(new Registered($user));

                Auth::login($user);

                $invitation->organization->users()->attach($user->id, [
                    'role'      => $invitation->type,
                    'is_active' => true,
                    'joined_at' => now(),
                ]);
                $invitation->update(['status' => 'accepted', 'accepted_at' => now()]);

                return redirect()->route('organization.show', $invitation->organization)
                    ->with('success', 'Вы успешно зарегистрировались и присоединились к организации!');
            }
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
