<?php

namespace App\Http\Controllers;

use App\Models\Bot;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'bot' => [
                'id' => $bot->id,
                'name' => $bot->name,
                'status' => $bot->status,
            ],
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
            ],
        ]);
    }

    /**
     * Display admin panel for the specified bot.
     */
    public function admin(Bot $bot)
    {
        // Проверка: только владелец организации может доступа к админ-панели бота
        $organization = $bot->organization;

        if (!$organization || Auth::id() !== $organization->owner_id) {
            abort(403, 'Только владелец организации может управлять ботом');
        }

        // Редирект на панель Filament для конкретного бота
        // Каждый бот имеет свою изолированную админ-панель с обучающим контентом
        return redirect()->route('filament.bot.resources.index', ['bot' => $bot->id]);
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
}
