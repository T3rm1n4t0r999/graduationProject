<?php

namespace App\Jobs;

use App\Models\Bot;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ToggleBotStatusJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Bot $bot, public bool $newStatus) {}

    public function handle(): void
    {
        $action = $this->newStatus ? 'start-bot' : 'stop-bot';
        $externalUrl = config('services.bot_manager.url');

        if (!$externalUrl) {
            Log::error('Bot manager URL not configured');
            return;
        }

        try {
            $response = Http::timeout(10)
                // Убрали withoutVerifying() для безопасности!
                // Настройте корректные SSL сертификаты на внешнем сервере.
                ->post($externalUrl . '/admin/' . $action, [
                    'token' => $this->bot->token, // Автоматически расшифруется
                ]);

            if ($response->successful()) {
                $this->bot->update(['is_active' => $this->newStatus]);
            } elseif (!$this->newStatus) {
                // Принудительно останавливаем в БД, если внешний сервис недоступен
                $this->bot->update(['is_active' => false]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to toggle bot status: ' . $e->getMessage());
        }
    }
}
