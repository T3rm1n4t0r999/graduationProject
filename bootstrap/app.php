<?php

use App\Http\Middleware\SetCurrentOrganization;
use App\Http\Middleware\ShareOrganizations;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            ShareOrganizations::class,

        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        $exceptions->respond(function (Response $response, Throwable $exception, $request) {
            $status = $response->getStatusCode();

            if (!in_array($status, [403, 404, 500])) {
                return $response;
            }

            $inertiaResponse = Inertia::render('Error', ['status' => $status])
                ->toResponse($request)
                ->setStatusCode($status);

            return $inertiaResponse;
        });

    })->create();
