<?php

use App\Http\Middleware\ShareOrganizations;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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

        ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // === Новый обработчик для редиректов при ModelNotFoundException ===
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if (!$request->inertia()) {
                return; // пропускаем, если не Inertia-запрос
            }

            $previous = $e->getPrevious();
            if ($previous instanceof ModelNotFoundException) {
                $model = $previous->getModel();

                // Не найдена организация → на дашборд
                if ($model === \App\Models\Organization::class) {
                    return redirect()->route('dashboard');
                }

                // Запасной редирект
                return redirect()->route('dashboard');
            }

            // Если это не ModelNotFoundException, передаём управление дальше (в respond)
        });

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
