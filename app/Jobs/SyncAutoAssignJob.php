<?php

namespace App\Jobs;

use App\Models\Course;
use App\Models\Organization;
use App\Models\StudentCourse;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncAutoAssignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Максимальное количество попыток.
     */
    public int $tries = 3;

    /**
     * Таймаут выполнения задачи (сек).
     */
    public int $timeout = 120;

    /**
     * Задержка между повторными попытками (сек).
     */
    public array $backoff = [10, 30, 60];

    public function __construct(
        public int $courseId,
        public int $organizationId
    ) {
        // Передаём только скалярные ID — никаких тяжёлых моделей в очереди
    }

    /**
     * Мидлвары, применяемые к задаче.
     * Защита от параллельного запуска для одного и того же курса.
     */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("auto_assign:course:{$this->courseId}"))
                ->releaseAfter(30)
                ->dontRelease(),
        ];
    }

    /**
     * Выполнение задачи.
     */
    public function handle(): void
    {
        // 1. Загружаем курс и проверяем, что он принадлежит правильной организации
        $course = Course::where('id', $this->courseId)
            ->where('organization_id', $this->organizationId)
            ->first();

        if (!$course) {
            Log::warning('SyncAutoAssignJob: курс не найден или был удалён', [
                'course_id'       => $this->courseId,
                'organization_id' => $this->organizationId,
            ]);
            return;
        }

        // 2. Если auto_assign отключили до выполнения Job'а — выходим
        if (!$course->auto_assign) {
            return;
        }

        // 3. Организация нужна только для получения студентов
        $organization = Organization::find($this->organizationId);
        if (!$organization) {
            Log::error('SyncAutoAssignJob: организация не найдена', [
                'organization_id' => $this->organizationId,
            ]);
            return;
        }

        $this->executeAutoAssign($organization, $course);
    }

    /**
     * Основная бизнес-логика: массовая вставка студентов через upsert.
     */
    private function executeAutoAssign(Organization $organization, Course $course): void
    {
        // 1. Загружаем только ID студентов (массив чисел), а не тяжёлые Eloquent-модели
        $studentIds = $organization->students()->pluck('id');

        if ($studentIds->isEmpty()) {
            Log::info('SyncAutoAssignJob: нет студентов для назначения', [
                'course_id' => $course->id,
            ]);
            return;
        }

        $now = now();

        // 2. Формируем массив данных для пакетной вставки
        // Работаем чанками по 1000, чтобы не убить память при 100k+ студентов
        $studentIds->chunk(1000)->each(function ($chunk) use ($course, $organization, $now) {
            $data = $chunk->map(fn($studentId) => [
                'student_id'      => $studentId,
                'course_id'       => $course->id,
                'organization_id' => $organization->id,
                'granted_by'      => 'auto',
                'granted_at'      => $now,
            ])->toArray();

            // 3. upsert делает массовый INSERT.
            // Если связь уже есть (уникальный ключ student_id + course_id), он обновит только granted_by и granted_at
            StudentCourse::upsert(
                $data,
                ['student_id', 'course_id'], // Уникальные колонки для проверки дубликатов
                ['granted_by', 'granted_at'] // Колонки для обновления при совпадении
            );
        });

        Log::info('SyncAutoAssignJob выполнен успешно', [
            'course_id'       => $course->id,
            'organization_id' => $organization->id,
            'students_count'  => $studentIds->count(),
        ]);
    }

    /**
     * Обработка критической ошибки после всех попыток.
     */
    public function failed(\Throwable $e): void
    {
        Log::error('SyncAutoAssignJob окончательно провалился', [
            'course_id'       => $this->courseId,
            'organization_id' => $this->organizationId,
            'error'           => $e->getMessage(),
            'trace'           => $e->getTraceAsString(),
        ]);

        // Опционально: уведомить администратора через Slack/Email
        // Notification::route('slack', config('services.slack.admin_webhook'))
        //     ->notify(new AutoAssignFailedNotification($this, $e));
    }
}
