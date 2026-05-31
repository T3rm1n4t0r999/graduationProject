<?php

namespace App\Providers;

use App\Models\Bot;
use App\Models\Exam;
use App\Models\Homework;
use App\Models\LessonMaterial;
use App\Models\LessonTask;
use App\Models\Organization;
use App\Models\Question;
use App\Policies\BotPolicy;
use App\Policies\OrganizationPolicy;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        DB::listen(function ($query) {
            if ($query->time > config('logging.slow_query.threshold', 100)) {
                Log::channel('slow_queries')->warning('Slow query detected', [
                    'time_ms'   => $query->time,
                    'sql'       => $query->sql,
                    'bindings'  => $query->bindings,
                    'url'       => request()->fullUrl(),
                    'user_id'   => auth()->id(),
                    'route'     => optional(request()->route())->getName(),
                    'connection'=> $query->connectionName,
                ]);
            }
        });

        Relation::morphMap([
            'lesson_task'     => LessonTask::class,
            'homework'       => Homework::class,
            'exam'           => Exam::class,

            'Question'       => Question::class,
            'LessonMaterial' => LessonMaterial::class,
        ]);
        Vite::prefetch(concurrency: 3);
        Gate::policy(Organization::class, OrganizationPolicy::class);
        Gate::policy(Bot::class, BotPolicy::class);

        // Явное связывание параметров маршрутов
        Route::bind('task', function ($value) {
            return LessonTask::findOrFail($value);
        });

        Route::bind('homework', function ($value) {
            return Homework::findOrFail($value);
        });

        Route::bind('exam', function ($value) {
            return Exam::findOrFail($value);
        });
    }
}
