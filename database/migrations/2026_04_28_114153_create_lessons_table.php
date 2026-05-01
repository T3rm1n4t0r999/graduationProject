<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('module_id')
                ->constrained('modules')
                ->onDelete('cascade'); // Удаляем уроки при удалении модуля
            $table->timestamps();

            $table->index('title');
            $table->index('module_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
