<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],


            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * Получить текущую организацию пользователя.
     */
    protected function getCurrentOrganization(Request $request)
    {
        if (!$request->user()) {
            return null;
        }

        // Приоритет: сессия -> база данных -> первая доступная
        $orgId = $request->session()->get('current_organization_id');

        if ($orgId) {
            $org = $request->user()->organizations()->find($orgId);
            if ($org) {
                return $org->only(['id', 'name', 'slug']);
            }
        }

        // Брать первую организацию пользователя
        $org = $request->user()->organizations()->first();

        if ($org) {
            $request->session()->put('current_organization_id', $org->id);
            return $org->only(['id', 'name', 'slug']);
        }

        return null;
    }
}
