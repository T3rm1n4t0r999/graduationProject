<?php

namespace App\Http\Controllers;

use App\Models\Invitations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InvitationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'email' => 'required|email',
            'type' => 'required|in:student,teacher', // Добавьте свои правила
            'expires_at' => 'nullable|date|after:today',
        ]);

        if (empty($validated['expires_at'])) {
            $validated['expires_at'] = now()->addDays(7);
        }

        $invitation = Invitations::create([
            'email' => $validated['email'],
            'sender_id' => Auth::id(),
            'organization_id' => $request['organization_id'],
            'type' => $validated['type'],
            'status' => 'pending',
            'token' => Str::random(16),
            'expires_at' => $validated['expires_at'],
        ]);

        return back()->with('success', 'Приглашение создано успешно.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
