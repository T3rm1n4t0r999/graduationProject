<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Оригинальное имя файла
            $table->string('path'); // Путь в storage
            $table->string('disk')->default('public');
            $table->integer('size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('extension')->nullable();

            // Полиморфные связи
            $table->unsignedBigInteger('fileable_id');
            $table->string('fileable_type');

            $table->timestamps();

            // Индексы для производительности
            $table->index(['fileable_id', 'fileable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
