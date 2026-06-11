<?php

namespace App\Http\Controllers\Organization;

use App\Http\Controllers\Controller;
use App\Http\Resources\BotResource;
use App\Http\Resources\OrganizationResource;
use App\Jobs\ToggleBotStatusJob;
use App\Models\Bot;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        // 1. Сначала валидация (защита от NPE)
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'bot_url' => 'required|string|max:100', // Исправлено на required
            'token' => 'required|string|max:500',
            'organization_id' => 'required|exists:organizations,id',
        ]);

        $organization = Organization::findOrFail($data['organization_id']);

        // 2. Авторизация (защита от IDOR)
        $this->authorize('manage', $organization);

        if (!$organization->isVerified()){
            return back()->with('error', 'Подтвердите организацию для создания бота.');
        }

        // 3. Убрали лишнюю транзакцию
        Bot::create($data);

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
            'bot_url' => 'required|string|max:100', // Исправлено на required
        ]);

        // Оптимизированное обновление
        $bot->name = $data['name'];
        $bot->bot_url = $data['bot_url'];

        if (!empty($data['token'])) {
            $bot->token = $data['token'];
        }

        $bot->save();

        return redirect()->route('organization.show', $bot->organization_id) // Используем ID, чтобы не делать лишний запрос к связи
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
        $message = $newStatus ? 'Бот запускается' : 'Бот останавливается';
        // Отправляем в очередь, чтобы не блокировать сервер
        dispatch(new ToggleBotStatusJob($bot, $newStatus));

        return back()->with('success', $message);
    }
}
