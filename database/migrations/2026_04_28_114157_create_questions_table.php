<?php
// database/migrations/2024_01_01_000001_create_questions_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->text('question');
            $table->enum('question_type', [
                'single_choice',
                'multiple_choice',
                'text',
                'code',
                'file'
            ])->default('text');
            $table->json('options')->nullable();
            $table->json('correct_answers')->nullable();
            $table->integer('points')->default(1);
            $table->integer('order')->default(0);

            // Полиморфные поля
            $table->unsignedBigInteger('questionable_id');
            $table->string('questionable_type');

            // Дополнительные поля (только те, что есть в модели)
            $table->json('metadata')->nullable();
            $table->text('explanation')->nullable();
            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->cascadeOnDelete();
            $table->timestamps();

            // Индексы
            $table->index('organization_id');
            $table->index(['questionable_type', 'questionable_id', 'order']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('questions');
    }
};
