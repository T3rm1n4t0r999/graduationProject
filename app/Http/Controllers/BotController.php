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
        //сделать: создать может только владелец
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
        $this->authorize('update', $bot);

        return Inertia::render('Bot/Edit', [
            'bot' => new BotResource($bot),
            'organization' => new OrganizationResource($bot->organization),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Bot $bot)
    {
        $this->authorize('update', $bot);

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

        return redirect()->route('organization.show', $bot->organization->id)
            ->with('success', 'Бот успешно обновлен');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Bot $bot)
    {
        //
    }
    /**
     * Переключить статус бота (Запуск/Остановка)
     */
    public function toggleStatus(Request $request, Bot $bot)
    {
        $this->authorize('update', $bot);

        $newStatus = !$bot->is_active;
        $action = $newStatus ? 'start-bot' : 'stop-bot';
        try {
            // Отправка запроса на внешний сервер бота
            $externalUrl = config('services.bot_manager.url'); // URL из .env

            if (!$externalUrl) {
                return back()->with('error', 'Ошибка запуска бота.');
            }

            $response = Http::timeout(10)
                ->withoutVerifying()
                ->post($externalUrl . '/admin/' . $action, [
                    'token' => $bot->token,
                ]);
            if ($response->successful()) {
                // Обновляем статус в базе данных только если внешний сервис ответил успешно
                $bot->update(['is_active' => $newStatus]);
            } else {
                return back()->with('error', 'Ошибка запуска бота. Внешний сервис недоступен.');
            }

        } catch (\Exception $e) {
            return back()->with('error', 'Неизвестная ошибка запуска бота.');
        }
    }
}
