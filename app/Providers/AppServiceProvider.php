<?php

namespace App\Providers;

use App\Models\Bot;
use App\Models\Organization;
use App\Policies\BotPolicy;
use App\Policies\OrganizationPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Gate::policy(Organization::class, OrganizationPolicy::class);
        Gate::policy(Bot::class, BotPolicy::class);
    }
}
