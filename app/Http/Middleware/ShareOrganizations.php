<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
class ShareOrganizations
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()) {
            inertia()->share([
                'organizations' => fn() => $request->user()->organizations()
                    ->select('organizations.id', 'organizations.name')
                    ->get()
                    ->map(fn($org) => [
                        'id' => $org->id,
                        'name' => $org->name,
                    ]),
            ]);
        }

        return $next($request);
    }
}
