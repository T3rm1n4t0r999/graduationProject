<?php

namespace App\Http\Controllers;

use App\Http\Resources\BotResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Bot;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class BotController extends Controller
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
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'token' => 'required|string|max:500',
            'organization_id' => 'required|exists:organizations,id',
        ]);
        $bot = Bot::create($data);
        return back()->with('success', 'Бот успешно создан');
    }

    /**
     * Display the specified resource.
     */
    public function show(Bot $bot)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Bot $bot)
    {
        // Проверка: только владелец организации может редактировать бота
        $organization = $bot->organization;

        if (!$organization || Auth::id() !== $organization->owner_id) {
            abort(403, 'Только владелец организации может редактировать бота');
        }

        return Inertia::render('Bot/Edit', [
            'bot' => new BotResource($bot),
            'organization' => new OrganizationResource($organization),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Bot $bot)
    {
        // Проверка: только владелец организации может редактировать бота
        $organization = $bot->organization;

        if (!$organization || Auth::id() !== $organization->owner_id) {
            abort(403, 'Только владелец организации может редактировать бота');
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'token' => 'nullable|string|max:500',
        ]);

        // Обновляем токен только если он был передан
        if (!empty($data['token'])) {
            $bot->token = $data['token'];
        }

        $bot->name = $data['name'];
        $bot->save();

        return redirect()->route('organization.show', $organization->id)
            ->with('success', 'Бот успешно обновлен');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Bot $bot)
    {
        //
    }

    public function admin(Bot $bot)
    {
        // Проверка прав: только владелец организации может управлять ботом
        if ($bot->organization->owner_id !== auth()->id()) {
            abort(403, 'Только владелец организации может управлять ботом');
        }

        // Опция 1: Использование хелпера filament (рекомендуется)
        // Он автоматически перенаправит на дашборд активной панели
        return redirect()->intended(filament()->getUrl());

        // Опция 2: Если нужно перенаправить именно на список ресурсов или конкретную страницу
        // return redirect()->route('filament.admin.resources.bots.index');
    }

    /**
     * Переключить статус бота (Запуск/Остановка)
     */
    public function toggleStatus(Request $request, Bot $bot)
    {
        // Проверка прав: только владелец организации может управлять ботом
        if ($bot->organization->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $newStatus = !$bot->is_active;
        $action = $newStatus ? 'start-bot' : 'stop-bot';
        $bot->update(['is_active' => $newStatus]);
        try {
            // Отправка запроса на внешний сервер бота
            $externalUrl = config('services.bot_manager.url'); // URL из .env

            if (!$externalUrl) {
                throw new \Exception('Bot manager URL not configured in .env');
            }

            $response = Http::timeout(10)
                ->withoutVerifying()
                ->post($externalUrl . '/admin/' . $action, [
                    'token' => $bot->token,
                ]);

            if ($response->successful()) {
                // Обновляем статус в базе данных только если внешний сервис ответил успешно
                $bot->update(['status' => $newStatus]);

            } else {
                throw new \Exception('External service returned error: ' . $response->status());
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при управлении ботом: ' . $e->getMessage(),
            ], 500);
        }
    }
}
