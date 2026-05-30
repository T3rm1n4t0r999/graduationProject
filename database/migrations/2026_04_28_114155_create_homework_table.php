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
            $table->foreignId('lesson_id')
                ->constrained('lessons')
                ->cascadeOnDelete();
            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->cascadeOnDelete();
            $table->integer('max_attempts')->default(0);
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            // Индексы
            $table->index('organization_id');
            $table->index('lesson_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('homeworks');
    }
};
