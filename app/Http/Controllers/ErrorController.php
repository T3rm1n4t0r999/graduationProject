<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ErrorController extends Controller
{
    public function show(Request $request, int $status)
    {
        // Если это запрос от Inertia, возвращаем компонент
        if ($request->header('X-Inertia')) {
            return Inertia::render('Error', ['status' => $status])
                ->toResponse($request)
                ->setStatusCode($status);
        }

        // Если это прямой переход (обычный HTTP запрос),
        // мы все равно возвращаем Inertia-ответ, но оборачиваем его так,
        // чтобы браузер мог его отобразить.
        // Однако, стандартный behavior Laravel для non-Inertia запросов - отдавать HTML.

        // Чтобы сделать красиво и там и там, лучше всего заставить Laravel
        // думать, что это Inertia запрос, или просто вернуть тот же самый render.
        // Inertia::render() вернет JSON, если нет заголовка. Браузер покажет JSON. Это плохо.

        // Поэтому для обычных запросов нам нужно вернуть HTML.
        // Но так как у нас SPA, мы хотим, чтобы даже при обновлении страницы
        // загружалось наше React-приложение с ошибкой.

        // Трюк: Мы возвращаем тот же компонент, но говорим Laravel отрендерить его как обычную страницу.
        // Для этого нужно использовать root template.

        return Inertia::render('Error', ['status' => $status])
            ->toResponse($request)
            ->setStatusCode($status);
    }
}
