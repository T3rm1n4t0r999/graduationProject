<?php

namespace App\Http\Controllers;

use App\Enums\OrganizationStatus;
use App\Http\Requests\StoreOrganizationRequest;
use App\Http\Resources\BotResource;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\UserResource;
use App\Models\Organization;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrganizationController
{
    public function store(StoreOrganizationRequest $request){
        $validated = $request->validated();

        return DB::transaction(function () use ($request, $validated) {

            $organization = Organization::create([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'owner_id' => Auth::id(),
                'status' => OrganizationStatus::PendingVerification,
                'settings' => [],
                'plan' => $validated['plan'] ?? 'free',
            ]);


            $organization->users()->attach(Auth::id(), [
                'role' => 'owner',
                'is_active' => true,
                'joined_at' => now(),
                'invited_at' => now(),
            ]);

            return back()->with('success', 'Организация создана успешно.');
        });
    }

    public function show(Organization $organization){
        $organization->load(['owner']);

        $users = $organization->users()
            ->withPivot('role', 'is_active', 'joined_at')
            ->latest('pivot_joined_at')
            ->paginate(2, ['*'], 'users_page')
            ->withQueryString();

        $bots = $organization->bots()
            ->latest()
            ->paginate(2, ['*'], 'bots_page')
            ->withQueryString();

        return Inertia::render('Organization/Show', [
            'organization' => new OrganizationResource($organization),
            'users' => UserResource::collection($users),
            'bots' => BotResource::collection($bots),
        ]);
    }
}
