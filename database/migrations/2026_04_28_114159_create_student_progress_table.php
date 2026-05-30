<?php
// database/migrations/2024_01_01_000002_create_student_progress_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('student_progress', function (Blueprint $table) {
            $table->id();

            // Полиморфные поля
            $table->unsignedBigInteger('progressable_id');
            $table->string('progressable_type');

            // Связь со студентом
            $table->foreignId('student_id')->constrained()->onDelete('cascade');

            // Данные прогресса
            $table->json('answers')->nullable();
            $table->json('attached_files')->nullable();
            $table->integer('points')->default(0);
            $table->integer('max_points')->default(0);
            $table->integer('attempt')->default(1); // Убрали autoIncrement()
            $table->json('metadata')->nullable();
            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->cascadeOnDelete();
            $table->boolean('checked')->default(false);
            $table->integer('checked_by')->default(0);
            $table->boolean('finished_by_timeout')->nullable();
            $table->timestamps();

            // Уникальный индекс для предотвращения дублирования попыток
            $table->unique([
                'student_id',
                'progressable_type',
                'progressable_id',
                'attempt'
            ], 'student_progress_unique_attempt');

            // Индексы для быстрого поиска
            $table->index(['progressable_type', 'progressable_id']);
            $table->index(['student_id', 'progressable_type', 'progressable_id']);
            $table->index(['student_id', 'attempt']);
            $table->index('organization_id');
            $table->index(['points']); // Для поиска лучших результатов
        });
    }

    public function down()
    {
        Schema::dropIfExists('student_progress');
    }
};
