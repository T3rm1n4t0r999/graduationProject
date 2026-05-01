<?php
// database/migrations/2024_01_01_000004_create_homeworks_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('homeworks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('max_score')->default(0);
            $table->foreignId('task_id')->constrained('lesson_task')->onDelete('cascade');
            $table->timestamps();

            // Индексы
            $table->index('task_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('homeworks');
    }
};
